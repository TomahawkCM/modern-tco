# Asking Questions Module - Asset Directory

**Module**: 01 - Asking Questions (v2)  
**Status**: Asset placeholders - awaiting Phase 4 creation  
**Last Updated**: 2025-10-13

## Directory Structure

```
asking-questions/
├── screenshots/     # Tanium Console UI captures (6 total)
├── videos/          # Micro-screencasts (2 total, 90 seconds each)
├── diagrams/        # Figma-exported layouts and flow diagrams
└── README.md        # This file
```

## Required Assets

### Screenshots (6 total) - Task 72

**Naming Convention**: `{order}-{description}-{width}x{height}.png`

1. **console-landing.png** (1920x1080)
   - Tanium Console landing page with navigation highlighted
   - Shows Console → Interact path
   - Alt text: "Tanium Console landing page showing left navigation panel with Interact module highlighted"

2. **interact-builder.png** (1920x1080)
   - Interact Question Builder interface
   - Shows empty question field and Results Grid
   - Alt text: "Tanium Interact Question Builder with empty query field and results grid below"

3. **results-grid.png** (1920x1080)
   - Results grid with populated data (Computer Name example)
   - Shows column sorting options
   - Alt text: "Tanium results grid displaying computer names with sortable columns and pagination"

4. **targeting-dropdown.png** (1920x1080)
   - Targeting dropdown menu expanded
   - Shows computer group selection options
   - Alt text: "Targeting dropdown menu showing available computer groups including All Machines and department-specific groups"

5. **save-dialog.png** (1920x1080)
   - Save Question dialog box
   - Shows name, description, folder fields
   - Alt text: "Save Question dialog with fields for question name, description, folder selection, and save button"

6. **export-dialog.png** (1920x1080)
   - Export to CSV dialog
   - Shows delimiter options and export button
   - Alt text: "Export to CSV dialog with delimiter selection (comma, semicolon, tab) and export confirmation button"

**Technical Requirements**:

- Format: PNG (lossless)
- Resolution: 1920x1080 minimum (retina-ready)
- File size: < 500KB each (use compression if needed)
- Color space: sRGB
- Accessibility: All must have descriptive alt text

**Tools**: Playwright (`mcp__playwright__browser_navigate`, `mcp__playwright__browser_take_screenshot`)

---

### Videos (2 total) - Task 61

**Naming Convention**: `{order}-{slug}-{duration}s.mp4`

1. **01-ask-first-question-90s.mp4**
   - Duration: 90 seconds
   - Content: Console login → Interact navigation → Build simple query → Preview results
   - Voiceover: Optional (captions required)
   - Resolution: 1920x1080 @ 30fps
   - Format: MP4 (H.264 codec)

2. **02-rerun-saved-question-90s.mp4**
   - Duration: 90 seconds
   - Content: Content → Saved Questions → Select question → Run → Export CSV
   - Voiceover: Optional (captions required)
   - Resolution: 1920x1080 @ 30fps
   - Format: MP4 (H.264 codec)

**Technical Requirements**:

- File size: < 15MB each
- Captions: WebVTT format (.vtt file)
- Hosting: Upload to Supabase Storage bucket `module-videos/asking-questions/`

**Tools**: External (OBS Studio, Loom, ScreenFlow)

---

### Diagrams (2 total) - Task 50

**Naming Convention**: `{order}-{description}.{format}`

1. **lesson-page-layout.png** (1440x3600)
   - Figma canvas export of full lesson page design
   - Shows section hierarchy and component placement
   - Reference: `drafts/figma/asking-questions.figma-plan.md`

2. **query-workflow-diagram.svg** (scalable)
   - FigJam flow diagram: Console → Interact → Build → Save → Export
   - Shows decision points and user actions
   - Exportable as SVG for crisp rendering

**Technical Requirements**:

- Layout: PNG @ 2x resolution (2880x7200 for retina)
- Diagrams: SVG (preferred) or PNG @ 2x
- Design system: Match shadcn/ui color palette
- Accessibility: Ensure adequate color contrast (WCAG AA)

**Tools**: Figma Desktop/Web App

---

## MDX Integration Points

The module file (`src/content/modules/01-asking-questions.mdx`) contains **8 TODO placeholders**:

| Line | Placeholder                                                               | Asset                                  | Status     |
| ---- | ------------------------------------------------------------------------- | -------------------------------------- | ---------- |
| 30   | `{/* TODO: screenshot here (Console landing hero) */}`                    | screenshots/console-landing.png        | ⏳ Pending |
| 71   | `{/* TODO: screenshot here (Interact navigation callout) */}`             | screenshots/interact-builder.png       | ⏳ Pending |
| 90   | `{/* TODO: screenshot here (Result grid highlighting column sorting) */}` | screenshots/results-grid.png           | ⏳ Pending |
| 220  | `{/* TODO: screenshot here (Targeting dropdown) */}`                      | screenshots/targeting-dropdown.png     | ⏳ Pending |
| 274  | `{/* TODO: screenshot here (Save Question dialog) */}`                    | screenshots/save-dialog.png            | ⏳ Pending |
| 304  | `{/* TODO: screenshot here (Export dialog) */}`                           | screenshots/export-dialog.png          | ⏳ Pending |
| 38   | Micro-screencast embed                                                    | videos/01-ask-first-question-90s.mp4   | ⏳ Pending |
| 386  | Micro-screencast embed                                                    | videos/02-rerun-saved-question-90s.mp4 | ⏳ Pending |

**Update Pattern** (after asset creation):

```jsx
// Before
{
  /* TODO: screenshot here (Console landing hero) */
}

// After
<Image
  src="/modules/asking-questions/screenshots/console-landing.png"
  alt="Tanium Console landing page showing left navigation panel with Interact module highlighted"
  width={1920}
  height={1080}
  priority
/>;
```

---

## Quality Checklist

Before marking Task 80 as complete, verify:

- [ ] All 6 screenshots placed in `screenshots/` directory
- [ ] All 2 videos uploaded to Supabase Storage
- [ ] All 2 diagrams exported from Figma
- [ ] All MDX TODO comments replaced with proper components
- [ ] All alt text is descriptive and accessibility-compliant
- [ ] Dev server renders all assets without 404 errors (`npm run dev`)
- [ ] Image optimization applied (next/image handles this)
- [ ] Video captions (.vtt files) present

---

## Related Tasks

- **Task 50**: Generate Figma layouts (diagrams/)
- **Task 61**: Produce micro-screencasts (videos/)
- **Task 72**: Capture console screenshots (screenshots/)
- **Task 80**: Place assets and verify MDX rendering (integration step)

---

## Notes

- This directory was created during Task Review (2025-10-13)
- Module v2 is functionally complete with content and assessments
- Asset creation is the final phase before staging deployment
- All assets should follow Web Content Accessibility Guidelines (WCAG 2.1 Level AA)
