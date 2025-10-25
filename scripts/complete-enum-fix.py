#!/usr/bin/env python3
import re

def fix_enum_literals():
    file_path = r'C:\Users\robne\Documents\mapmydeals-gpt5\Tanium TCO\modern-tco\src\data\imported-questions-master.ts'
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Backup original
    with open(file_path + '.backup', 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Apply all remaining fixes
    fixes_applied = 0
    
    # Console Procedures
    new_content = re.sub(r'"category": "Console Procedures",', '"category": QuestionCategory.CONSOLE_PROCEDURES,', content)
    fixes_applied += len(re.findall(r'"category": "Console Procedures",', content))
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Applied {fixes_applied} enum fixes to imported-questions-master.ts")
    print("Backup created as imported-questions-master.ts.backup")

if __name__ == "__main__":
    fix_enum_literals()