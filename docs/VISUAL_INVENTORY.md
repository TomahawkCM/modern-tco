# Visual Inventory & Design Specifications
**Module**: Tanium Platform Foundation (00-tanium-platform-foundation.mdx)
**Analysis Date**: 2025-10-12
**Total Lines**: 4,155
**Current Visuals**: 1 image, 112 code blocks
**Target Visuals**: 13+ professional diagrams

---

## 📊 Visual Opportunities Summary

| Priority | Category | Count | Lines | Status |
|----------|----------|-------|-------|--------|
| P1 | Architecture & Data Flow | 4 | 125-850 | 🔴 Critical |
| P2 | Console UI Mockups | 3 | 997-1300 | 🟡 High |
| P3 | Process Flow Diagrams | 3 | 1570-2100 | 🟢 Medium |
| P4 | Infographics | 3 | Various | 🟢 Medium |

**Total Diagrams**: 13
**Estimated Design Time**: 16-20 hours
**Implementation Time**: 4-6 hours

---

## 🎯 Priority 1: Architecture & Data Flow (Critical)

### **Visual 1.1: Enhanced Linear Chain vs Hub-and-Spoke Architecture**

**Location**: Lines 125-148
**Current State**: 1 PNG image + text diagram
**Replacement**: Professional comparison diagram

**Design Specifications**:
```yaml
Diagram Type: Side-by-side comparison
Dimensions: 1200x600px
Format: SVG (scalable)
Color Scheme:
  - Hub-and-Spoke: Red/Orange (warning colors)
  - Linear Chain: Blue/Green (success colors)
  - Background: Transparent or subtle gradient

Left Panel (Hub-and-Spoke - "The Problem"):
  - Central server (large node) labeled "Server/CEO"
  - 8-12 endpoint nodes (smaller circles) in circular pattern
  - Red lines connecting all endpoints to center (chaos)
  - Visual indicators: ❌ Bottleneck, Traffic jam icon, Overwhelmed
  - Annotation: "50,000 endpoints all talking at once"
  - Performance bar: Red, showing "Slow/Congested"

Right Panel (Linear Chain - "The Solution"):
  - 6-8 endpoint nodes in horizontal chain
  - Blue arrows showing orderly left-to-right flow
  - Server node on right end
  - Visual indicators: ✅ Efficient, Fast icon, Organized
  - Annotation: "Constant load, regardless of scale"
  - Performance bar: Green, showing "Fast/Optimized"

Visual Metaphors:
  - Left: Crowded highway traffic jam
  - Right: Smooth assembly line

Typography:
  - Headers: Inter Bold 18px
  - Labels: Inter Regular 14px
  - Annotations: Inter Regular 12px, italic

Learning Objective: Instantly communicate the architectural difference
Accessibility: Alt text describing both approaches, high contrast
```

---

### **Visual 1.2: 5-Step Data Flow Diagram**

**Location**: Lines 720-803
**Current State**: Text descriptions with step numbers
**Replacement**: Animated flow diagram

**Design Specifications**:
```yaml
Diagram Type: Horizontal process flow with numbered stages
Dimensions: 1400x400px
Format: SVG + Optional Lottie JSON for animation
Color Scheme:
  - Step progression: Blue gradient (light to dark)
  - Active step: Bright blue with glow
  - Completed: Green checkmark
  - Arrows: Animated blue gradient

Flow Structure (Left to Right):

  Step 1 - Question Sent 🚀
  ├─ Icon: Question mark in speech bubble
  ├─ Content: "Get Installed Applications from all machines"
  ├─ Timing: "0 seconds"
  ├─ Visual: Server node with radiating question
  └─ Arrow: Animated flow →

  Step 2 - Propagation 🔗
  ├─ Icon: Chain links connecting
  ├─ Content: "Question passes through linear chain"
  ├─ Timing: "1-7 seconds"
  ├─ Visual: 5 connected endpoint nodes, wave animation
  └─ Arrow: Animated flow →

  Step 3 - Evaluation 💻
  ├─ Icon: Processor/CPU chip
  ├─ Content: "Sensors execute on each endpoint"
  ├─ Timing: "Parallel execution"
  ├─ Visual: Multiple endpoints with checkmarks appearing
  └─ Arrow: Animated flow →

  Step 4 - Response ⬅️
  ├─ Icon: Upload/return arrow
  ├─ Content: "Results collected and aggregated"
  ├─ Timing: "5-7 seconds"
  ├─ Visual: Reversed chain with data packets flowing back
  └─ Arrow: Animated flow →

  Step 5 - Storage & Display 📊
  ├─ Icon: Database + Dashboard
  ├─ Content: "Results displayed in console"
  ├─ Timing: "Total: ~15 seconds"
  ├─ Visual: Server with dashboard showing results
  └─ Result: "3,247 vulnerable endpoints identified"

Interactive Elements (if Lottie):
  - Pulse animation on each step activation
  - Data packet animation along arrows
  - Progress indicator showing 0-15 seconds
  - Checkmarks appearing as steps complete

Typography:
  - Step titles: Inter Bold 16px
  - Descriptions: Inter Regular 13px
  - Timing: Inter Medium 12px, accent color
  - Icons: 32px, consistent style

Learning Objective: Visualize the complete query lifecycle
Accessibility: Describable step-by-step for screen readers
```

---

### **Visual 1.3: Component Relationship Diagram**

**Location**: Lines 312-650 (Section 2)
**Current State**: Text descriptions with office building analogy
**Replacement**: Interactive component diagram

