# PowerShell Conversion Patterns for TCO Documentation

## Core Command Mappings

### File Operations
- `mkdir folder` → `New-Item -ItemType Directory -Path "folder"`
- `rm -rf folder` → `Remove-Item "folder" -Recurse -Force`  
- `cp -r source dest` → `Copy-Item -Recurse "source" "dest"`
- `mv old new` → `Move-Item "old" "new"`
- `touch file.txt` → `New-Item -ItemType File -Path "file.txt"`
- `cat file.txt` → `Get-Content "file.txt"`
- `ls -la` → `Get-ChildItem -Force`

### Environment Variables
- `export VAR=value` → `$env:VAR = "value"`
- `PORT=3000 npm run dev` → `$env:PORT = "3000"; npm run dev`
- `NODE_ENV=development` → `$env:NODE_ENV = "development"`

### Search Operations
- `find . -name "*.ts"` → `Get-ChildItem -Recurse -Filter "*.ts"`
- `grep -r "pattern" .` → `Select-String -Pattern "pattern" -Recurse`
- `which command` → `Get-Command command`

### Process Management
- `ps aux | grep node` → `Get-Process node`
- `kill -9 PID` → `Stop-Process -Id PID -Force`
- `killall node` → `Get-Process node | Stop-Process -Force`

### Standard Format Template
```markdown
**PowerShell (Windows):**
```powershell
# PowerShell commands here
```

**Unix/Linux:**
```bash
# Unix commands here
```
```

## Project-Specific Patterns

### TCO Development Setup
- Database initialization commands
- npm script execution with environment variables
- File permission handling differences
- Path separator considerations (\ vs /)

## Quality Assurance Notes
- All PowerShell commands must be tested for functionality
- Maintain Unix compatibility alongside PowerShell additions
- Use consistent formatting across all documentation files
- Validate environment variable handling in both systems