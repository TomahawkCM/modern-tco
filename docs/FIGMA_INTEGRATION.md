# Figma Integration Guide

Complete guide for using Figma with the Tanium TCO LMS project.

## ✅ Setup Complete

Your Figma integration is fully configured with:

- ✅ API token stored securely in `.env.local`
- ✅ MCP server configured in `.mcp.json`
- ✅ API connection verified (robneveu@gmail.com)
- ✅ Design token sync script ready
- ✅ Asset export automation ready

---

## 🔧 Two Integration Methods

### **Method 1: Interactive MCP Server** (Claude-to-Figma)

Claude can directly create and modify Figma designs through conversation.

**What you get:**

- 40+ tools for real-time design manipulation
- Create shapes, text, frames, components
- Modify colors, effects, typography
- Analyze and export designs

**Setup (one-time):**

1. **Install Figma Desktop plugin:**
   - Download the plugin files from: https://github.com/arinspunk/claude-talk-to-figma-mcp
   - In Figma: Menu → Plugins → Development → Import plugin from manifest
   - Import `src/claude_mcp_plugin/manifest.json`

2. **Start WebSocket server:**

   ```bash
   npx bunx claude-talk-to-figma-mcp@latest
   # Or install globally: npm install -g claude-talk-to-figma-mcp
   # Then run: bun socket
   ```

   - Server runs on `http://localhost:3055`
   - Verify at: http://localhost:3055/status

3. **Connect Figma plugin:**
   - Open Claude MCP Plugin in Figma
   - Copy the channel ID generated

4. **Test with Claude Code:**
   ```
   Restart Claude Code, then say:
   "Talk to Figma, channel {YOUR-CHANNEL-ID}"
   ```

**Usage examples:**

```
"Create a mobile app login screen with modern styling"
"Add a blue button with rounded corners and shadow"
"Redesign this component with better contrast"
"Export this frame as PNG"
```

**Available tools:**

- Document: `get_document_info`, `get_selection`, `get_node_info`
- Creation: `create_rectangle`, `create_frame`, `create_text`, `create_ellipse`
- Modification: `set_fill_color`, `set_stroke_color`, `resize_node`, `move_node`
- Text: `set_text_content`, `set_font_name`, `set_font_size`
- Components: `get_local_components`, `create_component_instance`
- Export: `export_node_as_image`

---

### **Method 2: API Scripts** (Figma-to-Code)

Programmatic access to sync design tokens and export assets.

#### **A) Test Connection**

Verify your API token works:

```bash
node scripts/test-figma-connection.js
```

**Output:**

- ✅ User info (email, ID, handle)
- ✅ Team projects (if available)
- ✅ Connection status

---

#### **B) Sync Design Tokens**

Pull colors, fonts, spacing from Figma to Tailwind config.

**Usage:**

```bash
node scripts/sync-figma-tokens.js <FILE_KEY>
```

**Get FILE_KEY from Figma URL:**

```
https://www.figma.com/file/abc123def456/My-Design
                         ^^^^^^^^^^^^
                         This is your FILE_KEY
```

**Example:**

```bash
node scripts/sync-figma-tokens.js abc123def456
```

**What it does:**

1. Fetches color styles, text styles, effects from Figma
2. Scans document for actual color values
3. Extracts design tokens
4. Saves to `config/figma-tokens.json`

**Output file structure:**

```json
{
  "_comment": "Design tokens synced from Figma: Your File Name",
  "_syncedAt": "2025-10-12T21:00:00.000Z",
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#8B5CF6",
    "accent": "#F59E0B"
  },
  "fontFamily": {
    "heading": ["Inter", "sans-serif"],
    "body": ["Open Sans", "sans-serif"]
  },
  "spacing": {},
  "boxShadow": {},
  "borderRadius": {}
}
```

**Integrate with Tailwind:**

1. Import tokens in `tailwind.config.ts`:

   ```typescript
   import figmaTokens from "./config/figma-tokens.json";

   export default {
     theme: {
       extend: {
         colors: figmaTokens.colors,
         fontFamily: figmaTokens.fontFamily,
         boxShadow: figmaTokens.boxShadow,
         borderRadius: figmaTokens.borderRadius,
       },
     },
   };
   ```

2. Use in your components:
   ```tsx
   <div className="bg-primary text-white">Styled with Figma tokens!</div>
   ```

---

#### **C) Export Assets**

Automatically export images, icons, and components.

**Basic usage:**

```bash
# Export all marked assets
node scripts/export-figma-assets.js <FILE_KEY>

# Export as SVG at 1x scale
node scripts/export-figma-assets.js abc123 --format svg --scale 1

# Export to custom directory
node scripts/export-figma-assets.js abc123 --output public/images

# Export specific node
node scripts/export-figma-assets.js abc123 --node-id 123:456
```

**Options:**

