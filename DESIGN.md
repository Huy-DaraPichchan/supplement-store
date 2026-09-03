# DESIGN.md

## Purpose

This file defines the visual language and user-experience rules for the PureVita
storefront. Read it before planning or implementing frontend changes.

When implementation and this file disagree, treat this file as the intended design.
Update this file when an approved design decision changes.

## Product identity

PureVita is a modern supplement marketplace.

The interface should feel:

- Minimal and focused
- Warm rather than clinical
- Trustworthy without looking corporate
- Practical and easy to browse
- Distinctive through its magenta identity
- Dense enough for shopping without feeling crowded

Use Facebook Marketplace as a UX reference for browsing, search, categories,
filters, and product discovery. Do not copy Facebook's branding or visual design.

## Color direction

The primary brand color is `#bc1a8d`.

Do not use blue or green in interface chrome, including status indicators, charts,
links, focus states, illustrations, gradients, and dark mode. Product photography
may retain its natural colors so products are represented accurately.

Use semantic theme tokens instead of raw Tailwind color classes in components.

### Light theme

| Role | Value | Use |
| --- | --- | --- |
| Background | `#f7f2f6` | Page background |
| Foreground | `#241d23` | Primary text |
| Surface | `#ffffff` | Cards, menus, dialogs |
| Surface muted | `#f0e8ee` | Secondary sections and controls |
| Primary | `#bc1a8d` | Main actions and active states |
| Primary hover | `#991570` | Hover and pressed actions |
| Primary soft | `#f9e6f4` | Selected and highlighted surfaces |
| Primary foreground | `#ffffff` | Text on primary surfaces |
| Secondary text | `#665d65` | Supporting text |
| Muted text | `#938a92` | Metadata and placeholders |
| Border | `#ddcfda` | Default borders |
| Border strong | `#cbb8c7` | Emphasized boundaries |
| Warm accent | `#e58b45` | Promotional or attention accents |
| Warm accent soft | `#fff0e4` | Promotional backgrounds |
| Success | `#8a641f` | Successful and available states |
| Warning | `#b66a1c` | Warnings and low-stock states |
| Destructive | `#c13b56` | Errors and destructive actions |

### Dark theme

| Role | Value |
| --- | --- |
| Background | `#120e11` |
| Foreground | `#f8f2f6` |
| Surface | `#211a20` |
| Surface elevated | `#2a2128` |
| Surface muted | `#362a32` |
| Primary | `#db4caf` |
| Primary hover | `#e66cbe` |
| Primary soft | `#442039` |
| Primary foreground | `#1b1018` |
| Secondary text | `#c9bdc6` |
| Muted text | `#9f929c` |
| Border | `#493843` |
| Border strong | `#624d5a` |
| Warm accent | `#eea260` |
| Success | `#d2a84a` |
| Warning | `#e09a52` |
| Destructive | `#e2667c` |

Dark mode should preserve the magenta identity. It must not introduce cool blue
or green tones.

## Color usage

- Use primary magenta intentionally for actions, selection, and brand recognition.
- Do not fill large page areas with saturated magenta.
- Use neutral surfaces for most of the interface.
- Use the warm accent sparingly for promotions and special offers.
- Do not use raw colors such as `bg-emerald-*`, `text-blue-*`, or `border-slate-*`.
- Define visual colors as semantic variables in `frontend/app/globals.css`.
- Components should consume tokens such as `bg-background`, `bg-card`,
  `text-foreground`, `text-muted-foreground`, and `bg-primary`.
- Never use color as the only indication of status or selection.

## Typography

- Use the native system sans-serif stack for functional interface text. This resolves to
  San Francisco on Apple devices and the familiar platform UI font elsewhere.
- Use the native serif display stack only for the PureVita wordmark, page titles, and
  major marketing or section headings.
- Keep navigation, forms, filters, product cards, prices, and transactional UI in sans-serif.
- Do not add downloaded web fonts unless the native typography direction changes.
- Favor readable, medium-weight headings over oversized display typography.
- Page titles should usually be between `text-2xl` and `text-4xl`.
- Product names should remain compact and easy to scan.
- Prices should be visually stronger than secondary metadata.
- Labels and metadata may use smaller text but must remain legible.
- Avoid excessive uppercase text and extreme letter spacing.
- Keep line lengths comfortable for descriptions and informational pages.

## Layout

### Shared shell

- Use one consistent maximum content width across navigation and page content.
- Keep the global search prominent on marketplace-oriented pages.
- Navigation should remain simple and task-focused.
- Preserve clear separation between navigation, filters, results, and footer.
- Avoid wrapping every section in a card.

### Marketplace browsing

Follow a familiar marketplace structure:

- Search and primary navigation at the top
- Category access near the search or results area
- Filter sidebar on wide screens
- Filter drawer or sheet on small screens
- Sort control near the result count
- Product grid as the dominant page content
- Clear empty, loading, and error states
- Preserve useful browsing context when opening and returning from a product

Desktop layouts may use a compact left filter rail with the product grid beside it.
Mobile layouts should prioritize search, categories, and a two-column product grid.

### Spacing

- Use a consistent spacing scale based on Tailwind defaults.
- Prefer `gap-*` on parent layouts instead of margins between siblings.
- Use generous page spacing and tighter spacing inside product cards.
- Do not create large empty hero areas that delay access to products.
- Keep controls large enough to use comfortably on touch screens.

## Shape and elevation

- Use restrained corner radii.
- Default controls and cards should use the shared theme radius.
- Product images may use a slightly larger radius than controls.
- Prefer borders and surface contrast as the base separation between elements.
- Product cards may use a soft resting shadow and a slightly stronger hover shadow to
  improve catalog hierarchy without appearing to float excessively.
