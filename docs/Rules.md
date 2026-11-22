# Rules — Coding Standards, Security and Quality

The standards every change to ScanServe follows: libraries, code style, naming, error handling, security, product rules and quality.

## 1. Libraries

**Use (already decided):**
- Client: `react`, `react-dom`, `react-router`, `tailwindcss` + `@tailwindcss/vite`, `socket.io-client`, `lucide-react`, `qrcode`
- Server: `express` (v5), `mongoose`, `socket.io`, `zod`, `jsonwebtoken`, `bcryptjs`, `helmet`, `cors`, `express-rate-limit`, `dotenv`
- Dev: `vite`, `nodemon`, `eslint`, `prettier`, optional `vitest` + `supertest`

**Allowed only from their phase (see `Phases.md`):** `recharts` and `cloudinary` (Phase 3), `react-i18next`, `vite-plugin-pwa` and `web-push` (Phase 4).

**Avoid:**
- TypeScript, Next.js, Redux / Zustand / MobX (use React Context + hooks)
- UI kits: MUI, Bootstrap, Chakra, Ant Design, shadcn (we build small components with Tailwind)
- `axios` (use the `fetch` wrapper in `client/src/api/client.js`), `moment` (use `Intl` / plain `Date`)
- Firebase, Supabase, any payment gateway, any OTP/SMS service
- `express-async-handler` (Express 5 already catches errors from async handlers)

Any new library needs the user's OK first. State what it does and why the current list is not enough.

## 2. Code style

- ES modules (`import` / `export`) in client and server. `async/await`, no callback chains.
- Functional React components and hooks only. One component per file.
- Keep files under ~200 lines; split when bigger.
- Money is an **integer number of rupees** (₹120 → `120`). Format only in the UI with `lib/format.js`.
- Dates are stored as UTC `Date`; the "business day" for order numbers uses `Asia/Kolkata`.
- No hard-coded URLs or secrets. Use `import.meta.env.VITE_API_URL` and `process.env.*` via `server/src/config/env.js`.
- Comments explain **why**, not what. Add a short comment above anything non-obvious (atomic counter, socket rooms).

## 3. Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Variables, functions | camelCase | `placeOrder`, `orderNumber` |
| React components & their files | PascalCase | `OrderCard.jsx` |
| Hooks | `use` + PascalCase | `useDevice.js` |
| Other JS files | camelCase | `format.js`, `order.service.js` |
| Mongoose models | Singular PascalCase | `MenuItem` (collection `menuitems`) |
| Route files | `<name>.routes.js` | `orders.routes.js` |
| API paths | lowercase, plural nouns, kebab-case | `/api/orders/:id/mark-paid` |
| Socket events | `noun:verb` | `order:ready` |
| Env vars | UPPER_SNAKE_CASE | `MONGODB_URI` |
| Constants | UPPER_SNAKE_CASE | `MAX_OPEN_ORDERS = 2` |
| Booleans | `is` / `has` prefix | `isVeg`, `isAcceptingOrders` |

## 4. Error handling

**Server**
- Throw `new AppError(statusCode, code, message)` from `utils/AppError.js` for expected errors (e.g. `404, 'ORDER_NOT_FOUND', 'Order not found'`).
- Validate every request body, query and params with a `zod` schema through `middleware/validate.js` → `400 VALIDATION_ERROR`.
- One central `middleware/errorHandler.js` returns `{ error: { code, message } }`. Never send stack traces when `NODE_ENV=production`.
- Log unexpected errors with `console.error` including the route; no logging of passwords, tokens or full request bodies.

**Client**
- All requests go through `api/client.js`, which throws an `Error` carrying `code` and a user-friendly `message`.
- Show a short toast in plain language ("Could not place order. Please try again."). Never leave a blank screen; every page has loading, empty and error states.
- On socket reconnect, refetch data over REST. Sockets only notify; REST is the source of truth.

## 5. Security rules (strict, never break)

Security is a hard requirement from Phase 1, not a later phase. Every change must keep all of these true.

**Authentication**
- Passwords: `bcryptjs` with cost 12, minimum 8 characters; `passwordHash` has `select: false` in the schema.
- `JWT_SECRET` is at least 32 random characters. Tokens expire in 7 days and carry only `staffId`, `restaurantId`, `role` and `tokenVersion`.
- `Staff.tokenVersion` is checked on every request. Changing the password or "log out everywhere" increments it, which kills all old tokens.
- Login and register errors never reveal which field was wrong: always "Invalid email or password".
- Rate limits: login/register 5 attempts per 15 minutes per IP + email; order creation 10 per minute per device and per IP; everything else 300 per 15 minutes per IP. Set `app.set('trust proxy', 1)` on Render so limits see the real IP.
- Token storage: the JWT is kept in `localStorage` and sent as `Authorization: Bearer`. This is an accepted trade-off because the frontend and API are on different domains; the XSS rules below are what keep it safe. If the app gets its own domain later, switch to an httpOnly, Secure, SameSite cookie.

