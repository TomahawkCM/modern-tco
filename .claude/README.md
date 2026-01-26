# Claude Code Configuration - Tanium TCO LMS

## 🧠 Intelligent MCP Tool Selection System

This directory contains the configuration and protocols for Claude Code's intelligent, task-based tool selection system.

### 📋 Overview

Claude automatically selects the **minimum viable toolset** for each task using a comprehensive task-to-tool mapping matrix across **12 MCP servers** (~115 MCP tools + core Claude Code tools).

---

## 📊 Complete Tool Inventory

**Total**: ~115 MCP tools + core Claude Code tools across 12 servers
**Estimated Cost**: ~128K tokens

### MCP Server Breakdown

1. **shadcn** (7 tools, ~5K) - Component library management
2. **filesystem** (14 tools, ~9K) - All file operations
3. **sqlite-tanium** (8 tools, ~3K) - Local TCO database
4. **github** (26 tools, ~18K) - Git/repository operations
5. **firecrawl** (6 tools, ~8K) - Web scraping & research
6. **playwright** (21 tools, ~14K) - Browser automation & testing
7. **supabase** (3 tools, ~8K) - PostgREST API
8. **vibe-check** (5 tools, ~2K) - Error prevention & learning
9. **context7** (2 tools, ~5K) - Library documentation
10. **docker** (4 tools, ~3K) - Container management
11. **archon** (16 tools, ~10K) - Task management & RAG
12. **postgresql** (3 tools, ~8K) - Production database

---

## 🎯 Quick Task-to-Tool Reference

**⚠️ MANDATORY: ALL tasks include vibe-check (+2K tokens)**

```
Standard Workflow:
1. START → vibe-check (identify assumptions, prevent errors)
2. EXECUTE → Task-specific tools below
3. LEARN → vibe_learn (if errors, learn from mistakes)
```

| Task Category | Primary Tools | Token Cost |
|--------------|--------------|------------|
| **File Operations** | vibe-check + filesystem | ~11K |
| **Git (Local)** | vibe-check + Bash | ~2K |
| **GitHub (Remote)** | vibe-check + github | ~20K |
| **Local Database** | vibe-check + sqlite-tanium | ~5K |
| **Production DB** | vibe-check + postgresql | ~10K |
| **UI Components** | vibe-check + shadcn + filesystem | ~16K |
| **Styling/Colors** | vibe-check + filesystem ± playwright | ~11-25K |
| **TypeScript Errors** | vibe-check + ide + filesystem | ~14K |
| **E2E Testing** | vibe-check + playwright | ~16K |
| **Library Docs** | vibe-check + context7 | ~7K |
| **Web Scraping** | vibe-check + firecrawl | ~10K |

---

## 🚨 Critical Selection Rules

### **Rule 1: Know Your Database**
- Local/offline data → sqlite-tanium (~3K)
- Production/Supabase/RLS → postgresql (~8K)

### **Rule 2: Research Tool Selection**
- npm/framework docs → context7 (~5K, faster)
- General web content → firecrawl (~8K, flexible)

### **Rule 3: Visual Debugging is Valid**
- playwright isn't just for E2E testing
- Use for color bugs, layout issues when code inspection insufficient

### **Rule 4: Bash Commands First**
- git operations: Pre-approved, 0K tokens
- Test execution: Pre-approved, 0K tokens

### **Rule 5: shadcn is for Components, Not All Styling**
- Adding components → shadcn + filesystem
- Fixing CSS/colors → filesystem (+ playwright for visual verify if needed)

---

## ✅ Real-World Examples

### **"Fix color contrast bug"**
```
✅ vibe-check (identify assumptions) - 2K
✅ filesystem (search/edit CSS) - 9K
✅ playwright (visual verify) - 14K
❌ shadcn (not for CSS fixes)
Total: ~25K | ⚡⚡ Moderate
```

### **"Add quiz component"**
```
✅ vibe-check (check requirements) - 2K
✅ shadcn (find components) - 5K
✅ filesystem (create files) - 9K
Total: ~16K | ⚡⚡⚡ Fast
```

### **"Fix TypeScript errors"**
```
✅ vibe-check (identify root cause) - 2K
✅ ide (diagnostics) - 3K
✅ filesystem (fix code) - 9K
Total: ~14K | ⚡⚡⚡ Fast
```

---

## 🔍 Tool Overlap Resolution

- **Files**: Local = filesystem | Remote = github
- **Database**: Local = sqlite-tanium | Production = postgresql
- **Research**: Library docs = context7 | Web = firecrawl
- **Git**: Local = Bash | Remote = github MCP

---

## 📁 Key Configuration Files

- **`CLAUDE.md`** - Complete project instructions with Intelligent Tool Selection Protocol
- **`COMPLETE_TOOL_MATRIX.md`** - Full 184-tool inventory with task-to-tool mappings
- **`.mcp.json`** - MCP server configuration (11 servers)
- **`agent-routing-config.json`** - Agent selection patterns
- **`settings.json`** - Claude Code preferences
- **`hooks/`** - Session lifecycle hooks
- **`commands/`** - Custom slash commands

---

## 📚 Complete Documentation

**For detailed tool mappings, see:**
- `.claude/COMPLETE_TOOL_MATRIX.md` - All 184 tools with:
  - Capability matrix by task category
  - Detailed task-to-tool decision flows
  - Token optimization strategies
  - Implementation checklists
  - Common scenario examples

**For quick reference, see:**
- `.claude/CLAUDE.md` → "Intelligent Tool Selection Protocol" section
- This README for high-level overview

---

## 🎯 Performance Targets

**Most Tasks**: <32K tokens (vibe-check + filesystem + github + sqlite)
**Complex Tasks**: <52K tokens (vibe-check + specialized tools)

**Current Budget**: ~128K tokens (12 servers)

---

**Last Updated**: January 1, 2026
**System**: Claude Code with 12 MCP servers (~115 tools)
**Strategy**: Task-based intelligent selection for optimized performance
