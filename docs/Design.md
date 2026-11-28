# Design — UI/UX Spec

Visual direction (2026-11-24): **"cream, olive and night"**, a premium café-menu look set by two reference designs: a phone app with a dark food-photo hero, a serif display face, a cream menu panel, dark dish cards and a dish page; and a desktop kitchen dashboard with a dark sidebar, order queue cards and product cards. It replaces "chalkboard and marigold" (2026-11-23). The rules below keep it fast, readable and honest for tiny Indian cafés.

## 1. Design principles

1. **Big and obvious.** Users may be older, in a hurry, or holding food. Large text, large buttons (52px pills, 48px touch targets), one main action per screen.
2. **Food and the café first.** The customer menu opens with the café's cover photo under a warm dark wash, its logo and its name in the serif face. Dish photos are large; a dish without a photo gets a serif letter tile, never a broken image or a stock picture.
3. **Serif for voice, sans for work.** DM Serif Display gives the printed-menu feeling (café name, titles, dish names); Hind does everything practical (labels, prices, buttons, forms) and covers Hindi for Phase 4.
4. **Two action colours with fixed jobs.** Olive commits (Add to order, Place order, Save); burnt orange invites (Explore menu, View order, Open kitchen) and marks counts. Everything else is cream, white, night and ink.
5. **Honest content.** Only real data from the café is shown. No invented ratings, cooking times, calories, discounts or reservations, even though the reference designs show them.
6. **Fast on cheap phones.** Photos come from Cloudinary already resized and compressed (`f_auto,q_auto`, sized per use) and load lazily below the fold. Fonts are self-hosted. Motion only answers a tap (sheets and the dish page opening, quantity changing).
7. **Status by colour and word.** Never colour alone: "Sold out" is dimmed **and** says "Sold out"; Cooking / Ready chips have a word and a dot; veg and non-veg marks differ in shape.

## 2. Colour palette

All text/background pairs used for text meet WCAG AA (4.5:1). White on burnt orange is 4.6:1, so it is fine for button text and count badges. Soft chips use the darker shade for their text: `accent-hover` on `accent-soft` is 5.0:1 ("Cooking"); "Ready · unpaid" is white on `success` (5.1:1). Muted text is not used on tinted boxes (it drops under 4.5:1 there). Text on a photo sits on a night wash that is at least 65% dark behind the text.

| Token | Hex | Name | Use |
|---|---|---|---|
| `primary` | `#3E4A24` | Olive | Commit buttons (Add to order, Place order, Save), active chip, focus rings |
| `primary-hover` | `#2F3919` | | Hover |
| `primary-soft` | `#E9ECDD` | | Quantity control wash, letter tiles on cream |
| `accent` | `#C2541F` | Burnt orange | Explore menu, View order, Open kitchen, count badges, stat icons |
| `accent-hover` | `#A8461A` | | Hover; text on `accent-soft` ("Cooking" chip) |
| `accent-soft` | `#FBE9DF` | | Stat icon circles, "Cooking" chip background |
| `accent-on-night` | `#F08A5D` | | The active icon in the night sidebar |
| `bg` | `#F5F0E8` | Cream | Page background |
| `surface` | `#FFFFFF` | White | Cards |
| `surface-warm` | `#FBF8F3` | | Sheets, chips, the dish page's bottom bar |
| `border` | `#E6DED2` | | Dividers, input borders |
| `text` | `#1E1915` | Ink | Body text |
| `text-muted` | `#6E655C` | | Secondary text |
| `night` | `#1C1714` | Night | Hero wash, dark dish cards, owner sidebar, cart bar, kitchen |
| `night-soft` | `#2A221D` | | Kitchen cards, letter tiles on dark |
| `kitchen-bg`, `kitchen-card` | same as `night`, `night-soft` | | Kitchen board background and cards |
| `live` | `#7BD389` | | The "Taking orders" dot on the dark hero |
| `success` | `#2E7D4F` | | Taking orders, Ready, Paid, "Ready · unpaid" chip |
| `veg` | `#2E7D4F` | | Veg mark |
| `info` | `#1D4ED8` | | "New" badge |
| `warning` | `#B45309` | | Orders waiting 10+ minutes, reconnecting |
| `danger` | `#B3261E` | | Errors, Cancel, non-veg mark, not taking orders |

