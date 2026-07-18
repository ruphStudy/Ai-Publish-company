# APC-V1 Design System

> **Single Source of Truth — UI/UX**
> Version: 1.0.0 · Platform: AI Publishing Company (APC-V1)

---

## Table of Contents



1. [Product Design Philosophy](#1-product-design-philosophy)
2. [UI Inspiration](#2-ui-inspiration)
3. [Layout Standards](#3-layout-standards)
4. [Theme](#4-theme)
5. [Typography](#5-typography)
6. [Spacing System](#6-spacing-system)
7. [Component Standards](#7-component-standards)
8. [Navigation](#8-navigation)
9. [Dashboard Standards](#9-dashboard-standards)
10. [Tables](#10-tables)
11. [Forms](#11-forms)
12. [Charts](#12-charts)
13. [Accessibility](#13-accessibility)
14. [Responsive Rules](#14-responsive-rules)
15. [Icon Standards](#15-icon-standards)
16. [Tech Stack](#16-tech-stack)
17. [Naming Conventions](#17-naming-conventions)
18. [Best Practices](#18-best-practices)

---

## 1. Product Design Philosophy

APC-V1 is an enterprise-grade AI-powered book publishing intelligence platform. Every design decision must reflect this identity without compromise.

### Premium SaaS

The interface must communicate trust, capability, and control. Every surface, interaction, and data point is intentional. There is no clutter, no guesswork. The product must feel expensive before a user reads a single label.

- Use elevation and depth sparingly — only to establish hierarchy
- Prefer refinement over decoration
- Typography carries the visual weight; imagery and illustration are secondary

### AI-First

AI is not a feature — it is the product. The interface must visually signal intelligent augmentation at every relevant touchpoint.

- AI-generated insights, scores, and recommendations must be visually distinct from user-created data
- Use the AI Accent color token to mark AI surface boundaries
- AI actions must feel immediate, not mechanical — smooth, responsive, alive

### Publishing Intelligence Platform

The product processes large volumes of market data, book metadata, opportunity scores, and production pipelines. The design must make complex information readable and actionable.

- Prioritise scannable layouts over dense prose
- Metrics and numbers are first-class visual elements
- Tables, charts, and KPI cards are the primary content formats

### Clean

Remove every element that does not carry information or enable action.

- No decorative borders where none are needed
- No drop shadows beyond what establishes necessary stacking context
- No colour used without meaning
- White space is structure, not absence

### Minimal

Minimal means precise, not sparse. Every pixel is placed with intention.

- Limit the number of distinct typographic sizes per view to four maximum
- Limit the number of distinct colours per view to six maximum (excluding charts)
- Use motion only to reinforce spatial relationships or confirm state changes

### Data-Focused

The application exists to surface intelligence. Data must be the hero.

- Large, bold metrics in KPI cards
- Charts and visualisations never compete with the data they display
- Empty states explain what data is expected, not just that none exists

### Enterprise Ready

The platform is used by teams, not individuals. Design for roles, permissions, and operational context.

- Tables support bulk selection, column management, and export
- Actions that are destructive or irreversible require confirmation
- Status indicators (active, processing, failed, archived) are always visible and consistent

---

## 2. UI Inspiration

APC-V1 draws on the design language of the leading SaaS and productivity tools. The goal is not to copy these products but to inherit their underlying principles.

### Linear — Precision and Speed

Linear's interface communicates that the tool respects the user's time. Key principles adopted:

- Dense information layout that does not feel crowded
- Keyboard-first interactions surfaced through visible shortcut hints
- Smooth, physics-based transitions that reinforce spatial model
- Dark sidebar with high-contrast active states

### Stripe Dashboard — Data Clarity

Stripe makes complex financial data feel understandable. Key principles adopted:

- Clean metric cards with clear baseline comparisons
- Chart tooltips that provide context, not just raw values
- Consistent use of semantic colour (green for positive, red for negative)
- Tables that can hold many columns without feeling broken

### Notion — Contextual Hierarchy

Notion makes hierarchy readable through spacing and typography alone. Key principles adopted:

- Headings establish structure; decorative lines do not
- Content blocks have breathing room; they never touch their containers
- Sidebar navigation is calm — it does not compete with the main content

### Vercel — Deployment Intelligence

Vercel's dashboard is optimised for status monitoring and pipeline feedback. Key principles adopted:

- Status badges are the primary navigation cue in list views
- Progress and pipeline states use a consistent horizontal timeline
- Monospace font for technical metadata (ASINs, IDs, version strings)
- Dark-first design that does not feel heavy

### Perplexity — AI Surface Design

Perplexity defines how AI-generated content integrates into a professional interface. Key principles adopted:

- AI responses are visually contained — distinct from user-originated content
- Sources, confidence signals, and metadata accompany AI output
- The interface steps back when the AI is producing; it returns when the user acts

### ChatGPT Team — Conversational Data Interfaces

ChatGPT Team shows that information density can coexist with readability. Key principles adopted:

- Left sidebar navigation with collapsible section groups
- Content area has a generous max-width with centred text columns
- AI prompts and outputs are clearly separated, never merged

---

## 3. Layout Standards

### Application Layout

The application uses a three-panel layout with a reserved fourth panel for future contextual use.

```
┌─────────────────────────────────────────────────────────────────┐
│  Left Sidebar (256px / 64px collapsed)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Top Navigation Header (64px)                           │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │                                                         │   │
│  │  Main Content Area                   [Right Panel]      │   │
│  │  (flex-1, overflow-y-auto)           (future, 320px)    │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

| Region | Width | Behaviour |
|---|---|---|
| Left Sidebar | 256px expanded · 64px collapsed | Persistent · user-toggleable |
| Top Header | Full width · 64px height | Sticky · `z-40` · backdrop blur |
| Main Content | `flex-1` | Scrollable · `overflow-y-auto` |
| Right Context Panel | 320px (reserved) | Slide-in overlay · future use |

### Dashboard Layout

The dashboard main area uses a responsive CSS Grid with auto-fit columns. Standard grid configurations:

| Layout | Grid Definition | Use Case |
|---|---|---|
| 4-column KPI row | `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` | Metric cards |
| 3-column content | `grid-cols-1 lg:grid-cols-3` | Charts + activity |
| 2-column content | `grid-cols-1 lg:grid-cols-2` | Paired charts |
| Full-width | `col-span-full` | Tables · timelines |

### Spacing

All spacing values are derived from the 4px base unit. Use Tailwind spacing tokens exclusively — do not use arbitrary `px` values in components.

| Token | Value | Use |
|---|---|---|
| `gap-4` | 16px | Default grid gap |
| `gap-6` | 24px | Section gap |
| `p-4` | 16px | Card inner padding |
| `p-6` | 24px | Page-level container padding |
| `space-y-6` | 24px | Vertical section rhythm |
| `space-y-4` | 16px | Intra-section rhythm |

### Grid

- Use CSS Grid (`grid`) for two-dimensional layouts
- Use Flexbox (`flex`) for one-dimensional alignment within a row or column
- Never mix Grid and Flexbox at the same layout level for the same dimension

### Container Width

```css
.container {
  max-width: 1400px; /* --screen-2xl */
  margin: 0 auto;
  padding: 0 2rem;
}
```

The main content area wraps with `container mx-auto p-6` inside the scrollable region.

### Responsive Breakpoints

Tailwind default breakpoints are used without modification.

| Breakpoint | Min Width | Description |
|---|---|---|
| `sm` | 640px | Large mobile |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Wide desktop |

---

## 4. Theme

APC-V1 supports Light and Dark themes. Theme state is stored in `localStorage` under the key `theme` and applied as a class on the `<html>` element (`class="light"` or `class="dark"`).

### Light Theme

The light theme uses a near-white background with high-contrast foreground text and subtle borders.

| Token | HSL Value | Description |
|---|---|---|
| `--background` | `210 40% 98%` | Page background |
| `--foreground` | `222.2 84% 4.9%` | Default text |
| `--card` | `0 0% 100%` | Card surface |
| `--card-foreground` | `222.2 84% 4.9%` | Card text |
| `--muted` | `210 40% 96.1%` | Muted background |
| `--muted-foreground` | `215.4 16.3% 46.9%` | Muted text |
| `--border` | `214.3 31.8% 91.4%` | Default border |
| `--input` | `214.3 31.8% 91.4%` | Input border |

### Dark Theme

The dark theme uses deep navy backgrounds that preserve readability and reduce eye strain during extended sessions.

| Token | HSL Value | Description |
|---|---|---|
| `--background` | `222.2 84% 4.9%` | Page background |
| `--foreground` | `210 40% 98%` | Default text |
| `--card` | `222.2 84% 4.9%` | Card surface |
| `--card-foreground` | `210 40% 98%` | Card text |
| `--muted` | `217.2 32.6% 17.5%` | Muted background |
| `--muted-foreground` | `215 20.2% 65.1%` | Muted text |
| `--border` | `217.2 32.6% 17.5%` | Default border |
| `--input` | `217.2 32.6% 17.5%` | Input border |
| `--destructive` | `0 62.8% 30.6%` | Danger (darkened) |

### Theme Switching

- Theme toggle is located in the top navigation Header, right-aligned
- Uses the `Moon` and `Sun` icons from Lucide React
- Controlled by the `useTheme` hook (`apps/web/src/hooks/use-theme.ts`)
- No page reload required — class toggle on `document.documentElement`
- Persisted across sessions via `localStorage`

### Color Tokens

All colour tokens are CSS custom properties resolved through Tailwind's `hsl(var(--token))` pattern. Components must use semantic tokens, never raw colour values.

#### Semantic Palette

| Token | Light | Dark | Usage |
|---|---|---|---|
| `background` | Near-white | Deep navy | Page canvas |
| `foreground` | Near-black | Near-white | Body text |
| `card` | White | Deep navy | Card, Popover |
| `card-foreground` | Near-black | Near-white | Card text |
| `primary` | `239 84% 67%` | `239 84% 67%` | Actions, links, active states |
| `primary-foreground` | Near-white | Near-black | Text on primary |
| `secondary` | `262 83% 58%` | `262 83% 58%` | Secondary actions |
| `secondary-foreground` | Near-white | Near-black | Text on secondary |
| `muted` | Pale blue-gray | Dark slate | Disabled, subdued |
| `muted-foreground` | Medium gray | Light gray | Secondary text |
| `accent` | Pale blue-gray | Dark slate | Hover state background |
| `accent-foreground` | Near-black | Near-white | Text on accent |
| `destructive` | Red | Dark red | Danger actions |
| `destructive-foreground` | Near-white | Near-white | Text on destructive |
| `border` | Light gray | Dark slate | Dividers, outlines |
| `input` | Light gray | Dark slate | Input borders |
| `ring` | Primary | Primary | Focus ring |

#### Extended Semantic Tokens (Application-level)

These are defined in `apps/web/src/config/theme.ts` and used programmatically (not as CSS variables).

| Category | Key | Value | Usage |
|---|---|---|---|
| Success | `success.500` | `#22c55e` | Positive delta, active status |
| Warning | `warning.500` | `#f59e0b` | Caution, approaching limit |
| Danger | `error.500` | `#ef4444` | Failure, destructive |
| Info | `info.500` | `#3b82f6` | Informational, neutral highlight |
| AI Accent | `primary` (violet) | `hsl(239 84% 67%)` | All AI-generated surfaces |

#### AI Accent

The AI Accent is the primary color token (`hsl(239 84% 67%)` — indigo-violet). This colour is reserved for:

- AI Insight Cards
- Opportunity Scores generated by AI
- AI action buttons (`Sparkles` icon prefix)
- AI status badges
- Loading states during AI inference

Do not use the AI Accent colour for non-AI interactive elements.

---

## 5. Typography

### Font

**Inter** is the sole typeface for the application. It is loaded from Google Fonts with the weights `400`, `500`, `600`, and `700`.

```css
font-family: 'Inter', system-ui, sans-serif;
font-feature-settings: 'rlig' 1, 'calt' 1;
```

Contextual alternates (`calt`) and required ligatures (`rlig`) are enabled for improved readability at small sizes.

### Sizes

| Token | Value | Tailwind Class | Use |
|---|---|---|---|
| `xs` | 0.75rem / 12px | `text-xs` | Labels, captions, timestamps |
| `sm` | 0.875rem / 14px | `text-sm` | Body small, table content |
| `base` | 1rem / 16px | `text-base` | Body default |
| `lg` | 1.125rem / 18px | `text-lg` | Lead text, card subtitles |
| `xl` | 1.25rem / 20px | `text-xl` | Section headings |
| `2xl` | 1.5rem / 24px | `text-2xl` | Page sub-headings |
| `3xl` | 1.875rem / 30px | `text-3xl` | Page headings |
| `4xl` | 2.25rem / 36px | `text-4xl` | Hero metrics, KPI values |

### Weights

| Token | Value | Tailwind Class | Use |
|---|---|---|---|
| Normal | 400 | `font-normal` | Body, descriptions |
| Medium | 500 | `font-medium` | Labels, table headers, nav items |
| Semi-bold | 600 | `font-semibold` | Card titles, button text |
| Bold | 700 | `font-bold` | Page headings, KPI values |

### Line Heights

| Size | Line Height | Tailwind Class |
|---|---|---|
| xs, sm | 1.5 (24px at 14px) | `leading-5` |
| base, lg | 1.625 | `leading-relaxed` |
| xl, 2xl | 1.25 | `leading-tight` |
| 3xl, 4xl | 1.1 | `leading-none` |

### Heading Rules

- Page-level headings: `text-3xl font-bold tracking-tight`
- Section headings: `text-xl font-semibold`
- Card titles: `text-sm font-medium` (inside `CardTitle`)
- Subsection labels: `text-xs font-medium uppercase tracking-wide text-muted-foreground`
- Never use more than three distinct heading sizes in a single view
- Headings do not have bottom borders or decorative underlines

### Paragraph Rules

- Body text: `text-sm` or `text-base` with `leading-relaxed`
- Descriptive paragraphs below headings: `text-muted-foreground` at `text-sm`
- Maximum line length: 72 characters (achieved through container max-width)
- No justified alignment; left-align all prose

### Code Font

System monospace stack for technical strings (ASINs, IDs, API keys, version hashes):

```css
font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
```

Use `font-mono text-xs` Tailwind classes inline. Do not create a custom monospace component.

---

## 6. Spacing System

### 4px Scale

All spacing derives from a 4px base unit, expressed through Tailwind's default spacing scale.

| Step | Value | Token |
|---|---|---|
| 1 | 4px | `space-1`, `p-1`, `m-1` |
| 2 | 8px | `space-2`, `p-2`, `m-2` |
| 3 | 12px | `space-3`, `p-3`, `m-3` |
| 4 | 16px | `space-4`, `p-4`, `m-4` |
| 5 | 20px | `space-5`, `p-5`, `m-5` |
| 6 | 24px | `space-6`, `p-6`, `m-6` |
| 8 | 32px | `space-8`, `p-8`, `m-8` |
| 10 | 40px | `space-10`, `p-10`, `m-10` |
| 12 | 48px | `space-12`, `p-12`, `m-12` |

### Border Radius

Defined via the `--radius` CSS custom property: `0.75rem` (12px).

| Token | Value | Tailwind Class | Use |
|---|---|---|---|
| `sm` | `calc(var(--radius) - 4px)` = 8px | `rounded-sm` | Input fields, small badges |
| `md` | `calc(var(--radius) - 2px)` = 10px | `rounded-md` | Buttons |
| `lg` | `var(--radius)` = 12px | `rounded-lg` | Cards, Dialogs, Panels |
| `full` | 9999px | `rounded-full` | Avatar, circular badges |

### Shadows

Shadows are used exclusively for elevation — to indicate stacking context, not decoration.

| Name | Tailwind Class | Use |
|---|---|---|
| None | `shadow-none` | Flat surfaces |
| Extra small | `shadow-xs` | Input focus assist |
| Small | `shadow-sm` | Dropdown, Popover |
| Default | `shadow` | Cards on hover |
| Medium | `shadow-md` | Modals, side panels |
| Large | `shadow-lg` | Command palette, floating menus |

Do not apply `shadow-xl` or higher to application surfaces.

### Animations

All animations use Tailwind CSS or Framer Motion. Raw CSS `@keyframes` are limited to utility animations defined in `tailwind.config.js`.

| Animation | Duration | Easing | Use |
|---|---|---|---|
| Accordion expand | `200ms` | `ease-out` | Sidebar sub-nav, accordion |
| Accordion collapse | `200ms` | `ease-out` | Sidebar sub-nav, accordion |
| Fade in | `150ms` | `ease-in` | Tooltip, Popover appear |
| Slide in (right) | `300ms` | `ease-out` | Drawer, side panel |
| Slide in (up) | `200ms` | `ease-out` | Bottom sheet, toast |
| Page transition | `200ms` | `ease-in-out` | Route-level content swap |
| Skeleton pulse | `1500ms` | `ease-in-out` infinite | Loading skeleton |

### Hover States

- Interactive elements: `hover:bg-accent` for ghost/outline variants
- Cards that are clickable: `hover:shadow-md transition-shadow duration-150`
- Table rows: `hover:bg-muted/50`
- Sidebar items: `hover:bg-slate-800` (dark sidebar context)
- Buttons: defined within variant — do not override with external `hover:`

### Transitions

All state transitions use `transition-all duration-150 ease-in-out` unless a specific property is listed.

- Colour transitions: `transition-colors duration-150`
- Shadow transitions: `transition-shadow duration-150`
- Transform transitions: `transition-transform duration-200`
- Sidebar collapse: `transition-all duration-300`

### Loading Skeleton

Skeleton loaders replace content during data fetching. They must mirror the shape of the content they represent.

- Background: `bg-muted animate-pulse rounded-md`
- Text line: `h-4 w-full bg-muted animate-pulse rounded`
- KPI value: `h-8 w-24 bg-muted animate-pulse rounded`
- Card skeleton: replicate `CardHeader` + `CardContent` structure with skeleton divs

---

## 7. Component Standards

All components are built on **shadcn/ui** (Radix UI primitives) extended with Tailwind CSS class variants. Component files live in `apps/web/src/components/ui/`.

### Buttons

Four variants are defined:

| Variant | Background | Use |
|---|---|---|
| `default` | `primary` | Primary actions |
| `secondary` | `secondary` | Secondary actions |
| `outline` | Transparent + border | Tertiary actions |
| `ghost` | Transparent | Icon buttons, nav items |
| `destructive` | `destructive` | Irreversible actions |
| `link` | Transparent + underline | Inline text links |

Size variants:

| Size | Height | Padding | Font |
|---|---|---|---|
| `sm` | 32px | `px-3` | `text-xs` |
| `default` | 40px | `px-4 py-2` | `text-sm` |
| `lg` | 44px | `px-8` | `text-base` |
| `icon` | 40×40px | — | — |

Rules:
- AI-triggered actions use `default` variant prefixed with the `Sparkles` icon
- Destructive buttons must be separated from other actions by minimum `gap-4`
- Never place two `default` variant buttons adjacent to each other
- `disabled` state: `opacity-50 cursor-not-allowed pointer-events-none`

### Cards

Cards are the primary content container.

```
┌─────────────────────────────────────┐
│  CardHeader                         │
│  ├── CardTitle      CardDescription │
│  └── (optional icon or action)      │
│─────────────────────────────────────│
│  CardContent                        │
│  (primary data, charts, tables)     │
│─────────────────────────────────────│
│  CardFooter (optional)              │
│  (actions, pagination)              │
└─────────────────────────────────────┘
```

- Default padding: `p-6` in header and content
- Border: `border` using `--border` token
- Background: `bg-card`
- Radius: `rounded-lg`
- No inner box-shadow by default; add `shadow-sm` on hover for interactive cards

### Forms

- Wrap all form elements in `<form>` with `react-hook-form` `handleSubmit`
- Use `zod` schemas for validation
- Field order: Label → Input → Error message
- Error message: `text-sm text-destructive mt-1`
- Full-width inputs within forms: `w-full`
- Group related fields with `space-y-4`; separate field groups with `space-y-6`

### Inputs

- Default: `h-10 rounded-md border border-input px-3 py-2 text-sm`
- Focus: `ring-2 ring-ring ring-offset-2`
- Error state: `border-destructive focus-visible:ring-destructive`
- Disabled: `opacity-50 cursor-not-allowed`
- With icon prefix: use relative wrapper + `pl-9` on input
- Placeholder text: `text-muted-foreground`

### Tables

Built with **TanStack Table**. See full table standards in Section 10.

- Header row: `bg-muted/50 text-muted-foreground text-xs font-medium uppercase tracking-wide`
- Body rows: `text-sm` · alternating hover state
- Selected row: `bg-primary/10`
- Cell padding: `px-4 py-3`
- No outer table border; use bottom border on each row: `border-b border-border`

### Charts

Built with **Recharts**. See full chart standards in Section 12.

- Wrap all charts in a `ResponsiveContainer` with `width="100%"`
- Default height: `300px` for standard charts, `200px` for sparklines
- Charts live inside `CardContent`

### Dialogs

- Max width: `max-w-lg` for standard dialogs, `max-w-2xl` for complex forms
- Structure: `DialogHeader` → `DialogTitle` → `DialogDescription` → `DialogFooter`
- Footer: Cancel (outline) + Confirm (default/destructive), right-aligned
- Overlay: `bg-black/50 backdrop-blur-sm`
- Animation: fade + scale-in from center, `duration-200`
- Pressing `Escape` closes the dialog unless a destructive action is in progress

### Drawers

- Slide in from the right side
- Width: `w-full max-w-md sm:max-w-lg`
- Used for: Edit panels, detail views, filters, step-by-step configuration
- Header is sticky; footer with actions is sticky; content area scrolls independently
- Close button: top-right `X` icon (ghost, size `icon`)

### Badges

| Variant | Background | Use |
|---|---|---|
| `default` | `primary/10` text `primary` | Default label |
| `secondary` | `secondary/10` text `secondary` | Secondary label |
| `outline` | Transparent border | Neutral category tag |
| `destructive` | `destructive/10` text `destructive` | Error, failed |
| `success` | `success.500/10` text `success.700` | Active, completed |
| `warning` | `warning.500/10` text `warning.700` | Caution, review needed |

Size: fixed at `text-xs font-medium px-2 py-0.5 rounded-sm`.

### Tabs

- Use `@radix-ui/react-tabs` via shadcn/ui
- Tab list: `border-b border-border` with tab triggers as `border-b-2` active indicator
- Active tab indicator: `border-primary text-primary`
- Inactive tab: `text-muted-foreground hover:text-foreground`
- Use tabs for horizontal content segmentation within a single view; do not nest tabs

### Timeline

Used for pipeline stages, audit trails, and publishing history.

```
● (icon) ─── Event Title                          [timestamp]
│             Description text, muted-foreground
│
● (icon) ─── Event Title                          [timestamp]
│
○ (future)── Pending Step
```

- Active node: filled circle with primary colour
- Completed node: filled circle with `success` colour
- Pending node: outlined circle with `muted` colour
- Connector line: `border-l-2 border-muted ml-3`

### AI Insight Card

A specialised card for displaying AI-generated analysis, recommendations, or explanations.

```
┌──────────────────────────────────────────┐
│  [Sparkles icon, primary]  AI Insight    │
│  ─────────────────────────────────────── │
│  Generated analysis text or              │
│  recommendation content.                 │
│                                          │
│  [Source badge]  [Confidence score]      │
└──────────────────────────────────────────┘
```

- Left border accent: `border-l-4 border-primary`
- Background: `bg-primary/5` (subtle tint)
- Header icon: `Sparkles` from Lucide React, `text-primary`
- Text: `text-sm leading-relaxed`
- Confidence score: `text-xs text-muted-foreground` with a 0–100 numeric badge

### Opportunity Card

Displays a discovered book market opportunity with its AI-generated score.

```
┌──────────────────────────────────────────┐
│  Category · Subcategory          Score   │
│  Book Opportunity Title          [  87 ] │
│  ─────────────────────────────────────── │
│  Key metrics: competition, demand, gap   │
│  [Open]  [Add to Queue]                  │
└──────────────────────────────────────────┘
```

- Score badge: circular, colour-coded by range
  - 80–100: `success` green
  - 60–79: `warning` amber
  - 0–59: `muted` gray
- Card is clickable; entire surface is the click target

### Statistics Card

Standard KPI card used across the dashboard.

```
┌──────────────────────────────────────────┐
│  Label                      [icon]       │
│  ─────────────────────────────────────── │
│  2,847                                   │
│  +12% from last month  ↑                 │
└──────────────────────────────────────────┘
```

- Value: `text-2xl font-bold`
- Delta positive: `text-emerald-600` with `TrendingUp` icon
- Delta negative: `text-destructive` with `TrendingDown` icon
- Icon: `h-4 w-4 text-muted-foreground`, top-right of header

---

## 8. Navigation

### Sidebar

- Width: `256px` expanded · `64px` collapsed
- Background: `bg-slate-950` (always dark, regardless of application theme)
- Text: `text-slate-100`
- Border: `border-r` using the dark-mode border token
- Toggle: collapse/expand button at bottom of sidebar, chevron icon
- Transition: `transition-all duration-300`

Navigation Item States:

| State | Style |
|---|---|
| Default | `text-slate-400 hover:bg-slate-800 hover:text-slate-100` |
| Active | `bg-slate-800 text-slate-100` with left `border-l-2 border-primary` |
| Collapsed (icon only) | Icon centred, tooltip on hover |

Navigation Structure:

```
[Logo / Brand]
──────────────
[Dashboard]
[Knowledge Intelligence]
  ├── Categories
  ├── Research
  └── Market Intelligence
[Books]
[Book Production]
  ├── Generator
  ├── Pipeline
  └── Templates
[Publishing]
[Reports]
──────────────
[Settings]
```

- Section groups are separated by a `Separator` component
- Nested items are indented by `pl-4` when expanded
- Active parent item remains highlighted when a child is active

### Header

- Height: `h-16` (64px)
- Background: `bg-background/95 backdrop-blur`
- Position: `sticky top-0 z-40`
- Border: `border-b`

Header Zones (left to right):

| Zone | Content |
|---|---|
| Left | Global search input (`max-w-md`) |
| Right | Theme toggle · Notifications · User menu |

### Breadcrumb

- Appears below the header for views more than one level deep
- Format: `Section / Subsection / Current Page`
- Separator: `/` character in `text-muted-foreground`
- Current page: `text-foreground font-medium`
- Parent links: `text-muted-foreground hover:text-foreground`
- Do not show breadcrumb on top-level pages (Dashboard, Reports)

### Search

- Global search input is located in the header, full width up to `max-w-md`
- Icon: `Search` (Lucide) at `left-3`, `text-muted-foreground`
- Placeholder: `"Search..."`
- On focus: expands to `max-w-lg`, opens a command palette overlay
- Command palette: keyboard-navigable list with categorised results (Books, Categories, Intelligence, Actions)
- Shortcut hint: `⌘K` displayed when input is unfocused

### Notifications

- Bell icon (`Bell`) in the header right zone
- Unread indicator: `h-2 w-2 rounded-full bg-destructive` positioned `top-2 right-2`
- Click opens a `Popover` with a scrollable notification list
- Notification item: icon + title + timestamp + unread dot
- Max visible notifications in popover: 8; overflow link to full notification page

### User Menu

- `Avatar` + display name + role in the header right zone (hidden on mobile)
- Click opens a `DropdownMenu`

Dropdown items:

```
Profile
Settings
Team
──────────
Sign Out
```

- `Sign Out` is separated by a `Separator` and styled as `text-destructive`

---

## 9. Dashboard Standards

### KPI Cards

- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- Each card uses `Statistics Card` component (Section 7)
- Always show: label, current value, delta vs prior period, icon
- Delta must be contextually coloured (green positive, red negative, gray neutral)

### Trend Charts

- Default type: `AreaChart` (Recharts) with gradient fill
- Time axis: x-axis with readable date labels
- Metric axis: y-axis with abbreviated numbers (1.2K, 3.4M)
- Interactive: tooltip on hover showing exact value + date
- Colour: `primary` stroke with `primary/20` area fill

### Heat Maps

- Used for: publication frequency by day/time, keyword density grids, market coverage
- Cell colour scale: low → `muted` · mid → `primary/40` · high → `primary`
- Cell size: minimum `32×32px`
- Axes: clearly labelled with `text-xs text-muted-foreground`
- Tooltip on hover: category label + exact value

### Recent Activity

- Timeline format (see Timeline component, Section 7)
- Maximum 10 entries visible; link to full activity log
- Each entry: action type icon + description + timestamp
- Timestamps: relative (`2 hours ago`) with ISO absolute on tooltip
- Icons are colour-coded by action type: create (`primary`), update (`info`), delete (`destructive`)

### Opportunity Score

- Circular progress indicator or large numeric badge
- 0–100 range; always visible as a whole number
- Colour thresholds:
  - 80–100: `#22c55e` (success green)
  - 60–79: `#f59e0b` (warning amber)
  - 40–59: `#3b82f6` (info blue)
  - 0–39: `#ef4444` (danger red)
- Accompanied by a short textual interpretation below the score

### AI Recommendations

- Displayed as a list of `AI Insight Cards` (Section 7)
- Maximum 3 recommendations on the main dashboard
- Each card: recommendation title + 1-2 sentence rationale + action button
- Header: `Sparkles` icon + "AI Recommendations" label

### Quick Actions

- Horizontal row of `Button` components below the KPI row
- Maximum 4 actions visible; overflow as dropdown
- Examples: "Generate Book", "Run Market Scan", "Export Report", "Add Category"
- Icons prefix all quick action buttons

---

## 10. Tables

All tables are built with **TanStack Table** (`@tanstack/react-table`).

### Sorting

- Click on any column header to sort ascending; click again for descending; third click clears sort
- Active sort column header: arrow icon (`ChevronUp` / `ChevronDown`) appended, `text-primary`
- Only one column sorted at a time (single-column sort) unless explicitly multi-sort is enabled
- Sorted column cells: no background change; header only is highlighted

### Filtering

- Global filter: search input above the table, full-width on mobile, `max-w-sm` on desktop
- Column filters: accessible via a `Filter` icon button in the column header
- Active filter indicator: dot on `Filter` icon, coloured `primary`
- Filter panel: slide-in from right or inline below the column header
- Applied filters displayed as dismissible `Badge` chips above the table

### Pagination

- Controls below the table, right-aligned
- Format: `Rows per page: [select]  1–10 of 247  [< Prev] [Next >]`
- Page size options: 10, 25, 50, 100
- Disabled buttons use `opacity-50 cursor-not-allowed`

### Infinite Scroll

- Used when data volume exceeds 500 rows and pagination creates friction
- Load trigger: `IntersectionObserver` on a sentinel element at the bottom of the table
- Loading indicator: spinner row at the bottom during fetch
- Prefetch when the user is 200px from the bottom

### Sticky Header

- Table header is `sticky top-0 z-10 bg-background`
- Required for all tables taller than the viewport
- Shadow appears on the header when the table body is scrolled: `shadow-sm`

### Column Selection

- Column visibility toggle via a `Columns` button (top-right of the table toolbar)
- Opens a `DropdownMenu` with toggleable checkboxes per column
- At least one column must remain visible (enforce in logic)
- User column preferences are persisted in `localStorage`

---

## 11. Forms

### Validation

- Schema: defined with **Zod** and integrated via `@hookform/resolvers/zod`
- Validation triggers: `onChange` for touched fields; `onSubmit` for all fields
- Error display: inline below the input, `text-sm text-destructive`
- Success state: no inline indicator; success is communicated by toast or navigation

### Wizard

- Multi-step flows that are conceptually ordered but not time-sensitive
- Navigation: `Previous` (outline) + `Next` (default) buttons in the footer
- Step indicator: numbered dots or labelled steps at the top
- Completed steps: checkmark indicator, visitable by clicking
- Do not validate future steps until they are reached

### Stepper

- Used for linear, sequential processes (e.g., onboarding, pipeline configuration)
- Visual: horizontal steps bar at the top of the form section
- Current step: filled circle with step number, `text-primary`
- Completed step: checkmark icon, `text-success`
- Future step: outlined circle, `text-muted-foreground`

### Autosave

- Applied to long-form editors and configuration panels
- Debounce: 1500ms after last keystroke
- Status indicator (top-right of the editor):
  - Saving: `"Saving..."` with spinner
  - Saved: `"Saved"` with `Check` icon in `text-success`
  - Error: `"Save failed"` with retry button
- Do not block user interaction during autosave

### Error Handling

- Field-level errors: inline below input
- Form-level errors (e.g., server-side validation): shown in a `Callout` component above the submit button
- Network errors: displayed in a `Toast` notification (error variant, auto-dismiss after 5 seconds)
- Validation errors on submit do not navigate away; scroll to the first error field

---

## 12. Charts

All charts are built with **Recharts** (`recharts`).

### Recharts

All charts must be wrapped in `ResponsiveContainer` with `width="100%"`. Define height explicitly on the container; never on the chart component directly.

```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    {/* ... */}
  </AreaChart>
</ResponsiveContainer>
```

### Supported Chart Types

| Chart Type | Component | Use |
|---|---|---|
| Area Chart | `AreaChart` | Trends over time, cumulative metrics |
| Line Chart | `LineChart` | Comparison of multiple time series |
| Bar Chart | `BarChart` | Category comparisons, ranked lists |
| Pie Chart | `PieChart` | Composition, share breakdowns |
| Radial Bar | `RadialBarChart` | Opportunity score, progress |
| Composed | `ComposedChart` | Dual-axis (bar + line) |

### Color Usage

- Primary series: `hsl(239 84% 67%)` (primary token)
- Secondary series: `hsl(262 83% 58%)` (secondary token)
- Tertiary series and beyond: pull from `info.500`, `success.500`, `warning.500`
- Always use the same colour for the same metric across all charts in a single view
- Area fill: 20% opacity of the stroke colour (`fillOpacity={0.2}`)
- Axis labels and grid lines: `text-muted-foreground` and `stroke="hsl(var(--border))"`

### Empty States

Every chart must have a defined empty state. Do not render an empty chart frame.

Empty state structure:

```
┌──────────────────────────────────┐
│                                  │
│    [BarChart2 icon, muted]        │
│    No data available              │
│    [description of what data is   │
│     expected and how to get it]  │
│                                  │
└──────────────────────────────────┘
```

- Icon: relevant chart icon from Lucide React, `h-10 w-10 text-muted-foreground/40`
- Title: `text-sm font-medium text-muted-foreground`
- Description: `text-xs text-muted-foreground` (optional)

---

## 13. Accessibility

### Keyboard Navigation

- All interactive elements must be reachable and operable using `Tab` and `Shift+Tab`
- Dropdown menus and popovers: opened with `Enter` or `Space`, navigated with arrows, closed with `Escape`
- Dialogs: focus is trapped inside when open; `Escape` closes; focus returns to trigger on close
- Tables: rows navigable with arrow keys when the table is in focus
- Command palette: opened with `⌘K` / `Ctrl+K`; navigated with arrows; selected with `Enter`; closed with `Escape`

### ARIA

- All icons used as interactive elements must have `aria-label` or be accompanied by visible text
- Icon-only buttons: `<Button size="icon" aria-label="Close dialog">`
- Charts: include a visually hidden `<caption>` or `aria-label` on the chart container describing the data
- Live regions: AI inference status uses `aria-live="polite"` for screen-reader announcements
- Status badges use `role="status"` where appropriate

### Contrast

Minimum contrast ratios (WCAG 2.1 AA):

| Use | Minimum Ratio |
|---|---|
| Normal body text | 4.5:1 |
| Large text (18px+) | 3:1 |
| UI components and focus indicators | 3:1 |
| Decorative elements | No requirement |

- Light theme `--foreground` on `--background`: verified above 7:1
- Muted foreground on `--muted`: verified above 4.5:1
- `--primary` on `--primary-foreground`: verified above 4.5:1
- Do not use colour alone to convey meaning — always pair with an icon or label

### Focus

- Focus ring: `ring-2 ring-ring ring-offset-2`
- The `ring` token maps to `primary`, ensuring brand consistency
- Never suppress focus rings with `outline-none` without replacing them
- Focus order must follow the visual reading order (left-to-right, top-to-bottom)
- Programmatic focus: use `focus()` after dialog open and command palette open

---

## 14. Responsive Rules

### Desktop (lg: 1024px and above)

- Full sidebar at 256px (expandable/collapsible)
- 4-column KPI grid
- Multi-column table views
- Right context panel available (future)
- Full header with search + notifications + user menu

### Tablet (md: 768px — 1023px)

- Sidebar collapses to icon-only (64px) by default
- 2-column KPI grid
- Table: hide lowest-priority columns
- Header: search may collapse to icon
- Drawers and dialogs use `max-w-full`

### Mobile (below md: 768px)

- Sidebar hidden by default; accessible via a hamburger menu overlay
- 1-column KPI grid
- Tables: horizontal scroll or card-based row presentation
- Header: icon-only controls; search is a full-screen overlay
- Dialogs: full-screen (`w-full h-full`)
- Drawers: bottom sheet (`fixed inset-x-0 bottom-0`)
- Forms: single-column layout

---

## 15. Icon Standards

### Lucide React

**Lucide React** (`lucide-react`) is the sole icon library for APC-V1. Do not import icons from any other source.

### Icon Sizes

| Class | Dimensions | Use |
|---|---|---|
| `h-3 w-3` | 12×12px | Inline indicator dots |
| `h-4 w-4` | 16×16px | Inline with text, table actions, badges |
| `h-5 w-5` | 20×20px | Button icons, header controls |
| `h-6 w-6` | 24×24px | Sidebar nav items (expanded) |
| `h-8 w-8` | 32×32px | Empty state icons (small) |
| `h-10 w-10` | 40×40px | Empty state icons (large), section heroes |

### Icon Colors

| Context | Class |
|---|---|
| Default in text | inherits `currentColor` |
| Muted / secondary | `text-muted-foreground` |
| Primary action | `text-primary` |
| Success | `text-emerald-600` |
| Warning | `text-amber-500` |
| Danger | `text-destructive` |
| AI Accent | `text-primary` with `Sparkles` icon |
| Sidebar (inactive) | `text-slate-400` |
| Sidebar (active) | `text-slate-100` |

Rules:
- Do not hardcode hex or HSL values on icon elements; use Tailwind colour classes
- Icons should never have separate background fills (use a wrapping `div` if needed)
- Stroke width: Lucide defaults (`strokeWidth={2}` is the standard; use `strokeWidth={1.5}` for large decorative icons)

---

## 16. Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| UI Framework | React | 19 | Concurrent features enabled |
| Type System | TypeScript | 5.x | Strict mode |
| Styling | Tailwind CSS | 3.x | CSS custom properties + utility classes |
| Component Library | shadcn/ui | — | Radix UI primitives, copied into `/components/ui/` |
| Primitive Layer | Radix UI | 1.x–2.x | Accordion, Avatar, Dialog, DropdownMenu, Label, Popover, Select, Separator, Slot, Switch, Tabs, Toast |
| Icons | Lucide React | 0.468+ | Sole icon source |
| Data Fetching | TanStack Query | 5.x | All server state management |
| Table | TanStack Table | 8.x | All data table instances |
| Charts | Recharts | 2.x | All data visualisation |
| Animation | Framer Motion | 11.x | Page transitions, complex animations |
| Forms | React Hook Form | 7.x | With Zod resolver |
| Validation | Zod | 3.x | Shared with API layer |
| Routing | React Router | 7.x | File-based route conventions |
| HTTP Client | Axios | 1.x | Wrapped in `api-client.ts` |
| Build | Vite | 6.x | |
| CSS Plugin | tailwindcss-animate | 1.x | Keyframe utilities |
| Utility | clsx + tailwind-merge | — | `cn()` helper in `lib/utils.ts` |

### Notes on Key Libraries

**shadcn/ui**: Components are source-copied into the repository (`components/ui/`). They are not imported from a package. Modifications to these files are permitted to align with APC design tokens.

**TanStack Query**: All API calls go through React Query hooks. No direct `axios` calls in components. Hooks live in `hooks/` with the convention `use-[resource]-[action].ts`.

**Framer Motion**: Used exclusively for page-level route transitions and complex interaction animations (e.g., AI Insight Card appear, opportunity score counting animation). Sidebar collapse animation uses CSS transitions, not Framer Motion.

---

## 17. Naming Conventions

### Component Naming

- PascalCase for all component functions and files
- File name matches the exported component name: `OpportunityCard.tsx` → `export function OpportunityCard`
- Descriptive, domain-specific names: `AiInsightCard`, `OpportunityScoreBadge`, `BookPipelineTimeline`
- Never use generic names: `Component`, `Widget`, `Item`
- HOC prefix: `with` — e.g., `withAuthGuard`
- Hook prefix: `use` — e.g., `useOpportunityScore`, `useMarketIntelligence`

### Folder Structure

```
apps/web/src/
├── app/               # App-level setup (router, providers)
├── components/
│   ├── ui/            # shadcn/ui primitive components
│   └── layouts/       # Layout components (Sidebar, Header, DashboardLayout)
├── config/            # Static config (theme.ts, env.ts)
├── hooks/             # Custom React hooks (use-[resource]-[action].ts)
├── lib/               # Utilities (api-client.ts, utils.ts)
├── pages/             # Page-level route components ([route].tsx)
├── styles/            # Global CSS (global.css)
└── types/             # Shared TypeScript types (domain.types.ts)
```

Feature-specific components that are not global:

```
pages/
└── market-intelligence/
    ├── MarketIntelligencePage.tsx
    ├── components/
    │   ├── OpportunityCard.tsx
    │   └── TrendHeatMap.tsx
    └── hooks/
        └── use-market-intelligence.ts
```

### Theme Naming

- CSS custom properties: `--kebab-case` — e.g., `--primary-foreground`, `--muted-foreground`
- Tailwind config extensions: `camelCase` for JS keys in `theme.extend`
- Semantic names only — no raw colour names like `--blue-600`

### CSS Variable Naming

Pattern: `--[component][-variant][-state]` or `--[semantic-role]`

| Type | Pattern | Example |
|---|---|---|
| Semantic role | `--[role]` | `--background`, `--primary` |
| Role + contrast | `--[role]-foreground` | `--primary-foreground` |
| UI state | `--[component]-[state]` | `--input-disabled` (custom) |
| Radius | `--radius` | Single source |

---

## 18. Best Practices

### Consistency

- Every UI decision in a feature must use the existing design tokens and components
- Before creating a new component, verify that an existing one cannot be extended via props
- Every new page must use the `DashboardLayout` wrapper
- Spacing, radius, and typography must come exclusively from Tailwind tokens — no arbitrary values

### Performance

- Use `React.memo` on components that receive stable props and render frequently (table rows, list items)
- Virtualize lists longer than 100 items using `@tanstack/virtual` or equivalent
- Images: use `loading="lazy"` and define `width`/`height` to prevent layout shift
- Chart data: memoize with `useMemo`; never compute inside the render function
- Avoid unnecessary `useEffect` — prefer derived state and event handlers
- Code-split route-level components using `React.lazy` + `Suspense`

### Accessibility

- Every PR that introduces UI changes must be manually verified with keyboard-only navigation
- Colour must never be the sole indicator of meaning — always pair with an icon or label
- All form inputs must have associated `<label>` elements (never `placeholder` as a substitute for a label)
- Modals must trap focus; sidebars must not trap focus
- Use semantic HTML: `<nav>`, `<main>`, `<header>`, `<aside>`, `<section>`, `<article>`

### Reusable Components

- If the same UI pattern appears in two different places, extract it into a shared component immediately
- Shared components go in `components/ui/` (primitives) or `components/layouts/` (structural)
- Domain-specific shared components (e.g., `OpportunityCard`) live in `components/` at the feature level
- Component props must be typed with explicit TypeScript interfaces — no `any`
- Components must accept `className` as an optional prop for layout-level overrides

### No Duplicated UI

- Do not recreate Radix UI components that shadcn/ui already provides
- Do not import icons from sources other than Lucide React
- Do not create bespoke modal or popover implementations — use the existing `Dialog` and `Popover` components
- One global CSS file (`global.css`) — do not create per-component CSS files or CSS modules
- Theme values live in `tailwind.config.js` and `global.css` — do not inline HSL values in components

---

*This document is maintained as part of APC-V1 source. All UI changes must be reflected here before or alongside implementation.*