- Use stronger elevation only where it communicates priority or behavior, such as
  purchasing panels, menus, dialogs, and the primary promotional surface.
- Define reusable elevation values as semantic shadow tokens in `frontend/app/globals.css`.
- Avoid floating glass panels, glow effects, and decorative blur.

## Components

### Product cards

Product cards should optimize recognition and comparison.

Each card should prioritize:

1. Product image
2. Product name
3. Price
4. Category, size, or other useful metadata
5. Availability or ordering action when appropriate

Rules:

- Keep cards visually quiet.
- Use a consistent image aspect ratio.
- Use `object-cover` or `object-contain` deliberately based on product imagery.
- Clamp long names instead of allowing cards to become uneven.
- Do not hide essential information behind hover.
- Hover may use a small border, surface, or elevation transition.
- Do not animate product cards into view individually.
- Cards must remain useful on devices without hover.

### Buttons and actions

- Use existing shadcn variants before creating a custom button.
- Primary buttons use the primary magenta token.
- Secondary actions use neutral or outline variants.
- Destructive actions use the destructive token.
- Do not create several competing primary actions in one area.
- Icon-only controls require an accessible label and visible tooltip where useful.

### Search

- Search should be easy to find and usable from marketplace pages.
- Use plain language in placeholders.
- Show a clear affordance for clearing an active search.
- Search results, loading, no-results, and failure states must be explicit.
- Search must work with keyboard navigation.

### Categories and filters

- Category controls should be compact and scannable.
- Active filters must be visually obvious and removable.
- Show the number of active filters when filters are collapsed.
- Do not rely on color alone to indicate selection.
- On mobile, use a sheet or drawer rather than compressing a desktop sidebar.

### Navigation

- Keep the navbar visually restrained.
- Give search and shopping actions priority.
- Use a clear current-page state.
- Avoid decorative animation in navigation.
- Mobile navigation should expose common destinations without deep nesting.

### Dialogs, sheets, and menus

- Use shadcn primitives where available.
- Keep dialog actions predictable: cancel on the left, primary action on the right.
- Use sheets for mobile filters, navigation, and supporting marketplace controls.
- Overlays must trap focus and support keyboard dismissal.

## Imagery

- Product photography should carry most of the visual richness.
- Use consistent image framing and neutral image backgrounds where possible.
- Avoid decorative stock photography that competes with product discovery.
- Do not tint product photos with the brand color.
- Always provide meaningful alternative text.

## Motion

Motion should communicate meaningful changes, not decorate every element.

### Use noticeable animation for

- Theme switching
- Full-page loading transitions
- Major route or page transitions
- Opening and closing dialogs, sheets, and mobile navigation
- Large changes in application state where continuity helps orientation

### Use subtle transitions for

- Button hover and pressed states
- Input focus
- Card hover
- Color, border, background, and opacity changes
- Expanding small controls

### Avoid

- Animating every section when it enters the viewport
- Staggering every product card
- Large hover scaling
- Bouncy controls
- Continuous decorative motion
- Animation that delays navigation or purchasing
- Combining several animation effects on one interaction

Small transitions should usually last around `120-200ms`.
Larger state and page transitions should usually last around `200-350ms`.

Respect `prefers-reduced-motion`. Content and actions must remain understandable
when animation is disabled.

## Loading and feedback

- Use skeletons for product grids and major content areas.
- Skeletons should resemble the final layout and should not pulse aggressively.
- Do not replace every small operation with a full-screen loader.
- Keep existing content visible during background refreshes when possible.
- Show errors near the content or action that failed.
- Use concise toast messages for completed background actions.
- Prevent duplicate submissions while an order action is processing.

## Responsive behavior

- Design mobile behavior intentionally rather than shrinking desktop layouts.
- Product browsing should work comfortably with one hand.
- Maintain accessible tap targets.
- Avoid horizontal scrolling for primary content.
- Use two product columns on typical phones when content remains readable.
- Increase columns progressively based on available width.
- Move secondary filters and controls into sheets on narrow screens.

## Accessibility

- Meet WCAG AA contrast for text and interactive controls.
- Every interactive element must have a visible keyboard focus state.
- Use semantic HTML before adding ARIA attributes.
- Inputs require persistent labels when their purpose is not unmistakable.
- Icon-only buttons require accessible names.
- Do not communicate availability, errors, or selection through color alone.
- Support keyboard navigation for menus, dialogs, filters, and search.
- Honor reduced-motion and system theme preferences.

## Implementation rules

- Prefer shadcn components and existing project primitives where they fit.
- Use Aceternity UI and MagicUI only when a component supports the intended
  experience without adding unnecessary visual effects.
- Do not use an animated component merely because it is available.
- Keep styling close to the component unless it is a shared design token or
  genuinely reusable pattern.
- Do not add abstraction solely to centralize a few Tailwind classes.
- Keep frontend code understandable to beginner and intermediate developers.
- When a new visual value is needed, add or revise a semantic token first.
- Do not silently introduce colors, radii, shadows, or motion outside this system.

## Prohibited patterns

- Blue or green colors
- Decorative gradients
- Glassmorphism
- Neon glow
- Heavy card shadows
- Excessive pill-shaped containers
- Oversized landing-page copy inside shopping flows
- A card around every section
- Unnecessary carousel sections
- Animation on every component
- Large hover movement or scaling
- Important controls visible only on hover
- Raw color utilities where semantic tokens exist
- Copying Facebook branding or interface details verbatim
