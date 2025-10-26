#!/usr/bin/env node
/**
 * Task Manager Module
 * Lightweight task tracking system for TCO project
 * Prevents crashes from large markdown file imports
 */

const fs = require("fs");
const path = require("path");

class TaskManager {
  constructor() {
    this.tasksDir = path.join(__dirname);
    this.taskDbPath = path.join(this.tasksDir, "task-db.json");
    this.statusPath = path.join(this.tasksDir, "task-status.json");

    this.initializeFiles();
  }

  /**
   * Initialize task database files if they don't exist
   */
  initializeFiles() {
    if (!fs.existsSync(this.taskDbPath)) {
      const initialDb = {
        tasks: [],
        categories: {
          "critical-fixes": { priority: 1, color: "red" },
          "question-import": { priority: 2, color: "orange" },
          "module-content": { priority: 3, color: "blue" },
          "interactive-labs": { priority: 4, color: "green" },
          "advanced-features": { priority: 5, color: "purple" },
          "ui-polish": { priority: 6, color: "teal" },
          "data-persistence": { priority: 7, color: "indigo" },
          integration: { priority: 8, color: "gray" },
        },
        metadata: {
          total: 0,
          completed: 0,
          lastUpdated: new Date().toISOString(),
          version: "1.0.0",
        },
      };
      fs.writeFileSync(this.taskDbPath, JSON.stringify(initialDb, null, 2));
    }

    if (!fs.existsSync(this.statusPath)) {
      fs.writeFileSync(this.statusPath, JSON.stringify({}, null, 2));
    }
  }

  /**
   * Load task database
   */
  loadTaskDb() {
    try {
      return JSON.parse(fs.readFileSync(this.taskDbPath, "utf8"));
    } catch (error) {
      console.error("Error loading task database:", error.message);
      return null;
    }
  }

  /**
   * Load task status tracker (lightweight)
   */
  loadStatus() {
    try {
      return JSON.parse(fs.readFileSync(this.statusPath, "utf8"));
    } catch (error) {
      console.error("Error loading task status:", error.message);
      return {};
    }
  }

  /**
   * Save task database
   */
  saveTaskDb(db) {
    try {
      db.metadata.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.taskDbPath, JSON.stringify(db, null, 2));
      return true;
    } catch (error) {
      console.error("Error saving task database:", error.message);
      return false;
    }
  }

  /**
   * Save task status (lightweight updates)
   */
  saveStatus(status) {
    try {
      fs.writeFileSync(this.statusPath, JSON.stringify(status, null, 2));
      return true;
    } catch (error) {
      console.error("Error saving task status:", error.message);
      return false;
    }
  }

  /**
   * Add a new task
   */
  addTask(taskData) {
    const db = this.loadTaskDb();
    if (!db) return false;

    const newTask = {
      id: this.generateTaskId(),
      title: taskData.title,
      category: taskData.category || "general",
      priority: taskData.priority || 5,
      status: "pending",
      effort: taskData.effort || "unknown",
      file: taskData.file || null,
      lines: taskData.lines || null,
      dependencies: taskData.dependencies || [],
      description: taskData.description || "",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    db.tasks.push(newTask);
    db.metadata.total++;

    if (this.saveTaskDb(db)) {
      // Update lightweight status
      const status = this.loadStatus();
      status[newTask.id] = "pending";
      this.saveStatus(status);

      console.log(`✅ Task added: ${newTask.id} - ${newTask.title}`);
      return newTask.id;
    }

    return false;
  }

  /**
   * Update task status
   */
  updateTask(taskId, updates) {
    const db = this.loadTaskDb();
    if (!db) return false;

    const taskIndex = db.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      console.error(`❌ Task not found: ${taskId}`);
      return false;
    }

    const task = db.tasks[taskIndex];
    const oldStatus = task.status;

    // Update task properties
    Object.keys(updates).forEach((key) => {
      if (key !== "id" && key !== "created") {
        task[key] = updates[key];
      }
    });

    task.updated = new Date().toISOString();

    // Update metadata counters
    if (oldStatus !== task.status) {
      if (oldStatus === "completed" && task.status !== "completed") {
        db.metadata.completed--;
      } else if (oldStatus !== "completed" && task.status === "completed") {
        db.metadata.completed++;
      }
    }

    if (this.saveTaskDb(db)) {
      // Update lightweight status
      const status = this.loadStatus();
      status[taskId] = task.status;
      this.saveStatus(status);

      console.log(`✅ Task updated: ${taskId} - Status: ${task.status}`);
      return true;
    }

    return false;
  }

  /**
   * Get specific task
   */
  getTask(taskId) {
    const db = this.loadTaskDb();
    if (!db) return null;

    return db.tasks.find((task) => task.id === taskId) || null;
  }

  /**
   * List tasks with filters
   */
  listTasks(filters = {}) {
    const db = this.loadTaskDb();
    if (!db) return [];

    let tasks = db.tasks;

    // Apply filters
    if (filters.status) {
      tasks = tasks.filter((task) => task.status === filters.status);
    }
    if (filters.category) {
      tasks = tasks.filter((task) => task.category === filters.category);
    }
    if (filters.priority) {
      tasks = tasks.filter((task) => task.priority === parseInt(filters.priority));
    }

    // Sort by priority then by creation date
    tasks.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(a.created) - new Date(b.created);
    });

    return tasks;
  }

  /**
   * Get progress statistics
   */
  getProgress(category = null) {
    const db = this.loadTaskDb();
    if (!db) return null;

    let tasks = db.tasks;
    if (category) {
      tasks = tasks.filter((task) => task.category === category);
    }

    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "completed").length;
    const inProgress = tasks.filter((task) => task.status === "in-progress").length;
    const pending = tasks.filter((task) => task.status === "pending").length;
    const blocked = tasks.filter((task) => task.status === "blocked").length;

    return {
      total,
      completed,
      inProgress,
      pending,
      blocked,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      category: category || "all",
      lastUpdated: db.metadata.lastUpdated,
    };
  }

  /**
   * Generate unique task ID
   */
  generateTaskId() {
    const db = this.loadTaskDb();
    const existingIds = db.tasks.map((task) => task.id);

    let counter = 1;
    let newId;

    do {
      newId = `task-${String(counter).padStart(3, "0")}`;
      counter++;
    } while (existingIds.includes(newId));

    return newId;
  }

  /**
   * Import tasks from markdown (for migration)
   */
  importFromMarkdown(markdownContent) {
    // This will be implemented to parse the existing TODO list
    console.log("📝 Markdown import feature - To be implemented");
    return false;
  }

  /**
   * Export current tasks to different formats
   */
  exportTasks(format = "json") {
    const db = this.loadTaskDb();
    if (!db) return null;

    switch (format) {
      case "json":
        return JSON.stringify(db, null, 2);
      case "csv":
        // CSV export implementation
        const headers = ["ID", "Title", "Category", "Status", "Priority", "Effort"];
        const rows = db.tasks.map((task) => [
          task.id,
          task.title,
          task.category,
          task.status,
          task.priority,
          task.effort,
        ]);
        return [headers, ...rows].map((row) => row.join(",")).join("\n");
      default:
        return null;
    }
  }
}

module.exports = TaskManager;

// CLI usage when run directly
if (require.main === module) {
  const manager = new TaskManager();
  console.log("🚀 Task Manager initialized");
  console.log("📊 Current progress:", manager.getProgress());
}
