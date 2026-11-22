# Design — UI/UX Spec

## 1. Design principles

1. **Big and obvious.** Users may be older, in a hurry, or holding food. Large text, large buttons, one main action per screen.
2. **Warm, not flashy.** It should feel like a friendly local café, not a fintech app.
3. **Fast on cheap phones.** No heavy images or animations in the MVP; system fonts first.
4. **Status by colour and word.** Never colour alone: "Ready" is green **and** says "Ready".

## 2. Colour palette

All text/background pairs below meet WCAG AA contrast (4.5:1).

| Token | Hex | Use |
|---|---|---|
| `primary` | `#C2410C` | Main buttons (Order, Pay), links, active tab |
| `primary-hover` | `#9A3412` | Hover / pressed |
| `primary-soft` | `#FFEDD5` | Selected chip, cart bar background tint |
| `bg` | `#FFFBF5` | App background (warm off-white) |
| `surface` | `#FFFFFF` | Cards, sheets |
| `border` | `#E7E5E4` | Card borders, dividers |
| `text` | `#1C1917` | Main text |
| `text-muted` | `#57534E` | Secondary text, hints |
| `success` | `#15803D` | Ready button, "Ready" / "Paid" badges |
| `warning` | `#B45309` | Waiting a long time (Phase 2) |
| `danger` | `#B91C1C` | Cancel, errors, non-veg dot |
| `info` | `#1D4ED8` | "New" badge |
| `veg` | `#15803D` | Veg dot |

**Kitchen screen (dark, easier to read from a distance):** background `#0C0A09`, cards `#1C1917`, text `#FAFAF9`, muted text `#A8A29E`, Ready button `#15803D` with white text.

### Tailwind v4 tokens (`client/src/index.css`)

```css
@import "tailwindcss";

@theme {
  --color-primary: #C2410C;
  --color-primary-hover: #9A3412;
  --color-primary-soft: #FFEDD5;
  --color-bg: #FFFBF5;
  --color-surface: #FFFFFF;
  --color-border: #E7E5E4;
  --color-text: #1C1917;
  --color-text-muted: #57534E;
  --color-success: #15803D;
  --color-warning: #B45309;
  --color-danger: #B91C1C;
  --color-info: #1D4ED8;
  --color-veg: #15803D;
  --color-kitchen-bg: #0C0A09;
  --color-kitchen-card: #1C1917;

  --font-sans: "Inter", "Noto Sans Bengali", "Noto Sans Devanagari", system-ui, sans-serif;
  --radius-card: 0.75rem;

  /* Type scale from section 3: classes text-display, text-h1, text-h2 */
  --text-display: 3rem;
  --text-display--line-height: 1.1;
  --text-h1: 1.75rem;
  --text-h1--line-height: 1.25;
  --text-h2: 1.375rem;
  --text-h2--line-height: 1.3;
}
```

## 3. Typography

- Font: system UI stack in the MVP; load **Inter** (Latin) later, plus **Noto Sans Bengali** and **Noto Sans Devanagari** in Phase 4.
- Base size **18px** on customer screens (not 16px); body line height 1.5.
- Prices and order numbers use `tabular-nums`. Always show the rupee sign: `₹120`.

| Role | Size / weight | Where |
|---|---|---|
| Display | 48px / 700 | Order number on the customer's status page and kitchen cards |
| H1 | 28px / 700 | Page titles |
| H2 | 22px / 600 | Category names, section titles |
| Body | 18px / 400 | Dish names, normal text |
| Small | 14px / 400 | Hints, timestamps (never smaller than 14px) |
| Button | 18px / 600 | All buttons |

## 4. Components

| Component | Style |
|---|---|
| Button (primary) | `bg-primary text-white`, min height **52px** (customer), full width on mobile, radius 12px, no shadow |
| Button (kitchen Ready) | `bg-success text-white`, min height **72px**, text 24px / 700 |
| Button (secondary) | White, 1px `border`, text `text` |
| Card | `bg-surface`, 1px `border`, radius 12px, padding 16px, no heavy shadow |
| Dish row | Name (18px) + veg/non-veg dot on the left, price on the right, "+ Add" button; quantity stepper once added |
| Cart bar | Sticky bottom bar: "2 items · ₹180" + **Order** button; appears when the cart is not empty |
| Badge | Pill, 14px / 600: New (`info`), Ready (`success`), Paid (stone), Cancelled (`danger`) |
| Toast | Bottom of screen, 3 seconds, one line of plain language |
| Inputs | Height 52px, 18px text, visible label above (no placeholder-only labels) |
| Icons | `lucide-react`, 24px, always next to a text label in buttons |

Touch targets are at least **48×48px**. Spacing uses steps of 4px (Tailwind defaults); screen padding 16px.

## 5. Key screens (MVP)

```
Customer menu (/m/:slug)          Order status (/m/:slug/order/:id)
┌─────────────────────────┐       ┌─────────────────────────┐
│ Café name      ● Open   │       │        Order No.        │
│ [Snacks][Rice][Drinks]  │       │           12            │
│ ● Egg chowmein   ₹70 [+]│       │  Rahul · ₹150           │
│ ● Veg momos      ₹60 [+]│       │  ✓ Ready, please collect│
│ ● Chai (sold out)  ₹10  │       │ ┌─────────────────────┐ │
│                         │       │ │ Pay ₹150 with UPI   │ │
│┌───────────────────────┐│       │ └─────────────────────┘ │
││ 2 items · ₹130  Order ││       │ [ Paying cash ]         │
│└───────────────────────┘│       └─────────────────────────┘
└─────────────────────────┘

Kitchen (/kitchen, tablet landscape, dark)
┌──────────────┬──────────────┬──────────────┐
│ 12  Rahul    │ 13  Guest    │ 14  Priya    │
│ 2× Egg chow  │ 1× Momos     │ 3× Chai      │
│ 1× Chai      │              │              │
│ 2 min ago    │ 1 min ago    │ just now     │
│ [  READY  ]  │ [  READY  ]  │ [  READY  ]  │
│   cancel     │   cancel     │   cancel     │
└──────────────┴──────────────┴──────────────┘
```

Owner dashboard (phone): tabs **Unpaid · Menu · QR · Settings**. Unpaid list rows: "No. 12 · Rahul · ₹150 · 25 min ago" with **Mark paid** (UPI / Cash).

## 6. Responsive breakpoints

Tailwind defaults: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px.

| Screen | Mobile (<640) | Tablet (640–1023) | Desktop (≥1024) |
|---|---|---|---|
| Customer | Designed for this | Content max-width 480px, centred | Same as tablet |
| Kitchen | 1 column | 2 columns | 3–4 columns (tablet landscape is the target) |
| Owner | Designed for this, bottom tabs | Max-width 640px | Side menu + content, max-width 1024px |

## 7. Reference inspiration

- **Swiggy / Zomato menus:** category tabs, sticky cart bar, veg/non-veg dots (Indian convention).
- **Fast-food "order ready" boards:** huge order numbers readable from across the room (kitchen + counter TV).
- **Google Pay / PhonePe pay screens:** one big amount, one big button.
- **Kitchen display systems (KDS):** order cards in arrival order, one action per card.

Use these for layout ideas only; never copy logos, colours or assets.
