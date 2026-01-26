# Complete Tool Matrix & Task-Based Deployment Strategy
## Tanium TCO LMS - 12 MCP Servers

**Last Updated**: January 1, 2026
**Total Tools**: ~115 MCP tools + core Claude Code tools
**Estimated Token Cost**: ~128K tokens

---

## 📊 TOOL CAPABILITY MATRIX

### **🚨 MANDATORY: vibe-check for ALL Tasks**

**EVERY task must start with vibe-check** (~2K tokens)

```
Standard Workflow:
1. START → vibe_check (identify assumptions, potential issues)
2. EXECUTE → Task-specific tools from matrix below
3. LEARN → vibe_learn (if errors occur, learn from mistakes)
```

**Why mandatory?**
- Catches assumptions before they become problems
- Prevents cascading errors (fix one thing, break another)
- Builds learning pattern database across sessions
- 2K cost saves 10-50K in rework

**All token costs below include +2K for vibe-check**

---

### **By Task Category: What Tools to Use**

#### **1. FILE OPERATIONS**

| Task | Tools | Token Cost | Rationale |
|------|-------|------------|-----------|
| Read single file | `filesystem.read_text_file` | ~9K | Direct file access |
| Read multiple files | `filesystem.read_multiple_files` | ~9K | Batch operation |
| Edit file (line-based) | `filesystem.edit_file` | ~9K | Git-style diff editing |
| Create/overwrite file | `filesystem.write_file` | ~9K | File creation |
| Search files by pattern | `filesystem.search_files` | ~9K | Recursive search |
| Move/rename files | `filesystem.move_file` | ~9K | File management |
| Get file metadata | `filesystem.get_file_info` | ~9K | Size, timestamps, permissions |
| Directory operations | `filesystem.list_directory`, `create_directory`, `directory_tree` | ~9K | Folder management |
| Read images/media | `filesystem.read_media_file` | ~9K | Base64 media reading |

**Primary Tool**: `filesystem` (14 tools)
**Alternatives**: None for local files
**Token Cost**: ~9K

---

#### **2. GIT & VERSION CONTROL**

| Task | Tools | Token Cost | Rationale |
|------|-------|------------|-----------|
| Check repo status | Use Bash: `git status`, `git diff` | 0K (approved) | Lightweight git commands |
| Create commit | Use Bash: `git add`, `git commit` | 0K (approved) | Standard git workflow |
| Push changes | Use Bash: `git push` | 0K (approved) | Push to remote |
| Create branch | `github.create_branch` | ~18K | GitHub API for branches |
| Read repo files | `github.get_file_contents` | ~18K | Access GitHub files |
| Create PR | `github.create_pull_request` | ~18K | Full PR creation |
| Review PR | `github.create_pull_request_review` | ~18K | Add review comments |
| Merge PR | `github.merge_pull_request` | ~18K | Merge PR |
| Search code | `github.search_code` | ~18K | Cross-repo code search |
| Batch file push | `github.push_files` | ~18K | Multiple files, single commit |

**Primary Tools**:
- Local git: Bash commands (0K tokens, pre-approved)
- GitHub operations: `github` (26 tools, ~18K tokens)

**Decision Rule**: Use Bash for local git, GitHub MCP for remote/PR operations

---

#### **3. DATABASE OPERATIONS**

| Task | Tools | Token Cost | Rationale |
|------|-------|------------|-----------|
| **Local Data (TCO questions, practice)** |
| Query question bank | `sqlite-tanium.query` | ~3K | Local SQLite database |
| List local tables | `sqlite-tanium.list_tables` | ~3K | Table discovery |
| CRUD operations | `sqlite-tanium.create/read/update/delete_records` | ~3K | Local data management |
| Get local schema | `sqlite-tanium.get_table_schema` | ~3K | Schema inspection |
| **Production Data (Supabase)** |
| Query production DB | `postgresql.query` | ~8K | Production PostgreSQL |
| Get production schema | `postgresql.schema` | ~8K | With security filtering |
| List production tables | `postgresql.tables` | ~8K | With RLS filtering |
| Complex queries/RLS | `postgresql.query` (modify level) | ~8K | Advanced DB operations |

