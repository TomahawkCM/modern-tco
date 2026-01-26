# snapshot

Get accessibility tree snapshot with interactive element refs.

## Usage
```bash
npx agent-browser snapshot [options]
```

## Options
- `-i, --interactive` - Only interactive elements
- `-c, --compact` - Remove empty structural elements
- `-d, --depth <n>` - Limit tree depth
- `-s, --selector <sel>` - Scope to CSS selector

## Examples
```bash
# Interactive elements only
npx agent-browser snapshot -i

# Compact output
npx agent-browser snapshot -i -c

# Scoped to selector
npx agent-browser snapshot -i --selector "main"
```
