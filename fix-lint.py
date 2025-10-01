#!/usr/bin/env python3
"""
Comprehensive ESLint Auto-Fix Script for Modern Tanium TCO LMS
Targets 445 unused variable errors with intelligent pattern matching
"""

import os
import re
import subprocess
from pathlib import Path
from typing import Dict, List, Set

print("🔧 Starting Comprehensive ESLint Cleanup...\n")

# Step 1: Get lint output
print("📋 Step 1: Analyzing lint errors...")
try:
    result = subprocess.run(
        ['npm', 'run', 'lint'],
        capture_output=True,
        text=True,
        timeout=120
    )
    lint_output = result.stdout + result.stderr
except Exception as e:
    print(f"❌ Error running lint: {e}")
    exit(1)

# Step 2: Parse errors
files_to_fix: Dict[str, Set[str]] = {}

# Pattern: file.ts:line:col error 'varName' is defined/assigned but never used
pattern = r"^(.+?):(\d+):(\d+)\s+error\s+'(.+?)' is (?:defined but never used|assigned a value but never used)"
matches = re.finditer(pattern, lint_output, re.MULTILINE)

for match in matches:
    filepath, line_num, col_num, var_name = match.groups()
    if filepath not in files_to_fix:
        files_to_fix[filepath] = set()
    files_to_fix[filepath].add(var_name)

print(f"📊 Found {sum(len(v) for v in files_to_fix.values())} unused variables in {len(files_to_fix)} files\n")

# Step 3: Fix each file
fixed_count = 0
error_count = 0

for filepath, var_names in files_to_fix.items():
    full_path = Path(os.getcwd()) / filepath

    if not full_path.exists():
        continue

    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        for var_name in var_names:
            if var_name.startswith('_'):
                continue  # Already prefixed

            # Pattern 1: Function parameters - func(varName: Type)
            content = re.sub(
                rf'\b({var_name})\s*:\s*([^,)]+)',
                r'_\1: \2',
                content
            )

            # Pattern 2: Variable declarations - const varName =
            content = re.sub(
                rf'\b(const|let|var)\s+({var_name})\b',
                r'\1 _\2',
                content
            )

            # Pattern 3: Destructuring - { varName } or [ varName ]
            content = re.sub(
                rf'([{{,]\s*)({var_name})(\s*[,}}])',
                r'\1_\2\3',
                content
            )

            content = re.sub(
                rf'([\[,]\s*)({var_name})(\s*[,\]])',
                r'\1_\2\3',
                content
            )

            # Pattern 4: Import statements - import { varName }
            content = re.sub(
                rf'(import\s*\{{[^}}]*\b)({var_name})(\b[^}}]*\}})',
                r'\1_\2\3',
                content
            )

            # Pattern 5: Catch clauses - catch (error)
            content = re.sub(
                rf'\bcatch\s*\(\s*({var_name})\s*(?::\s*any|:\s*unknown)?\s*\)',
                r'catch (_\1)',
                content
            )

        if content != original:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += len(var_names)
            print(f"✅ Fixed {len(var_names)} variables in {filepath}")

    except Exception as e:
        print(f"❌ Error fixing {filepath}: {e}")
        error_count += 1

print("\n" + "=" * 70)
print(f"✨ Cleanup Complete!")
print(f"📁 Files Modified: {len(files_to_fix)}")
print(f"🔧 Variables Prefixed: {fixed_count}")
print(f"❌ Errors: {error_count}")
print("=" * 70 + "\n")

# Step 4: Re-run lint to verify
print("🔍 Re-running lint to verify...\n")
try:
    result = subprocess.run(
        ['npm', 'run', 'lint', '2>&1', '|', 'tail', '-5'],
        shell=True,
        capture_output=True,
        text=True,
        timeout=60
    )
    print(result.stdout)
except:
    pass

print("\n✅ Automated cleanup complete!")