**Design Specifications**:
```yaml
Diagram Type: Node-and-edge relationship graph
Dimensions: 1000x700px
Format: SVG
Color Scheme:
  - Sensors: Purple (#8B5CF6)
  - Questions: Blue (#3B82F6)
  - Actions: Orange (#F59E0B)
  - Packages: Green (#10B981)
  - Connecting lines: Gray with directional arrows

Layout (Circular or Hierarchical):

  Center: "Tanium Platform"
  ├─ Top Left: SENSORS (Purple circle, 200px)
  │   ├─ Icon: Magnifying glass
  │   ├─ Label: "Data Collectors"
  │   ├─ Examples: 3 sub-nodes
  │   │   ├─ "Computer Name"
  │   │   ├─ "OS Version"
  │   │   └─ "Running Services"
  │   └─ Connection: Arrow to "Questions"
  │
  ├─ Top Right: QUESTIONS (Blue circle, 200px)
  │   ├─ Icon: Question mark
  │   ├─ Label: "Work Orders"
  │   ├─ Format bubble: "Get [Sensor] from [Target]"
  │   ├─ Example: "Find vulnerable Adobe"
  │   └─ Connections:
  │       ├─ From: Sensors (input)
  │       └─ To: Actions (decision point)
  │
  ├─ Bottom Right: ACTIONS (Orange circle, 200px)
  │   ├─ Icon: Lightning bolt
  │   ├─ Label: "Task Assignments"
  │   ├─ Examples: 3 sub-nodes
  │   │   ├─ "Install Patch"
  │   │   ├─ "Restart Service"
  │   │   └─ "Delete File"
  │   └─ Connection: Arrow to "Packages"
  │
  └─ Bottom Left: PACKAGES (Green circle, 200px)
      ├─ Icon: Box/cube
      ├─ Label: "Project Templates"
      ├─ Examples: 3 sub-nodes
      │   ├─ "Software Deploy"
      │   ├─ "Security Scan"
      │   └─ "System Config"
      └─ Connection: Back to "Sensors" (creates loop)

Workflow Overlay:
  - Numbered arrows showing typical flow: 1→2→3→4
  - "Complete Workflow" path highlighted
  - Real example: "Find Adobe → Deploy Patch → Verify Fix"

Interactive States (if needed for web):
  - Hover: Highlight component + show tooltip
  - Click: Expand to show more examples
  - Path trace: Animate workflow from Sensor to Package

Typography:
  - Component names: Inter Bold 18px
  - Labels: Inter Medium 14px
  - Examples: Inter Regular 12px
  - Workflow text: Inter Medium 13px

Learning Objective: Understand how all components work together
Accessibility: Clear labels, high contrast, logical reading order
```

---

### **Visual 1.4: Network Efficiency Comparison**

**Location**: Lines 1306-1325
**Current State**: Code blocks with bandwidth statistics
**Replacement**: Infographic with bar charts

**Design Specifications**:
```yaml
Diagram Type: Side-by-side bar chart comparison
Dimensions: 1200x500px
Format: SVG
Color Scheme:
  - Traditional: Red gradient (#EF4444 to #DC2626)
  - Tanium: Green gradient (#10B981 to #059669)
  - Background: White with subtle grid lines

Layout:

Left Side: "Traditional Tool Impact"
  Bar Chart (Vertical):
    ├─ Continuous Collection: 20% (tall red bar)
    ├─ Database Sync: 10% (medium red bar)
    ├─ Report Generation: 50% peak (huge red bar, dotted for "spike")
    └─ Total Average: 15-30% (summary indicator)

  Visual Elements:
    - Network icon with warning symbol
    - "⚠️ High Impact" badge
    - Annotation: "50,000 endpoints"
    - Bandwidth meter showing congestion

Right Side: "Tanium Impact"
  Bar Chart (Vertical - same scale):
    ├─ Query Propagation: 0.01% (tiny green bar)
    ├─ Response Collection: 0.05% (small green bar)
    ├─ Baseline: 0% (flat line)
    └─ Total Peak: <0.1% (summary indicator)

  Visual Elements:
    - Network icon with checkmark
    - "✅ Minimal Impact" badge
    - Annotation: "Same 50,000 endpoints"
    - Bandwidth meter showing "clear"

Comparison Highlights:
  - Large "300x More Efficient" badge in center
  - Arrow pointing from red to green showing reduction
  - "Network Savings" callout box:
      • 99.7% reduction in bandwidth usage
      • No continuous polling
      • No database synchronization overhead

Typography:
  - Title: Inter Bold 24px
  - Percentages: Inter Bold 32px
  - Labels: Inter Medium 14px
  - Annotations: Inter Regular 12px

Data Visualization Best Practices:
  - Y-axis starts at 0
  - Same scale for fair comparison
  - Clear legend
  - Grid lines for easy reading

Learning Objective: Dramatic visualization of efficiency gains
Accessibility: Data table alternative provided in alt text
```

---

## 🎮 Priority 2: Console UI Mockups (High Priority)

### **Visual 2.1: Tanium Console Layout**

**Location**: Lines 997-1013
**Current State**: ASCII art diagram
**Replacement**: Professional UI mockup

**Design Specifications**:
```yaml
Mockup Type: High-fidelity console interface
Dimensions: 1600x1000px (16:10 for realistic console view)
Format: PNG at 2x and 3x for retina
Color Scheme: Match Tanium actual console or modern dark theme
  - Primary: #1E293B (dark blue-gray)
  - Secondary: #334155
  - Accent: #3B82F6 (blue)
  - Success: #10B981
  - Warning: #F59E0B
  - Background: #0F172A

Layout Structure:

┌─────────────────────────────────────────────────────────────┐
│ TOP BAR (60px height, dark bg)                             │
├─────┬───────────────────────────────────────────────────────┤
│     │                                                         │
│ NAV │  CONTENT AREA                                          │
│     │                                                         │
│ 240 │  (Main interaction space)                              │
│ px  │                                                         │
│     │                                                         │
├─────┴───────────────────────────────────────────────────────┤
│ STATUS BAR (40px height)                                    │
└─────────────────────────────────────────────────────────────┘

Detailed Components:

1. TOP NAVIGATION BAR:
   Left Section (400px):
   - Tanium Logo (120px width, white/blue)
   - Module Dropdown: "Interact ▼" (button style)

   Center Section (600px):
   - Global Search bar with icon
   - Placeholder: "Search endpoints, questions, actions..."

   Right Section (600px):
   - Notification bell icon (badge showing "3")
   - User avatar (32px circle) + "Admin ▼"
   - Help icon (?)
   - Settings gear icon

2. LEFT SIDEBAR (240px width):
   Header:
   - "Interact" title (18px)
   - Collapse button (≡ icon)

   Navigation Items (48px height each):
   - 📊 Dashboard (active state - highlighted)
   - ❓ Questions
   - ⚡ Actions
   - 🔧 Configuration
   - 📈 Trends
   - 🔗 Connect

   Footer:
   - Version info
   - Status indicator

3. CONTENT AREA:
   Dashboard View:

   Top Section (200px):
   - Large metrics cards (3 columns)
     Card 1: "System Health"
       • 49,847 Online (green)
       • 153 Offline (orange)
       • Sparkline graph

     Card 2: "Query Performance"
       • Avg: 15s
       • Last: 12s
       • Trend: ▼ 2s

     Card 3: "Active Operations"
       • 2 Queries running
       • 1 Action deploying
       • Mini progress bars

   Recent Activity Feed (400px):
   - Timeline list with icons:
     • [15s ago] Chrome vulnerability query - 3,247 results
     • [2m ago] Patch deployed to 2,450 endpoints - 98% success
     • [5m ago] Service restart action completed
   - Each item has: timestamp, description, status badge

   Quick Actions Section (200px):
   - Button grid (2x2):
     • "New Question" (primary button)
     • "Deploy Action" (secondary)
     • "View Trends" (secondary)
     • "Import Package" (secondary)

4. STATUS BAR:
   Left: Connection Status
   - ● Green dot
   - "Online | 50,000 clients connected"

   Center: Active Operations
   - "Query running: Adobe Reader scan (8s elapsed)"
   - Progress bar: 75%

   Right: System Info
   - "Tanium Server 7.5"
   - "PostgreSQL healthy"
   - Clock: "14:32 UTC"

Realistic UI Details:
- Shadows and depth (subtle elevation)
- Hover states indicated with lighter backgrounds
- Active states with accent color
- Loading spinners where appropriate
- Tooltips on hover (small callouts)
- Rounded corners (4px-8px radius)
- Proper spacing (8px, 16px, 24px increments)

Typography:
- Headings: Inter Bold 18-24px
- Body: Inter Regular 14px
- Small text: Inter Regular 12px
- Monospace for IDs: Fira Code 12px

Learning Objective: Show students exactly what they'll see in console
Accessibility: Clear visual hierarchy, sufficient contrast ratios
```

