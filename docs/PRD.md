# PRD — ScanServe

## 1. What we are building

ScanServe is a QR-ordering web app for **tiny cafés and restaurants** (2–4 people, the owner also cooks and keeps the accounts).

- The customer scans a QR on the menu board, orders from their phone, eats, and pays at the end by UPI or cash.
- The kitchen sees every order live and taps **Ready** once.
- The owner sees who has not paid yet.

No app install, no customer login, no OTP, no pickup codes.

**Problem it solves (real example: a café in Durgapur):** the owner stops cooking to take orders, orders live only in people's memory and get mixed up at rush hour, and the day's accounts come from memory.

## 2. Target users

| User | Who | What they need |
|---|---|---|
| Owner (primary) | Runs a 2–4 person café, cooks too, uses a basic Android phone | Fewer interruptions, no forgotten orders, know who has not paid |
| Cook | Works at the stove, busy hands | See new orders at a glance, one tap when done |
| Customer | Anyone with a smartphone, any age | Order and pay without typing much or waiting at the counter |

## 3. Core features

### MVP (Phase 1)
1. **Owner account:** register a café (name, URL slug, UPI ID) and log in with email + password.
2. **Menu management:** add, edit and delete dishes (name, price, category, veg/non-veg) and switch dishes sold out.
3. **QR poster:** a printable page with the café's menu QR code.
4. **Customer ordering:** open `/m/:slug`, browse by category, add to cart, place an order. Name asked once and remembered on the phone.
5. **Device recognition:** a random device ID is stored in the browser; no login.
6. **Daily order numbers:** 1, 2, 3… reset every day.
7. **Live kitchen screen:** new orders appear instantly (Socket.io) with a sound; one big **Ready** button per order; one-tap **Cancel**.
8. **Live order status for the customer:** "Being cooked" → "Ready, please collect".
9. **Pay after eating:** a pay screen with a UPI button (UPI ID and amount filled in) plus a "Paying cash" option. The customer marks it paid.
10. **Unpaid list for the owner:** orders that are Ready but not paid, with the owner able to mark them paid.

### Later phases
- Voice: orders read aloud and customer names called (Phase 2)
- Daily hisab with charts, owner quick-add for spoken orders, dish photos (Phase 3)
- Hindi, Bengali and English, PWA install, push notifications, "your usual" (Phase 4)
- Khata (credit for regulars), counter TV, busy-café mode (Phase 5)

## 4. User stories (MVP)

- As a customer, I scan the QR, tap dishes and tap **Order** without creating an account.
- As a customer, I see when my food is ready without asking at the counter.
- As a customer, I pay after eating with my UPI app opened and the amount already filled in.
- As a cook, I see every new order on the kitchen screen the moment it is placed.
- As the owner, I tap **Ready** once per order and nothing else.
- As the owner, I see a list of orders that are not paid yet, with names and amounts.
- As the owner, I mark a dish sold out and customers can no longer order it.

## 5. Success criteria

| # | Criterion | How we check |
|---|---|---|
| 1 | A first-time customer goes from scan to placed order in under 60 seconds | Time 3 people who have never seen the app |
| 2 | Staff do exactly 1 tap per normal order (Ready) | Count taps in the order flow |
| 3 | A new order shows on the kitchen screen within 2 seconds | Two devices side by side |
| 4 | Prices and totals are always calculated by the server | Edit a request in DevTools; the bill must not change |
| 5 | Two orders placed at the same moment never get the same number | Script that places 20 orders in parallel |
| 6 | Works on a cheap Android phone over a slow mobile connection | Chrome DevTools "Slow 4G" + a real low-end phone |
| 7 | No OTP, login or code is ever asked of a customer | Walk through every customer screen |
| 8 | A real café uses it for one day (end of Phase 5) | Owner feedback recorded |

## 6. Non-goals (we will NOT build)

- Payment gateway, card payments or automatic payment verification
- Customer accounts, OTPs, pickup codes (busy-café mode in Phase 5 is optional)
- Delivery, takeaway scheduling or online pre-ordering from home
- Table management (optional table number only, much later)
- Inventory or stock counting
- Multiple branches per café, staff payroll or attendance
- Native Android or iOS apps (it is a web app / PWA)
- Receipt printers or any new hardware
- AI features
