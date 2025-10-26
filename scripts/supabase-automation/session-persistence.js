#!/usr/bin/env node

/**
 * Session Persistence Manager for Supabase CLI
 * Handles cross-session authentication and state management
 * Part of the complete Supabase automation system
 */

const fs = require("fs");
const path = require("path");
const { execSync, exec } = require("child_process");
const os = require("os");
const crypto = require("crypto");

class SessionPersistenceManager {
  constructor() {
    this.homeDir = os.homedir();
    this.supabaseDir = path.join(this.homeDir, ".supabase");
    this.sessionFile = path.join(this.supabaseDir, "session-state.json");
    this.configFile = path.join(this.supabaseDir, "config.toml");
    this.backupDir = path.join(this.supabaseDir, "backups");
    this.logFile = path.join(this.supabaseDir, "session.log");
  }

  /**
   * Initialize session persistence system
   */
  async initialize() {
    try {
      this.log("Initializing session persistence system...");

      // Create necessary directories
      this.ensureDirectories();

      // Check current authentication status
      const authStatus = await this.checkAuthStatus();
      this.log(`Current auth status: ${authStatus ? "authenticated" : "not authenticated"}`);

      // Save current session state
      if (authStatus) {
        await this.saveSessionState();
      }

      return { success: true, authenticated: authStatus };
    } catch (error) {
      this.log(`Initialization error: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user is currently authenticated with Supabase CLI
   */
  async checkAuthStatus() {
    try {
      const result = execSync("supabase status --output json 2>nul", {
        encoding: "utf8",
        timeout: 10000,
      });

      // If command succeeds and returns valid JSON, user is authenticated
      const status = JSON.parse(result);
      return status && Object.keys(status).length > 0;
    } catch (error) {
      // Try alternative method - check for access token
      try {
        execSync("supabase projects list 2>nul", {
          encoding: "utf8",
          timeout: 5000,
        });
        return true;
      } catch (tokenError) {
        return false;
      }
    }
  }

  /**
   * Save current session state to persistent storage
   */
  async saveSessionState() {
    try {
      this.log("Saving session state...");

      const sessionData = {
        timestamp: new Date().toISOString(),
        authenticated: true,
        projects: [],
        accessToken: process.env.SUPABASE_ACCESS_TOKEN || null,
        checksum: null,
      };

      // Get projects list if authenticated
      try {
        const projectsResult = execSync("supabase projects list --output json", {
          encoding: "utf8",
          timeout: 10000,
        });
        sessionData.projects = JSON.parse(projectsResult);
      } catch (error) {
        this.log(`Could not fetch projects: ${error.message}`, "warn");
      }

      // Create checksum for integrity verification
      sessionData.checksum = this.createChecksum(sessionData);

      // Create backup of existing session
      if (fs.existsSync(this.sessionFile)) {
        const backupPath = path.join(this.backupDir, `session-${Date.now()}.json`);
        fs.copyFileSync(this.sessionFile, backupPath);
        this.log(`Created backup: ${backupPath}`);
      }

      // Save session state
      fs.writeFileSync(this.sessionFile, JSON.stringify(sessionData, null, 2));
      this.log("Session state saved successfully");

      return sessionData;
    } catch (error) {
      this.log(`Error saving session state: ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * Restore session from persistent storage
   */
  async restoreSession() {
    try {
      this.log("Attempting to restore session...");

      if (!fs.existsSync(this.sessionFile)) {
        this.log("No saved session found", "warn");
        return { success: false, reason: "no_session" };
      }

      const sessionData = JSON.parse(fs.readFileSync(this.sessionFile, "utf8"));

      // Verify integrity
      const expectedChecksum = this.createChecksum(sessionData);
      if (sessionData.checksum !== expectedChecksum) {
        this.log("Session data integrity check failed", "error");
        return { success: false, reason: "integrity_failed" };
      }

      // Check if session is still valid (not older than 7 days)
      const sessionAge = Date.now() - new Date(sessionData.timestamp).getTime();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (sessionAge > maxAge) {
        this.log("Session expired (older than 7 days)", "warn");
        return { success: false, reason: "expired" };
      }

      // Restore access token if available
      if (sessionData.accessToken) {
        process.env.SUPABASE_ACCESS_TOKEN = sessionData.accessToken;

        // Set system environment variable for persistence
        if (process.platform === "win32") {
          try {
            execSync(`setx SUPABASE_ACCESS_TOKEN "${sessionData.accessToken}"`, {
              timeout: 5000,
            });
            this.log("Access token restored to system environment");
          } catch (error) {
            this.log(`Could not set system environment variable: ${error.message}`, "warn");
          }
        }
      }

      // Verify authentication still works
      const authStatus = await this.checkAuthStatus();

      if (authStatus) {
        this.log("Session restored successfully");
        return { success: true, sessionData };
      } else {
        this.log("Session restoration failed - authentication invalid", "warn");
        return { success: false, reason: "auth_invalid" };
      }
    } catch (error) {
      this.log(`Error restoring session: ${error.message}`, "error");
      return { success: false, reason: "error", error: error.message };
    }
  }

  /**
   * Perform interactive login and save session
   */
  async performLogin() {
    try {
      this.log("Starting interactive login...");

      // Check if already authenticated
      const authStatus = await this.checkAuthStatus();
      if (authStatus) {
        this.log("Already authenticated");
        return { success: true, alreadyAuthenticated: true };
      }

      console.log("🔐 Please complete Supabase CLI authentication...");
      console.log("   This will open your browser for login.");
      console.log("   After login, return to this terminal.");

      // Perform login
      execSync("supabase login", { stdio: "inherit" });

      // Verify authentication
      const newAuthStatus = await this.checkAuthStatus();
      if (!newAuthStatus) {
        throw new Error("Authentication verification failed");
      }

      // Save the new session state
      await this.saveSessionState();

      this.log("Login completed and session saved");
      return { success: true };
    } catch (error) {
      this.log(`Login error: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up old sessions and backups
   */
  async cleanup(daysToKeep = 30) {
    try {
      this.log(`Cleaning up sessions older than ${daysToKeep} days...`);

      if (!fs.existsSync(this.backupDir)) {
        return { success: true, cleaned: 0 };
      }

      const files = fs.readdirSync(this.backupDir);
      const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
      let cleaned = 0;

      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          cleaned++;
          this.log(`Cleaned up old backup: ${file}`);
        }
      }

      this.log(`Cleanup completed. Removed ${cleaned} old files`);
      return { success: true, cleaned };
    } catch (error) {
      this.log(`Cleanup error: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  /**
   * Get session information
   */
  getSessionInfo() {
    try {
      if (!fs.existsSync(this.sessionFile)) {
        return { exists: false };
      }

      const sessionData = JSON.parse(fs.readFileSync(this.sessionFile, "utf8"));
      const sessionAge = Date.now() - new Date(sessionData.timestamp).getTime();

      return {
        exists: true,
        timestamp: sessionData.timestamp,
        age: Math.floor(sessionAge / (1000 * 60 * 60 * 24)), // days
        projects: sessionData.projects?.length || 0,
        hasAccessToken: Boolean(sessionData.accessToken),
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    const dirs = [this.supabaseDir, this.backupDir];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${dir}`);
      }
    }
  }

  /**
   * Create checksum for data integrity
   */
  createChecksum(data) {
    const { checksum, ...dataWithoutChecksum } = data;
    return crypto.createHash("sha256").update(JSON.stringify(dataWithoutChecksum)).digest("hex");
  }

  /**
   * Log messages with timestamp
   */
  log(message, level = "info") {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    // Console output
    if (level === "error") {
      console.error(logEntry);
    } else if (level === "warn") {
      console.warn(logEntry);
    } else {
      console.log(logEntry);
    }

    // File logging
    try {
      fs.appendFileSync(this.logFile, logEntry + "\n");
    } catch (error) {
      // Silent fail for logging errors
    }
  }
}

// CLI Interface
async function main() {
  const manager = new SessionPersistenceManager();
  const command = process.argv[2];

  switch (command) {
    case "init":
      const initResult = await manager.initialize();
      console.log(JSON.stringify(initResult, null, 2));
      process.exit(initResult.success ? 0 : 1);

    case "restore":
      const restoreResult = await manager.restoreSession();
      console.log(JSON.stringify(restoreResult, null, 2));
      process.exit(restoreResult.success ? 0 : 1);

    case "login":
      const loginResult = await manager.performLogin();
      console.log(JSON.stringify(loginResult, null, 2));
      process.exit(loginResult.success ? 0 : 1);

    case "status":
      const status = await manager.checkAuthStatus();
      const info = manager.getSessionInfo();
      console.log(JSON.stringify({ authenticated: status, session: info }, null, 2));
      process.exit(0);

    case "cleanup":
      const days = parseInt(process.argv[3]) || 30;
      const cleanupResult = await manager.cleanup(days);
      console.log(JSON.stringify(cleanupResult, null, 2));
      process.exit(cleanupResult.success ? 0 : 1);

    case "save":
      const saveResult = await manager.saveSessionState();
      console.log(JSON.stringify({ success: true, sessionData: saveResult }, null, 2));
      process.exit(0);

    default:
      console.log(`
Supabase Session Persistence Manager

Usage: node session-persistence.js <command> [options]

Commands:
  init                Initialize session persistence system
  restore             Restore session from saved state
  login               Perform interactive login and save session
  status              Check authentication and session status
  save                Save current session state
  cleanup [days]      Clean up old sessions (default: 30 days)

Examples:
  node session-persistence.js init
  node session-persistence.js restore
  node session-persistence.js login
  node session-persistence.js status
  node session-persistence.js cleanup 7
            `);
      process.exit(0);
  }
}

// Export for use as module
module.exports = SessionPersistenceManager;

// Run CLI if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error.message);
    process.exit(1);
  });
}