---

### **Visual 2.2: Module Navigation Interface**

**Location**: Lines 1119-1300
**Current State**: Text list descriptions
**Replacement**: Interactive module selector mockup

**Design Specifications**:
```yaml
Mockup Type: Module switcher dropdown/grid
Dimensions: 800x600px
Format: PNG at 2x
Color Scheme: Same as console theme

Design: Modal/Dropdown Style

Header:
- "Select Module" title
- Search box: "Filter modules..."
- Close button (×)

Module Grid (3 columns x 3 rows):

Row 1 - Core Modules:
  [Interact]
  ├─ Icon: Question mark in circle (blue)
  ├─ Title: "Interact"
  ├─ Description: "Real-time endpoint operations"
  ├─ Status: Active (green dot)
  └─ Badge: "Most Used"

  [Trends]
  ├─ Icon: Line chart (purple)
  ├─ Title: "Trends"
  ├─ Description: "Historical analysis"
  ├─ Status: Active
  └─ Badge: none

  [Connect]
  ├─ Icon: Link/chain (teal)
  ├─ Title: "Connect"
  ├─ Description: "Third-party integrations"
  ├─ Status: Active
  └─ Badge: none

Row 2 - Specialized Modules:
  [Patch]
  ├─ Icon: Shield with checkmark (orange)
  ├─ Title: "Patch"
  ├─ Description: "Update management"
  ├─ Status: Active
  └─ Badge: "New Updates Available" (orange)

  [Asset]
  ├─ Icon: Computer/server (gray)
  ├─ Title: "Asset"
  ├─ Description: "Inventory management"
  ├─ Status: Active
  └─ Badge: none

  [Comply]
  ├─ Icon: Checklist (green)
  ├─ Title: "Comply"
  ├─ Description: "Configuration mgmt"
  ├─ Status: Active
  └─ Badge: none

Row 3 - Security Modules:
  [Threat Response]
  ├─ Icon: Shield with alert (red)
  ├─ Title: "Threat Response"
  ├─ Description: "Security operations"
  ├─ Status: Active
  └─ Badge: "3 Active Hunts"

  [Deploy]
  ├─ Icon: Rocket (blue)
  ├─ Title: "Deploy"
  ├─ Description: "Software deployment"
  ├─ Status: Active
  └─ Badge: none

  [More...]
  ├─ Icon: Grid of dots
  ├─ Title: "View All"
  ├─ Description: "See all modules"
  └─ Link to expanded view

Interactive States:
- Default: White/light background
- Hover: Light blue background, elevation shadow
- Active/Selected: Blue border, checkmark
- Disabled: Grayed out with lock icon
- Loading: Spinner animation

Each Module Card:
- Size: 240x180px
- Padding: 16px
- Border radius: 8px
- Icon: 48px
- Title: Inter Bold 16px
- Description: Inter Regular 13px
- Badge: Rounded pill, 10px padding

Typography:
- Header: Inter Bold 20px
- Module names: Inter Bold 16px
- Descriptions: Inter Regular 13px
- Badges: Inter Medium 11px

Learning Objective: Familiarize students with module ecosystem
Accessibility: Keyboard navigation, ARIA labels
```

---

### **Visual 2.3: Question Builder Interface**

**Location**: Lines 428-475
**Current State**: Text format examples
**Replacement**: Visual query builder mockup

**Design Specifications**:
```yaml
Mockup Type: Question builder UI with drag-and-drop zones
Dimensions: 1200x700px
Format: PNG at 2x
Color Scheme: Console theme with builder-specific elements

Layout: Question Construction Interface

Top Section - Query Template:
┌─────────────────────────────────────────────────────┐
│ Get [SENSOR ▼] from [TARGET ▼] where [CONDITION ▼]  │
└─────────────────────────────────────────────────────┘

Three Dropzone Areas (Horizontal Layout):

1. SENSOR SELECTOR (350px width):
   Header: "1. Choose Sensor"

   Search box: "Search 500+ sensors..."

   Sensor List (scrollable):
   ┌─────────────────────────────────┐
   │ ⚡ Popular Sensors               │
   │                                  │
   │ [📋] Computer Name               │
   │ [💻] Operating System            │
   │ [🔧] Installed Applications     │ ← Selected (highlighted)
   │ [👤] Logged In Users             │
   │ [📁] File Details                │
   │                                  │
   │ ⚙️ All Sensors (500+)            │
   │ ... (collapsed)                  │
   └─────────────────────────────────┘

   Selected Sensor Card:
   - Name: "Installed Applications"
   - Description: "Returns list of installed software"
   - Output: "Application names and versions"
   - Examples: 3 sample outputs

2. TARGET SELECTOR (300px width):
   Header: "2. Select Target"

   Options:
   ┌─────────────────────────────────┐
   │ ○ All Machines (50,000)         │
   │                                  │
   │ ● Computer Groups                │
   │   ▼ [Marketing Dept] (1,200)    │ ← Selected
   │   ▢ [Sales Team] (450)          │
   │   ▢ [Engineering] (2,100)       │
   │   ▢ [Executives] (25)           │
   │                                  │
   │ ○ Specific IPs/Names            │
   │   [Enter IP or hostname...]     │
   │                                  │
   │ ○ Custom Filter                 │
   │   [Add conditions...]           │
   └─────────────────────────────────┘

   Target Count: "1,200 endpoints" (highlighted)

3. CONDITION BUILDER (350px width):
   Header: "3. Add Conditions (Optional)"

   Condition Rules:
   ┌─────────────────────────────────┐
   │ where                           │
   │                                  │
   │ [Installed Applications ▼]      │
   │ [contains ▼]                    │
   │ [Adobe Reader____]              │
   │                                  │
   │ + Add AND condition             │
   │ + Add OR condition              │
   │                                  │
   │ Advanced Filter:                │
   │ Version < 24.0                  │
   └─────────────────────────────────┘

   Logic operators: AND, OR, NOT (chips)
   Comparison ops: =, !=, >, <, contains, matches

Bottom Section - Query Preview & Actions:

Preview Panel (800px width):
┌─────────────────────────────────────────────────────┐
│ 📝 Query Preview:                                    │
│                                                      │
│ Get Installed Applications from Computer Group      │
│ "Marketing Dept" where Installed Applications       │
│ contains "Adobe Reader"                              │
│                                                      │
│ ⏱️ Estimated: 15 seconds | 🎯 Targets: 1,200        │
└─────────────────────────────────────────────────────┘

Action Buttons:
- [Run Question] (primary, blue, large)
- [Save as Saved Question] (secondary)
- [Clear All] (text button)

Right Sidebar - Help & Examples:
┌─────────────────────────┐
│ 💡 Quick Tips           │
│ • Start with sensor     │
│ • Narrow your target    │
│ • Test before saving    │
│                         │
│ 📚 Example Queries      │
│ • Find Chrome           │
│ • Check disk space      │
│ • List services         │
└─────────────────────────┘

Interactive Elements:
- Drag sensors to template
- Autocomplete in search boxes
- Live preview updates as you type
- Validation indicators (green checkmark / red X)
- Sample data tooltips on hover
- "?" help icons with explanations

Color Coding:
- Sensors: Purple highlights
- Targets: Blue highlights
- Conditions: Orange highlights
- Valid state: Green borders
- Invalid state: Red borders with error message

Typography:
- Section headers: Inter Bold 14px
- Dropdown text: Inter Regular 14px
- Preview text: Fira Code 16px
- Help text: Inter Regular 12px

Learning Objective: Demystify question building with visual tool
Accessibility: Clear focus states, keyboard shortcuts, screen reader labels
```

