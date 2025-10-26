# Generate New Supabase PAT Token

## Current Issue

The Supabase Personal Access Token (PAT) in our configuration is **INVALID** (returning 401 Unauthorized).

## Steps to Fix

### 1. Generate New PAT Token

1. Go to: <https://supabase.com/dashboard/account/tokens>
2. Click "Generate new token"
3. Name it something like "TCO-MCP-Server"
4. Copy the new token (starts with `sbp_`)

### 2. Update Configuration Files

Replace the old token in these files:

**File 1: `.env.local`**

```bash
# Replace line 32:
SUPABASE_ACCESS_TOKEN=NEW_TOKEN_HERE
```

**File 2: `C:\Users\robne\AppData\Roaming\Claude\claude_desktop_config.json`**

```json
{
  "env": {
    "SUPABASE_ACCESS_TOKEN": "NEW_TOKEN_HERE"
  }
}
```

### 3. Restart Claude Desktop

- Close Claude Desktop completely
- Restart Claude Desktop
- MCP server should now connect properly

## Test Token Validity

After updating, run:

```bash
node scripts/test-supabase-token.js
```

Should show:

- ✅ Token is valid!
- ✅ Target project found
- ✅ MCP Server started successfully

## Current Token Status

❌ **INVALID**: `sbp_984dfc579739dd6c4ece2bfa74f74a1dcb340206`

- Format: `sbp_v0_...` (47 chars) - Non-standard format
- API Response: 401 Unauthorized

## Expected Format

✅ **VALID**: `sbp_[40-character-string]`

- Example: `sbp_abc123def456ghi789jkl012mno345pqr678stu`
