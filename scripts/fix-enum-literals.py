#!/usr/bin/env python3
"""
Fix enum string literals in imported-questions-master.ts
This script handles the large file that couldn't be processed through Claude's Edit tools
"""

import re
import os

def fix_enum_literals():
    # File path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, '..', 'src', 'data', 'imported-questions-master.ts')
    
    print("Starting enum literal fixes...")
    print(f"Target file: {file_path}")
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"File size: {len(content)} characters")
    
    # Count original occurrences
    difficulty_beginner = len(re.findall(r'"difficulty": "Beginner",', content))
    difficulty_intermediate = len(re.findall(r'"difficulty": "Intermediate",', content))
    difficulty_advanced = len(re.findall(r'"difficulty": "Advanced",', content))
    
    category_platform = len(re.findall(r'"category": "Platform Fundamentals",', content))
    category_console = len(re.findall(r'"category": "Console Procedures",', content))
    category_troubleshooting = len(re.findall(r'"category": "Troubleshooting",', content))
    category_practical = len(re.findall(r'"category": "Practical Scenarios",', content))
    category_linear = len(re.findall(r'"category": "Linear Chain Architecture",', content))
    
    print(f"Found difficulty strings: Beginner({difficulty_beginner}), Intermediate({difficulty_intermediate}), Advanced({difficulty_advanced})")
    print(f"Found category strings: Platform({category_platform}), Console({category_console}), Troubleshooting({category_troubleshooting}), Practical({category_practical}), Linear({category_linear})")
    
    # Replace difficulty strings
    content = re.sub(r'"difficulty": "Beginner",', '"difficulty": Difficulty.BEGINNER,', content)
    content = re.sub(r'"difficulty": "Intermediate",', '"difficulty": Difficulty.INTERMEDIATE,', content)
    content = re.sub(r'"difficulty": "Advanced",', '"difficulty": Difficulty.ADVANCED,', content)
    
    # Replace category strings
    content = re.sub(r'"category": "Platform Fundamentals",', '"category": QuestionCategory.PLATFORM_FUNDAMENTALS,', content)
    content = re.sub(r'"category": "Console Procedures",', '"category": QuestionCategory.CONSOLE_PROCEDURES,', content)
    content = re.sub(r'"category": "Troubleshooting",', '"category": QuestionCategory.TROUBLESHOOTING,', content)
    content = re.sub(r'"category": "Practical Scenarios",', '"category": QuestionCategory.PRACTICAL_SCENARIOS,', content)
    content = re.sub(r'"category": "Linear Chain Architecture",', '"category": QuestionCategory.LINEAR_CHAIN,', content)
    
    # Write the file back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Enum literal fixes completed!")
    
    # Verify changes
    with open(file_path, 'r', encoding='utf-8') as f:
        new_content = f.read()
    
    remaining_difficulty_strings = len(re.findall(r'"difficulty": "[^"]*",', new_content))
    remaining_category_strings = len(re.findall(r'"category": "[^"]*",', new_content))
    
    print(f"Remaining difficulty strings: {remaining_difficulty_strings}")
    print(f"Remaining category strings: {remaining_category_strings}")
    
    if remaining_difficulty_strings == 0 and remaining_category_strings == 0:
        print("✅ All enum conversions completed successfully!")
        return True
    else:
        print("⚠️ Some string literals may still remain")
        return False

if __name__ == "__main__":
    success = fix_enum_literals()
    if success:
        print("\n🎯 COMPLETE: All TypeScript enum errors should now be fixed!")
    else:
        print("\n⚠️ Manual review may be needed for remaining patterns")