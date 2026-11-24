// The last few orders this phone placed at a café, so the menu can link back to the latest
// order's status page. Only ids and numbers are kept; the order itself comes from the server.
const MAX_REMEMBERED = 5;
// Old orders stop showing on the menu after this long.
const RECENT_MS = 12 * 60 * 60 * 1000;

const keyFor = (slug) => `scanserve.orders.${slug}`;

function readAll(slug) {
  try {
    const value = JSON.parse(localStorage.getItem(keyFor(slug)) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function rememberOrder(slug, order) {
  const entry = { id: order.id, orderNumber: order.orderNumber, createdAt: order.createdAt };
  const others = readAll(slug).filter((saved) => saved.id !== order.id);
  try {
    localStorage.setItem(keyFor(slug), JSON.stringify([entry, ...others].slice(0, MAX_REMEMBERED)));
  } catch {
    // Not saved: the status page link is simply not shown on the menu.
  }
}

// The newest order from the last 12 hours, or null.
export function latestRecentOrder(slug) {
  const [latest] = readAll(slug);
  if (!latest?.id || typeof latest.orderNumber !== 'number') return null;
  const age = Date.now() - new Date(latest.createdAt).getTime();
  return age >= 0 && age < RECENT_MS ? latest : null;
}
