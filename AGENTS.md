## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Spacing & Page Placement System (MANDATORY FOR ALL AGENTS)

A standardized, fool-proof spacing and layout system is implemented in `src/styles/global.css` and documented in `docs/SPACING.md`.

Whenever adding or editing any page, section, or component, **follow these rules strictly**:

### 1. The 3 Core Rules
1. **Never invent arbitrary pixel/rem values**: Never write ad-hoc values like `margin-top: 35px;` or `padding: 2.2rem;`. Always use `--space-*` tokens or layout classes.
2. **Every section must use standard layout wrappers**:
   - Use `<Section variant="light|white|dark">` or `<section class="section section--[white|light|dark]"> <div class="container">`.
   - Never write custom `padding-block` or manual horizontal gutters on sections.
3. **Internal spacing must use rhythm primitives**:
   - For vertical stacks (title, text, list, button): use `.stack` (with `--space-stack-*` or modifiers `.stack--sm`, `.stack--md`, `.stack--lg`).
   - For horizontal groups (tags, badges, button rows): use `.cluster` (with `.cluster--sm`, `.cluster--md`).
   - For card grids: use `.grid-cards` (responsive auto-fit) or `.grid-2`, `.grid-3`, `.grid-4`.

### 2. Copy-Paste Section Template
To add a new section that perfectly matches the rest of the site:

```astro
---
import Section from '../components/Section.astro';
---

<Section id="my-feature" variant="light">
  <!-- Standard Section Header -->
  <div class="section-header text-center">
    <h2 class="section-title">Clear Section Title</h2>
    <p class="section-subtitle centered">
      Supporting description with comfortable, readable measure.
    </p>
  </div>

  <!-- Standard Card Grid -->
  <div class="grid-cards">
    <article class="card-surface stack stack--md">
      <h3>Card Title</h3>
      <p>Card description text.</p>
      <div class="cluster cluster--sm">
        <span class="badge">Tag 1</span>
        <span class="badge">Tag 2</span>
      </div>
    </article>
  </div>
</Section>
```

### 3. Spacing Token Quick Reference
- **Section Vertical Padding**: `--space-section-y` (`clamp(4.5rem, 7.5vw, 7rem)`)
- **Compact Band Padding**: `--space-section-y-compact` (`clamp(3rem, 5vw, 4.5rem)`)
- **Header Bottom Margin**: `--space-header-mb` (`clamp(2.5rem, 5vw, 3.75rem)`)
- **Card Interior Padding**: `--space-card-p` (`clamp(1.25rem, 2.5vw, 2rem)`)
- **Card Grid Gap**: `--space-card-gap` (`clamp(1.25rem, 2.5vw, 2rem)`)
- **Gutter / Edge Margin**: `--space-gutter` (`clamp(1.25rem, 4vw, 2.5rem)`)
- **Micro Scale**: `--space-1` (4px), `--space-2` (8px), `--space-3` (12px), `--space-4` (16px), `--space-6` (24px), `--space-8` (32px), `--space-12` (48px).

See `docs/SPACING.md` for full documentation and class reference.
