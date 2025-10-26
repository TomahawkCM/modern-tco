# Suggested Commands - Modern TCO Development

## Development Commands

```bash
# Start development server (default port 3000)
npm run dev

# Start development server on custom port
npm run dev:port  # Uses port 3007

# Build for production
npm run build

# Start production server
npm start
```

## Quality Assurance Commands

```bash
# Type checking (without emitting files)
npm run typecheck

# Linting (Next.js ESLint configuration)
npm run lint

# Generate questions from scripts
npm run generate-questions

# Validate question format and content
npm run validate-questions
```

## Task Management Commands

```bash
# Initialize task management system
npm run task:init

# Add new task
npm run task:add

# List all tasks
npm run task:list

# Show specific task details
npm run task:show

# Update task status
npm run task:update

# Mark task as complete
npm run task:complete

# Show task progress overview
npm run task:progress

# Check overall task status
npm run task:status

# Export tasks to file
npm run task:export
```

## Migration Commands

```bash
# Check migration status
npm run migration:status

# List all migrations
npm run migration:list

# Start new migration
npm run migration:start

# Complete current migration
npm run migration:complete

# Create migration backup
npm run migration:backup

# Continue interrupted migration
npm run migration:continue
```

## Monitoring Commands

```bash
# Start Claude monitoring system
npm run claude:monitor

# Check Claude system status
npm run claude:status

# Run Claude system check
npm run claude:check

# Preserve Claude context
npm run claude:preserve
```

## Windows System Commands

```bash
# List directory contents
dir

# Change directory
cd path\to\directory

# Search for files
findstr "pattern" *.ts

# Find files by name
dir /s "filename"

# Show file contents
type filename.txt

# Copy files
copy source.txt destination.txt

# Remove files
del filename.txt

# Create directory
mkdir directoryname

# Remove directory
rmdir directoryname
```

## Git Commands

```bash
# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "message"

# Push to remote
git push

# Pull from remote
git pull

# Create branch
git checkout -b branch-name

# Switch branches
git checkout branch-name

# Merge branch
git merge branch-name
```

## Environment Setup

```bash
# Install dependencies
npm install

# Clean install (delete node_modules first)
npm ci

# Update dependencies
npm update

# Check outdated packages
npm outdated
```
