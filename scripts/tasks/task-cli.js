#!/usr/bin/env node
/**
 * Task CLI - Command Line Interface for Task Management
 * Provides easy terminal access to task operations
 * Usage: node task-cli.js <command> [options]
 */

const TaskManager = require("./task-manager");
const { program } = require("commander");

// Initialize task manager
const taskManager = new TaskManager();

// Helper function to display tasks in a formatted table
function displayTasks(tasks) {
  if (tasks.length === 0) {
    console.log("📋 No tasks found matching criteria");
    return;
  }

  console.log("\n📋 Task List:");
  console.log("─".repeat(100));
  console.log("ID      │ Status      │ Priority │ Category         │ Title");
  console.log("─".repeat(100));

  tasks.forEach((task) => {
    const statusEmoji = getStatusEmoji(task.status);
    const priorityColor = getPriorityColor(task.priority);
    console.log(
      `${task.id.padEnd(8)}│ ${statusEmoji} ${task.status.padEnd(8)}│ ${priorityColor}${task.priority}${"\x1b[0m".padEnd(2)}       │ ${task.category.padEnd(16)}│ ${task.title.substring(0, 40)}${task.title.length > 40 ? "..." : ""}`
    );
  });
  console.log("─".repeat(100));
}

// Helper function to get status emoji
function getStatusEmoji(status) {
  const emojis = {
    pending: "⏳",
    "in-progress": "🔄",
    completed: "✅",
    blocked: "🚧",
  };
  return emojis[status] || "❓";
}

// Helper function to get priority color
function getPriorityColor(priority) {
  const colors = {
    1: "\x1b[31m", // Red
    2: "\x1b[33m", // Yellow
    3: "\x1b[34m", // Blue
    4: "\x1b[32m", // Green
    5: "\x1b[35m", // Magenta
  };
  return colors[priority] || "\x1b[37m"; // White default
}

// Helper function to display progress
function displayProgress(progress) {
  console.log("\n📊 Progress Summary:");
  console.log("─".repeat(50));
  console.log(`Category: ${progress.category}`);
  console.log(`Total Tasks: ${progress.total}`);
  console.log(`✅ Completed: ${progress.completed}`);
  console.log(`🔄 In Progress: ${progress.inProgress}`);
  console.log(`⏳ Pending: ${progress.pending}`);
  console.log(`🚧 Blocked: ${progress.blocked}`);
  console.log(`📈 Completion Rate: ${progress.completionRate}%`);
  console.log(`⏰ Last Updated: ${new Date(progress.lastUpdated).toLocaleString()}`);
  console.log("─".repeat(50));
}

// Command: Add new task
program
  .command("add")
  .description("Add a new task")
  .requiredOption("-t, --title <title>", "Task title")
  .option("-c, --category <category>", "Task category", "general")
  .option("-p, --priority <priority>", "Task priority (1-8)", "5")
  .option("-e, --effort <effort>", "Estimated effort", "unknown")
  .option("-f, --file <file>", "Related file path")
  .option("-l, --lines <lines>", "Related line numbers")
  .option("-d, --description <description>", "Task description", "")
  .action((options) => {
    const taskData = {
      title: options.title,
      category: options.category,
      priority: parseInt(options.priority),
      effort: options.effort,
      file: options.file,
      lines: options.lines,
      description: options.description,
    };

    const taskId = taskManager.addTask(taskData);
    if (taskId) {
      console.log(`🎯 Task created successfully with ID: ${taskId}`);
    } else {
      console.error("❌ Failed to create task");
      process.exit(1);
    }
  });

// Command: Update task status
program
  .command("update")
  .description("Update a task")
  .requiredOption("-i, --id <id>", "Task ID")
  .option("-s, --status <status>", "New status (pending|in-progress|completed|blocked)")
  .option("-t, --title <title>", "New title")
  .option("-c, --category <category>", "New category")
  .option("-p, --priority <priority>", "New priority (1-8)")
  .option("-e, --effort <effort>", "New effort estimate")
  .option("-d, --description <description>", "New description")
  .action((options) => {
    const updates = {};

    if (options.status) updates.status = options.status;
    if (options.title) updates.title = options.title;
    if (options.category) updates.category = options.category;
    if (options.priority) updates.priority = parseInt(options.priority);
    if (options.effort) updates.effort = options.effort;
    if (options.description) updates.description = options.description;

    if (Object.keys(updates).length === 0) {
      console.error(
        "❌ No updates specified. Use --status, --title, --category, --priority, --effort, or --description"
      );
      process.exit(1);
    }

    const success = taskManager.updateTask(options.id, updates);
    if (!success) {
      process.exit(1);
    }
  });

// Command: List tasks
program
  .command("list")
  .description("List tasks with optional filters")
  .option("-s, --status <status>", "Filter by status")
  .option("-c, --category <category>", "Filter by category")
  .option("-p, --priority <priority>", "Filter by priority")
  .option("--limit <limit>", "Limit number of results", "50")
  .action((options) => {
    const filters = {};
    if (options.status) filters.status = options.status;
    if (options.category) filters.category = options.category;
    if (options.priority) filters.priority = options.priority;

    const tasks = taskManager.listTasks(filters);
    const limitedTasks = tasks.slice(0, parseInt(options.limit));

    displayTasks(limitedTasks);

    if (tasks.length > parseInt(options.limit)) {
      console.log(`\n... and ${tasks.length - parseInt(options.limit)} more tasks`);
    }
  });