---

## 🔄 Priority 3: Process Flow Diagrams (Medium Priority)

### **Visual 3.1: Client Registration Flow**

**Location**: Lines 2890-2968
**Current State**: Bash diagnostic script
**Replacement**: Flowchart diagram

**Design Specifications**:
```yaml
Diagram Type: Vertical flowchart with decision trees
Dimensions: 900x1200px
Format: SVG
Color Scheme:
  - Start/End: Green rounded rectangles
  - Process steps: Blue rectangles
  - Decisions: Yellow diamonds
  - Error paths: Red dashed lines
  - Success paths: Green solid lines

Flow Structure:

START: "New Client Installation"
  ↓
[Check: TaniumClient service installed?]
  ├─ NO → [ERROR: Install client first] → END
  └─ YES ↓

[Check: Network connectivity to server?]
  ├─ NO → [ERROR: Check firewall/network] → END
  └─ YES ↓

[Process: Client attempts registration]
  ↓
[Check: Server reachable on port 17472?]
  ├─ NO → [Check: Port open in firewall?]
  │         ├─ NO → [ERROR: Open port 17472] → END
  │         └─ YES → [Check: Server IP correct?]
  │                    ├─ NO → [Fix: Update ServerNameList] → Retry
  │                    └─ YES → [ERROR: Server may be down] → END
  └─ YES ↓

[Process: Exchange certificates]
  ↓
[Check: Certificate valid?]
  ├─ NO → [ERROR: Certificate mismatch] → [Fix: Re-deploy cert] → Retry
  └─ YES ↓

[Process: Client registers with server]
  ↓
[Check: Registration successful?]
  ├─ NO → [Check: Registration string correct?]
  │         ├─ NO → [Fix: Update registration string] → Retry
  │         └─ YES → [ERROR: Contact support] → END
  └─ YES ↓

[Process: Client joins linear chain]
  ↓
[Check: Peers available?]
  ├─ NO → [Direct connection to server] → SUCCESS
  └─ YES → [Connect to peer chain] → SUCCESS

SUCCESS: "Client Registered & Operational"
  ↓
[Status: Ready to receive questions]

Visual Elements:
- Decision diamonds: 200x150px
- Process boxes: 250x80px
- Error boxes: Red border, warning icon
- Success boxes: Green border, checkmark icon
- Retry loops: Curved arrows back to decision point
- Icons: Checkmarks (✓), X marks (✗), Warning (⚠️)

Annotations:
- Port numbers labeled clearly
- Time estimates for each step
- Common error messages in callout boxes
- "Pro Tips" in blue info boxes

Typography:
- Step text: Inter Medium 13px
- Decision questions: Inter Bold 14px
- Error messages: Inter Regular 12px, red
- Annotations: Inter Regular 11px, gray

Learning Objective: Troubleshoot registration issues systematically
Accessibility: Clear logical flow, numbered steps alternative
```

---

### **Visual 3.2: Deployment Architecture Diagram**

**Location**: Lines 1566-1765
**Current State**: Code/text descriptions
**Replacement**: Infrastructure topology diagram

