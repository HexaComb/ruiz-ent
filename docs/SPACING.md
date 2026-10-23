# Ruiz Family Enterprises — Spacing & Layout System

This document outlines the design system's spacing scale, layout primitives, and rules for composing pages. Follow these specifications whenever building new pages, sections, or UI components.

---

## 1. Design Tokens Reference

All tokens are defined in [:root in `src/styles/global.css`](file:///Users/marcochavez/Desktop/projects/business/ruiz-ent/src/styles/global.css).

### Micro Spacing Scale (4px Base Grid)

| Token | CSS Value | Pixels | Common Use Case |
| :--- | :--- | :--- | :--- |
| `--space-0` | `0` | 0px | Reset margins/paddings |
| `--space-1` | `0.25rem` | 4px | Hairline spacing, inline badges, tight offsets |
| `--space-2` | `0.5rem` | 8px | Icon gaps, compact badge padding, sub-labels |
| `--space-3` | `0.75rem` | 12px | Button icon/text gap, compact list row gaps |
| `--space-4` | `1rem` | 16px | **Base rhythm unit**: paragraph gap, form row gap |
| `--space-5` | `1.25rem` | 20px | Medium element gap |
| `--space-6` | `1.5rem` | 24px | Card sub-blocks, subsection margins |
| `--space-8` | `2rem` | 32px | Content group separation |
| `--space-10` | `2.5rem` | 40px | Major block separation |
| `--space-12` | `3rem` | 48px | Component landmark rhythm |
| `--space-16` | `4rem` | 64px | Distinct block breaks |
| `--space-20` | `5rem` | 80px | High-contrast visual pauses |
| `--space-24` | `6rem` | 96px | Hero & major feature separation |
| `--space-32` | `8rem` | 128px | Extreme spacious separation |

### Macro & Fluid Layout Scale

These tokens scale automatically between mobile (320px) and desktop (1440px) viewports:

| Token | Responsive Value | Purpose |
| :--- | :--- | :--- |
| `--space-gutter` | `clamp(1.25rem, 4vw, 2.5rem)` | Screen edge margins (used by `.container`) |
| `--space-section-y` | `clamp(4.5rem, 7.5vw, 7rem)` | **Standard section vertical padding** |
| `--space-section-y-compact` | `clamp(3rem, 5vw, 4.5rem)` | Compact bands, notices, callout strips |
| `--space-section-y-spacious` | `clamp(5.5rem, 9vw, 8.5rem)` | Hero & high-impact showcase sections |
| `--space-header-mb` | `clamp(2.5rem, 5vw, 3.75rem)` | Gap between `.section-header` and section body |
| `--space-card-p` | `clamp(1.25rem, 2.5vw, 2rem)` | Interior padding for cards and panels |
| `--space-card-p-compact` | `clamp(1rem, 2vw, 1.5rem)` | Compact card interior padding |
| `--space-card-gap` | `clamp(1.25rem, 2.5vw, 2rem)` | Gap between cards in `.grid-cards` |
| `--space-grid-gap` | `clamp(1.25rem, 2.5vw, 2rem)` | Standard multi-column grid gap |
| `--space-grid-gap-lg` | `clamp(1.75rem, 3.5vw, 2.75rem)` | Spacious multi-column grid gap |

### Semantic Component Rhythm Tokens

| Token | Value | Target |
| :--- | :--- | :--- |
| `--space-stack-xs` | `var(--space-1)` (4px) | Tight metadata lines |
| `--space-stack-sm` | `var(--space-2)` (8px) | Subheadings & labels |
| `--space-stack-md` | `var(--space-4)` (16px) | Standard content stack rhythm |
| `--space-stack-lg` | `var(--space-6)` (24px) | Card interior sections |
| `--space-stack-xl` | `var(--space-8)` (32px) | Form groups |
| `--space-stack-2xl` | `var(--space-12)` (48px) | Major content groups |
| `--space-cluster-gap`| `var(--space-3)` (12px) | Tag clusters, button groups |

---

## 2. Layout Primitives

### 1. Section Primitive (`<Section>` or `.section`)

Every page section must use either the Astro component:
```astro
---
import Section from '../components/Section.astro';
---

<Section id="my-section" variant="light">
  <!-- Content inside auto-centered container -->
</Section>
```

Or standard HTML:
```html
<section class="section section--light" id="my-section">
  <div class="container">
    <!-- Content inside auto-centered container -->
  </div>
</section>
```

#### Section Surface Variants
- `.section--white`: White surface (`var(--bg-white)`)
- `.section--light`: Subtle cool gray/slate surface (`var(--bg-light)`)
- `.section--light-inset`: Inset tone (`var(--bg-light-inset)`)
- `.section--dark`: Deep navy/slate surface (`var(--bg-dark)`) with white text
- `.section--dark-elevated`: Elevated dark card tone (`var(--bg-dark-elevated)`)

#### Section Density Variants
- `.section--compact`: `padding-block: var(--space-section-y-compact);`
- `.section--spacious`: `padding-block: var(--space-section-y-spacious);`

---

### 2. Container (`.container`)

Controls max-width and fluid horizontal gutters.
- `.container`: standard max width `1240px` with `--space-gutter` padding.
- `.container--narrow`: max width `860px` (ideal for text, FAQs, contact forms).
- `.container--wide`: max width `1400px` (ideal for wide media galleries).

---

### 3. Section Header (`.section-header`)

Standard typography and bottom spacing for section introductions:
```html
<div class="section-header text-center">
  <h2 class="section-title">Precision Structural Concrete</h2>
  <p class="section-subtitle centered">
    Engineered to Class A specifications across the Central Valley.
  </p>
</div>
```
- `.section-header`: automatically includes `margin-bottom: var(--space-header-mb)`.
- `.section-title`: includes `margin-bottom: var(--space-4)`.
- Use `.on-dark` on `.section-title` and `.section-subtitle` when placed on dark sections.

---

### 4. Stack Primitive (`.stack`)

Creates flawless vertical rhythm without manual margins on child elements:
```html
<div class="stack stack--md">
  <h3>Card Title</h3>
  <p>First paragraph of content.</p>
  <div class="cluster">
    <span class="badge">Stamped</span>
    <span class="badge">Sealed</span>
  </div>
</div>
```
Variants: `.stack--xs`, `.stack--sm`, `.stack--md` (default), `.stack--lg`, `.stack--xl`, `.stack--2xl`.

---

### 5. Cluster Primitive (`.cluster`)

Creates auto-wrapping horizontal groups with consistent gaps (tags, badges, button groups):
```html
<div class="cluster cluster--md">
  <a href="#quote" class="btn btn-primary">Request Free Estimate</a>
  <a href="tel:5592441922" class="btn btn-outline-dark">Call (559) 244-1922</a>
</div>
```
Modifiers: `.cluster--center`, `.cluster--between`, `.cluster--sm`, `.cluster--lg`.

---

### 6. Card Grids & Surfaces (`.grid-cards`, `.card-surface`)

Responsive grids that automatically fit columns without breakpoint micro-management:
```html
<div class="grid-cards">
  <article class="card-surface stack stack--md">
    <h4>Pool Decks</h4>
    <p>Non-slip, heat-reflective finishes designed for Central Valley summers.</p>
  </article>
  <article class="card-surface stack stack--md">
    <h4>Retaining Walls</h4>
    <p>Solid-grouted split-face masonry engineered for lifetime slope retention.</p>
  </article>
</div>
```
- Multi-column grid classes: `.grid-2`, `.grid-3`, `.grid-4`.
- Card surface variants: `.card-surface--compact`, `.card-surface--dark`.

---

## 3. Fast Rules for AI Agents

1. **NEVER use arbitrary pixel or rem spacing** (e.g. `margin-top: 35px`, `padding: 2.2rem`).
2. **ALWAYS alternate section surfaces** (e.g. Hero [dark] -> Services [light] -> Work [white] -> Story [dark]).
3. **ALWAYS use `.stack` or `gap`** to space siblings instead of chaining `margin-bottom` on individual elements.
4. **ALWAYS use `.cluster`** when placing badges, tags, or side-by-side action buttons.
5. **DO use logical properties** in CSS: `padding-block`, `padding-inline`, `margin-block`, `margin-inline`.
