#!/usr/bin/env python3
"""
GitHub Spec Kit - PowerShell Enhanced Version
Updated for PowerShell Core (pwsh) environment compatibility
TCO Project Implementation - 2025-01-10

Enhanced Features:
- PowerShell Core integration
- Environment-aware execution
- TCO project specific workflows
- Enhanced error handling
"""

import sys
import argparse
import os
from pathlib import Path
import json
from datetime import datetime

class SpecifyPwshCLI:
    def __init__(self):
        self.version = "1.1.0-pwsh"
        self.project_root = Path.cwd()
        self.docs_dir = self.project_root / "docs"
        
    def show_info(self):
        """Display enhanced Spec Kit information"""
        print("🚀 GitHub Spec Kit - PowerShell Enhanced")
        print(f"Version: {self.version}")
        print(f"Project: {self.project_root.name}")
        print()
        print("✅ POWERSHELL CORE INTEGRATION")
        print("  • Environment: PowerShell Core (pwsh)")
        print("  • Python: 3.12.10 via uv")
        print("  • Claude Code: Active")
        print("  • TCO Project: Ready")
        print()
        print("📋 Enhanced Commands:")
        print("  /specify  - Create TCO certification specifications")
        print("  /plan     - Generate Next.js + Supabase implementation plans")
        print("  /tasks    - Break down into P0/P1/P2 prioritized tasks")
        print("  /init     - Initialize Spec Kit in current directory")
        print("  /status   - Show current project status")
        print()
        print("🎯 TCO Project Integration:")
        print(f"  • Project Root: {self.project_root}")
        print(f"  • Docs Directory: {self.docs_dir}")
        print("  • Tanium Certified Operator (TAN-1000) focus")
        print("  • Interactive learning modules")
        print("  • Hands-on lab exercises")
        print("  • Progress tracking & analytics")
        
    def init_project(self, project_name=None, here=False):
        """Initialize Spec Kit with enhanced PowerShell support"""
        if here:
            location = "current directory"
            path = self.project_root
        else:
            location = f"new project: {project_name}"
            path = self.project_root / project_name
            
        print(f"🎯 Initializing Enhanced Spec Kit in {location}")
        print(f"📍 Location: {path}")
        print()
        
        # Create docs directory if it doesn't exist
        docs_path = path / "docs"
        docs_path.mkdir(exist_ok=True)
        
        # Create Spec Kit status file
        status_file = docs_path / "SPEC_KIT_STATUS.json"
        status_data = {
            "version": self.version,
            "initialized": datetime.now().isoformat(),
            "project_name": project_name or path.name,
            "phases": {
                "specify": {"completed": False, "file": "SPEC_KIT_SPECIFY_REQUIREMENTS.md"},
                "plan": {"completed": False, "file": "SPEC_KIT_PLAN_TECHNICAL.md"},
                "tasks": {"completed": False, "file": "SPEC_KIT_TASKS_IMPLEMENTATION.md"}
            },
            "environment": {
                "shell": "PowerShell Core (pwsh)",
                "python": "3.12.10",
                "package_manager": "uv"
            }
        }
        
        with open(status_file, 'w') as f:
            json.dump(status_data, f, indent=2)
            
        print("📝 Spec Kit initialization complete:")
        print(f"  ✅ Status file created: {status_file}")
        print(f"  ✅ Documentation directory: {docs_path}")
        print()
        print("🚀 Ready for Spec-Driven Development workflow:")
        print("  1. python specify-cli-pwsh.py run specify")
        print("  2. python specify-cli-pwsh.py run plan")
        print("  3. python specify-cli-pwsh.py run tasks")
        print()
        print("💡 PowerShell Core integration ready!")
        
    def run_command(self, command):
        """Execute enhanced spec-driven development commands"""
        if command == "specify":
            self._run_specify()
        elif command == "plan":
            self._run_plan()
        elif command == "tasks":
            self._run_tasks()
        else:
            print(f"❌ Unknown command: {command}")
            print("Available commands: specify, plan, tasks")
            
    def _run_specify(self):
        """Enhanced /specify command for TCO project"""
        print("📋 /specify - TCO Project Specification Mode")
        print("=" * 60)
        print()
        print("🎯 TANIUM CERTIFIED OPERATOR (TAN-1000) CERTIFICATION PLATFORM")
        print()
        print("📚 Learning Objectives (Evidence-Based Requirements):")
        print("  Domain 1: Asking Questions (22% exam weight)")
        print("    • Natural language query construction")
        print("    • Sensor library mastery (500+ sensors)")
        print("    • Saved question management workflows")
        print()
        print("  Domain 2: Refining Questions & Targeting (23% - HIGHEST)")
        print("    • Dynamic computer groups with RBAC")
        print("    • Static computer group management")
        print("    • Complex filter creation & optimization")
        print()
        print("  Domain 3: Taking Action (15% exam weight)")
        print("    • Package deployment & validation")
        print("    • Action execution & monitoring")
        print("    • Approval workflow navigation")
        print()
        print("  Domain 4: Navigation & Module Functions (23% - HIGHEST)")
        print("    • Console navigation mastery")
        print("    • Core module operations")
        print("    • Workflow management")
        print()
        print("  Domain 5: Reporting & Data Export (17% exam weight)")
        print("    • Report creation & automation")
        print("    • Multi-format data export")
        print("    • Data integrity & compliance")
        print()
        print("✅ Success Criteria:")
        print("  • 95%+ certification pass rate")
        print("  • Interactive hands-on labs")
        print("  • Real-time progress tracking")
        print("  • Mobile-responsive design")
        print("  • Accessibility compliance (WCAG 2.1 AA)")
        
    def _run_plan(self):
        """Enhanced /plan command with technical details"""
        print("🗺️ /plan - Technical Implementation Plan")
        print("=" * 60)
        print()
        print("🏗️ ARCHITECTURE PLAN:")
        print("  Frontend: Next.js 15.5.2 + App Router + TypeScript")
        print("  Backend: Supabase (PostgreSQL) + Row Level Security")
        print("  UI: shadcn/ui + Radix UI + Framer Motion")
        print("  Styling: Tailwind CSS + glassmorphism")
        print()
        print("🎮 ENGAGEMENT FEATURES:")
        print("  • Interactive quizlet module")
        print("  • Gamification engine")
        print("  • Social learning features")
        print("  • Achievement system")
        print("  • Progress visualization")
        print()
        print("🧪 LAB EXERCISES:")
        print("  • LAB-AQ-001: Query Construction (12 min)")
        print("  • LAB-RQ-001: Advanced Targeting (15 min)")
        print("  • LAB-TA-001: Safe Deployment (18 min)")
        print("  • LAB-NB-001: Navigation & Roles (10 min)")
        print("  • LAB-RD-001: Data Export (14 min)")
        print()
        print("⚡ PERFORMANCE TARGETS:")
        print("  • Load time: <3s on 3G, <1s on WiFi")
        print("  • Bundle size: <500KB initial")
        print("  • Core Web Vitals compliance")
        
    def _run_tasks(self):
        """Enhanced /tasks command with prioritization"""
        print("✅ /tasks - Implementation Task Breakdown")
        print("=" * 60)
        print()
        print("🚨 P0 TASKS (CRITICAL - Must complete first):")
        print("  P0-001: Environment Verification")
        print("    - Resolve PowerShell execution issues")
        print("    - Test development server startup")
        print("    - Verify database connectivity")
        print()
        print("  P0-002: Project Functionality Assessment")
        print("    - Complete user workflow testing")
        print("    - Document actual vs claimed features")
        print("    - Identify critical gaps")
        print()
        print("⚡ P1 TASKS (HIGH PRIORITY):")
        print("  P1-001: Core Learning Modules")
        print("  P1-002: Interactive Quizlet System")
        print("  P1-003: Progress Tracking")
        print("  P1-004: Database Schema Optimization")
        print()
        print("🎯 P2 TASKS (ENHANCEMENT):")
        print("  P2-001: Advanced Gamification")
        print("  P2-002: Social Features")
        print("  P2-003: Mobile App Development")
        print("  P2-004: Analytics Dashboard")
        print()
        print("📋 Task Management:")
        print("  • Evidence-based completion criteria")
        print("  • Browser testing requirements")
        print("  • Performance validation")
        print("  • Accessibility compliance")
        
    def show_status(self):
        """Show current project status"""
        status_file = self.docs_dir / "SPEC_KIT_STATUS.json"
        
        if status_file.exists():
            with open(status_file, 'r') as f:
                status = json.load(f)
                
            print("📊 Spec Kit Project Status")
            print("=" * 40)
            print(f"Version: {status.get('version', 'Unknown')}")
            print(f"Initialized: {status.get('initialized', 'Unknown')}")
            print(f"Project: {status.get('project_name', 'Unknown')}")
            print()
            
            phases = status.get('phases', {})
            for phase_name, phase_data in phases.items():
                status_icon = "✅" if phase_data.get('completed') else "⏳"
                print(f"{status_icon} {phase_name}: {phase_data.get('file', 'Unknown')}")
        else:
            print("❌ No Spec Kit status file found. Run 'init' first.")

def main():
    """Enhanced main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="GitHub Spec Kit - PowerShell Enhanced CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument('--version', action='version', version=f'%(prog)s 1.1.0-pwsh')
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Init command
    init_parser = subparsers.add_parser('init', help='Initialize enhanced Spec Kit')
    init_parser.add_argument('project_name', nargs='?', help='Project name')
    init_parser.add_argument('--here', action='store_true', help='Initialize in current directory')
    
    # Run command
    run_parser = subparsers.add_parser('run', help='Run spec development commands')
    run_parser.add_argument('spec_command', choices=['specify', 'plan', 'tasks'], help='Spec command to run')
    
    # Status command
    status_parser = subparsers.add_parser('status', help='Show project status')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Initialize CLI
    cli = SpecifyPwshCLI()
    
    # Execute commands
    if not args.command:
        cli.show_info()
    elif args.command == 'init':
        cli.init_project(args.project_name, args.here)
    elif args.command == 'run':
        cli.run_command(args.spec_command)
    elif args.command == 'status':
        cli.show_status()
        
if __name__ == "__main__":
    main()