- `--format <png|jpg|svg|pdf>` - Export format (default: png)
- `--scale <1|2|3|4>` - Scale factor (default: 2)
- `--output <dir>` - Output directory (default: public/assets/figma)
- `--node-id <id>` - Specific node to export

**What it does:**

1. Scans Figma file for exportable nodes
2. Looks for:
   - Nodes with export settings
   - Components and instances
   - Nodes with "icon", "logo", or "export" in name
3. Requests image exports from Figma API
4. Downloads to local directory
5. Creates `manifest.json` with metadata

**Marking nodes for export in Figma:**

1. Select a node/frame/component
2. Go to Export section in right panel
3. Click "+" to add export settings
4. Choose format and scale
5. Run the script!

**Output:**

```
public/assets/figma/
  ├── logo.png
  ├── icon-home.png
  ├── icon-settings.png
  ├── button-primary.png
  └── manifest.json
```

**Manifest structure:**

```json
{
  "exportedAt": "2025-10-12T21:00:00.000Z",
  "fileKey": "abc123def456",
  "fileName": "Design System",
  "format": "png",
  "scale": 2,
  "assetsCount": 15,
  "assets": [
    {
      "id": "123:456",
      "name": "Logo",
      "type": "COMPONENT",
      "filename": "logo.png"
    }
  ]
}
```

---

## 🔐 Security

- ✅ Token stored in `.env.local` (gitignored)
- ✅ Never commit tokens to version control
- ✅ Token format: `figd_*` (personal access token)
- ✅ Rotate tokens regularly in Figma settings

**Regenerate token:**

1. Go to Figma → Settings → Personal access tokens
2. Delete old token
3. Create new token
4. Update `.env.local`

---

## 🚀 Quick Start Workflows

### **Workflow 1: Design System Sync**

```bash
# 1. Open your design system in Figma
# 2. Copy the file key from URL
# 3. Sync tokens
node scripts/sync-figma-tokens.js YOUR_FILE_KEY

# 4. Update Tailwind config to import tokens
# 5. Use tokens in your components
```

### **Workflow 2: Icon Library Export**

```bash
# 1. Create an "Icons" page in Figma
# 2. Mark all icons for export (SVG format)
# 3. Export all
node scripts/export-figma-assets.js YOUR_FILE_KEY --format svg --scale 1

# 4. Icons saved to public/assets/figma/
# 5. Import in components as needed
```

### **Workflow 3: Interactive Design with Claude**

```bash
# 1. Start WebSocket server
bun socket

# 2. Open Figma plugin, get channel ID
# 3. In Claude Code:
"Talk to Figma, channel abc-123"

# 4. Start designing:
"Create a card component with shadow and rounded corners"
```

---

## 📚 API Reference

### **Figma REST API Endpoints**

All scripts use these endpoints:

- `GET /v1/me` - User information
- `GET /v1/files/:file_key` - File structure and nodes
- `GET /v1/files/:file_key/styles` - Color, text, effect styles
- `GET /v1/images/:file_key` - Export images
- `GET /v1/teams/:team_id/projects` - Team projects
- `GET /v1/styles/:style_key` - Detailed style info

**Headers required:**

```javascript
{
  'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN
}
```

---

## 🐛 Troubleshooting

**"Token not found" error:**

- Verify `.env.local` exists in project root
- Check token format: `FIGMA_ACCESS_TOKEN=figd_...`
- Restart terminal/IDE to load environment variables

**"403 Forbidden" error:**

- Token may be expired - regenerate in Figma
- Token doesn't have access to file - check permissions
- Verify you're logged into correct Figma account

**"File not found" error:**

- Check FILE_KEY is correct (from URL)
- Ensure you have access to the file
- File may be in a different team/organization

**MCP server not connecting:**

- Restart Claude Code after adding to `.mcp.json`
- Run `claude mcp list` to verify server loaded
- Check WebSocket server is running on port 3055

**No exportable nodes found:**

- Mark nodes for export in Figma (Export section)
- Or include "icon", "logo", "export" in node names
- Or use `--node-id` flag for specific nodes

---

## 📖 Additional Resources

- **Figma API Docs:** https://www.figma.com/developers/api
- **MCP Server Repo:** https://github.com/arinspunk/claude-talk-to-figma-mcp
- **Figma Plugin Docs:** https://www.figma.com/plugin-docs/
- **Tailwind Config:** https://tailwindcss.com/docs/configuration

---

## 🎯 Next Steps

1. **Get your Figma file key** from any design file URL
2. **Test the connection:**
   ```bash
   node scripts/test-figma-connection.js
   ```
3. **Choose your workflow:**
   - Design tokens → Run sync script
   - Asset export → Run export script
   - Interactive design → Set up MCP server

4. **Restart Claude Code** to enable Figma MCP server

---

**Need help?** The scripts include detailed error messages and troubleshooting tips. Run any script without arguments to see usage information.

**Integration complete! 🎉** Your Figma subscription is now connected to your development workflow.