**Design Specifications**:
```yaml
Diagram Type: Network topology / geographic distribution
Dimensions: 1400x900px
Format: SVG
Color Scheme:
  - Servers: Blue (primary infrastructure)
  - Zone Servers: Teal (regional infrastructure)
  - Clients: Gray (endpoints)
  - Network lines: Different colors per zone
  - Geographic regions: Subtle background colors

Layout: Geographic / Hierarchical

Top Tier - Central:
┌─────────────────────────────────────────┐
│  🏢 Corporate Headquarters (New York)   │
│                                          │
│  [Tanium Server Cluster]                │
│  ├─ Primary Server (Active)             │
│  ├─ Secondary Server (Standby)          │
│  └─ Database: PostgreSQL HA             │
│                                          │
│  Specs: 32 cores, 128GB RAM, 2TB NVMe  │
└─────────────────────────────────────────┘
          │
          ├──────────────┬──────────────────┐
          ↓              ↓                  ↓

Middle Tier - Regional Zone Servers:

[Zone Server: US West]   [Zone Server: Europe]   [Zone Server: Asia-Pacific]
Location: San Francisco   Location: London         Location: Singapore
├─ 15,000 clients        ├─ 12,000 clients       ├─ 8,000 clients
├─ 8 cores, 32GB RAM     ├─ 8 cores, 32GB RAM    ├─ 8 cores, 32GB RAM
└─ Latency: 45ms to HQ   └─ Latency: 85ms to HQ  └─ Latency: 165ms to HQ
     │                        │                        │
     ├────┬────┐             ├────┬────┐             ├────┬────┐
     ↓    ↓    ↓             ↓    ↓    ↓             ↓    ↓    ↓

Bottom Tier - Endpoint Groups:

[Endpoint Cluster]  [Endpoint Cluster]  [Endpoint Cluster]
3,000 endpoints     5,000 endpoints     7,000 endpoints
- Desktops         - Laptops           - Servers
- Servers          - Mobile devices    - Virtual machines
Linear Chain: A→B→C Linear Chain: A→B→C Linear Chain: A→B→C

Visual Elements per Component:

Tanium Server:
- Large cylinder icon (database)
- Server rack icon
- HA badge (High Availability)
- Status: Green dot "Active"
- Metrics card: CPU, Memory, Connections

Zone Servers:
- Medium server icon
- Geographic flag icon
- Connection lines to HQ (latency labeled)
- Client count badge
- Status indicator

Endpoints:
- Small computer/laptop/server icons
- Grouped in clusters of 5-10 icons
- Linear chain lines connecting them
- Region label
- Total count badge

Network Lines:
- Solid lines: Active connections
- Dashed lines: Backup/failover paths
- Line thickness: Indicates bandwidth/capacity
- Color: Different per geographic region
- Labels: Latency, bandwidth

Legend Box (Bottom Right):
- Primary Server: Blue cylinder
- Zone Server: Teal server
- Endpoints: Gray laptop/desktop
- Active Connection: Solid line
- Backup Connection: Dashed line
- Linear Chain: Arrowed connections

Callout Boxes:
1. "50,000 Total Endpoints"
2. "3 Geographic Regions"
3. "< 200ms Worst-Case Latency"
4. "99.99% Availability"

Typography:
- Location names: Inter Bold 16px
- Server specs: Inter Regular 12px
- Metrics: Inter Medium 13px
- Callouts: Inter Bold 18px

Learning Objective: Understand enterprise deployment topology
Accessibility: Alternative text describing hierarchy
```

---

### **Visual 3.3: Security Certificate Hierarchy (PKI Tree)**

**Location**: Lines 2047-2106
**Current State**: Text tree structure
**Replacement**: PKI tree diagram

**Design Specifications**:
```yaml
Diagram Type: Hierarchical tree structure
Dimensions: 1000x800px
Format: SVG
Color Scheme:
  - Root CA: Red (most trusted)
  - Infrastructure CA: Orange
  - Server Certs: Blue
  - Client Certs: Green
  - Connection lines: Gray

Tree Structure (Top-Down):

Level 0 - Root CA (Offline):
┌────────────────────────────────────┐
│    🔐 Tanium Root CA               │
│    Status: OFFLINE (Cold Storage)  │
│    Validity: 20 years              │
│    Key: RSA 4096                   │
└────────────────────────────────────┘
           │
           ├──────────────┬──────────────┐
           ↓              ↓              ↓

Level 1 - Intermediate CAs:
[Infrastructure CA]  [Module CA]  [Content CA]
└─ Issues server    └─ Signs     └─ Package
   certificates        modules       signing

           │
    ┌──────┴──────┐
    ↓             ↓

Level 2 - Server Certificates:
[Tanium Server Cert]    [Zone Server Cert]
├─ CN: tanium.company   ├─ CN: zone1.tanium
├─ Validity: 2 years    ├─ Validity: 2 years
├─ Purpose: TLS         ├─ Purpose: TLS
└─ Status: Active ✓     └─ Status: Active ✓
         │                       │
         └───────┬───────────────┘
                 ↓

Level 3 - Client Certificates:
[Client Certificate Template]
├─ Auto-enrollment enabled
├─ Validity: 1 year
├─ Auto-renewal: 30 days before expiry
└─ Issued to: 50,000 endpoints
         │
    ┌────┼────┐
    ↓    ↓    ↓
[Client] [Client] [Client]
Laptop   Desktop  Server
Cert     Cert     Cert

Certificate Icons:
- Root CA: Gold shield with lock
- Intermediate: Silver shield
- Server: Blue certificate document
- Client: Green certificate document
- Expired: Red X overlay
- Expiring Soon: Orange warning

Visual Relationships:
- Parent-child: Solid black lines with arrows
- Trust chain: Green highlight path
- Certificate details: Expandable cards
- Status indicators: Color-coded dots

Callout Information Boxes:
1. Root CA Storage:
   "Stored offline in HSM (Hardware Security Module)"
   "Only activated for CA operations"

2. Rotation Schedule:
   "Server Certs: Renewed every 2 years"
   "Client Certs: Auto-renewed every year"

3. Trust Chain:
   "Endpoint validates: Client → Server → Infrastructure → Root"

4. Security Features:
   "• Certificate pinning enabled"
   "• Revocation checking (OCSP)"
   "• Automatic rotation alerts"

Interactive Elements (if web version):
- Click certificate: Show full details
- Hover: Display validity dates
- Trace trust path: Highlight chain

Typography:
- CA names: Inter Bold 16px
- Certificate fields: Fira Code 12px
- Callouts: Inter Regular 13px
- Status text: Inter Medium 12px

Learning Objective: Understand PKI trust model
Accessibility: Hierarchical heading structure in alt text
```

---

## 📊 Priority 4: Infographics (Medium Priority)

### **Visual 4.1: Speed Comparison Chart**

**Location**: Lines 834-851
**Current State**: Code blocks showing time comparison
**Replacement**: Engaging infographic with metaphors

