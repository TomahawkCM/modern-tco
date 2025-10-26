# Serena MCP Installation Guide

## Overview

Serena has been successfully installed as an MCP (Model Context Protocol) server for the modern-tco project. This guide documents the installation process and configuration.

## Installation Details

### 1. Repository Setup

- **Location**: `C:\Users\robne\Documents\mapmydeals-gpt5\Tanium TCO\modern-tco\serena\`
- **Installation Method**: Git clone from <https://github.com/oraios/serena.git>
- **Python Version**: 3.11.13 (automatically managed by uv)

### 2. Dependencies Installed

```bash
# Core dependencies installed via uv sync:
- serena-agent v0.1.4
- anthropic v0.59.0
- mcp v1.12.3
- pydantic v2.11.7
- httpx v0.28.1
- psutil v7.0.0
- And 50+ other dependencies
```

### 3. Project Configuration

- **Config File**: `.serena/project.yml`
- **Project Name**: `modern-tco`
- **Language**: `typescript` (for JavaScript/TypeScript projects)
- **Cache Directory**: `.serena/cache/`
- **Memory Directory**: `.serena/memories/`

## Available Tools (25 total)

Serena provides the following tools for enhanced coding capabilities:

### File Operations

- `read_file`: Read files within the project
- `create_text_file`: Create/overwrite files
- `list_dir`: List directories with optional recursion
- `find_file`: Find files by pattern
- `search_for_pattern`: Search for patterns in project

### Symbol-Level Operations

- `find_symbol`: Global symbol search with filtering
- `find_referencing_symbols`: Find symbol references
- `get_symbols_overview`: Overview of top-level symbols in files
- `replace_symbol_body`: Replace full symbol definitions
- `insert_after_symbol`: Insert content after symbol definitions
- `insert_before_symbol`: Insert content before symbol definitions

### Memory & Knowledge Management

- `write_memory`: Store project-specific knowledge
- `read_memory`: Retrieve stored memories
- `list_memories`: List all stored memories
- `delete_memory`: Remove memories

### Project Management

- `activate_project`: Switch between projects
- `onboarding`: Perform project structure analysis
- `check_onboarding_performed`: Check if project is analyzed

### Development Support

- `execute_shell_command`: Run shell commands
- `restart_language_server`: Restart LSP when needed
- `replace_regex`: Pattern-based replacements
- `delete_lines`: Remove line ranges
- `replace_lines`: Replace line ranges
- `insert_at_line`: Insert content at specific lines

## Usage

### Starting Serena MCP Server

```bash
cd serena
uv run serena-mcp-server --project ../. --context desktop-app --mode interactive --mode editing --transport stdio
```

### Server Configuration

- **Context**: `desktop-app` (optimized for IDE usage)
- **Modes**: `interactive` + `editing` (full functionality)
- **Transport**: `stdio` (for MCP communication)
- **Project**: Automatically loads `modern-tco` project

### Web Dashboard

When running, Serena provides a web dashboard at:
`http://127.0.0.1:24284/dashboard/index.html`

## Key Benefits

1. **Token Efficiency**: 30-50% reduction in token usage through precise symbol-level operations
2. **Enhanced Code Understanding**: Semantic analysis via Language Server Protocol
3. **Project Memory**: Persistent knowledge storage across sessions
4. **Symbol-Level Editing**: Precise code modifications without reading entire files
5. **Multi-Language Support**: 16+ programming languages supported
6. **IDE-like Capabilities**: Find references, symbol navigation, and more

## Integration Status

✅ **Installed**: Serena repository cloned and dependencies installed
✅ **Configured**: Project-specific configuration created
✅ **Tested**: Server startup successful with all 25 tools loaded
✅ **Ready**: Available for Claude MCP integration

## Next Steps

To integrate with Claude Code, add the following to your MCP configuration:

```json
{
  "mcpServers": {
    "serena": {
      "command": "uv",
      "args": [
        "run",
        "serena-mcp-server",
        "--project",
        ".",
        "--context",
        "desktop-app",
        "--mode",
        "interactive",
        "--mode",
        "editing"
      ],
      "cwd": "C:/Users/robne/Documents/mapmydeals-gpt5/Tanium TCO/modern-tco/serena"
    }
  }
}
```

## Troubleshooting

- **Mode Issues**: Use separate `--mode` flags, not comma-separated values
- **Project Detection**: Ensure you're in the correct directory when starting
- **Language Server**: TypeScript LSP will be automatically downloaded if needed
- **Performance**: Initial indexing may take time for large projects

## Version Information

- **Serena Version**: 0.1.4-2ef466ee
- **Python**: 3.11.13
- **UV Package Manager**: 0.8.12
- **Installation Date**: September 1, 2025
