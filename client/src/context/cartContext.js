import { createContext } from 'react';

// Filled by CartProvider (one per café menu); read it with the useCart hook.
export const CartContext = createContext(null);
