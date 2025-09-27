#!/usr/bin/env node

/**
 * Development Startup Script
 * Automated startup with health checks and CPU protection
 * Prevents Node.js process proliferation and ensures clean development environment
 */

const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

class DevelopmentStartup {
  constructor() {
    this.logFile = path.join(__dirname, "..", "docs", "dev-startup.log");
    this.isWindows = os.platform() === "win32";
    this.processes = new Map();
    this.healthChecks = [];
    this.startupPhase = "init";

    // Startup configuration with GPU optimization
    this.config = {
      maxCpuPercent: 70,
      maxMemoryPercent: 80,
      maxNodeProcesses: 8,
      healthCheckInterval: 30000,
      startupTimeout: 120000,
      cleanupBeforeStart: true,
      enableSystemMonitoring: true,
      enableGpuAcceleration: true,
      gpuMemoryLimit: 8192,
    };
  }

  log(level, message, phase = null) {
    const timestamp = new Date().toISOString();
    const phasePrefix = phase ? `[${phase}] ` : "";
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${phasePrefix}${message}\n`;

    console.log(logEntry.trim());

    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error("Failed to write log:", error.message);
    }
  }

  async checkSystemResources() {
    this.log("info", "Checking system resources...", "HEALTH");

    try {
      const SystemMonitor = require("./system-monitor");
      const monitor = new SystemMonitor();
      const metrics = await monitor.collectMetrics();

      if (!metrics) {
        throw new Error("Failed to collect system metrics");
      }

      const issues = [];

      if (metrics.cpu.usage > this.config.maxCpuPercent) {
        issues.push(`High CPU usage: ${metrics.cpu.usage}%`);
      }

      if (metrics.memory.percent > this.config.maxMemoryPercent) {
        issues.push(`High memory usage: ${metrics.memory.percent}%`);
      }

      if (metrics.nodeProcesses > this.config.maxNodeProcesses) {
        issues.push(`Too many Node.js processes: ${metrics.nodeProcesses}`);
      }

      // Check GPU health if available
      if (metrics.gpu && metrics.gpu.available) {
        if (metrics.gpu.memory > 85) {
          issues.push(`High GPU memory usage: ${metrics.gpu.memory.toFixed(1)}%`);
        }
      }

      if (issues.length > 0) {
        this.log("warn", `System resource issues detected: ${issues.join(", ")}`, "HEALTH");
        return { healthy: false, issues, metrics };
      }

      const gpuStatus = metrics.gpu?.available ? `, GPU ${metrics.gpu.usage}%` : "";
      this.log(
        "info",
        `System healthy: CPU ${metrics.cpu.usage}%, Memory ${metrics.memory.percent}%, Processes ${metrics.nodeProcesses}${gpuStatus}`,
        "HEALTH"
      );
      return { healthy: true, metrics };
    } catch (error) {
      this.log("error", `Health check failed: ${error.message}`, "HEALTH");
      return { healthy: false, issues: [error.message] };
    }
  }

  async cleanupOrphanedProcesses() {
    if (!this.config.cleanupBeforeStart) return;

    this.log("info", "Cleaning up orphaned processes...", "CLEANUP");

    try {
      const ProcessCleanup = require("./cleanup-processes");
      const cleanup = new ProcessCleanup();
      const result = await cleanup.cleanupOrphans();

      this.log(
        "info",
        `Cleanup completed: ${result.cleaned} processes cleaned, ${result.errors} errors`,
        "CLEANUP"
      );
      return result;
    } catch (error) {
      this.log("error", `Cleanup failed: ${error.message}`, "CLEANUP");
      return { cleaned: 0, errors: 1 };
    }
  }

  async checkPortAvailability(port) {
    return new Promise((resolve) => {
      const net = require("net");
      const server = net.createServer();

      server.listen(port, () => {
        server.once("close", () => {
          resolve(true); // Port is available
        });
        server.close();
      });

      server.on("error", () => {
        resolve(false); // Port is in use
      });
    });
  }

  async waitForPort(port, timeout = 30000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const available = await this.checkPortAvailability(port);
      if (!available) {
        return true; // Service is running on port
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return false; // Timeout reached
  }

  async startDevelopmentServer() {
    this.log("info", "Starting Next.js development server...", "DEV-SERVER");

    const portAvailable = await this.checkPortAvailability(3000);
    if (!portAvailable) {
      this.log(
        "warn",
        "Port 3000 is already in use, development server may already be running",
        "DEV-SERVER"
      );
      return false;
    }

    return new Promise((resolve) => {
      // Use GPU-optimized development command if GPU acceleration is enabled
      const devCommand = this.config.enableGpuAcceleration ? "dev:gpu" : "dev:basic";
      const memorySize = this.config.enableGpuAcceleration ? this.config.gpuMemoryLimit : 4096;

      const spawnOptions = {
        stdio: ["ignore", "pipe", "pipe"],
        cwd: path.join(__dirname, ".."),
        env: {
          ...process.env,
          NODE_OPTIONS: `--max-old-space-size=${memorySize}`,
          NEXT_TELEMETRY_DISABLED: "1",
          // Enable GPU acceleration environment variables
          CUDA_VISIBLE_DEVICES: this.config.enableGpuAcceleration ? "0" : "",
          GPU_ACCELERATION: this.config.enableGpuAcceleration ? "1" : "0",
        },
      };

      // Use PowerShell on Windows for better compatibility
      if (this.isWindows) {
        spawnOptions.shell = "powershell.exe";
      }

      const devProcess = spawn("npm", ["run", devCommand], spawnOptions);

      let serverReady = false;
      let errorOccurred = false;

      devProcess.stdout.on("data", (data) => {
        const output = data.toString();
        this.log("info", `DEV-SERVER: ${output.trim()}`, "DEV-SERVER");

        if (
          output.includes("Ready") ||
          output.includes("localhost:3000") ||
          output.includes("started server")
        ) {
          serverReady = true;
          const gpuNote = this.config.enableGpuAcceleration ? " (GPU-accelerated)" : "";
          this.log("info", `Development server ready${gpuNote}`, "DEV-SERVER");
          resolve(true);
        }
      });

      devProcess.stderr.on("data", (data) => {
        const output = data.toString();
        if (!this.isIgnorableError(output)) {
          this.log("warn", `DEV-SERVER ERROR: ${output.trim()}`, "DEV-SERVER");
        }
      });

      devProcess.on("error", (error) => {
        if (!errorOccurred) {
          errorOccurred = true;
          this.log("error", `Failed to start development server: ${error.message}`, "DEV-SERVER");
          resolve(false);
        }
      });

      devProcess.on("exit", (code) => {
        if (!serverReady && !errorOccurred) {
          this.log("error", `Development server exited with code ${code}`, "DEV-SERVER");
          resolve(false);
        }
      });

      this.processes.set("dev-server", devProcess);

      // Timeout fallback
      setTimeout(() => {
        if (!serverReady && !errorOccurred) {
          this.log("warn", "Development server startup timeout", "DEV-SERVER");
          resolve(false);
        }
      }, this.config.startupTimeout);
    });
  }

  isIgnorableError(output) {
    const ignorablePatterns = [
      "Warning: React.jsx",
      "ExperimentalWarning",
      "DeprecationWarning",
      "MaxListenersExceededWarning",
    ];

    return ignorablePatterns.some((pattern) => output.includes(pattern));
  }

  async startSystemMonitoring() {
    if (!this.config.enableSystemMonitoring) return true;

    this.log("info", "Starting system monitoring...", "MONITOR");

    try {
      const monitorOptions = {
        stdio: ["ignore", "pipe", "pipe"],
        cwd: path.join(__dirname, ".."),
        detached: false,
      };

      // Use PowerShell on Windows for better compatibility
      if (this.isWindows) {
        monitorOptions.shell = "powershell.exe";
      }

      const monitorProcess = spawn(
        "node",
        ["scripts/system-monitor.js", "start", "60000"],
        monitorOptions
      );

      monitorProcess.stdout.on("data", (data) => {
        const output = data.toString().trim();
        if (output && !output.includes("System Status:")) {
          this.log("info", `MONITOR: ${output}`, "MONITOR");
        }
      });

      monitorProcess.stderr.on("data", (data) => {
        const output = data.toString().trim();
        if (output) {
          this.log("warn", `MONITOR ERROR: ${output}`, "MONITOR");
        }
      });

      this.processes.set("system-monitor", monitorProcess);

      this.log("info", "System monitoring started", "MONITOR");
      return true;
    } catch (error) {
      this.log("error", `Failed to start system monitoring: ${error.message}`, "MONITOR");
      return false;
    }
  }

  async verifyStartup() {
    this.log("info", "Verifying startup success...", "VERIFY");

    const checks = [];

    // Check if development server is accessible
    checks.push({
      name: "Development Server",
      check: () => this.waitForPort(3000, 10000),
    });

    // Check system resources
    checks.push({
      name: "System Resources",
      check: async () => {
        const health = await this.checkSystemResources();
        return health.healthy;
      },
    });

    const results = [];
    for (const check of checks) {
      try {
        const result = await check.check();
        results.push({ name: check.name, passed: result });
        this.log("info", `${check.name}: ${result ? "PASS" : "FAIL"}`, "VERIFY");
      } catch (error) {
        results.push({ name: check.name, passed: false, error: error.message });
        this.log("error", `${check.name}: ERROR - ${error.message}`, "VERIFY");
      }
    }

    const allPassed = results.every((r) => r.passed);
    this.log("info", `Startup verification: ${allPassed ? "SUCCESS" : "FAILED"}`, "VERIFY");

    return { success: allPassed, results };
  }

  async setupSignalHandlers() {
    const shutdown = async (signal) => {
      this.log("info", `Received ${signal}, shutting down...`, "SHUTDOWN");

      for (const [name, process] of this.processes) {
        try {
          this.log("info", `Stopping ${name}...`, "SHUTDOWN");
          if (this.isWindows) {
            // Use cross-platform process termination
            exec(
              `powershell -Command "Stop-Process -Id ${process.pid} -Force -ErrorAction SilentlyContinue"`,
              (error) => {
                if (error) {
                  // Fallback to taskkill if PowerShell command fails
                  exec(`taskkill /PID ${process.pid} /T /F`, { shell: "powershell.exe" });
                }
              }
            );
          } else {
            process.kill("SIGTERM");
          }
        } catch (error) {
          this.log("error", `Failed to stop ${name}: ${error.message}`, "SHUTDOWN");
        }
      }

      this.log("info", "Shutdown complete", "SHUTDOWN");
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    if (this.isWindows) {
      process.on("SIGBREAK", shutdown);
    }
  }

  async run() {
    this.log("info", "=== Starting Development Environment ===", "INIT");

    try {
      // Setup signal handlers
      await this.setupSignalHandlers();

      // Phase 1: System health check
      this.startupPhase = "health-check";
      const healthCheck = await this.checkSystemResources();
      if (!healthCheck.healthy) {
        this.log("warn", "System health issues detected, attempting remediation...", "INIT");

        // Try cleanup if there are too many processes
        if (healthCheck.issues.some((issue) => issue.includes("processes"))) {
          await this.cleanupOrphanedProcesses();

          // Recheck after cleanup
          const recheckHealth = await this.checkSystemResources();
          if (!recheckHealth.healthy) {
            this.log("error", "System health issues persist after cleanup", "INIT");
            return false;
          }
        }
      }

      // Phase 2: Cleanup
      this.startupPhase = "cleanup";
      await this.cleanupOrphanedProcesses();

      // Phase 3: Start development server
      this.startupPhase = "dev-server";
      const devServerStarted = await this.startDevelopmentServer();
      if (!devServerStarted) {
        this.log("error", "Failed to start development server", "INIT");
        return false;
      }

      // Phase 4: Start monitoring
      this.startupPhase = "monitoring";
      await this.startSystemMonitoring();

      // Phase 5: Verification
      this.startupPhase = "verification";
      const verification = await this.verifyStartup();
      if (!verification.success) {
        this.log("error", "Startup verification failed", "INIT");
        return false;
      }

      this.startupPhase = "running";
      this.log("info", "=== Development Environment Ready ===", "SUCCESS");
      this.log("info", "Development server: http://localhost:3000", "SUCCESS");
      this.log("info", "System monitoring: Active", "SUCCESS");
      if (this.config.enableGpuAcceleration) {
        this.log("info", "GPU acceleration: Enabled", "SUCCESS");
      }
      this.log("info", "Press Ctrl+C to shutdown", "SUCCESS");

      // Keep the process alive
      process.stdin.resume();
      return true;
    } catch (error) {
      this.log("error", `Startup failed: ${error.message}`, "ERROR");
      return false;
    }
  }

  async getStatus() {
    const systemHealth = await this.checkSystemResources();
    const processCount = this.processes.size;

    return {
      phase: this.startupPhase,
      healthy: systemHealth.healthy,
      processes: processCount,
      activeProcesses: Array.from(this.processes.keys()),
      systemMetrics: systemHealth.metrics,
      config: this.config,
    };
  }
}

// CLI Interface
async function main() {
  const startup = new DevelopmentStartup();
  const command = process.argv[2] || "start";

  switch (command) {
    case "start":
      const success = await startup.run();
      if (!success) {
        process.exit(1);
      }
      break;

    case "status":
      const status = await startup.getStatus();
      console.log("\n=== Development Startup Status ===");
      console.log(JSON.stringify(status, null, 2));
      break;

    case "health":
      const health = await startup.checkSystemResources();
      console.log("\n=== System Health Check ===");
      console.log(JSON.stringify(health, null, 2));
      break;

    case "config":
      console.log("\n=== Startup Configuration ===");
      console.log(JSON.stringify(startup.config, null, 2));
      break;

    default:
      console.log(`
Development Startup CLI

Commands:
  start             Start development environment
  status            Show startup status
  health            Check system health
  config            Show configuration

Examples:
  node scripts/dev-startup.js start
  node scripts/dev-startup.js health
      `);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
}

module.exports = DevelopmentStartup;
