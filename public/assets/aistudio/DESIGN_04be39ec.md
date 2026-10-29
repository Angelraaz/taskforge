---
name: Agile Kinetic
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#006577'
  on-tertiary: '#ffffff'
  tertiary-container: '#008096'
  on-tertiary-container: '#f9fdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system is engineered for fluid, high-velocity agile management on mobile screens. Merging the tactile clarity of physical Kanban index cards with modern digital tactility, it serves product builders, agile teams, and solo creators who require dense information hierarchies without visual fatigue.

The visual style embraces modern corporate vibrancy: crisp, clean white surfaces layered against ultra-subtle tinted slate canvases (`#F8FAFC` to `#F1F5F9`), energized by an electric violet/indigo accent core. Micro-elevations, pill-shaped tags, distinct column containers with integrated task count badges, and translucent border treatments cultivate a feeling of structured momentum, speed, and tactile delight.

## Colors

The palette establishes an energetic, focused atmosphere. The background remains light and fresh, avoiding sterile pure white in favor of a soft cool slate backdrop that allows pure white task cards to pop naturally with subtle boundary contrast.

### Palette Architecture
- **Primary & Accent (`#6366F1` & `#7C3AED`):** Electric indigo and radiant violet drive active interactive states, primary actions, and column identifiers.
- **Vivid Status Semantics:**
  - **Success / Completed (`#10B981`):** Emerald green for checklist completion, validated states, and "Done" statuses.
  - **Warning / Deadlines (`#F59E0B`):** Warm amber for imminent due dates and mid-level priority indicators.
  - **Urgent / High Priority (`#EF4444`):** Crisp rose red for blockers and high-urgency badges.
  - **Informational / Flow (`#06B6D4`):** Vibrant cyan for architectural, technical, or exploratory task attributes.
- **Surface & Neutral Hierarchy:**
  - Base canvas: `#F8FAFC`
  - Column container fill: `#F1F5F9`
  - Card surfaces: `#FFFFFF`
  - Subtle borders: `#E2E8F0`
  - High-contrast typography: Headlines in deep ink (`#0F172A`), secondary copy in muted slate (`#64748B`).

## Typography

The type system blends the energetic geometry of **Plus Jakarta Sans** for titles, column headers, pill tags, and action buttons with the neutral legibility of **Inter** for descriptions and sub-text.

- **Column Titles:** Utilize `label-sm` set to uppercase with wide tracking (`0.04em`) paired with heavy weight (`700`) to create authoritative section breaks without claiming excessive vertical space.
- **Card Titles:** Rendered via `headline-sm` with tight line heights to maintain high scanability.
- **Metadata & Pill Copy:** Rendered in `label-md` for numerical checklists, dates, and dynamic project tags.

## Layout & Spacing

The layout is built for horizontal-scroll mobile Kanban navigation coupled with vertical card stacking within swimlanes.

- **Horizontal Column Flow:** Columns measure between 84vw and 88vw width on mobile viewports, exposing a 12–16px preview sliver of the adjacent column to afford horizontal scrolling.
- **Column Padding & Gutter:** Column wrappers apply `space-md` internal padding. Inter-card vertical rhythm is governed by `space-sm` (8px) to `space-md` (12px), guaranteeing high data density while preventing touch target overlap.
- **Touch Targets:** Interactive action chips, ellipsis buttons, and checkbox indicators maintain a minimum 44×44px hit-box via transparent padding buffers.

## Elevation & Depth

Visual hierarchy employs a three-tier elevation strategy that favors subtle tactile lift over heavy drop shadows:

1. **Canvas (Base Level):** Soft background `#F8FAFC` provides the lowest ground plane.
2. **Column Containers (Level 1):** Subtle sunken or flat containers styled with `#F1F5F9` surfaces, bounded by 1px solid `#E2E8F0` outlines with no shadow, anchoring task groups cleanly.
3. **Task Cards (Level 2):** Elevated cards on pure `#FFFFFF` featuring a dual-layer soft ambient shadow (`0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 3px -1px rgba(15, 23, 42, 0.04)`) and a delicate outline (`1px solid rgba(226, 232, 240, 0.8)`).
4. **Active / Dragging State (Level 3):** Lifted cards scale subtly to 1.02, receiving an amplified violet-tinted shadow (`0 12px 24px -4px rgba(99, 102, 241, 0.18), 0 4px 8px -2px rgba(15, 23, 42, 0.06)`).
5. **Color Accents:** Vibrant 3px horizontal color bars or top borders indicate column identity and urgency directly on card headers.

## Shapes

The geometry balances friendly modernism with structured utility:
- **Columns & Main Panels:** Use `rounded-xl` (1.25rem / 20px) to form welcoming, distinct container boundaries.
- **Task Cards:** Use `rounded-lg` (0.875rem / 14px) for clean card nesting within columns.
- **Metadata Pills, Badges & Micro-tags:** Employ fully rounded pill geometries (`9999px`) for date tags, status pills, count badges, and quick-filter pills.
- **Checkboxes:** Finished with 6px soft-corner squircle rounding, avoiding harsh geometric squareness.

## Components

### Task Cards
- **Structure:** Pure white rounded rectangle with an optional top color stripe (3px height) matching its status or column tone.
- **Header:** Integrated checkbox on the top-left, followed by a bold task title.
- **Content:** Secondary snippet preview (max 2 lines) in muted slate.
- **Metadata Footer:** A structured horizontal flex container carrying:
  - Dot indicator + Category label (`UI / UX`, `PWA`).
  - Priority badge with colored dot.
  - Due date pill with calendar icon (`#FEF3C7` background with `#D97706` text when due soon).
  - Checklist tracker (`1/3` tasks completed) with mini progress counter.
  - Action row containing inline swap/move icon and card menu button.

### Column Containers
- Soft tinted background (`#F1F5F9`) with an upper header containing:
  - Colored indicator dot (indigo, amber, emerald).
  - Uppercase tracked column label.
  - Circular count badge with soft gray fill and bold centered number.
  - Quick action cluster: `+` (Quick Add) and `···` (Column Settings).
- Footer featuring a dashed or ghost "+ Añadir tarea" (Add Task) button centered at the bottom.

### Segmented Controls & Filter Pills
- Horizontal scrollable filter bar with pill-shaped tabs. Active tabs possess an electric indigo border or solid fill, while inactive tabs use light slate backgrounds with subtle borders.

### Buttons & Icons
- **Quick Action Bar:** Floating and header buttons use soft rounded-rect containers (`12px` radius) with neutral `#FFFFFF` or translucent slate fills.
- **Notification Badges:** High-contrast hot rose/red badges (`#EF4444`) with white typography, overlaid precisely on notification bells.

### Checkboxes
- Custom 20×20px rounded squircle checkboxes with a 1.5px slate border. Checked state transitions smoothly into solid `#6366F1` or `#10B981` with a crisp white check glyph.