**Primary Tools**:
- Local data: `sqlite-tanium` (8 tools, ~3K tokens)
- Production data: `postgresql` (3 tools, ~8K tokens)

**Decision Rule**:
- Local/offline data → sqlite-tanium
- Production/Supabase/RLS → postgresql

---

#### **4. UI/COMPONENT DEVELOPMENT**

| Task | Tools | Token Cost | Rationale |
|------|-------|------------|-----------|
| Add new component | `shadcn.get_add_command_for_items` + `filesystem` | ~14K | Get CLI command, then install |
| Search components | `shadcn.search_items_in_registries` | ~5K | Find available components |
| View component code | `shadcn.view_items_in_registries` | ~5K | See implementation |
| Get usage examples | `shadcn.get_item_examples_from_registries` | ~5K | See demo code |
| Component audit | `shadcn.get_audit_checklist` | ~5K | Verify installation |
| Fix styling/colors | `filesystem` + maybe `playwright` for visual verify | ~9-23K | Code edit + optional visual check |
| Theme configuration | `filesystem` (edit globals.css, tailwind.config) | ~9K | Theme variables |

**Primary Tool**: `shadcn` (7 tools, ~5K tokens)
**Support**: `filesystem` for actual file edits
**Optional**: `playwright` for visual verification

**Decision Rule**:
- Adding components → shadcn + filesystem
- Fixing styles → filesystem (+ playwright if visual debugging needed)

---

#### **5. TESTING & QA**

| Task | Tools | Token Cost | Rationale |
|------|-------|------------|-----------|
| Get TypeScript errors | `ide.getDiagnostics` | ~3K | VS Code diagnostics |
| Run tests (npm/vitest) | Bash: `npm test`, `npm run lint` | 0K (approved) | Test execution |
| E2E browser testing | `playwright.browser_*` (21 tools) | ~14K | Full browser automation |
| Visual regression | `playwright.browser_take_screenshot` | ~14K | Screenshot comparison |
| Accessibility audit | `playwright.browser_snapshot` | ~14K | A11y tree snapshot |
| Network debugging | `playwright.browser_network_requests` | ~14K | Monitor API calls |
| Console errors | `playwright.browser_console_messages` | ~14K | Check browser console |
| Fill forms | `playwright.browser_fill_form` | ~14K | Automated form testing |

**Primary Tools**:
- Type checking: `ide.getDiagnostics` (1 tool, ~3K tokens)
- Unit/integration tests: Bash commands (0K, approved)
- E2E/visual testing: `playwright` (21 tools, ~14K tokens)

**Decision Rule**:
- Static analysis → ide
- Unit tests → Bash
- Browser/E2E → playwright

---

#### **6. RESEARCH & DOCUMENTATION**

| Task | Tools | Token Cost | Rationale |
|------|-------|------------|-----------|
| Get npm package docs | `context7.get-library-docs` | ~5K | Latest library documentation |
| Resolve package name | `context7.resolve-library-id` | ~5K | Find Context7 library ID |
| Scrape single page | `firecrawl.firecrawl_scrape` | ~8K | Convert to markdown/JSON |
| Web search | `firecrawl.firecrawl_search` | ~8K | Search + optional scraping |
| Crawl website | `firecrawl.firecrawl_crawl` | ~8K | Full site crawling |
| Extract structured data | `firecrawl.firecrawl_extract` | ~8K | LLM-powered extraction |
| Map site structure | `firecrawl.firecrawl_map` | ~8K | Discover all URLs |

**Primary Tools**:
- Library docs: `context7` (2 tools, ~5K tokens)
- Web scraping: `firecrawl` (6 tools, ~8K tokens)

**Decision Rule**:
- npm/framework docs → context7 (faster, specialized)
- General web content → firecrawl (more flexible)

---

#### **7. ERROR PREVENTION & LEARNING**

| Task | Tools | Token Cost | Rationale |
|------|-------|------------|-----------|
| Check assumptions | `vibe-check.vibe_check` | ~2K | Metacognitive questioning |
| Learn from mistakes | `vibe-check.vibe_learn` | ~2K | Pattern recognition |
| Set session rules | `vibe-check.update_constitution` | ~2K | Add guardrails |
| View current rules | `vibe-check.check_constitution` | ~2K | Check constitution |

**Primary Tool**: `vibe-check` (5 tools, ~2K tokens)

