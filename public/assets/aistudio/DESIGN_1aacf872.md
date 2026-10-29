---
name: Obsidian Kinetic
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#bdc2ff'
  on-secondary: '#131e8c'
  secondary-container: '#2f3aa3'
  on-secondary-container: '#a8afff'
  tertiary: '#ddb7ff'
  on-tertiary: '#490080'
  tertiary-container: '#b76dff'
  on-tertiary-container: '#400071'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e0e0ff'
  secondary-fixed-dim: '#bdc2ff'
  on-secondary-fixed: '#000767'
  on-secondary-fixed-variant: '#2f3aa3'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-board: 1.25rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

The design system projects precision, focus, and velocity. Engineered specifically for high-throughput product teams, technical project managers, and engineers, the interface eliminates cognitive friction by treating software as an instrument rather than a canvas. The visual identity merges technical minimalism with targeted luminous accents, evoking the feeling of a high-performance command center.

The aesthetic philosophy draws heavily from modern developer toolkits:
- **Obsidian Foundation:** Deep, light-absorbing slate bases reduce visual fatigue across prolonged sessions.
- **Controlled Luminescence:** Neon indigo and electric violet are deployed strictly as semantic signals, active states, and focal triggers—never as decorative clutter.
- **Crisp Structural Boundaries:** Structure is declared via sub-pixel ghost borders and tonal differentiation rather than heavy drop shadows or skeuomorphic textures.

## Colors

The palette relies on deep slate and obsidian undertones to create a layered surface hierarchy, illuminated by high-energy indigo and violet accents.

### Color Roles & Surface Mapping
- **App Canvas (`#0b0f19`):** Root background, viewport container, and board canvas.
- **Column / Track Surface (`#0f172a`):** Base structure for Kanban swimlanes and board columns.
- **Card Default Surface (`#182234`):** Resting state for task cards, input panels, and table rows.
- **Card Elevated / Interactive Surface (`#1e293b`):** Hovered cards, flyout menus, and active modal overlays.
- **Primary Accent (`#6366f1`):** Primary actions, active filter indicators, and drop-target visual markers.
- **Secondary / Focus Accent (`#818cf8`):** Focus rings, interactive link states, and selected item outlines.
- **Tertiary Accent (`#a855f7`):** Critical milestones, blocked states, or feature tags requiring instant differentiation.

### Text Contrast Tiers
- **Text Primary (`#f8fafc`):** Titles, active task titles, and primary numbers (100% opacity).
- **Text Secondary (`#94a3b8`):** Descriptions, column counts, metadata labels, and timestamps.
- **Text Muted (`#475569`):** Keyboard shortcuts, empty state placeholders, and disabled indicators.

### Functional & Semantic Tokens
- **Ghost Border Default (`rgba(148, 163, 184, 0.08)`):** Column dividers, resting cards, and panel edges.
- **Luminous Border Active (`rgba(99, 102, 241, 0.40)`):** Hovered cards, drag previews, and focused inputs.
- **Status Success (`#10b981`):** Complete, merged, passed.
- **Status Warning (`#f59e0b`):** In review, due soon.
- **Status Danger (`#ef4444`):** Blocked, overdue, high priority.

## Typography

The type system balances technical clarity with ergonomic readability. Headings and body copy rely on **Geist** for crisp geometry, tight tracking, and neutral tone. Metadata, IDs, tags, sprint markers, and keyboard affordances leverage **JetBrains Mono** to ground the interface in technical precision.

### Typographic Hierarchy Rules
- **Task Titles:** Render in `body-md` with `fontWeight: 500` to maintain balance inside compact cards without overpowering the lane.
- **Board & View Headers:** Render in `headline-lg` or `headline-md` using subtle negative letter-spacing (`-0.02em`) for a modern condensed look.
- **Identifiers & Badges:** Task IDs (e.g., `FORGE-1024`) must use `label-sm` in `JetBrains Mono` with uppercase styling to ensure instant scanning across complex boards.
- **Tabular Data & Timestamps:** Always default to monospaced sizing (`label-md` or `label-sm`) to avoid jitter during real-time layout updates.

## Layout & Spacing

The layout operates on a strict 4px sub-grid, paired with a dynamic horizontal viewport model optimized for horizontal Kanban scrolling and deep multi-panel nesting.

### Board & Kanban Geometry
- **Column Sizing:** Fixed-width columns at `320px` on desktop with `gutter-board` (`1.25rem`) spacing between swimlanes to preserve unified visual tension.
- **Horizontal Overflow:** The main viewport handles horizontal overflow smoothly with hardware-accelerated momentum, while individual columns scroll vertically with custom ultra-narrow scroll tracks.
- **Canvas Boundaries:** Outer canvas maintains a fixed `margin` (`1.5rem`) on desktop, collapsing to `margin-mobile` (`1rem`) on smaller screens.

