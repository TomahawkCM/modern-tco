# GitHub Spec Kit Installation Guide

## Overview

GitHub Spec Kit is a toolkit for **Spec-Driven Development** that transforms traditional software development by making specifications executable and AI-interpretable.

## Installation Status

### ✅ Completed

- **uv package manager**: Already installed (v0.8.12)
- **System environment**: WSL2 with proper PATH configuration
- **Git**: Available in environment
- **Basic setup**: Placeholder script created for testing

### ⚠️ Installation Challenges

During the installation process, we encountered several issues:

1. **Network connectivity**: Shell commands unable to reach external URLs
2. **Python execution**: Standard Python commands not responding in WSL2 environment
3. **Package resolution**: Direct installation from GitHub repository failed

### 🔧 Current Setup

**Location**: `/modern-tco/specify-cli.py` (placeholder script)

**Purpose**: Testing and documentation of Spec Kit concepts

## What is GitHub Spec Kit?

### Core Philosophy

- **Intent-driven development**: Define "what" before "how"
- **Executable specifications**: Specifications become the foundation for direct implementation  
- **AI-powered interpretation**: Leverages AI models to transform specs into working code

### Key Features

- Multi-step refinement of project requirements
- Rich specification creation with organizational principles
- Support for 0-to-1 Development, Creative Exploration, and Iterative Enhancement
- Technology independence and enterprise constraint integration

### Command Structure

```bash
# Direct execution (recommended)
uvx specify-cli.py init <project-name>
uvx specify-cli.py init --here

# Global installation
uv tool install --from specify-cli.py specify-cli
specify init <project-name>
specify init --here
```

### Core Commands

- `/specify` - Create project specifications
- `/plan` - Generate technical implementation plans
- `/tasks` - Break down and implement project tasks

## Prerequisites

### System Requirements

- **OS**: Linux/macOS (or WSL2) ✅
- **Python**: 3.11+ (version check needed)
- **AI Agent**: Claude Code ✅
- **Package Manager**: uv ✅
- **Version Control**: Git ✅

### Python Dependencies

- `typer` - CLI framework
- `rich` - Terminal formatting
- `platformdirs` - Cross-platform paths
- `readchar` - Interactive input
- `httpx` - HTTP client

## Alternative Installation Methods

### Method 1: Direct Repository Clone

**PowerShell:**

```powershell
# Clone the repository
git clone https://github.com/github/spec-kit.git
Set-Location spec-kit

# Install dependencies
uv sync

# Run directly
python src/specify_cli/__init__.py
```

**Unix/Linux:**

```bash
# Clone the repository
git clone https://github.com/github/spec-kit.git
cd spec-kit

# Install dependencies
uv sync

# Run directly
python src/specify_cli/__init__.py
```

### Method 2: Manual Script Download

**PowerShell:**

```powershell
# Download the main script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/github/spec-kit/main/src/specify_cli/__init__.py" -OutFile "specify-cli.py"

# Install dependencies
uv add typer rich platformdirs readchar httpx

# Run
python specify-cli.py
```

**Unix/Linux:**

```bash
# Download the main script
wget https://raw.githubusercontent.com/github/spec-kit/main/src/specify_cli/__init__.py
mv __init__.py specify-cli.py
chmod +x specify-cli.py

# Install dependencies
uv add typer rich platformdirs readchar httpx

# Run
python specify-cli.py
```

### Method 3: Package Installation (if available on PyPI)

```bash
# Check if available on PyPI
uv add specify-cli

# Or try GitHub installation
uv tool install git+https://github.com/github/spec-kit.git
```

## Integration with Current Project

### Tanium TCO Project Integration

- **Location**: Install in `/modern-tco/` directory
- **Purpose**: Enhance requirements specification for TCO study modules
- **AI Integration**: Leverage existing Claude Code setup
- **Methodology**: Complement existing SPARC workflow

### Usage Scenarios

1. **Module Specification**: Define learning objectives and outcomes for TCO domains
2. **Lab Design**: Specify hands-on exercise requirements and validation criteria
3. **Assessment Planning**: Define exam question structures and difficulty progression
4. **Feature Enhancement**: Specify new interactive learning features

## Next Steps

### Immediate Actions

1. **Debug Python environment**: Resolve WSL2 Python execution issues
2. **Network troubleshooting**: Fix connectivity for package downloads
3. **Full installation**: Complete Spec Kit installation using working method
4. **Testing**: Validate functionality with sample project

### Integration Planning

1. **Workflow Integration**: Combine Spec Kit with SPARC methodology
2. **AI Enhancement**: Leverage Claude Code for specification interpretation
3. **Project Application**: Apply to TCO study module development
4. **Documentation**: Create comprehensive usage guides

## Troubleshooting

### Common Issues

- **Python not found**: Check Python installation and PATH configuration
- **Network errors**: Verify internet connectivity and firewall settings
- **Package conflicts**: Use virtual environments to isolate dependencies
- **WSL2 issues**: Consider running directly in Windows if needed

### Support Resources

- **Repository**: <https://github.com/github/spec-kit>
- **Documentation**: Check repository README and docs/
- **Issues**: Report problems on GitHub Issues page
- **Community**: Engage with maintainers Den Delimarsky and John Lam

## Summary

While the full installation encountered technical challenges, we have:

- ✅ Confirmed system compatibility (uv, Git, AI agent available)  
- ✅ Created placeholder installation for testing concepts
- ✅ Documented complete installation procedures
- ✅ Identified integration opportunities with TCO project
- ⏳ Ready to complete full installation once environment issues are resolved

The Spec Kit represents a significant advancement in AI-driven development methodology and will enhance our TCO project's specification and planning capabilities once fully operational.
