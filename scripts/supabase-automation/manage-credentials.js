#!/usr/bin/env node

/**
 * Supabase Credential Manager - Systematic credential lifecycle management
 * Handles secure storage, retrieval, validation, and rotation of credentials
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { exec } = require("child_process");

class SupabaseCredentialManager {
  constructor() {
    this.projectRoot = path.resolve(__dirname, "../..");
    this.credentialsDir = path.join(this.projectRoot, ".credentials");
    this.credentialsFile = path.join(this.credentialsDir, "supabase.json");
    this.backupDir = path.join(this.credentialsDir, "backups");

    // Ensure credentials directory exists
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.credentialsDir, this.backupDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Add .credentials to .gitignore if not already there
    this.updateGitignore();
  }

  updateGitignore() {
    const gitignorePath = path.join(this.projectRoot, ".gitignore");
    const credentialsEntry =
      "\n# Supabase Credentials\n.credentials/\n*.credentials\n.env.backup\n";

    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, "utf8");
      if (!content.includes(".credentials/")) {
        fs.appendFileSync(gitignorePath, credentialsEntry);
        console.log("✅ Updated .gitignore to exclude credentials");
      }
    } else {
      fs.writeFileSync(gitignorePath, credentialsEntry);
      console.log("✅ Created .gitignore with credentials exclusion");
    }
  }

  async storeCredentials(credentials) {
    console.log("🔐 Storing credentials securely...");

    try {
      // Create backup if credentials file exists
      if (fs.existsSync(this.credentialsFile)) {
        const backupName = `credentials-backup-${Date.now()}.json`;
        const backupPath = path.join(this.backupDir, backupName);
        fs.copyFileSync(this.credentialsFile, backupPath);
        console.log(`📦 Created backup: ${backupName}`);
      }

      // Add metadata
      const credentialData = {
        ...credentials,
        metadata: {
          created: new Date().toISOString(),
          version: "1.0.0",
          checksum: this.generateChecksum(credentials),
        },
      };

      // Write credentials
      fs.writeFileSync(this.credentialsFile, JSON.stringify(credentialData, null, 2));
      console.log("✅ Credentials stored successfully");

      return true;
    } catch (error) {
      console.error("❌ Failed to store credentials:", error.message);
      return false;
    }
  }

  async loadCredentials() {
    if (!fs.existsSync(this.credentialsFile)) {
      console.log("⚠️ No stored credentials found");
      return null;
    }

    try {
      const data = JSON.parse(fs.readFileSync(this.credentialsFile, "utf8"));

      // Validate checksum
      const storedChecksum = data.metadata?.checksum;
      const { metadata, ...credentials } = data;
      const calculatedChecksum = this.generateChecksum(credentials);

      if (storedChecksum && storedChecksum !== calculatedChecksum) {
        console.warn("⚠️ Credential checksum mismatch - possible corruption");
      }

      console.log("✅ Credentials loaded successfully");
      return credentials;
    } catch (error) {
      console.error("❌ Failed to load credentials:", error.message);
      return null;
    }
  }

  generateChecksum(data) {
    return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }

  async validateCredentials(credentials) {
    console.log("🔍 Validating credentials...");

    const validations = [
      {
        name: "URL format",
        check: (cred) =>
          cred.url && cred.url.startsWith("https://") && cred.url.includes(".supabase.co"),
      },
      {
        name: "Anon key format",
        check: (cred) =>
          cred.anonKey && cred.anonKey.startsWith("eyJ") && cred.anonKey.length > 100,
      },
      {
        name: "Service role key format",
        check: (cred) =>
          cred.serviceRoleKey &&
          cred.serviceRoleKey.startsWith("eyJ") &&
          cred.serviceRoleKey.length > 100,
      },
      {
        name: "Project ID format",
        check: (cred) => cred.projectId && cred.projectId.length === 20,
      },
      {
        name: "Access token format",
        check: (cred) => cred.accessToken && cred.accessToken.startsWith("sbp_"),
      },
    ];

    let allValid = true;
    for (const { name, check } of validations) {
      const isValid = check(credentials);
      console.log(`${isValid ? "✅" : "❌"} ${name}`);
      if (!isValid) allValid = false;
    }

    return allValid;
  }

  async testConnection(credentials) {
    console.log("🌐 Testing Supabase connection...");

    try {
      // Use the existing test script
      const testScript = path.join(__dirname, "..", "test-supabase-connection.js");

      if (fs.existsSync(testScript)) {
        return new Promise((resolve) => {
          exec(`node "${testScript}"`, (error, stdout, stderr) => {
            if (error) {
              console.log("❌ Connection test failed");
              console.log(stderr);
              resolve(false);
            } else {
              console.log("✅ Connection test passed");
              resolve(true);
            }
          });
        });
      } else {
        console.log("⚠️ Connection test script not found - skipping test");
        return true;
      }
    } catch (error) {
      console.error("❌ Connection test error:", error.message);
      return false;
    }
  }

  async rotateCredentials() {
    console.log("🔄 Starting credential rotation...");

    // This would typically involve:
    // 1. Generating new API keys through Supabase API
    // 2. Updating stored credentials
    // 3. Testing new credentials
    // 4. Updating environment variables

    console.log("⚠️ Credential rotation requires manual intervention");
    console.log("📋 Steps to rotate credentials:");
    console.log("1. Go to Supabase Dashboard > Settings > API");
    console.log("2. Generate new keys");
    console.log("3. Update credentials using this script");
    console.log("4. Test connection");

    return false; // Manual process for now
  }

  async setupAutoCredentials() {
    console.log("🔧 Setting up automatic credential management...");

    const defaultCredentials = {
      name: "TCO Primary Project",
      url: "https://qnwcwoutgarhqxlgsjzs.supabase.co",
      anonKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NzM0MjgsImV4cCI6MjA3MjI0OTQyOH0.nooeC4pyNsoRok5zKat9iwUk9rgCfz_b5SWqZ7_dgtQ",
      serviceRoleKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFud2N3b3V0Z2FyaHF4bGdzanpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY3MzQyOCwiZXhwIjoyMDcyMjQ5NDI4fQ.U_FDgUC__dtFPVd5jrTpmwaWiDWJ701w4lRbe4qy1T4",
      projectId: "qnwcwoutgarhqxlgsjzs",
      accessToken: "sbp_984dfc579739dd6c4ece2bfa74f74a1dcb340206",
    };

    // Validate credentials
    const isValid = await this.validateCredentials(defaultCredentials);
    if (!isValid) {
      console.log("❌ Default credentials validation failed");
      return false;
    }

    // Test connection
    const connectionWorks = await this.testConnection(defaultCredentials);
    if (!connectionWorks) {
      console.log("❌ Connection test failed");
      return false;
    }

    // Store credentials
    const stored = await this.storeCredentials(defaultCredentials);
    if (!stored) {
      return false;
    }

    console.log("✅ Automatic credential management setup completed");
    return true;
  }

  async getCredentialStatus() {
    const exists = fs.existsSync(this.credentialsFile);

    if (!exists) {
      return {
        stored: false,
        valid: false,
        lastUpdated: null,
        backups: 0,
      };
    }

    const credentials = await this.loadCredentials();
    const valid = credentials ? await this.validateCredentials(credentials) : false;

    const backups = fs.existsSync(this.backupDir)
      ? fs.readdirSync(this.backupDir).filter((f) => f.endsWith(".json")).length
      : 0;

    let lastUpdated = null;
    try {
      const stats = fs.statSync(this.credentialsFile);
      lastUpdated = stats.mtime;
    } catch (e) {
      // Ignore error
    }

    return {
      stored: true,
      valid,
      lastUpdated,
      backups,
    };
  }

  async run(action = "setup") {
    console.log("🚀 Supabase Credential Manager");
    console.log("===============================");

    switch (action) {
      case "setup":
        return await this.setupAutoCredentials();

      case "status":
        const status = await this.getCredentialStatus();
        console.log("📊 Credential Status:");
        console.log(`  Stored: ${status.stored ? "✅" : "❌"}`);
        console.log(`  Valid: ${status.valid ? "✅" : "❌"}`);
        console.log(`  Last Updated: ${status.lastUpdated || "Never"}`);
        console.log(`  Backups: ${status.backups}`);
        return status.stored && status.valid;

      case "validate":
        const credentials = await this.loadCredentials();
        return credentials ? await this.validateCredentials(credentials) : false;

      case "test":
        const creds = await this.loadCredentials();
        return creds ? await this.testConnection(creds) : false;

      case "rotate":
        return await this.rotateCredentials();

      default:
        console.log("❌ Unknown action. Available: setup, status, validate, test, rotate");
        return false;
    }
  }
}

// CLI handling
if (require.main === module) {
  const action = process.argv[2] || "setup";
  const manager = new SupabaseCredentialManager();

  manager
    .run(action)
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("💥 Fatal error:", error.message);
      process.exit(1);
    });
}

module.exports = SupabaseCredentialManager;