**Kitchen screen:** night background, `night-soft` cards, text `stone-50`, muted `stone-400`, a green Ready button with white text, orders waiting 10+ minutes in amber.

Cards use a soft shadow (`shadow-card`) instead of a border.

## 3. Typography

- **DM Serif Display** (one weight, 400) for the café name, page and section titles, dish names on the dish page, order numbers on the customer and kitchen screens. The browser is not allowed to fake a bold version (`font-synthesis: none`).
- **Hind** (400, 500, 600) for everything else. Prices, counts and order numbers in lists are Hind bold with `tabular-nums`. Always show the rupee sign: `₹120`.
- Base size **18px** on customer screens; body line height 1.5.
- Small spaced capitals (`text-eyebrow`, 12px, 0.18em) only for a few labels, like a printed menu: "Welcome to" in the hero, a dish's category on the dish page, the date on the dashboard, "Manage" in the sidebar.

| Role | Font | Size |
|---|---|---|
| Hero café name | DM Serif Display | 44px (56px from 640px) |
| Page title (`text-h1`) | DM Serif Display | 30px |
| Section title (`text-h2`) | DM Serif Display | 22px |
| Body | Hind | 18px (16px for small text) |

## 4. Components

| Component | Spec |
|---|---|
| Button | Pill, min height 52px, 18px / 600. Variants: primary (olive), accent (burnt orange, white text), secondary (white with border), light (white on dark), danger. Sizes: `md` (default) and `compact` (less padding, 16px text on phones) for a button that shares its row; padding and text size are set by the size prop, never by className, because Tailwind classes for the same property clash instead of replacing each other |
| Customer hero | Full-bleed cover photo under a night gradient; logo circle and a solid dark "Taking orders" pill at the top; "Welcome to", the café name in serif, the tagline, and an orange "Explore menu" pill with a dark arrow circle that scrolls to the menu. Without a photo: night with the café's initial drawn faintly |
| Menu panel | Cream panel with 32px rounded top corners sliding up over the hero; "Our menu" title, dish count, sticky category chips (48px; All + categories, active chip olive; choosing one brings that category's start up under the chips), dish grid |
| Dish card | Dark (night) card, photo on top (4:3), veg mark on a white chip, name and price in white, a round white "+" (48px); once added, a − 2 + control on a soft white wash; sold out: dimmed photo and a "Sold out" chip, no "+" |
| Dish page | Full screen on phones (a centred card on larger screens), big photo with rounded bottom corners, back button, name in serif, category in small capitals, price, description, "Remove from order" when in the cart; bottom bar with a quantity control and "Add to order │ ₹total" (olive, compact button so the words fit at 360px). A native `<dialog>`: Android back and Escape close it. It announces quantity changes and shows its own messages (the page's toast is hidden behind a modal dialog); when the order already has 30 different dishes it says so instead of showing the bar |
| Cart bar | Night pill at the bottom of phones: item count and total, orange "View order" |
| Sheet | Rises from the bottom on phones (rounded top, grab handle), centred on larger screens; serif title |
| Pay panel | Shown once the order is ready: total in large text, olive "Pay with UPI", "Pay ₹X to <UPI ID>" with Copy UPI ID, then "I've paid by UPI" / "Paying cash" |
| Owner sidebar | Desktop: night sidebar with the ScanServe mark, "Manage" nav (Overview, Kitchen, Unpaid, Menu, QR poster, Settings) with live orange count badges, and the café card (logo, name, Customer menu, Log out) at the bottom |
| Stat card | White card, icon in an orange-soft circle, label, large value, short hint; links to its page when there is one |
| Queue card | White card: orange `#number` and time ("5 min ago", "at 2:15 pm", "on 23 Nov"; ready cards count from when they became ready), customer name, a Cooking chip (dark orange on soft orange) or "Ready · unpaid" chip (white on green) with a dot, items and total. Cooking orders come first, then ready-but-unpaid ones |
| Product card | White card, inset photo with the price on a white chip, "Sold out" chip, veg mark and name, one line of description, "Available today" switch |
| Badge | Pill, 14px / 600: New (`info`), Ready (`success`), Paid / Sold out (`border` bg), Cancelled (`danger`) |
| Toast | Bottom of the screen, 3 seconds, one line of plain language |
| Inputs | Height 52px, 18px text, radius 12px, visible label above (no placeholder-only labels) |
| Icons | `lucide-react`, 20–24px, next to a text label in buttons |

## 5. Key screens

```
Customer (/m/:slug), phone            Dish page                     Desktop (≥1024)
┌───────────────────────┐   ┌───────────────────────┐   ┌──────────────────────────────┬──────────┐
│(logo)    ● Taking orders│ │(<)                    │   │ hero photo, café name, Explore│          │
│░░ cover photo, dark ░░│   │   [  big photo   ]    │   ├──────────────────────────────┤ Your     │
│WELCOME TO             │   │                       │   │ Our menu                     │ order    │
│Tiffin & Table (serif) │   │Masala Dosa (serif) ■  │   │ (All)(Snacks)(Rolls)(Momos)  │ [steppers│
│Home-style food        │   │BREAKFAST              │   │ [dark] [dark] [dark]         │  total   │
│[Explore menu (→)]     │   │₹70                    │   │ [dark] [dark] [dark]         │  Place   │
├──── cream panel ──────┤   │Crisp rice crepe…      │   │                              │  order]  │
│Our menu               │   │                       │   └──────────────────────────────┴──────────┘
│(All)(Snacks)(Drinks)  │   │[− 1 +] [Add to order│₹70]│
│[dark card][dark card] │   └───────────────────────┘
│ 2 items ₹140 [View order→] (night bar)
└───────────────────────┘

Owner (/owner/overview), desktop
┌──────────────┬───────────────────────────────────────────────────────┐
│ ▣ ScanServe  │ TUESDAY, 24 NOVEMBER                [Open kitchen] … │
│ MANAGE       │ Good afternoon, Riya (serif)                          │
│ ▸ Overview   │ [Orders today] [Collected today] [Unpaid] [In kitchen]│
│   Kitchen  3 │ Order queue (4) ────────────────────────── Kitchen → │
│   Unpaid   1 │ [#1 Priya Cooking] [#2 Amit Cooking] [#4 Rahul Ready] │
│   Menu       │ Your menu ─────────────────────────── Manage menu → │
│   QR poster  │ (All)(Snacks)…                                         │
│   Settings   │ [product card] [product card] [product card]           │
│ ┌──────────┐ │                                                        │
│ │(T) Café  │ │                                                        │
│ │Customer  │ │                                                        │
│ │menu · Log│ │                                                        │
│ └──────────┘ │                                                        │
└──────────────┴───────────────────────────────────────────────────────┘
```

Owner area on phones: a top bar (café logo and name, Log out) and bottom tabs **Overview · Kitchen · Unpaid · Menu · Settings** with live badges (the current tab has olive text and an olive bar on top, not colour alone); QR poster is reached from Overview and Settings ("Print QR poster"). Kitchen (`/kitchen`) stays a full-screen dark board: cards for new orders, oldest first, huge serif numbers, one big green Ready button per order.

## 6. Responsive breakpoints

Tailwind defaults: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px.

| Screen | Mobile (<640) | Tablet (640–1023) | Desktop (≥1024) |
|---|---|---|---|
| Customer | 2-column dark dish cards, night cart bar | 3 columns | 3 columns + sticky "Your order" panel, max-width 1200px |
| Dish page | Full screen | Centred card, max-width 520px | Centred card |
| Kitchen | 1 column | 2 columns | 3–4 columns (tablet landscape is the target) |
| Owner | Top bar + bottom tabs, stats 2×2 | Same, wider content | Night sidebar + content, stats 4 across, max-width 1120px |

## 7. Reference inspiration

- Two reference designs (2026-11-24) set the direction: a premium restaurant phone app (photo hero with serif headline and orange "Explore Menu", dish page with big photo and "Add to Order", "Our Menu" with chips and dark cards) and a desktop KDS dashboard (dark sidebar with counts, order queue cards, product cards with category tabs).
- **Swiggy / Zomato menus:** veg/non-veg marks (Indian convention), sticky cart bar.
- **Kitchen display systems (KDS):** order cards in arrival order, one action per card, huge numbers.

Use these for layout and mood only; never copy logos, names, photos or other assets, and never show features or numbers the app does not have.