### Responsive Reflow Rules
- **Desktop (>= 1280px):** Full multi-column view with collapsible navigation rail, persistent filter bar, and side inspection drawer.
- **Tablet (768px - 1279px):** Horizontal swipeable lane architecture with dynamic snapping to active column centers.
- **Mobile (< 768px):** Single-column stacked mode with tabbed swimlane navigation and bottom sheet task inspection.

## Elevation & Depth

Visual depth is achieved through **tonal stratification** and **subtle luminescence**, avoiding muddy, heavily blurred black shadows that compromise dark mode contrast.

### Surface Stratification
1. **Level 0 (Canvas):** `#0b0f19` — Deepest recessed floor.
2. **Level 1 (Columns / Panels):** `#0f172a` — Structural containers bounded by `1px solid rgba(148, 163, 184, 0.06)`.
3. **Level 2 (Cards / Inputs):** `#182234` — Interactive cards resting above the column background, bounded by `1px solid rgba(148, 163, 184, 0.1)`.
4. **Level 3 (Hover / Focus):** `#1e293b` — Raised elements with luminous perimeter: `box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.4), 0 8px 24px -4px rgba(11, 15, 25, 0.8)`.
5. **Level 4 (Dragging Cards / Modals):** `#1e293b` — Floating state using an energetic back-glow: `box-shadow: 0 0 0 1px #818cf8, 0 12px 32px -8px rgba(99, 102, 241, 0.25), 0 20px 48px -12px rgba(0, 0, 0, 0.9)`.

## Shapes

The interface embraces a restrained geometric discipline using **Soft (Level 1)** rounding. Elements remain sharp and purposeful, ensuring maximum content density without feeling starkly brutalist.

- **Base Components (Inputs, Buttons, Cards):** `0.25rem` (4px) to `0.375rem` (6px) corner radius.
- **Structural Containers (Columns, Sidebars):** `0.5rem` (8px).
- **Badges, Tags & Avatars:** Fully rounded pill forms (`9999px`) provide deliberate contrast against structural rectangles, visually separating categorization chips from task containers.

## Components

### Buttons
- **Primary:** Solid `#6366f1` background, `#ffffff` text, crisp `0.25rem` border-radius. On hover: `#818cf8` with subtle luminous spread (`0 0 12px rgba(99, 102, 241, 0.4)`).
- **Secondary / Ghost:** Transparent background, `#94a3b8` text, `1px solid rgba(148, 163, 184, 0.12)`. On hover: surface transitions to `#1e293b`, text shifts to `#f8fafc`, border illuminates to `rgba(129, 140, 248, 0.3)`.
- **Icon Buttons:** Fixed 28x28px or 32x32px square bounds, centered glyphs, matching ghost treatment.

### Kanban Cards
- **Structure:** Resting background `#182234`, `1px solid rgba(148, 163, 184, 0.08)`, internal padding `space-md`.
- **Hover Behavior:** Surface transitions to `#1e293b`, border shifts to `rgba(99, 102, 241, 0.35)`, subtle vertical lift (`translateY(-1px)`).
- **Drag State:** Tilted 1.5 degrees, elevated with `#818cf8` halo outline and deep background drop-shadow.
- **Card Content Flow:** Top row contains task ID (`JetBrains Mono`, muted slate) and priority indicator; middle row holds task title (`Geist`, white, medium); bottom row hosts assignees, tag pills, and due date.

### Status Badges & Chips
- **Format:** Pill shape (`rounded-full`), `label-sm` typography, padding `2px 8px`.
- **Subdued Tinting:** High-contrast dark backgrounds using tinted opacity (`background: rgba(color, 0.12); color: color; border: 1px solid rgba(color, 0.25)`).
  - *Indigo Tag:* `rgba(99, 102, 241, 0.15)` bg / `#818cf8` text / `rgba(99, 102, 241, 0.3)` border.
  - *Violet Tag:* `rgba(168, 85, 247, 0.15)` bg / `#c084fc` text / `rgba(168, 85, 247, 0.3)` border.
  - *Overdue Tag:* `rgba(239, 68, 68, 0.15)` bg / `#f87171` text / `rgba(239, 68, 68, 0.3)` border.

### Inputs & Search Bars
- **Surface:** `#0f172a` filled background with `1px solid rgba(148, 163, 184, 0.12)`.
- **Focus State:** Background deepens to `#182234`, outline switches to `1px solid #6366f1` accompanied by a 2px outer glow (`rgba(99, 102, 241, 0.25)`).
- **Inline Search:** Features integrated monospaced keyboard shortcuts (e.g., `Cmd + K`) formatted as miniature dark pills on the right flank.

### Checkboxes & Selection Controls
- **Form Factor:** 16x16px squared boundaries with `2px` border radius.
- **Unchecked:** Transparent background, `1.5px solid #475569`.
- **Checked:** `#6366f1` fill, crisp white check icon, border tinted `#818cf8`.

### Drop Indicators & Swimlane Targets
- **Target Slot:** Dashed `1.5px` border in `#6366f1`, translucent fill `rgba(99, 102, 241, 0.05)`, smooth expansion animation when cards hover over drop zones.