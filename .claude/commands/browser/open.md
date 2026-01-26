# open

Navigate to a URL in the browser.

## Usage
```bash
npx agent-browser open <url> [options]
```

## Options
- `--session <name>` - Use named session
- `--profile <path>` - Persistent browser profile
- `--headed` - Show browser window

## Examples
```bash
# Open URL
npx agent-browser open https://example.com

# With persistent profile
npx agent-browser open https://example.com --profile ~/.browser-profile

# Visible browser
npx agent-browser open https://example.com --headed
```