**Design Specifications**:
```yaml
Diagram Type: Comparison infographic with visual metaphors
Dimensions: 1200x600px
Format: SVG
Color Scheme:
  - Traditional: Red/Orange (slow)
  - Tanium: Blue/Green (fast)
  - Background: White gradient

Layout: Side-by-Side with Visual Drama

Left Panel: "Traditional Tool" 🐌
┌────────────────────────────────┐
│  🐌 SLOW & STEADY              │
│                                 │
│  Timeline (Vertical):           │
│                                 │
│  Hour 0-4:                     │
│  [█████░░░░░] Polling          │
│  └─ "Server polls endpoints"   │
│                                 │
│  Hour 4-24:                    │
│  [██████████] Processing       │
│  └─ "Database updates"         │
│                                 │
│  Hour 24-48:                   │
│  [█████░░░░░] Results          │
│  └─ "Incomplete data"          │
│                                 │
│  ⏰ Total: 48 HOURS            │
│                                 │
│  Visual: Snail icon, hourglass │
│  Color: Red progress bars      │
└────────────────────────────────┘

Right Panel: "Tanium" 🚀
┌────────────────────────────────┐
│  🚀 LIGHTNING FAST             │
│                                 │
│  Timeline (Compressed):         │
│                                 │
│  Second 0:                      │
│  [█] Question Sent             │
│                                 │
│  Seconds 1-7:                   │
│  [████] Propagation            │
│                                 │
│  Seconds 8-15:                  │
│  [████] Complete!              │
│                                 │
│  ⚡ Total: 15 SECONDS          │
│                                 │
│  Visual: Rocket icon, lightning │
│  Color: Green progress bars     │
└────────────────────────────────┘

Center Comparison Element:
┌────────────────────────────────┐
│   ⚡ 11,520X FASTER ⚡         │
│                                 │
│   48 hours = 172,800 seconds   │
│   vs                            │
│   15 seconds                    │
│                                 │
│   That's 2 DAYS vs 15 SECONDS! │
└────────────────────────────────┘

Visual Metaphors:
- Traditional: Snail crawling up timeline
- Tanium: Rocket zooming across
- Speed lines and motion blur on Tanium side
- Calendar pages falling for Traditional
- Lightning bolt for Tanium

Additional Data Points:
Bottom Section - Impact Cards:

[Traditional Impact]          [Tanium Impact]
- 48 hours to answer         - 15 seconds to answer
- 60-80% incomplete data     - 100% complete data
- High network congestion    - <0.1% network usage
- Stale information         - Real-time data
- Limited scalability       - Unlimited scale

Typography:
- Headline numbers: Inter Bold 48px
- Timeline labels: Inter Bold 18px
- Descriptions: Inter Regular 14px
- Comparison stat: Inter Black 36px, highlight color

Visual Effects:
- Drop shadows for depth
- Glow effect on "faster" text
- Gradient backgrounds
- Icon animations (if animated version)

Learning Objective: Dramatic visualization of time savings
Accessibility: Clear numeric comparison in alt text
```

---

### **Visual 4.2: Scalability Metrics Visualization**

**Location**: Lines 1347-1400
**Current State**: Text descriptions of linear performance
**Replacement**: Line graph showing consistent performance

**Design Specifications**:
```yaml
Diagram Type: Multi-line graph with comparison
Dimensions: 1200x700px
Format: SVG
Color Scheme:
  - Tanium: Blue solid line (flat/linear)
  - Traditional: Red exponential curve (rising sharply)
  - Grid: Light gray
  - Background: White

Graph Layout:

X-Axis: Number of Endpoints
- 1,000
- 5,000
- 10,000
- 25,000
- 50,000
- 100,000
- 250,000
- 500,000

Y-Axis: Query Response Time (seconds)
- 0
- 10
- 20
- 30
- 60
- 120
- 300
- 600
- 1800 (30 min)
- 3600 (1 hour)

Tanium Performance Line:
- Starts at: 10 seconds (1K endpoints)
- Remains at: 10-15 seconds across ALL scales
- Visual: Thick blue line, nearly flat
- Data points: Blue circles at each measurement
- Annotation: "Consistent 15s regardless of scale"
- Shaded area below: Light blue (success zone)

Traditional Tool Performance Line:
- Starts at: 30 seconds (1K endpoints)
- Rises to: 15 minutes (50K endpoints)
- Reaches: 2+ hours (500K endpoints)
- Visual: Thick red line, exponential curve
- Data points: Red triangles at each measurement
- Annotation: "Exponential degradation"
- Shaded area below: Light red (warning zone)

Key Data Points Labeled:

At 50,000 endpoints:
- Tanium: 15s (blue callout)
- Traditional: 15 minutes (red callout)
- Difference: "60x faster"

At 250,000 endpoints:
- Tanium: 15s (blue callout)
- Traditional: 45 minutes (red callout)
- Difference: "180x faster"

At 500,000 endpoints:
- Tanium: 15s (blue callout)
- Traditional: 2+ hours (red callout)
- Difference: "480x faster"

Highlight Zones:
- Green zone (0-30s): "Acceptable Response Time"
- Yellow zone (30s-5min): "Degraded Performance"
- Red zone (5min+): "Unacceptable Delay"

Side Panel - Key Insights:
┌────────────────────────────────┐
│ 📊 Scalability Facts            │
│                                 │
│ ✅ Tanium Advantages:           │
│ • Linear performance            │
│ • No degradation at scale       │
│ • 15s @ 1K = 15s @ 500K        │
│                                 │
│ ❌ Traditional Limitations:     │
│ • Exponential slowdown          │
│ • Server overload               │
│ • Network congestion            │
│                                 │
│ 💡 Business Impact:             │
│ • Respond in minutes not hours  │
│ • Scale without new hardware    │
│ • Real-time security posture    │
└────────────────────────────────┘

Legend (Bottom):
- 🔵 Tanium (Linear Chain Architecture)
- 🔴 Traditional (Hub-and-Spoke Architecture)
- 🟢 Acceptable Response
- 🟡 Degraded Performance
- 🔴 Unacceptable Delay

Typography:
- Title: Inter Bold 24px
- Axis labels: Inter Regular 13px
- Data point labels: Inter Bold 14px
- Annotations: Inter Medium 12px
- Insights: Inter Regular 13px

Grid Style:
- Major grid lines: Solid light gray
- Minor grid lines: Dotted very light gray
- Zero baseline: Bold black line

Learning Objective: Visualize linear vs exponential scaling
Accessibility: Data table provided as alternative
```

---

### **Visual 4.3: TCO Learning Path Map**

**Location**: Lines 1468-1550
**Current State**: Text list of domains
**Replacement**: Interactive learning journey map

