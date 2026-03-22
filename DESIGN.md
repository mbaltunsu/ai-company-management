# Design System Specification: The Obsidian Monolith

## Stitch Project Reference

- **Project ID:** `14167979408247618791`
- **Design Tool:** [stitch.google](https://stitch.google)
- **Theme:** Dark / Fidelity / Custom Indigo
- **Device:** Desktop (1280×1024)

### Screens Catalog

| Screen | Stitch Screen ID | Status |
|--------|-----------------|--------|
| Dashboard Overview | `031300efc1c44804b435068e44b012b3` | Designed |
| Project Detail | — | Needs design |
| Agent Management | — | Needs design |
| Issues & Goals | — | Needs design |
| Settings | — | Needs design |

### Local Assets
- Screenshot: `docs/design/dashboard-overview.png`
- HTML Reference: `docs/design/dashboard-overview.html`

---

## 1. Overview & Creative North Star

The Creative North Star for this design system is **"The Digital Obsidian."** We are moving away from the "flat web" and toward an experience that feels carved from a single, dark, matte mineral. This system rejects the cluttered, "boxed-in" layout of traditional dashboards in favor of high-contrast editorial hierarchy, intentional asymmetry, and tonal depth.

We achieve a premium, custom feel by treating the interface as a physical workspace where light doesn't just "hit" surfaces, it is absorbed by them. We break the template look by using oversized stat numbers (`display-sm`) juxtaposed against tiny, precise metadata (`label-sm`), creating a rhythmic tension that feels intentional and authoritative.

## 2. Colors & Surface Logic

This system utilizes a "Deep Dark" palette. The goal is to create a UI that vanishes into the periphery, leaving only the data and primary actions visible.

### The Palette

- **Background (`surface-dim`):** `#0a0a0b` — The absolute foundation.
- **Card Surfaces (`surface-container`):** `#111113` — Subtle elevation.
- **Primary Accent (`primary`):** `#6366f1` — Muted violet-indigo for focus and intent.
- **Success (`secondary`):** `#10b981` — Emerald green for positive status.
- **Warning (`tertiary`):** `#ffb95f` — Amber for open issues and attention.

### The "No-Line" Rule

Standard dashboards rely on 1px borders to separate everything. In this system, **borders are a last resort.** Sectioning must be achieved through:

1.  **Background Color Shifts:** Use `surface-container-low` for sidebars and `surface-dim` for the main content area.
2.  **Negative Space:** Use the Spacing Scale (specifically `8` to `12` units) to define groupings rather than drawing a box around them.

### Surface Hierarchy & Nesting

Depth is achieved through "Tonal Stacking."

- **Level 0:** `surface-dim` (#0a0a0b) for the global background.
- **Level 1:** `surface-container` (#111113) for primary dashboard cards.
- **Level 2:** `surface-container-high` (#201f20) for nested elements like code blocks or inner search bars.

### The "Glass & Gradient" Rule

To prevent the UI from feeling "dead," use **Glassmorphism** for floating elements (dropdowns, modals, tooltips).

- **Token:** `surface-container` at 70% opacity + 12px `backdrop-blur`.
- **Signature Texture:** Apply a subtle radial gradient (Primary #6366f1 at 10% opacity) to the top-left corner of hero cards to provide a "glow" that suggests a light source.

## 3. Typography

Typography is our primary tool for storytelling. We use **Inter** for its neutral, architectural clarity and a **Monospace** face for technical data.

- **Display / Stat Numbers:** `display-sm` (24px) / Inter / Semibold. These are the heartbeat of the dashboard.
- **Card Titles:** `headline-sm` (18px) / Inter / Medium. High contrast (`on-background` #f8f8f8).
- **Body / UI Base:** `body-md` (13px) / Inter / Regular. Used for general text and labels.
- **Metadata:** `label-sm` (11px) / Inter / Medium / All Caps (Tracking +5%). Used with `on-surface-variant` (#a1a1aa).
- **Technical Data:** `Monospace` (12px). Use for hashes, versions, and ID strings to signal "System Reality."

## 4. Elevation & Depth

We reject traditional drop shadows. We use **Tonal Layering** and **Ghost Borders** to define space.

- **The Layering Principle:** A card should feel like it is "rising" out of the darkness. Instead of a shadow, an active card might move from `surface-container` to `surface-container-high`.
- **Ambient Shadows:** If a modal must float, use a shadow with a 40px blur, 0% offset, and 8% opacity. The shadow color should be tinted with our primary violet (`#6366f1`) to create a "dark glow" rather than a grey smudge.
- **The Ghost Border:** For high-density areas, use a 1px border using `outline-variant` (#1f1f23). **Never use 100% white or high-contrast borders.** The border should be just barely visible, acting as a "whisper" of a boundary.

## 5. Components

### Buttons

- **Primary:** Solid `primary` (#6366f1) with `on-primary` (#f8f8f8) text. 8px radius.
- **Ghost (Default):** Transparent background, 1px `outline-variant` border. On hover: background becomes `surface-container-highest`.
- **Action:** Pill-shaped (999px radius), 11px metadata font, used for secondary triggers.

### Pill Badges (Status Indicators)

- **Style:** 999px radius, `surface-container-high` background.
- **The Dot:** A 6px solid circle using the status color (`secondary` for success, `tertiary` for warning) placed to the left of the text.

### Input Fields

- **Base:** `surface-container-lowest` background, 1px `outline-variant` border.
- **Focus State:** Border changes to `primary` (#6366f1) with a 2px outer "glow" (Primary at 15% opacity). No heavy shadows.

### Cards & Lists

- **Rule:** Forbid the use of horizontal divider lines.
- **Execution:** Use vertical white space (`spacing-4` or `spacing-6`) and `surface-container` background shifts to separate list items. A "zebra stripe" using `surface-container-low` and `surface-dim` is preferred over a line.

### Additional Signature Component: The "Activity Monolith"

A vertical sparkline or activity graph that uses a `primary` to `secondary` gradient, contained within a `surface-container` card with no internal padding, allowing the data to bleed to the edges.

## 6. Do’s and Don’ts

### Do:

- **Do** use extreme contrast in font sizes (24px stats vs 11px labels) to create a premium editorial feel.
- **Do** use `letter-spacing` on small metadata labels to ensure legibility on dark backgrounds.
- **Do** treat empty states as an opportunity for "Organic Brutalism"—large typography and vast negative space.

### Don't:

- **Don't** use pure black (#000000). It kills the "Obsidian" depth.
- **Don't** use standard 1px dividers between list items. Use space and color-tiering.
- **Don't** use heavy drop shadows. If it doesn't feel like it's glowing or carved, it's wrong.
- **Don't** use icons as the primary focal point; they are supporting actors to the typography and data.

---

## 7. Tailwind CSS Variable Mapping

Map Stitch design tokens to our Tailwind/shadcn CSS variables in `globals.css`:

```css
.dark {
  /* Surface System (Tonal Stacking) */
  --background: 240 6% 4%;            /* #0a0a0b — surface-dim */
  --foreground: 0 0% 97%;             /* #f8f8f8 — on-background */

  --card: 240 5% 7%;                  /* #111113 — surface-container */
  --card-foreground: 0 0% 97%;        /* #f8f8f8 */

  --popover: 240 5% 7%;              /* #111113 — glassmorphism base */
  --popover-foreground: 0 0% 97%;

  /* Primary: Violet-Indigo */
  --primary: 239 84% 67%;             /* #6366f1 */
  --primary-foreground: 0 0% 97%;     /* #f8f8f8 */

  /* Secondary surfaces */
  --secondary: 240 4% 12%;            /* #1f1f23 — outline-variant */
  --secondary-foreground: 0 0% 97%;

  --muted: 240 3% 13%;                /* #201f20 — surface-container-high */
  --muted-foreground: 240 5% 67%;     /* #a1a1aa — on-surface-variant */

  --accent: 240 3% 13%;               /* #201f20 */
  --accent-foreground: 0 0% 97%;

  --destructive: 0 63% 31%;
  --destructive-foreground: 0 0% 97%;

  --border: 240 6% 12%;               /* #1f1f23 — outline-variant (ghost border) */
  --input: 240 6% 12%;
  --ring: 239 84% 67%;                /* #6366f1 — primary */

  /* Sidebar */
  --sidebar: 240 6% 4%;               /* #0a0a0b — same as background */
  --sidebar-foreground: 0 0% 89%;
  --sidebar-border: 240 6% 12%;       /* #1f1f23 */
  --sidebar-accent: 239 84% 67%;      /* #6366f1 */
  --sidebar-accent-foreground: 0 0% 97%;

  /* Charts */
  --chart-1: 239 84% 67%;             /* #6366f1 — primary indigo */
  --chart-2: 160 79% 56%;             /* #10b981 — success emerald */
  --chart-3: 36 100% 69%;             /* #ffb95f — warning amber */
  --chart-4: 247 65% 75%;             /* #c0c1ff — primary light */
  --chart-5: 0 84% 60%;               /* destructive red */
}
```

### Extended Stitch Tokens (Custom Tailwind)

```js
// tailwind.config.ts — extend.colors
{
  "surface-dim": "#0a0a0b",
  "surface-container": "#111113",
  "surface-container-low": "#111113",
  "surface-container-high": "#201f20",
  "surface-container-highest": "#353436",
  "outline-variant": "#1f1f23",
  "on-background": "#f8f8f8",
  "on-surface-variant": "#a1a1aa",
  "on-surface-dim": "#52525b",
  "success": "#10b981",
  "warning": "#ffb95f",
}
```

### Typography Scale

| Token | Size | Weight | Font | Usage |
|-------|------|--------|------|-------|
| `display-sm` | 24px | 600 (Semibold) | Inter | Stat numbers, hero metrics |
| `headline-sm` | 18px | 500 (Medium) | Inter | Card titles, section headers |
| `body-md` | 13px | 400 (Regular) | Inter | Body text, UI labels |
| `label-sm` | 11px | 500 (Medium) | Inter | Metadata, caps with +5% tracking |
| `mono` | 12px | 400 (Regular) | JetBrains Mono | Hashes, versions, IDs |

### Animations

```css
/* Emerald pulse for active agent indicators */
@keyframes pulse-emerald {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #0a0a0b; }
::-webkit-scrollbar-thumb { background: #1f1f23; border-radius: 10px; }
```

---

## 8. Stitch Prompts for Remaining Screens

Use these prompts in [stitch.google](https://stitch.google) to generate designs for the other pages. Use the **same project** (ID: `14167979408247618791`) to keep the theme consistent.

### Project Detail Page

```
Design a project detail page for the Obsidian Monolith dashboard. This is the deep-dive view for a single AI coding project called "Agent Alpha."

Header area: Project name "Agent Alpha" in headline-sm (18px semibold), a status badge showing "Active" with green dot, and the GitHub repo link in monospace (12px). Below that, a row of tech stack pills: "Next.js", "TypeScript", "Tailwind" in surface-container-high background with label-sm text.

Left column (60%): Two stacked cards. First card "Commit Activity" — an area chart showing commits over the past 30 days using indigo (#6366f1) gradient fill on surface-container background. X-axis: dates in label-sm. Y-axis: commit count. Below the chart, a scrollable list of 5 recent commits showing: commit message in body-md, truncated SHA hash in JetBrains Mono, author name, and relative timestamp. Use surface color shifts between rows instead of dividers.

Right column (40%): Three stacked cards. First: "Branch Overview" — list of 4 branches (main, feature/auth, fix/parsing, develop) each showing branch name with a git branch icon, last commit date in label-sm, and a status dot (green for main, indigo for feature branches). Second: "Release History" — vertical timeline with 3 releases showing version tag (v1.2.0) in monospace bold, release name, publish date. Third: "Goals" — 3 goals with title, progress bar (indigo fill on surface-container-high track), and percentage.

Bottom: Full-width card "README Preview" showing a truncated markdown-rendered README with body-md typography on surface-container background.

Keep the same dark obsidian theme, no borders except ghost borders (#1f1f23), tonal depth through surface layering.
```

### Agent Management Page

```
Design an agent management page for the Obsidian Monolith dashboard. This shows all AI agents assigned to a specific project.

Header: "Agents" title in headline-sm, project name "Agent Alpha" as a breadcrumb in on-surface-variant color. Right side: a primary button "New Agent" with plus icon, indigo (#6366f1) background, 8px radius.

Main content: A grid of 6 agent cards in a 3x2 layout. Each card is on surface-container (#111113) background with rounded-xl corners. Card contents: Agent name in body-md semibold (e.g., "API Designer", "Code Reviewer", "Frontend Developer"), agent type badge as a pill with dot indicator, a 2-line description in on-surface-variant (13px), and a row of capability tags in surface-container-high pills with label-sm text (e.g., "REST", "OpenAPI", "Auth Patterns"). Bottom of each card: "Last updated 2d ago" in label-sm monospace.

When a card is hovered, its background shifts to surface-container-high (#201f20).

Below the grid: "Agent Editor" section — a split view. Left half: a list of agent filenames (api-designer.md, code-reviewer.md) with the active one highlighted with indigo left border. Right half: a markdown editor area on surface-container-lowest background showing the agent spec content in body-md with monospace code blocks. Above the editor: "Preview" and "Edit" tabs.

Maintain the obsidian theme — no drop shadows, use tonal stacking for depth, ghost borders only where density requires it.
```

### Issues & Goals Page

```
Design an issues and goals management page for the Obsidian Monolith dashboard. This combines GitHub issues sync with local goal tracking.

Header: "Issues & Goals" in headline-sm. Right side: "Create Issue" primary button (indigo), "Sync" ghost button with refresh icon. Below header: two tab pills — "Issues" (active, indigo background) and "Goals" in ghost style.

Issues tab (shown): Filter bar with ghost-style dropdowns for Status (Open/Closed/All), Labels, and a search input. Below: a list of 8 GitHub issues. Each issue row shows: issue number in monospace (#42), title in body-md semibold, colored label pills (e.g., green "enhancement", red "bug", blue "feature"), assignee avatar (24px circle), and relative timestamp. Open issues have an emerald dot, closed have on-surface-variant dot. Use alternating surface-dim and surface-container backgrounds instead of dividers. Clicking an issue would expand it inline.

Right sidebar (30% width): "Quick Stats" card showing: Open Issues count (23) in display-sm with amber tint, Closed This Week (7) in display-sm with emerald tint, Average Close Time "2.4 days" in display-sm. Below: "Labels" card showing a horizontal bar chart of issues by label using indigo/emerald/amber/red segments.

Goals section (below issues or via tab): 4 goal cards in a 2x2 grid. Each card: goal title in body-md semibold, description in on-surface-variant, a horizontal progress bar (indigo fill, surface-container-high track), percentage label, due date in label-sm monospace, and status badge (Active/Completed/At Risk with appropriate dot colors).

Obsidian theme throughout — tonal depth, ghost borders, no drop shadows.
```

### Settings Page

```
Design a settings page for the Obsidian Monolith dashboard. Clean, minimal configuration interface.

Header: "Settings" in headline-sm. Subtitle: "Configure your dashboard connections and preferences" in on-surface-variant.

Layout: Left sidebar (200px) with settings categories as a vertical nav list: "GitHub" (active, indigo text with indigo left border), "Database", "Projects", "Appearance", "About". Use on-surface-variant for inactive items, surface-container-high hover.

Right content area showing the "GitHub" settings panel:

First card "Connection" on surface-container: "Personal Access Token" label in label-sm uppercase, an input field showing masked token (••••••••ghp_x4k) with a "Reveal" ghost button and "Test Connection" action button. Below: connection status showing "Connected" with emerald dot and "Rate Limit: 4,847 / 5,000 remaining" with a thin progress bar (indigo fill, nearly full). Reset time in monospace label-sm.

Second card "Account" on surface-container: "GitHub Owner" label, input showing "username" in body-md. "Default Organization" dropdown.

Third card "Sync Settings" on surface-container: "Auto-sync interval" with a segmented control (30s, 1m, 5m, 10m — with 1m selected in indigo). "Sync on page load" toggle switch (indigo when active). "Last sync: 2 minutes ago" in label-sm monospace.

Bottom: "Save Changes" primary button (indigo) and "Reset to Defaults" ghost button.

Obsidian theme — surface stacking for card depth, ghost borders, no shadows, monospace for technical values.
```
