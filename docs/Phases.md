# Phases — ScanServe

Work on **one phase at a time**. A phase is done only when every "Done when" check passes. The current phase is shown in the README roadmap.

Every phase ends with the same two steps: the security check (`Rules.md` section 5, plus `npm audit`) and a `README.md` update (`Rules.md` section 7).

| Phase | Name | Goal | Rough time |
|---|---|---|---|
| 1 | MVP: order loop + pay after eating | A customer can order, the kitchen taps Ready, the customer pays, the owner sees who has not paid | 2–3 weeks |
| 2 | Voice kitchen | The cook never needs to look at the screen | 1 week |
| 3 | Hisab & owner tools | The owner's daily accounts are automatic | 1 week |
| 4 | Languages & PWA | Works in Hindi, Bengali and English and feels like an app | 1 week |
| 5 | Extras & real-café test | Khata, counter TV, polish, one real day in a café | 1 week |

---

## Phase 1 — MVP: order loop + pay after eating

Build in this order. Each step should run in the browser before moving on.

### 1.1 Setup
- [x] Repo with `client/` (Vite + React + Tailwind v4) and `server/` (Express 5), both running locally
- [x] MongoDB Atlas cluster connected; `server/src/config/env.js` validates env vars with zod
- [x] Health route `GET /api/health` → `{ ok: true }`; client shows it on a test page
- [x] `.env.example` files, `.gitignore` (`node_modules`, `.env`)

### 1.2 Owner account
- [x] `Restaurant` and `Staff` models
- [x] Register (café name, slug, UPI ID, owner name, email, password) and login → JWT
- [x] `requireAuth` middleware; `GET /api/auth/me`
- [x] Client: `/owner/register`, `/owner/login`, `AuthContext`, protected `/owner` route

### 1.3 Menu
- [x] `MenuItem` model and owner CRUD API
- [x] Owner menu editor: add, edit, delete, categories, veg tag, sold-out switch
- [x] Settings page: café name, UPI ID, "accepting orders" switch
- [x] QR poster page: QR for `<site>/m/<slug>`, printable

### 1.4 Customer menu and device
- [ ] `Device` model; `POST /api/devices`; `useDevice` hook saves `deviceId` and `name` in `localStorage`
- [x] `GET /api/public/:slug/menu`; customer menu page with category tabs, veg dot, sold-out greyed (with the redesign: hero, photo cards)
- [x] Cart with a sticky bottom bar (`CartContext`), quantity +/− (plus an order panel on desktop)

### 1.5 Orders
- [ ] `Order` and `DailyCounter` models; `counter.service.js` (atomic `$inc`, Asia/Kolkata date)
- [ ] `POST /api/public/:slug/orders`: server recalculates prices, rejects sold-out items, max 2 open orders per device
- [ ] "What should we call you?" asked once before the first order (skip → "Guest")
- [ ] Order status page `/m/:slug/order/:orderId` showing number, items, total, status

### 1.6 Live kitchen
- [ ] Socket.io server with `kitchen:<restaurantId>` (JWT) and `device:<deviceId>` rooms
- [ ] `/kitchen` page: cards for `new` orders, oldest first, with a sound on `order:new`
- [ ] Big **Ready** button → `PATCH /ready` → customer page switches to "Ready, please collect"
- [ ] **Cancel** button (with confirm) → customer sees "Cancelled by the café"
- [ ] Refetch on socket reconnect

### 1.7 Pay after eating
- [ ] Pay panel on the order status page once the order is `ready`: total in big text
- [ ] "Pay with UPI" button opens `upi://pay?...` (`lib/upi.js`), plus fallback text "Pay ₹X to <UPI ID>"
- [ ] "Paying cash" button; both call `POST /api/public/orders/:id/paid` → status `paid`
- [ ] Owner unpaid list (today's `ready` orders), with "Mark paid (UPI / cash)"
- [ ] `order:paid` updates the kitchen and owner screens live

### 1.8 Deploy
- [x] Backend on Render, frontend on Netlify, env vars set, CORS correct (done early, after 1.1)
- [ ] Test on a real phone with the printed QR

### Phase 1 — Done when
1. On a phone, scan the QR → order 2 dishes → the order appears on the kitchen screen (another device) within 2 seconds.
2. Tapping Ready makes the customer's page show "Ready" without a refresh.
3. The customer taps "Paying cash"; the order disappears from the owner's unpaid list.
4. An order left Ready and unpaid shows in the unpaid list, and the owner can mark it paid.
5. Changing a price in DevTools before placing an order does not change the total saved on the server.
6. Marking a dish sold out removes it from ordering.
7. The live URLs work on a phone using mobile data.
8. The security check in `Rules.md` section 5 passes, and `npm audit` shows no high or critical issues.
9. `README.md` shows Phase 1 as done, with screenshots and setup steps that work.

**Not in Phase 1:** voice, dish photos, hisab charts, languages, PWA/push, khata, counter TV, staff PINs.

---

## Phase 2 — Voice kitchen
- New orders read aloud with `speechSynthesis` ("Number 12, Rahul: 2 egg chowmein, 1 chai")
- Ready tap calls aloud "Rahul, number 12, your food is ready"; customer's phone vibrates + sound
- "Start kitchen" button to unlock audio each morning
- Cards turn red after 15 minutes; customer screen shows "Being cooked" with time since ordering
- "Out of stock" on an order card notifies that customer

**Done when:** a cook can run 5 orders without looking at the screen except to tap Ready.

## Phase 3 — Hisab & owner tools
- Daily hisab page: total, cash vs UPI, order count, top dishes, unpaid total (Recharts allowed from this phase)
- "Marked paid by customer" vs "confirmed by owner" shown separately
- "Share today's hisab" to WhatsApp (`https://wa.me/?text=...`)
- Owner quick-add with big dish buttons for spoken orders
- Dish photos with Cloudinary (done early, 2026-11-23, with café cover and logo); optional kitchen PIN for cooks

**Done when:** the day's numbers on the hisab page match the orders in the database for a test day.

## Phase 4 — Languages & PWA
- Hindi, Bengali and English for menu UI and voice (`react-i18next` allowed from this phase)
- PWA install (`vite-plugin-pwa`) and "food is ready" push notification (`web-push`)
- "Your usual" one-tap reorder for returning devices

**Done when:** a Bengali-speaking user can order and hear the kitchen voice in Bengali or the Hindi fallback.

## Phase 5 — Extras & real-café test
- Khata (credit) for regular customers; counter TV page with ready numbers
- Optional busy-café mode: pay first, pickup codes
- README with screenshots/GIFs, demo video
- One real day at the Durgapur café; record the owner's feedback

**Done when:** the café used it for a full day and the feedback is recorded.
