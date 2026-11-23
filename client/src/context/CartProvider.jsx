import { useCallback, useEffect, useMemo, useState } from 'react';
import { readCart, saveCart } from '../lib/cartStorage.js';
import { CartContext } from './cartContext.js';

// Rules.md section 5: at most 20 of one dish and 30 different dishes per order. The server
// checks these again when the order is placed; here they keep the stepper honest.
const MAX_QUANTITY = 20;
const MAX_LINES = 30;

// The customer's cart for one café: { [itemId]: quantity }. Prices are never stored here; the
// menu supplies them, and the server recalculates every total.
export default function CartProvider({ slug, children }) {
  const [lines, setLines] = useState(() => readCart(slug));

  useEffect(() => {
    saveCart(slug, lines);
  }, [slug, lines]);

  const setQuantity = useCallback((itemId, quantity) => {
    setLines((current) => {
      const next = { ...current };
      if (quantity <= 0) {
        delete next[itemId];
        return next;
      }
      const isNewLine = !(itemId in current);
      if (isNewLine && Object.keys(current).length >= MAX_LINES) return current;
      next[itemId] = Math.min(Math.trunc(quantity), MAX_QUANTITY);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ lines, setQuantity, maxQuantity: MAX_QUANTITY, maxLines: MAX_LINES }),
    [lines, setQuantity],
  );

  return <CartContext value={value}>{children}</CartContext>;
}
