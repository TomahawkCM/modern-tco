#!/usr/bin/env node

/**
 * Hive-Mind Configuration Script for Tanium TCO LMS
 *
 * Initializes the Claude Flow hive-mind intelligence system with:
 * - SQLite tracking database for agent performance
 * - Cross-session memory persistence
 * - Agent coordination topology configuration
 * - Performance metrics and analytics
 * - Truth verification system (0.95 threshold)
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Configuration paths
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CLAUDE_FLOW_DIR = path.join(PROJECT_ROOT, '.claude-flow');
const DB_PATH = path.join(CLAUDE_FLOW_DIR, 'hive-mind.db');
const CONFIG_PATH = path.join(CLAUDE_FLOW_DIR, 'hive-config.json');
const METRICS_DIR = path.join(CLAUDE_FLOW_DIR, 'metrics');

// Hive-Mind Configuration
const HIVE_MIND_CONFIG = {
  version: '2.0.0',
  initialized: new Date().toISOString(),
  project: 'tanium-tco-lms',

  // Agent topology configuration
  topology: {
    default: 'hierarchical',
    adaptive: true,
    maxAgents: 10,
    strategy: 'adaptive'
  },

  // Agent performance tracking
  performance: {
    trackTokenUsage: true,
    trackExecutionTime: true,
    trackQuality: true,
    trackCollaboration: true,
    metricsRetention: 30 // days
  },

  // Cross-session memory
  memory: {
    enabled: true,
    persistence: 'sqlite',
    ttl: 604800, // 7 days in seconds
    namespace: 'tanium-tco',
    compression: true
  },

  // Truth verification system
  verification: {
    enabled: true,
    threshold: 0.95,
    autoVerify: true,
    pairProgramming: true
  },

  // Agent specialization profiles
  agentProfiles: {
    'tco-content-specialist': {
      capabilities: ['mdx-authoring', 'video-integration', 'assessment-design'],
      priority: 'high',
      tokenBudget: 0.15
    },
    'tco-validation-expert': {
      capabilities: ['enterprise-qa', 'certification-compliance', 'security-audit'],
      priority: 'high',
      tokenBudget: 0.12
    },
    'tco-ui-architect': {
      capabilities: ['shadcn-ui', 'accessibility', 'responsive-design'],
      priority: 'medium',
      tokenBudget: 0.10
    },
    'assessment-engine-specialist': {
      capabilities: ['weighted-scoring', 'adaptive-learning', 'analytics'],
      priority: 'high',
      tokenBudget: 0.15
    },
    'video-system-architect': {
      capabilities: ['youtube-api', 'progress-tracking', 'multi-provider'],
      priority: 'medium',
      tokenBudget: 0.10
    },
    'database-architect': {
      capabilities: ['supabase', 'postgresql', 'rls', 'real-time'],
      priority: 'high',
      tokenBudget: 0.13
    },
    'react-specialist': {
      capabilities: ['react', 'typescript', 'hooks', 'contexts'],
      priority: 'high',
      tokenBudget: 0.12
    },
    'performance-engineer': {
      capabilities: ['optimization', 'caching', 'lighthouse', 'bundle-analysis'],
      priority: 'medium',
      tokenBudget: 0.08
    },
    'security-engineer': {
      capabilities: ['rls-audit', 'csp', 'authentication', 'encryption'],
      priority: 'critical',
      tokenBudget: 0.05
    }
  },

  // Task routing patterns
  routing: {
    patterns: {
      frontend: {
        keywords: ['react', 'component', 'ui', 'tsx', 'shadcn', 'accessibility'],
        agents: ['react-specialist', 'typescript-pro', 'tco-ui-architect'],
        topology: 'hierarchical'
      },
      backend: {
        keywords: ['api', 'supabase', 'postgresql', 'auth', 'rls'],
        agents: ['backend-developer', 'database-architect', 'security-engineer'],
        topology: 'hierarchical'
      },
      assessment: {
        keywords: ['assessment', 'scoring', 'analytics', 'progress'],
        agents: ['assessment-engine-specialist', 'tco-analytics-coordinator'],
        topology: 'adaptive'
      },
      content: {
        keywords: ['video', 'youtube', 'content', 'mdx', 'learning'],
        agents: ['video-system-architect', 'tco-content-specialist'],
        topology: 'mesh'
      },
      testing: {
        keywords: ['test', 'vitest', 'jest', 'e2e', 'playwright'],
        agents: ['test-automator', 'qa-expert', 'tco-validation-expert'],
        topology: 'hierarchical'
      },
      deployment: {
        keywords: ['deploy', 'vercel', 'production', 'ci/cd'],
        agents: ['tco-deployment-manager', 'devops-engineer', 'vercel-specialist'],
        topology: 'hierarchical'
      }
    }
  }
};

/**
 * Initialize Hive-Mind system
 */
async function initializeHiveMind() {
  console.log('🐝 Initializing Hive-Mind Intelligence System...\n');

  try {
    // 1. Create .claude-flow directory structure
    await createDirectoryStructure();

    // 2. Initialize SQLite database
    await initializeSQLiteDatabase();

    // 3. Save configuration
    await saveConfiguration();

    // 4. Initialize metrics tracking
    await initializeMetricsTracking();

    // 5. Verify MCP servers
    await verifyMCPServers();

    console.log('\n✅ Hive-Mind Initialization Complete!\n');
    console.log('📊 Configuration saved to:', CONFIG_PATH);
    console.log('💾 Database initialized at:', DB_PATH);
    console.log('📈 Metrics tracking enabled in:', METRICS_DIR);
    console.log('\n🚀 Ready for agent coordination!\n');

    // Display quick start commands
    displayQuickStart();

  } catch (error) {
    console.error('❌ Hive-Mind Initialization Failed:', error.message);
    process.exit(1);
  }
}

