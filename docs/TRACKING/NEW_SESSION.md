# New Session Quickstart
- Default: run the next eligible task automatically  
  ```powershell
  .\scripts\go.ps1
  ```

- Dry run (see what would run, create session log, but do not execute Codex)  
  ```powershell
  .\scripts\go.ps1 -DryRun
  ```

- Run a specific task ID  
  ```powershell
  .\scripts\go.ps1 -Id TASK-0005
  ```

- Ultra-short alias  
  ```powershell
  .\scripts\g.ps1
  .\scripts\g.ps1 -Id TASK-0004
  ```
