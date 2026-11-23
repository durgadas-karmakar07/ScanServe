# Design — UI/UX Spec

Visual direction (2026-11-23): **"chalkboard and marigold"**. The look comes from the world of a small Indian café: the green chalkboard menu on the wall, marigold garlands, steel tiffins and veg / non-veg marks. It replaces the earlier warm-cream and orange look, which read like every other generated page.

## 1. Design principles

1. **Big and obvious.** Users may be older, in a hurry, or holding food. Large text, large buttons, one main action per screen.
2. **The menu board is the hero.** The customer menu opens with the café itself: its cover photo washed in chalkboard green, its logo and its name in large Baloo type. This is the one bold, memorable element; everything below it stays calm.
3. **Food first.** Dish photos are big (4:3, rounded). A dish without a photo gets a typographic tile (its first letter in Baloo on steel), never a broken image or a stock picture.
4. **Marigold means "add" or "order".** The accent colour is used only for the action that moves an order forward (Add, View order, Place order). Everything else uses chalkboard green, ink and steel.
5. **Fast on cheap phones.** Photos come from Cloudinary already resized and compressed (`f_auto,q_auto`, sized per use) and load lazily below the fold. Fonts are self-hosted and swap in. Motion only answers a tap (sheets opening, quantity changing).
6. **Status by colour and word.** Never colour alone: "Sold out" is grey **and** says "Sold out"; veg and non-veg marks differ in shape too.

## 2. Colour palette

All text/background pairs below meet WCAG AA contrast (4.5:1). Token names stay stable so components read the same; the values changed with the new direction.

| Token | Hex | Name | Use |
|---|---|---|---|
| `primary` | `#1D3B33` | Chalkboard | Primary buttons, active tab, hero wash, headings accents |
| `primary-hover` | `#142A24` | Chalkboard dark | Hover / pressed |
| `primary-soft` | `#E1ECE6` | Mint chalk | Selected chip, active side-menu item |
| `accent` | `#F2A20C` | Marigold | Add, View order, Place order (always with `text` ink, never white) |
| `accent-hover` | `#D98C00` | Marigold dark | Hover / pressed on accent |
| `accent-soft` | `#FDF1D6` | Marigold wash | Quantity stepper background, highlights |
| `bg` | `#EEF2EF` | Steel | App background (cool, like a steel tiffin) |
| `surface` | `#FFFFFF` | — | Cards, sheets |
| `border` | `#D6DDD8` | — | Card borders, dividers |
| `text` | `#1E2622` | Ink | Main text, text on marigold |
| `text-muted` | `#56615B` | — | Secondary text, hints |
| `success` | `#1E7F46` | Leaf | "Ready" / "Paid", veg mark |
| `warning` | `#B45309` | — | Waiting a long time (Phase 2) |
| `danger` | `#C0392B` | Chilli | Cancel, errors, non-veg mark |
| `info` | `#1D4ED8` | — | "New" badge |
| `veg` | `#1E7F46` | Leaf | Veg mark |

**Kitchen screen (dark, easier to read from a distance):** background `#0C0A09`, cards `#1C1917`, text `#FAFAF9`, muted text `#A8A29E`, Ready button `success` with white text.

### Tailwind v4 tokens (`client/src/index.css`)

```css
@theme {
  --color-primary: #1d3b33;
  --color-primary-hover: #142a24;
  --color-primary-soft: #e1ece6;
  --color-accent: #f2a20c;
  --color-accent-hover: #d98c00;
  --color-accent-soft: #fdf1d6;
  --color-bg: #eef2ef;
  --color-surface: #ffffff;
  --color-border: #d6ddd8;
  --color-text: #1e2622;
  --color-text-muted: #56615b;
  --color-success: #1e7f46;
  --color-warning: #b45309;
  --color-danger: #c0392b;
  --color-info: #1d4ed8;
  --color-veg: #1e7f46;
  --color-kitchen-bg: #0c0a09;
  --color-kitchen-card: #1c1917;

  --font-display: 'Baloo 2 Variable', 'Baloo 2', 'Noto Sans Devanagari', system-ui, sans-serif;
  --font-sans: 'Hind', 'Noto Sans Bengali', 'Noto Sans Devanagari', system-ui, sans-serif;
  --radius-card: 1rem;

  --text-display: 3rem;
  --text-display--line-height: 1.05;
  --text-h1: 1.75rem;
  --text-h1--line-height: 1.2;
  --text-h2: 1.375rem;
  --text-h2--line-height: 1.25;
}
```

## 3. Typography

- **Baloo 2** (Ek Type, India) for headings, the café name, prices and order numbers. Rounded and friendly, like a hand-painted café board; the same family has Bengali (Baloo Da 2) and Hindi coverage for Phase 4.
- **Hind** (Indian Type Foundry) for body text and controls: plain, very legible at small sizes, Devanagari version available.
- Both are self-hosted through `@fontsource` (no third-party requests, CSP stays `font-src 'self'`).
- Base size **18px** on customer screens; body line height 1.5. Prices and order numbers use `tabular-nums`. Always show the rupee sign: `₹120`.
- Sentence case everywhere. No all-caps labels and no small "eyebrow" labels above headings.