**Design Specifications**:
```yaml
Diagram Type: Node-based learning path / journey map
Dimensions: 1400x800px
Format: SVG
Color Scheme:
  - Foundation (current): Blue (highlighted)
  - Domain 1: Purple
  - Domain 2: Teal
  - Domain 3: Orange
  - Domain 4: Green
  - Domain 5: Red
  - Completion: Gold
  - Connection lines: Gray dashed

Layout: Flowing Path (Left to Right, Slight Curves)

START Node:
[🏁 Foundation Module]
├─ Status: Current (blue glow)
├─ Progress: 100%
├─ Duration: 3 hours
├─ Blueprint Weight: 0%
└─ Prerequisites: None
      │
      ↓ (arrow labeled "Start Here")

Path Flows Through 5 Domains:

Node 1: Domain 1
[❓ Asking Questions]
├─ Exam Weight: 22%
├─ Estimated Time: 6 hours
├─ Key Topics:
│   • Question syntax
│   • Sensor selection
│   • Result interpretation
├─ Status: Locked (requires Foundation)
└─ Icon: Question mark in circle
      │
      ↓

Node 2: Domain 2
[🎯 Refining & Targeting]
├─ Exam Weight: 23%
├─ Estimated Time: 7 hours
├─ Key Topics:
│   • Computer groups
│   • Filtering techniques
│   • Query optimization
├─ Status: Locked (requires Domain 1)
└─ Icon: Target/bullseye
      │
      ↓

Node 3: Domain 3
[⚡ Taking Action]
├─ Exam Weight: 15%
├─ Estimated Time: 5 hours
├─ Key Topics:
│   • Action deployment
│   • Package management
│   • Progress monitoring
├─ Status: Locked (requires Domain 2)
└─ Icon: Lightning bolt
      │
      ↓

Node 4: Domain 4
[🧭 Navigation & Modules]
├─ Exam Weight: 23%
├─ Estimated Time: 8 hours
├─ Key Topics:
│   • Console mastery
│   • Module functions
│   • RBAC
├─ Status: Locked (requires Domain 3)
└─ Icon: Compass
      │
      ↓

Node 5: Domain 5
[📊 Reporting & Export]
├─ Exam Weight: 17%
├─ Estimated Time: 6 hours
├─ Key Topics:
│   • Report generation
│   • Data export
│   • Dashboards
├─ Status: Locked (requires Domain 4)
└─ Icon: Bar chart
      │
      ↓

END Node:
[🎓 TCO Certification Ready]
├─ Total Study Time: 35+ hours
├─ Practice Exam: Required
├─ Exam: 90 questions, 105 minutes
└─ Certification: Tanium Certified Operator

Visual Node Design:
- Size: 250x200px rounded rectangles
- Border: 4px, color-coded by domain
- Shadow: Depth effect when unlocked
- Lock icon: Grayed out and locked when unavailable
- Checkmark: Green when completed
- Progress ring: Circular around icon showing % complete

Connection Lines:
- Unlocked path: Solid colored line with arrow
- Locked path: Dashed gray line
- Current step: Animated dashed line
- Alternate paths: Dotted lines (if available)

Interactive States:
- Current: Blue glow, animated pulse
- Completed: Green checkmark, subtle brightness
- Locked: Grayscale, lock icon
- In Progress: Partial color fill with %
- Hover: Expand to show more details

Progress Indicators:
Top of diagram:
[═══════════════════════░░░░░░░░░░░░░░] 35% Complete
Foundation: ✓ | D1: ○ | D2: ○ | D3: ○ | D4: ○ | D5: ○

Bottom stats bar:
- Total Time Invested: 3/35 hours
- Modules Completed: 1/6
- Exam Readiness: Foundation Established
- Next Step: Begin Domain 1

Side Panel - Study Tips:
┌────────────────────────────────┐
│ 📚 Learning Strategy            │
│                                 │
│ ✅ Recommended Approach:        │
│ • Complete in order             │
│ • Practice after each domain    │
│ • Review foundation concepts    │
│                                 │
│ ⏱️ Time Commitment:             │
│ • Full-time: 1 week             │
│ • Part-time: 2-3 weeks          │
│ • Self-paced: Your schedule     │
│                                 │
│ 🎯 Success Tips:                │
│ • Hands-on practice essential   │
│ • Join study groups             │
│ • Use practice exams            │
└────────────────────────────────┘

Typography:
- Domain names: Inter Bold 18px
- Exam weight: Inter Bold 16px, accent color
- Key topics: Inter Regular 13px
- Duration: Inter Medium 14px
- Tips: Inter Regular 12px

Learning Objective: Visualize complete certification journey
Accessibility: Linear path description in alt text
```

---

## 📁 Asset Organization

### **Figma File Structure**
```
LMS Design System
├─ 📄 Page 1: Design System
│   ├─ Colors
│   ├─ Typography
│   ├─ Icons
│   └─ Components
│
├─ 📄 Page 2: Module Foundation Diagrams
│   ├─ P1.1: Architecture Comparison
│   ├─ P1.2: Data Flow (5 Steps)
│   ├─ P1.3: Component Relationships
│   ├─ P1.4: Network Efficiency
│   ├─ P2.1: Console Layout
│   ├─ P2.2: Module Navigator
│   ├─ P2.3: Question Builder
│   ├─ P3.1: Client Registration Flow
│   ├─ P3.2: Deployment Architecture
│   ├─ P3.3: PKI Certificate Tree
│   ├─ P4.1: Speed Comparison
│   ├─ P4.2: Scalability Metrics
│   └─ P4.3: Learning Path Map
│
└─ 📄 Page 3: Export Ready
    └─ All diagrams marked for export
```

### **Local Asset Organization**
```
public/assets/figma/module-foundation/
├─ architecture/
│   ├─ linear-chain-vs-hub-spoke.svg
│   ├─ data-flow-5-steps.svg
│   ├─ data-flow-5-steps.json (Lottie animation)
│   ├─ component-relationships.svg
│   └─ network-efficiency-comparison.svg
│
├─ console/
│   ├─ console-layout-mockup@2x.png
│   ├─ console-layout-mockup@3x.png
│   ├─ module-navigation@2x.png
│   ├─ module-navigation@3x.png
│   ├─ question-builder@2x.png
│   └─ question-builder@3x.png
│
├─ processes/
│   ├─ client-registration-flow.svg
│   ├─ deployment-architecture.svg
│   └─ pki-certificate-hierarchy.svg
│
├─ infographics/
│   ├─ speed-comparison.svg
│   ├─ scalability-metrics.svg
│   └─ learning-path-map.svg
│
└─ manifest.json (asset metadata)
```

---

## 🎨 Design System Specifications

### **Color Palette**
```yaml
Primary Colors:
  - Tanium Blue: #0066CC
  - Accent Blue: #3B82F6
  - Dark Blue: #1E40AF

Secondary Colors:
  - Purple: #8B5CF6 (Sensors)
  - Teal: #14B8A6 (Zone Servers)
  - Orange: #F59E0B (Actions)
  - Green: #10B981 (Success/Packages)

Semantic Colors:
  - Success: #10B981
  - Warning: #F59E0B
  - Error: #EF4444
  - Info: #3B82F6

UI Colors:
  - Background: #FFFFFF
  - Surface: #F8FAFC
  - Border: #E2E8F0
  - Text Primary: #1E293B
  - Text Secondary: #64748B
  - Text Muted: #94A3B8

Accessibility:
  - All color combinations meet WCAG AA (4.5:1 contrast)
  - Critical elements meet AAA (7:1 contrast)
```

