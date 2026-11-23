import { useParams } from 'react-router';
import CartProvider from '../../context/CartProvider.jsx';
import CustomerMenu from './CustomerMenu.jsx';

// /m/:slug — what customers see after scanning the QR. Each café gets its own cart.
export default function MenuPage() {
  const { slug } = useParams();

  return (
    <CartProvider key={slug} slug={slug}>
      <CustomerMenu slug={slug} />
    </CartProvider>
  );
}