| Role | Font | Size / weight | Where |
|---|---|---|---|
| Display | Baloo 2 | 48px / 700 | Café name in the hero, order numbers |
| H1 | Baloo 2 | 28px / 700 | Page titles |
| H2 | Baloo 2 | 22px / 600 | Category names, section titles |
| Body | Hind | 18px / 400 | Dish names, normal text |
| Small | Hind | 14px / 400 | Hints, descriptions, timestamps (never smaller than 14px) |
| Button | Hind | 18px / 600 | All buttons |

## 4. Components

Radius follows hierarchy: full-bleed hero 0, cards and photos 16px, inputs 12px, buttons and chips fully rounded.

| Component | Style |
|---|---|
| Button (primary) | `bg-primary text-white`, pill, min height **52px**, no shadow |
| Button (accent) | `bg-accent text-text`, pill, 52px; only for Add / View order / Place order |
| Button (secondary) | White, 1px `border`, text `text`, pill |
| Button (danger) | `bg-danger text-white`, pill |
| Button (kitchen Ready) | `bg-success text-white`, min height **72px**, text 24px / 700 |
| Card | `bg-surface`, 1px `border`, radius 16px, padding 16px, no heavy shadow |
| Dish card (customer) | Photo 4:3 on top (or letter tile), veg mark + name, one-line description, price in Baloo, accent "Add" pill → quantity stepper once added; sold out: photo greyed, "Sold out" label, no Add |
| Dish row (owner) | 72px thumbnail, name, category, price, "Available today" switch, Edit / Delete |
| Hero (customer) | Full-bleed cover photo under a chalkboard-green gradient, logo in a white circle, café name (Display), tagline, Open / Paused badge; no photo → plain chalkboard with a faint pattern of the café's initial |
| Category tabs | Sticky under the hero, horizontal scroll, active tab has a marigold underline |
| Cart bar | Sticky bottom bar in `primary`: item count and total on the left, accent "View order" pill on the right; appears when the cart is not empty |
| Photo picker | Preview (4:3 or circle for logo), "Add photo" / "Change" / "Remove", upload progress; JPG, PNG or WebP up to 5 MB |
| Badge | Pill, 14px / 600: New (`info`), Ready (`success`), Paid / Sold out (`border` bg), Cancelled (`danger`) |
| Toast | Bottom of screen, 3 seconds, one line of plain language |
| Inputs | Height 52px, 18px text, radius 12px, visible label above (no placeholder-only labels) |
| Icons | `lucide-react`, 24px, always next to a text label in buttons |

Touch targets are at least **48×48px**. Spacing uses steps of 4px (Tailwind defaults); screen padding 16px.

## 5. Key screens (MVP)

```
Customer menu (/m/:slug), phone           Desktop (≥1024)
┌─────────────────────────┐               ┌───────────────────────────────────────────┐
│░░ cover photo, green ░░░│  hero         │░░░░░░░░░░░░ hero, full width ░░░░░░░░░░░░░│
│ (logo) Tiffin & Table   │               │ (logo) Tiffin & Table  ● Open             │
│ Home-style Bengali food │               ├───────────────────────────────────────────┤
│ ● Open                  │               │ Snacks  Rice  Drinks          (tabs)      │
├─────────────────────────┤               ├─────────────────────────────┬─────────────┤
│ Snacks  Rice  Drinks →  │  sticky tabs  │ [card] [card] [card]        │ Your order  │
├─────────────────────────┤               │ [card] [card] [card]        │ 2 × Momos   │
│ ┌─────────┐ ┌─────────┐ │               │                             │ 1 × Chai    │
│ │  photo  │ │  photo  │ │  2-col cards  │                             │ ₹130        │
│ │■ Momos  │ │▲ Chowmn │ │               │                             │ [Place order│
│ │₹60  [+] │ │₹70  [+] │ │               └─────────────────────────────┴─────────────┘
├─────────────────────────┤
│ 2 items   ₹130 [View order] │  sticky cart bar (chalkboard + marigold)
└─────────────────────────┘

Kitchen (/kitchen, tablet landscape, dark)
┌──────────────┬──────────────┬──────────────┐
│ 12  Rahul    │ 13  Guest    │ 14  Priya    │
│ 2× Egg chow  │ 1× Momos     │ 3× Chai      │
│ [  READY  ]  │ [  READY  ]  │ [  READY  ]  │
└──────────────┴──────────────┴──────────────┘
```

Owner area: tabs **Menu · QR poster · Settings** (Unpaid arrives in 1.7); bottom tabs on phones, side menu on desktop with the café's logo and name at the top.

## 6. Responsive breakpoints

Tailwind defaults: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px.

| Screen | Mobile (<640) | Tablet (640–1023) | Desktop (≥1024) |
|---|---|---|---|
| Customer | 2-column dish cards, sticky cart bar | 3 columns, max-width 960px | 3 columns + sticky "Your order" panel on the right, max-width 1200px |
| Kitchen | 1 column | 2 columns | 3–4 columns (tablet landscape is the target) |
| Owner | Bottom tabs | Max-width 640px | Side menu + content, max-width 1024px |

## 7. Reference inspiration

- The developer's reference mock-ups (customer menu with hero photo, category tabs, photo cards, sticky cart; desktop with an order panel) set the layout.
- **Swiggy / Zomato menus:** category tabs, sticky cart bar, veg/non-veg marks (Indian convention).
- **Fast-food "order ready" boards:** huge order numbers readable from across the room.
- **Kitchen display systems (KDS):** order cards in arrival order, one action per card.

Use these for layout ideas only; never copy logos, colours or assets.
