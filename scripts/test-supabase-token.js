#!/usr/bin/env node
/**
 * Test Supabase PAT Token Validity and MCP Connection
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

async function testToken() {
  console.log("🔐 Testing Supabase PAT Token...");

  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF;

  console.log(`📋 Project Ref: ${projectRef}`);
  console.log(`🔑 Token format: ${token ? token.substring(0, 10) + "..." : "MISSING"}`);

  if (!token) {
    console.error("❌ SUPABASE_ACCESS_TOKEN not found in environment");
    return false;
  }

  // Test token format
  const expectedFormat = /^sbp_[a-zA-Z0-9]{40}$/;
  if (!expectedFormat.test(token)) {
    console.log("⚠️  Token format doesn't match expected pattern sbp_[40chars]");
    console.log(`   Current: ${token.substring(0, 15)}... (${token.length} chars)`);
  }

  try {
    // Test API call with token
    const response = await fetch("https://api.supabase.com/v1/projects", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const projects = await response.json();
      console.log("✅ Token is valid!");
      console.log(`📊 Found ${projects.length} projects`);

      // Find our specific project
      const targetProject = projects.find((p) => p.ref === projectRef);
      if (targetProject) {
        console.log(`✅ Target project found: ${targetProject.name}`);
        console.log(`   Status: ${targetProject.status}`);
        console.log(`   Region: ${targetProject.region}`);
      } else {
        console.log(`⚠️  Project ${projectRef} not found in accessible projects`);
      }

      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Token validation failed: ${response.status}`);
      console.error(`   Error: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Failed to test token:", error.message);
    return false;
  }
}

async function testMCPConnection() {
  console.log("\\n🔌 Testing MCP Server availability...");

  // This would normally be tested through Claude, but we can check if the server starts
  const { spawn } = require("child_process");

  return new Promise((resolve) => {
    const env = { ...process.env };
    const mcp = spawn(
      "npx",
      [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=qnwcwoutgarhqxlgsjzs",
        "--features=database,docs,development",
      ],
      {
        env,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    let output = "";
    let hasStarted = false;

    mcp.stdout.on("data", (data) => {
      output += data.toString();
      if (output.includes('{"jsonrpc":"2.0"') || output.includes("MCP")) {
        hasStarted = true;
        console.log("✅ MCP Server started successfully");
        mcp.kill();
        resolve(true);
      }
    });

    mcp.stderr.on("data", (data) => {
      const error = data.toString();
      if (error.includes("Invalid access token")) {
        console.log("❌ MCP Server failed: Invalid access token");
        mcp.kill();
        resolve(false);
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!hasStarted) {
        console.log("⏱️  MCP Server test timed out");
        mcp.kill();
        resolve(false);
      }
    }, 10000);
  });
}

// Run tests
(async () => {
  console.log("🧪 Starting Supabase MCP Connection Tests\\n");

  const tokenValid = await testToken();

  if (tokenValid) {
    const mcpWorks = await testMCPConnection();

    if (tokenValid && mcpWorks) {
      console.log("\\n🎉 All tests passed! MCP should work correctly.");
      process.exit(0);
    }
  }

  console.log("\\n❌ Issues found. Check configuration and token.");
  process.exit(1);
})();