// Command: Show task details
program
  .command("show")
  .description("Show detailed information about a specific task")
  .requiredOption("-i, --id <id>", "Task ID")
  .action((options) => {
    const task = taskManager.getTask(options.id);
    if (!task) {
      console.error(`❌ Task not found: ${options.id}`);
      process.exit(1);
    }

    console.log("\n📋 Task Details:");
    console.log("─".repeat(50));
    console.log(`ID: ${task.id}`);
    console.log(`Title: ${task.title}`);
    console.log(`Status: ${getStatusEmoji(task.status)} ${task.status}`);
    console.log(`Category: ${task.category}`);
    console.log(`Priority: ${task.priority}`);
    console.log(`Effort: ${task.effort}`);
    if (task.file) console.log(`File: ${task.file}`);
    if (task.lines) console.log(`Lines: ${task.lines}`);
    if (task.description) console.log(`Description: ${task.description}`);
    console.log(`Created: ${new Date(task.created).toLocaleString()}`);
    console.log(`Updated: ${new Date(task.updated).toLocaleString()}`);
    if (task.dependencies.length > 0) {
      console.log(`Dependencies: ${task.dependencies.join(", ")}`);
    }
    console.log("─".repeat(50));
  });

// Command: Show progress
program
  .command("progress")
  .description("Show progress statistics")
  .option("-c, --category <category>", "Show progress for specific category")
  .action((options) => {
    const progress = taskManager.getProgress(options.category);
    if (!progress) {
      console.error("❌ Failed to get progress information");
      process.exit(1);
    }

    displayProgress(progress);
  });

// Command: Mark task as completed (quick shortcut)
program
  .command("complete")
  .description("Mark a task as completed")
  .requiredOption("-i, --id <id>", "Task ID")
  .action((options) => {
    const success = taskManager.updateTask(options.id, { status: "completed" });
    if (success) {
      console.log(`🎉 Task ${options.id} marked as completed!`);
    } else {
      process.exit(1);
    }
  });

// Command: Export tasks
program
  .command("export")
  .description("Export tasks to different formats")
  .option("-f, --format <format>", "Export format (json|csv)", "json")
  .option("-o, --output <file>", "Output file path")
  .action((options) => {
    const exportData = taskManager.exportTasks(options.format);
    if (!exportData) {
      console.error(`❌ Failed to export tasks in format: ${options.format}`);
      process.exit(1);
    }

    if (options.output) {
      const fs = require("fs");
      fs.writeFileSync(options.output, exportData);
      console.log(`📁 Tasks exported to: ${options.output}`);
    } else {
      console.log(exportData);
    }
  });

// Command: Quick status overview
program
  .command("status")
  .description("Quick status overview of all categories")
  .action(() => {
    const db = taskManager.loadTaskDb();
    if (!db) {
      console.error("❌ Failed to load task database");
      process.exit(1);
    }

    console.log("\n🚀 TCO Project Status Overview:");
    console.log("═".repeat(70));

    Object.keys(db.categories).forEach((categoryKey) => {
      const progress = taskManager.getProgress(categoryKey);
      const category = db.categories[categoryKey];
      const statusBar = "█".repeat(Math.floor(progress.completionRate / 5));
      const emptyBar = "░".repeat(20 - Math.floor(progress.completionRate / 5));

      console.log(
        `${categoryKey.padEnd(20)} │ ${statusBar}${emptyBar} ${progress.completionRate.toString().padStart(3)}% │ ${progress.completed}/${progress.total}`
      );
    });

    console.log("═".repeat(70));

    const overallProgress = taskManager.getProgress();
    console.log(
      `Overall Progress: ${overallProgress.completionRate}% (${overallProgress.completed}/${overallProgress.total} tasks)`
    );
  });

// Command: Initialize with sample tasks from markdown
program
  .command("init")
  .description("Initialize database with sample critical tasks")
  .action(() => {
    // Add some critical tasks to get started
    const criticalTasks = [
      {
        title: "Fix ProgressContext Domain Mismatch",
        category: "critical-fixes",
        priority: 1,
        effort: "15min",
        file: "src/contexts/ProgressContext.tsx",
        lines: "75-81",
        description:
          "Update domain names from old format (FUNDAMENTALS, DEPLOYMENT) to TCO format (ASKING_QUESTIONS, REFINING_TARGETING)",
      },
      {
        title: "Update Domain Page Info Object",
        category: "critical-fixes",
        priority: 1,
        effort: "20min",
        file: "src/app/domains/[domain]/page.tsx",
        lines: "36-142",
        description: "Create new TCO-specific domainInfo with proper learning objectives",
      },
      {
        title: "Fix Domain Question Filtering",
        category: "critical-fixes",
        priority: 1,
        effort: "10min",
        file: "src/app/domains/[domain]/page.tsx",
        lines: "166-168",
        description: "Update filter logic to handle TCO domain enums properly",
      },
    ];

    console.log("🔄 Initializing task database with critical tasks...");

    criticalTasks.forEach((taskData) => {
      const taskId = taskManager.addTask(taskData);
      if (taskId) {
        console.log(`✅ Added: ${taskId}`);
      }
    });

    console.log('\n🎉 Task database initialized! Run "npm run task:status" to see overview.');
  });

// Set up program info
program.name("task-cli").description("TCO Project Task Management CLI").version("1.0.0");

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