**Authorization**
- Every owner route uses `requireAuth`. Every database query filters by `restaurantId` from the token, never from the request body, params or query.
- Before updating or deleting by id, load the document with both `_id` and `restaurantId`. If it is not found, return 404 (not 403) so ids cannot be probed.
- Customer routes use `requireDevice`; a device can read or pay only its own orders (`order.deviceId === req.deviceId`).
- All status changes go through one function that allows only `new -> ready -> paid` and `new|ready -> cancelled`; anything else returns 409. Repeating the same action (a double tap) is harmless.

**Input validation**
- Every body, query and param is validated by a strict zod schema (`.strict()` rejects unknown keys) before it reaches a controller: string length limits, integers only for money and quantities, ObjectId format for ids, UUID v4 for `deviceId`.
- Turn on `mongoose.set('sanitizeFilter', true)` and never pass `req.body` or `req.query` straight into a Mongoose query (blocks `$gt`-style injection).
- `express.json({ limit: '10kb' })`.
- The server recalculates every price and total from the database; prices sent by the client are ignored. Limits: max 20 of one dish, max 30 lines per order, max 2 open orders per device.
- The UPI ID must match `^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$`. UPI link parameters are built with `URLSearchParams`, and the amount always comes from the server.

**Socket.io**
- The server, not the client, decides rooms: kitchen sockets join only the room of the `restaurantId` inside their verified JWT; device sockets join only `device:<their own deviceId>`.
- Reject handshakes with a missing or invalid token or deviceId. Socket.io CORS uses the same single `CLIENT_ORIGIN`.
- Clients never change data over sockets. All changes go through REST, so validation, auth and rate limits always apply; sockets only broadcast.

**HTTP and browser**
- `helmet()` with a Content-Security-Policy and HSTS; HTTPS only in production (Render and Vercel provide it).
- CORS allows exactly `CLIENT_ORIGIN`; never `*`.
- React escapes output by default: never use `dangerouslySetInnerHTML`, `eval` or `new Function`. Links to other sites use `rel="noopener noreferrer"`.
- Nothing secret goes in `VITE_*` variables; everything in the client bundle is public.

**Secrets and data**
- `.env` files are never committed; `.env.example` has empty values only. If a secret ever reaches GitHub, rotate it immediately (new JWT secret, new database password).
- MongoDB Atlas: separate database users for development and production, strong passwords, least privilege (`readWrite` on the app database only).
- Store only what is needed: a customer's first name and device ID. No phone numbers, no location.
- Errors never expose stack traces, MongoDB messages or file paths to the client. Logs never contain passwords, tokens or full request bodies.

**Dependencies**
- Commit `package-lock.json`. Run `npm audit` at the end of every phase and fix high and critical issues before moving on. Use only well-known, maintained packages.

**Security check before a phase is done:** go through this whole section, test the important rules (wrong password, someone else's order id, edited price, unknown fields), and report anything not met.

## 6. Product rules (from the design — do not "improve" these away)

- No customer login, OTP or pickup code.
- Staff do one tap per normal order (Ready). Do not add a "Preparing" step.
- Payment is trust-based: no gateway, no screenshot upload, no auto-verification.
- Big text and big buttons; must work on a cheap Android phone.

## 7. Professional quality (UI, code and GitHub)

- **UI:** follow `Design.md` exactly: only its colour tokens, type scale and components; spacing in 4px steps; every screen has loading, empty and error states. No unstyled browser defaults, no emoji used as icons, no lorem ipsum. Check every screen at 360px, 768px and 1280px wide before calling it done.
- **Code:** clear names, no dead code, no commented-out blocks, no `console.log` left in committed code.
- **Git:** small commits with Conventional Commit messages (`feat: add kitchen ready button`, `fix: ...`, `docs: ...`). Never commit `node_modules`, `.env` or build output.
- **README.md** (repo root) is the project's public face on GitHub. Keep it professional and true:
  - Update it at the end of every phase: feature status, roadmap ticks, screenshots or GIFs of new screens, setup steps.
  - Every command in it must work with the current `package.json` scripts, every link must open, and there are no broken images.
  - Never claim a feature works before it does.
