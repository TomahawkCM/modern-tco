# Modern TCO LMS Visual Style Guide

**Version**: 1.0.0
**Last Updated**: 2025-10-15
**Purpose**: Design system documentation for content creators and developers

This guide documents the visual design system used across the Modern Tanium TCO Learning Management System, including color palettes, typography, icons, and diagram creation guidelines.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Icon Library](#icon-library)
4. [Diagram Creation](#diagram-creation)
5. [Component Guidelines](#component-guidelines)
6. [Export Settings](#export-settings)
7. [File Organization](#file-organization)
8. [Best Practices](#best-practices)

---

## Color Palette

### Primary Colors

#### Tanium Brand Colors
```
Tanium Blue         #0066CC    (Primary brand color)
Tanium Blue Dark    #004C99    (Hover states, dark mode)
Tanium Blue Light   #3385D6    (Accents, highlights)
```

#### Accent Colors
```
Accent Blue         #4A90E2    (Interactive elements)
Success Green       #10B981    (Success states, positive feedback)
Warning Yellow      #F59E0B    (Warning states, cautions)
Error Red           #EF4444    (Error states, critical alerts)
Info Cyan           #06B6D4    (Information, tips)
```

### Semantic Colors

#### UI States
```
Background Dark     #1E293B    (Dark mode background)
Background Light    #F8FAFC    (Light mode background)
Border Gray         #CBD5E1    (Borders, dividers)
Text Primary        #0F172A    (Primary text - light mode)
Text Secondary      #64748B    (Secondary text)
Text Inverse        #F1F5F9    (Text on dark backgrounds)
```

#### Data Visualization
```
Chart Blue          #3B82F6
Chart Green         #22C55E
Chart Yellow        #FACC15
Chart Orange        #F97316
Chart Purple        #A855F7
Chart Pink          #EC4899
Chart Teal          #14B8A6
```

### Usage Guidelines

**Primary Brand Color** (`#0066CC`): Use for:
- Main CTAs and buttons
- Primary navigation elements
- Brand headers and logos
- Critical UI elements requiring attention

**Accent Colors**: Use for:
- Secondary actions
- Interactive hover states
- Status indicators
- Data visualization highlights

**Semantic Colors**: Reserve for specific UI states:
- ✅ Green: Success, completion, correct answers
- ⚠️  Yellow: Warnings, cautions, review needed
- ❌ Red: Errors, failures, incorrect answers
- ℹ️  Cyan: Informational messages, tips, callouts

---

## Typography

### Font Family

**Primary**: Inter (Google Fonts)
- Display text: Inter 700 (Bold)
- Headings: Inter 600 (SemiBold)
- Body: Inter 400 (Regular)
- Captions: Inter 400 (Regular, smaller size)

**Monospace**: JetBrains Mono (for code)
- Code blocks: JetBrains Mono 400
- Terminal output: JetBrains Mono 400

### Font Sizes & Scale

```
Display    48px / 3rem     Line height: 1.2    Weight: 700
H1         36px / 2.25rem  Line height: 1.3    Weight: 600
H2         30px / 1.875rem Line height: 1.3    Weight: 600
H3         24px / 1.5rem   Line height: 1.4    Weight: 600
H4         20px / 1.25rem  Line height: 1.4    Weight: 600
H5         18px / 1.125rem Line height: 1.5    Weight: 600
Body       16px / 1rem     Line height: 1.6    Weight: 400
Caption    14px / 0.875rem Line height: 1.5    Weight: 400
Small      12px / 0.75rem  Line height: 1.5    Weight: 400
```

### Typography Best Practices

1. **Hierarchy**: Always maintain clear visual hierarchy
2. **Line Length**: Keep body text between 50-75 characters per line
3. **Contrast**: Ensure WCAG AA contrast ratios (4.5:1 minimum)
4. **Responsive**: Scale fonts appropriately for mobile/tablet/desktop

---

## Icon Library

### Core Icon Set (30+ icons)

#### Navigation & Actions
```
→  Arrow Right        (Forward navigation, next steps)
←  Arrow Left         (Back navigation, previous)
↑  Arrow Up           (Scroll up, hierarchy up)
↓  Arrow Down         (Scroll down, hierarchy down)
✓  Checkmark          (Success, completion, correct)
✗  X Mark             (Close, cancel, incorrect)
+  Plus               (Add, create new)
-  Minus              (Remove, collapse)
⚙  Gear               (Settings, configuration)
🔍 Magnifying Glass   (Search, find)
```

#### Status & Feedback
```
✅ Green Check        (Success, passed, correct answer)
❌ Red X              (Error, failed, incorrect answer)
⚠️  Warning Triangle  (Warning, caution, review)
ℹ️  Info Circle       (Information, help, tips)
💡 Lightbulb          (Ideas, insights, tips)
🎯 Target             (Goals, objectives, focus)
📊 Chart              (Analytics, statistics, data)
🏆 Trophy             (Achievement, badge, completion)
⭐ Star               (Rating, favorite, highlight)
🔒 Lock               (Secure, private, locked content)
```

#### Learning & Education
```
📚 Books              (Modules, learning materials)
✏️  Pencil            (Practice, exercises, edit)
🎓 Graduation Cap     (Certification, completion)
🔬 Microscope         (Labs, experiments)
📝 Notepad            (Notes, documentation)
🎥 Video Camera       (Video content, screencasts)
🎮 Game Controller    (Interactive, gamification)
💬 Speech Bubble      (Discussion, Q&A, chat)
🔔 Bell               (Notifications, alerts)
📅 Calendar           (Schedule, deadlines)
```

### Icon Usage Guidelines

1. **Size**: Use consistent icon sizes (16px, 24px, 32px)
2. **Alignment**: Vertically center icons with adjacent text
3. **Color**: Match icon color to context (inherit from parent)
4. **Spacing**: Maintain 8px minimum spacing between icon and text
5. **Accessibility**: Always include `aria-label` for icon-only buttons

---

## Diagram Creation

### Diagram Types & Tools

#### 1. Architecture Diagrams
**Tool**: SVG programmatic generation
**Style**: Clean, professional, minimal shadows
**Colors**: Blue (#3B82F6) for architecture, Gray (#94A3B8) for traditional
**Export**: SVG, 1200x600px

**Use For**:
- System architecture comparisons
- Linear chain vs hub-and-spoke diagrams
- Network topology diagrams

#### 2. Process Flow Diagrams
**Tool**: SVG with flowchart elements
**Style**: Vertical or horizontal flow with decision points
**Colors**:
- Start/End: Green (#10B981)
- Process: Blue (#3B82F6)
- Decision: Yellow (#FACC15)
- Error: Red (#EF4444)

**Export**: SVG, 900x1200px (vertical) or 1400x400px (horizontal)

**Use For**:
- Client registration flows
- Data processing pipelines
- Deployment workflows

#### 3. UI Mockups
**Tool**: High-fidelity SVG layouts
**Style**: Realistic console interfaces, dark theme
**Colors**: Dark mode palette (#1E293B background, #F1F5F9 text)
**Export**: SVG or PNG@2x, 1600x1000px

**Use For**:
- Console layout demonstrations
- Module navigation interfaces
- Query builder mockups

#### 4. Infographics
**Tool**: Mermaid diagram syntax (embedded in MDX)
**Style**: Chart-based visualizations with emojis and visual metaphors
**Colors**: Data visualization palette (see Color Palette section)
**Export**: Inline Mermaid code blocks (auto-rendered)

**Use For**:
- Speed comparison charts
- Scalability metrics
- Performance statistics

### Diagram Design Principles

1. **Simplicity**: Remove unnecessary elements
2. **Clarity**: Label all components clearly
3. **Consistency**: Use the same visual language across all diagrams
4. **Accessibility**: Include alt text and high contrast ratios
5. **Scalability**: Design for responsive viewing (mobile-friendly)

### Standard Diagram Sizes

```
Icon/Badge:         256x256px
Small Diagram:      800x600px
Medium Diagram:     1200x800px
Large Diagram:      1600x1000px
Wide Diagram:       1400x400px (horizontal flow)
Tall Diagram:       900x1200px (vertical flow)
```

---

## Component Guidelines

### MDX Components

#### Callout Boxes
```jsx
<Callout type="note|definition|info|warning|tip|caution|lab|summary">
  Content here
</Callout>
```

**Types & Colors**:
- `note`: Blue (#3B82F6) - General information
- `definition`: Purple (#A855F7) - Term definitions
- `info`: Cyan (#06B6D4) - Informational tips
- `warning`: Yellow (#F59E0B) - Caution, review needed
- `tip`: Green (#10B981) - Best practices, pro tips
- `caution`: Red (#EF4444) - Critical warnings
- `lab`: Orange (#F97316) - Hands-on exercises
- `summary`: Gray (#6B7280) - Section summaries

#### InfoBox
```jsx
<InfoBox icon="💡" title="Quick Tip">
  Content here
</InfoBox>
```

**Style**: Dark theme with semi-transparent background

#### MicroQuizMDX
```jsx
<MicroQuizMDX
  question="Which sensor would you use to check disk space?"
  options={["Disk Space", "Memory", "CPU", "Network"]}
  correctAnswer={0}
  explanation="Disk Space sensor provides storage capacity information."
/>
```

**Colors**:
- Correct: Green (#10B981)
- Incorrect: Red (#EF4444)
- Neutral: Gray (#6B7280)

### Button Styles

```
Primary:   Blue bg (#0066CC), white text, hover: darker (#004C99)
Secondary: White bg, blue text (#0066CC), border blue
Success:   Green bg (#10B981), white text
Danger:    Red bg (#EF4444), white text
Ghost:     Transparent bg, inherit text, hover: bg-gray-100
```

---

## Export Settings

### SVG Diagrams

**Recommended Settings**:
```javascript
{
  format: 'svg',
  viewBox: '0 0 {width} {height}',
  preserveAspectRatio: 'xMidYMid meet',
  xmlns: 'http://www.w3.org/2000/svg',
  role: 'img',
  'aria-labelledby': '{diagram-title-id}'
}
```

**Optimization**:
- Minify SVG with SVGO
- Remove unnecessary metadata
- Inline critical styles
- Use semantic IDs for accessibility

### PNG Screenshots

**Console Screenshots**:
```
Format:     PNG
Resolution: 2x (Retina)
Width:      1600px minimum
Background: Actual console dark theme
DPI:        144 (2x) or 72 (1x)
```

**Compression**:
- Use pngquant or TinyPNG
- Target: <500KB per image
- Maintain visual quality (80%+ quality)

### Video Screencasts

**Micro-screencasts** (90 seconds):
```
Format:     MP4 (H.264)
Resolution: 1920x1080 (1080p)
Framerate:  30fps
Bitrate:    5-8 Mbps
Audio:      AAC 128kbps (optional)
Captions:   SRT/VTT file (required)
```

**Compression**:
- Use HandBrake or ffmpeg
- Target: <10MB per 90-second video
- Optimize for web streaming

---

## File Organization

### Directory Structure

```
modern-tco/
├── public/
│   ├── assets/
│   │   ├── diagrams/          # Programmatic SVG diagrams
│   │   │   ├── architecture-comparison.svg
│   │   │   ├── data-flow-process.svg
│   │   │   ├── component-relationships.svg
│   │   │   └── ...
│   │   └── figma/              # Figma exports (if used)
│   ├── Screenshots/            # Console screenshots (PNG)
│   │   ├── Linear Chain Architecture.png
│   │   ├── Console Layout.png
│   │   └── ...
│   └── videos/                 # Micro-screencasts (MP4)
│       ├── console-navigation.mp4
│       ├── query-builder-demo.mp4
│       └── ...
├── scripts/
│   └── diagrams/               # Diagram generation scripts
│       ├── 01-architecture-comparison.js
│       ├── 02-data-flow.js
│       ├── generate.js
│       └── manifest.json
└── docs/
    ├── VISUAL_STYLE_GUIDE.md   # This file
    └── ...
```

### Naming Conventions

**Files**: `kebab-case-descriptive-name.ext`
```
✅ architecture-comparison.svg
✅ console-layout-dark-theme.png
✅ query-builder-demo.mp4
❌ Diagram1.svg
❌ Screenshot_20250915.png
❌ vid.mp4
```

**IDs & Classes**: `kebab-case`
```html
<!-- SVG IDs -->
<svg id="diagram-architecture-comparison">
  <title id="title-architecture">Architecture Comparison</title>
</svg>

<!-- CSS Classes -->
<div class="callout-box callout-warning">...</div>
```

---

## Best Practices

### Accessibility

1. **Color Contrast**: Maintain WCAG AA compliance (4.5:1 for text, 3:1 for UI)
2. **Alt Text**: Provide descriptive alt text for all images/diagrams
3. **ARIA Labels**: Use semantic HTML and ARIA attributes
4. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
5. **Screen Readers**: Test with NVDA/JAWS/VoiceOver

### Performance

1. **Image Optimization**:
   - SVG: Minify and inline critical styles
   - PNG: Compress with pngquant (target <500KB)
   - Video: Target <10MB per minute

2. **Lazy Loading**: Use Next.js `<Image>` component with lazy loading
3. **Responsive Images**: Provide multiple sizes with `srcset`
4. **Font Loading**: Preload critical fonts, subset when possible

### Responsive Design

**Breakpoints**:
```
Mobile:  < 640px   (sm)
Tablet:  640-1024px (md, lg)
Desktop: > 1024px   (xl, 2xl)
```

**Diagram Scaling**:
- Mobile: Scale to fit container width, allow vertical scroll
- Tablet: Full width or 2-column grid
- Desktop: Full width or 3-column grid

### Version Control

1. **Source Files**: Commit SVG source code, not just rendered outputs
2. **Binary Files**: Use Git LFS for large PNGs/videos (>1MB)
3. **Documentation**: Update this guide when adding new components/patterns
4. **Changelog**: Document major design system changes

---

## Quick Reference Card

### Common Tasks

**Add a new diagram**:
1. Create SVG programmatically or manually
2. Export to `public/assets/diagrams/`
3. Reference in MDX: `![Alt text](/assets/diagrams/your-diagram.svg)`
4. Add to diagram manifest

**Add a console screenshot**:
1. Capture at 1600px minimum width
2. Compress with pngquant
3. Save to `public/Screenshots/`
4. Add descriptive alt text

**Create an infographic**:
1. Use Mermaid syntax in MDX
2. Follow color palette guidelines
3. Include title and caption
4. Test rendering on dev server

**Update color palette**:
1. Update this guide
2. Update Tailwind config if needed
3. Test in dark/light modes
4. Verify WCAG contrast compliance

---

## Resources & Tools

### Design Tools
- **SVG Editor**: Inkscape, Figma, or programmatic JavaScript
- **Image Compression**: pngquant, TinyPNG, Squoosh
- **Color Picker**: Coolors.co, Adobe Color
- **Contrast Checker**: WebAIM Contrast Checker

### Documentation
- **MDX**: https://mdxjs.com/
- **Mermaid**: https://mermaid.js.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

### Testing
- **Accessibility**: axe DevTools, Lighthouse
- **Responsive**: Chrome DevTools, BrowserStack
- **Performance**: Lighthouse, WebPageTest

---

## Change Log

### Version 1.0.0 (2025-10-15)
- Initial visual style guide creation
- Documented 21-color palette
- Added 30+ icon library
- Defined 4 diagram types with export settings
- Established typography system
- Created file organization structure

---

## Questions or Contributions?

For questions, suggestions, or contributions to the design system:
1. Open an issue in the GitHub repository
2. Contact the design team
3. Update this guide and submit a pull request

**Maintained by**: Modern TCO Development Team
**Next Review**: Quarterly (Q1 2026)