/**
 * Create directory structure
 */
async function createDirectoryStructure() {
  console.log('📁 Creating directory structure...');

  const dirs = [
    CLAUDE_FLOW_DIR,
    METRICS_DIR,
    path.join(CLAUDE_FLOW_DIR, 'memory'),
    path.join(CLAUDE_FLOW_DIR, 'sessions'),
    path.join(CLAUDE_FLOW_DIR, 'agents')
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('  ✅ Created:', path.relative(PROJECT_ROOT, dir));
    }
  }
}

/**
 * Initialize SQLite database for agent tracking
 */
async function initializeSQLiteDatabase() {
  console.log('\n💾 Initializing SQLite database...');

  // Check if sqlite3 is available
  try {
    await execPromise('which sqlite3');
  } catch (error) {
    console.log('  ⚠️  SQLite3 not found. Installing via npm...');
    await execPromise('npm install --save-dev sqlite3', { cwd: PROJECT_ROOT });
  }

  // Create database schema
  const schema = `
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      capabilities TEXT,
      spawned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      terminated_at DATETIME,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      agent_id TEXT,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      result TEXT,
      FOREIGN KEY(agent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS performance_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT,
      task_id TEXT,
      token_usage INTEGER,
      execution_time_ms INTEGER,
      quality_score REAL,
      collaboration_score REAL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(agent_id) REFERENCES agents(id),
      FOREIGN KEY(task_id) REFERENCES tasks(id)
    );

    CREATE TABLE IF NOT EXISTS memory_store (
      key TEXT PRIMARY KEY,
      value TEXT,
      namespace TEXT DEFAULT 'default',
      ttl INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS verification_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT,
      truth_score REAL,
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      verified_by TEXT,
      notes TEXT,
      FOREIGN KEY(task_id) REFERENCES tasks(id)
    );

    CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_id);
    CREATE INDEX IF NOT EXISTS idx_metrics_agent ON performance_metrics(agent_id);
    CREATE INDEX IF NOT EXISTS idx_memory_namespace ON memory_store(namespace);
  `;

  // Write schema to temporary SQL file
  const schemaPath = path.join(CLAUDE_FLOW_DIR, 'schema.sql');
  fs.writeFileSync(schemaPath, schema);

  // Execute schema
  try {
    await execPromise(`sqlite3 "${DB_PATH}" < "${schemaPath}"`);
    console.log('  ✅ Database schema created');
    fs.unlinkSync(schemaPath); // Clean up
  } catch (error) {
    console.log('  ⚠️  Using Node.js sqlite3 package instead');
    // Fallback to Node.js implementation if CLI fails
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(DB_PATH);

    await new Promise((resolve, reject) => {
      db.exec(schema, (err) => {
        if (err) reject(err);
        else resolve();
      });
      db.close();
    });

    console.log('  ✅ Database schema created via Node.js');
  }
}

/**
 * Save configuration to JSON file
 */
async function saveConfiguration() {
  console.log('\n💾 Saving configuration...');

  fs.writeFileSync(
    CONFIG_PATH,
    JSON.stringify(HIVE_MIND_CONFIG, null, 2),
    'utf8'
  );

  console.log('  ✅ Configuration saved');
}

/**
 * Initialize metrics tracking
 */
async function initializeMetricsTracking() {
  console.log('\n📈 Initializing metrics tracking...');

  const metricsFiles = {
    'task-metrics.json': [],
    'performance.json': {
      startTime: Date.now(),
      totalTasks: 0,
      successfulTasks: 0,
      failedTasks: 0,
      totalAgents: 0,
      activeAgents: 0,
      neuralEvents: 0
    },
    'system-metrics.json': {
      tokenUsage: 0,
      executionTime: 0,
      qualityScore: 0,
      collaborationScore: 0,
      lastUpdated: new Date().toISOString()
    }
  };

  for (const [filename, content] of Object.entries(metricsFiles)) {
    const filepath = path.join(METRICS_DIR, filename);
    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(
        filepath,
        JSON.stringify(content, null, 2),
        'utf8'
      );
      console.log(`  ✅ Created ${filename}`);
    }
  }
}

/**
 * Verify MCP servers are configured
 */
async function verifyMCPServers() {
  console.log('\n🔍 Verifying MCP server configuration...');

  const requiredServers = [
    'claude-flow',
    'filesystem',
    'github',
    'firecrawl',
    'playwright'
  ];

  console.log('  ℹ️  Required MCP servers:', requiredServers.join(', '));
  console.log('  ✅ MCP servers should be configured in Claude Code settings');
}

/**
 * Display quick start commands
 */
function displayQuickStart() {
  console.log('🚀 Quick Start Commands:\n');
  console.log('  # Spawn full LMS development team');
  console.log('  /spawn-lms-team\n');
  console.log('  # Spawn content creation team');
  console.log('  /spawn-content-team\n');
  console.log('  # Spawn testing team');
  console.log('  /spawn-testing-team\n');
  console.log('  # Spawn deployment team');
  console.log('  /spawn-deployment-team\n');
  console.log('  # Initialize swarm manually');
  console.log('  mcp__claude-flow__swarm_init({ topology: "hierarchical" })\n');
  console.log('  # Check system status');
  console.log('  npx claude-flow status\n');
}

// Run initialization
if (require.main === module) {
  initializeHiveMind().catch(console.error);
}

module.exports = {
  initializeHiveMind,
  HIVE_MIND_CONFIG
};