**Decision Rule**: Use proactively on:
- Complex tasks with high error risk
- When stuck in tunnel vision
- Before major refactors or deployments

---

#### **8. PYTHON/NOTEBOOK EXECUTION**

| Task | Tools | Token Cost | Rationale |
|------|-------|------------|-----------|
| Execute Python code | `ide.executeCode` | ~3K | Jupyter kernel execution |
| Get diagnostics | `ide.getDiagnostics` | ~3K | Error checking |

**Primary Tool**: `ide` (2 tools, ~3K tokens)

**Decision Rule**: Use for Jupyter notebooks or Python analysis

---

## 🎯 TASK-TO-TOOL DECISION MATRIX

### **Common LMS Development Scenarios**

#### **Scenario 1: Fix Color Contrast Bug**
```
Task: "Text and background same color in modules"

Analysis:
1. Visual bug → need to see it
2. Likely CSS/Tailwind classes
3. May need theme inspection

Tool Selection:
✅ vibe-check (identify assumptions about color system) - 2K
✅ filesystem (read components, search for color classes) - 9K
✅ playwright (visual verification, screenshots) - 14K
❓ shadcn (if theme config issue) - +5K

Total Cost: 25-30K tokens
Performance: ⚡⚡ Moderate (visual debugging justified)
```

#### **Scenario 2: Add New Assessment Feature**
```
Task: "Build new quiz component with shadcn"

Analysis:
1. Need shadcn components
2. File creation/editing
3. No browser testing yet

Tool Selection:
✅ vibe-check (check assumptions about quiz requirements) - 2K
✅ shadcn (find quiz components, get examples) - 5K
✅ filesystem (create files, edit) - 9K
❌ playwright (no testing needed yet)

Total Cost: 16K tokens
Performance: ⚡⚡⚡ Fast
```

#### **Scenario 3: Database Schema Migration**
```
Task: "Add new table to production Supabase with RLS"

Analysis:
1. Production database operation
2. Need RLS policy creation
3. Schema modification

Tool Selection:
✅ vibe-check (verify schema design assumptions) - 2K
✅ postgresql (schema queries, RLS policies) - 8K
✅ filesystem (migration SQL files) - 9K
❌ sqlite-tanium (wrong database - local only)

Total Cost: 19K tokens
Performance: ⚡⚡⚡ Fast
```

#### **Scenario 4: Research API Integration**
```
Task: "Research Tanium API and implement integration"

Analysis:
1. External documentation needed
2. Code implementation
3. No multi-agent needed

Tool Selection:
✅ vibe-check (identify API integration assumptions) - 2K
✅ firecrawl (scrape Tanium docs) - 8K
✅ filesystem (implement integration) - 9K
❌ context7 (not for Tanium API - use firecrawl)

Total Cost: 19K tokens
Performance: ⚡⚡⚡ Fast
```

#### **Scenario 5: TypeScript Error Fix**
```
Task: "Fix TypeScript errors in ExamInterface"

Analysis:
1. Need to see errors
2. File editing required
3. Simple bug fix

Tool Selection:
✅ vibe-check (identify root cause, not just symptoms) - 2K
✅ ide (get TypeScript diagnostics) - 3K
✅ filesystem (read file, fix errors) - 9K
❌ shadcn (not component-related)
❌ playwright (no browser needed)

Total Cost: 14K tokens
Performance: ⚡⚡⚡ Lightning fast
```

---

## 🚨 CRITICAL DEPLOYMENT RULES

### **Rule 1: Start Minimal, Add Only When Needed**
- Default to lowest-cost tools first
- Add expensive tools only when justified
- Question every tool addition

### **Rule 2: Know Your Database**
- Local/offline data → sqlite-tanium (~3K)
- Production/Supabase/RLS → postgresql (~8K)
- Never mix the two

### **Rule 3: Research Tool Selection**
- npm/framework docs → context7 (~5K, faster)
- General web scraping → firecrawl (~8K, flexible)
- Don't default to one

### **Rule 4: Visual Debugging is Valid**
- playwright isn't just for E2E tests
- Use for color bugs, layout issues, visual verification
- Justified when code inspection insufficient