### **Typography Scale**
```yaml
Font Family:
  - Primary: Inter (Google Fonts)
  - Monospace: Fira Code (code/technical)

Type Scale:
  - Display: 48px Bold
  - H1: 36px Bold
  - H2: 24px Bold
  - H3: 20px Bold
  - H4: 18px Bold
  - Body Large: 16px Regular
  - Body: 14px Regular
  - Body Small: 13px Regular
  - Caption: 12px Regular
  - Tiny: 11px Regular

Line Heights:
  - Display: 1.2
  - Headings: 1.3
  - Body: 1.5
  - Captions: 1.4

Font Weights:
  - Regular: 400
  - Medium: 500
  - Bold: 700
  - Black: 900 (for emphasis)
```

### **Icon Library**
```yaml
Icon Style: Outline/Line style, 24px default
Stroke Width: 2px
Corner Radius: 2px (rounded ends)

Core Icons Needed:
  Platform:
    - Server (cylinder)
    - Client/Endpoint (laptop/desktop)
    - Zone Server (server rack)
    - Network (connected nodes)
    - Database (stacked cylinders)

  Actions:
    - Question mark (queries)
    - Lightning bolt (actions)
    - Magnifying glass (sensors)
    - Box/Package (packages)
    - Shield (security)

  States:
    - Checkmark (success)
    - X mark (error)
    - Warning triangle
    - Info circle
    - Lock/Unlock

  UI:
    - Arrow directions (up, down, left, right)
    - Expand/Collapse
    - Search
    - Settings gear
    - User avatar
    - Notification bell

Icon Colors:
  - Default: #64748B
  - Active: #3B82F6
  - Success: #10B981
  - Warning: #F59E0B
  - Error: #EF4444
```

### **Component Library**
```yaml
Buttons:
  - Primary: Blue bg, white text, 8px radius
  - Secondary: Gray border, gray text
  - Text: No background, blue text
  - Sizes: Small (32px), Medium (40px), Large (48px)

Cards:
  - Background: White
  - Border: 1px solid #E2E8F0
  - Radius: 8px
  - Shadow: 0 1px 3px rgba(0,0,0,0.1)
  - Padding: 16px or 24px

Badges:
  - Pill shape (full radius)
  - Small: 20px height, 12px text
  - Medium: 24px height, 14px text
  - Color: Background matches semantic color

Progress Bars:
  - Height: 8px
  - Radius: 4px (fully rounded)
  - Background: #E2E8F0
  - Fill: Gradient or solid color
  - Animated: CSS transition

Tooltips:
  - Background: #1E293B
  - Text: White, 12px
  - Padding: 8px 12px
  - Radius: 6px
  - Arrow: 6px triangle
```

---

## 📋 Implementation Checklist

### **Phase 1: Analysis** ✅
- [x] Analyze module content
- [x] Identify 13 visual opportunities
- [x] Create detailed specifications
- [x] Document design system requirements

### **Phase 2: Design System** (User Task)
- [ ] Create Figma file: "LMS Design System"
- [ ] Set up color styles (21 colors)
- [ ] Set up text styles (10 styles)
- [ ] Create icon component library (30+ icons)
- [ ] Build reusable diagram components

### **Phase 3: Priority 1 Diagrams** (User Task)
- [ ] P1.1: Architecture comparison
- [ ] P1.2: Data flow (5 steps)
- [ ] P1.3: Component relationships
- [ ] P1.4: Network efficiency

### **Phase 4: Priority 2 Diagrams** (User Task)
- [ ] P2.1: Console layout mockup
- [ ] P2.2: Module navigation
- [ ] P2.3: Question builder

### **Phase 5: Priority 3 Diagrams** (User Task)
- [ ] P3.1: Client registration flow
- [ ] P3.2: Deployment architecture
- [ ] P3.3: PKI certificate tree

### **Phase 6: Priority 4 Diagrams** (User Task)
- [ ] P4.1: Speed comparison
- [ ] P4.2: Scalability metrics
- [ ] P4.3: Learning path map

### **Phase 7: Export & Integration** (Claude Task)
- [ ] Run export script for all 13 diagrams
- [ ] Verify file sizes and quality
- [ ] Replace ASCII diagrams in MDX
- [ ] Add proper alt text
- [ ] Test responsive loading

### **Phase 8: Testing & Validation** (User Task)
- [ ] Visual regression testing
- [ ] Accessibility audit (WCAG AA)
- [ ] Performance testing (image optimization)
- [ ] Cross-browser compatibility
- [ ] Mobile/tablet responsive check

### **Phase 9: Documentation** (Claude Task)
- [ ] Create VISUAL_STYLE_GUIDE.md
- [ ] Document design system
- [ ] Create usage guidelines
- [ ] Provide export instructions

---

## 🎯 Success Metrics

**Quality Standards**:
- ✅ All diagrams use consistent design system
- ✅ WCAG AA compliance (4.5:1 contrast minimum)
- ✅ File sizes optimized (<500KB for PNG, <200KB for SVG)
- ✅ Load time <3 seconds on 3G connection
- ✅ Responsive on mobile/tablet/desktop

**Educational Impact**:
- ✅ Complex concepts visualized clearly
- ✅ Visual hierarchy guides attention
- ✅ Consistent visual language aids learning
- ✅ Diagrams complement text without replacing it

**Technical Requirements**:
- ✅ SVG for architecture/flow diagrams (scalable)
- ✅ PNG @2x/@3x for UI mockups (retina-ready)
- ✅ Lottie JSON optional for animations
- ✅ Alt text for all images (accessibility)
- ✅ Lazy loading implemented (performance)

---

## 📝 Notes for Designers

1. **Start with Design System** - Establish colors, typography, and components FIRST before creating individual diagrams

2. **Real Data** - Use realistic Tanium examples (not Lorem Ipsum). Examples from module text are authentic.

3. **Consistency** - Use the same icon style, color scheme, and typography across ALL diagrams

4. **Simplicity** - Favor clarity over complexity. Each diagram should teach ONE concept well.

5. **Accessibility** - Test with color blindness simulators, ensure sufficient contrast, add clear labels

6. **Scalability** - Design at 2x resolution, export both SVG (for diagrams) and PNG (for mockups)

7. **Animation** - If creating animated versions, keep animations subtle and purposeful (not distracting)

8. **Figma Organization** - Use pages, frames, and components properly. Name layers clearly.

9. **Export Settings** - Mark layers for export with consistent naming: `diagram-name@2x.png`

10. **Version Control** - Save versions in Figma before major changes

---

**Document Complete** ✅
**Total Specifications**: 13 detailed diagrams
**Estimated Design Time**: 16-20 hours
**Next Step**: Create Figma design system (Task #2)

---

*This document serves as the complete visual specification for enhancing the Tanium Platform Foundation module with professional diagrams and mockups while preserving all educational content.*
