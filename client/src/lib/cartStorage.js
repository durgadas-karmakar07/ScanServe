// The cart lives in sessionStorage per café: it survives a reload or a quick switch to another
// app, and is gone when the tab closes. Storage can throw (private mode), so every call is guarded.
const keyFor = (slug) => `scanserve.cart.${slug}`;

export function readCart(slug) {
  try {
    const value = JSON.parse(sessionStorage.getItem(keyFor(slug)) ?? '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export function saveCart(slug, lines) {
  try {
    sessionStorage.setItem(keyFor(slug), JSON.stringify(lines));
  } catch {
    // Not saved: the cart still works until the page reloads.
  }
}