### **Rule 5: Use vibe-check Proactively**
- Before complex refactors (~2K overhead)
- When stuck or making assumptions
- Error prevention > error fixing

### **Rule 6: Bash Commands When Possible**
- git status/diff/commit/push - Pre-approved, 0K tokens
- npm test/build/lint - Pre-approved, 0K tokens
- Prefer CLI over MCP when equivalent

---

## 📊 TOKEN BUDGET OPTIMIZATION

### **Current State**
- **Reported**: 118K tokens
- **Calculated**: 147K tokens
- **Discrepancy**: 29K (needs investigation)

### **Optimization Strategies**

#### **Strategy A: Lazy Loading** (Not Currently Possible)
- Only load servers when needed
- Requires config switching (manual)

#### **Strategy B: Intelligent Selection** (Current Approach)
- All tools available
- Select minimum viable set per task
- Rely on Claude's judgment

#### **Strategy C: Task-Based Profiles** (Future)
- Create `.mcp.dev.json`, `.mcp.test.json`, `.mcp.full.json`
- Switch based on task type
- Requires manual intervention

**Current Recommendation**: Strategy B with strict adherence to deployment rules

---

## ✅ QUICK REFERENCE CHART

**⚠️ ALL costs include mandatory vibe-check (+2K tokens)**

| Task Type | Primary Tools | Token Cost | Performance |
|-----------|--------------|------------|-------------|
| **File ops** | vibe-check + filesystem | ~11K | ⚡⚡⚡ |
| **Local git** | vibe-check + Bash | ~2K | ⚡⚡⚡ |
| **GitHub ops** | vibe-check + github | ~20K | ⚡⚡ |
| **Local DB** | vibe-check + sqlite-tanium | ~5K | ⚡⚡⚡ |
| **Production DB** | vibe-check + postgresql | ~10K | ⚡⚡⚡ |
| **Add component** | vibe-check + shadcn + filesystem | ~16K | ⚡⚡⚡ |
| **Fix styling** | vibe-check + filesystem ± playwright | ~11-25K | ⚡⚡⚡ |
| **TypeScript errors** | vibe-check + ide + filesystem | ~14K | ⚡⚡⚡ |
| **E2E testing** | vibe-check + playwright | ~16K | ⚡⚡ |
| **npm docs** | vibe-check + context7 | ~7K | ⚡⚡⚡ |
| **Web scraping** | vibe-check + firecrawl | ~10K | ⚡⚡⚡ |

**Legend**: ⚡⚡⚡ Fast | ⚡⚡ Moderate | ⚡ Slower

---

## 🔍 TOOL OVERLAP RESOLUTION

### **Overlap 1: File Operations**
- `filesystem` - Local files ✅ PRIMARY
- `github.get_file_contents` - GitHub repository files
- **Rule**: Local = filesystem, Remote = github

### **Overlap 2: Database**
- `sqlite-tanium` - Local/offline data ✅ PRIMARY for local
- `postgresql` - Production/Supabase ✅ PRIMARY for production
- **Rule**: Check data source location

### **Overlap 3: Research**
- `context7` - npm/framework docs ✅ PRIMARY for libraries
- `firecrawl` - General web content ✅ PRIMARY for scraping
- **Rule**: Library docs = context7, Web = firecrawl

### **Overlap 4: Git Operations**
- Bash commands - Local git (status, commit, push) ✅ PRIMARY
- `github` - Remote operations (PR, issues) ✅ PRIMARY for GitHub
- **Rule**: Local = Bash, Remote = github MCP

---

## 📝 IMPLEMENTATION CHECKLIST

When selecting tools for a task:

- [ ] 1. **START with vibe-check** (MANDATORY for ALL tasks - 2K tokens)
- [ ] 2. Identify task category (file, DB, UI, testing, etc.)
- [ ] 3. Check Quick Reference Chart for primary tools
- [ ] 4. Calculate estimated token cost (including +2K for vibe-check)
- [ ] 5. Verify no lower-cost alternative exists
- [ ] 6. Check for tool overlaps (use resolution rules)
- [ ] 7. Document tool selection rationale
- [ ] 8. Use vibe_learn if errors occur (learn from mistakes)

---

**Last Updated**: January 1, 2026
**Maintained By**: Claude Code AI Assistant
**Review Frequency**: After each major task or tool addition
