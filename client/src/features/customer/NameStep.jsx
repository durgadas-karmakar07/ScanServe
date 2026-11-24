import { ShoppingBag } from 'lucide-react';
import { useId, useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const MAX_NAME_LENGTH = 30;
export const GUEST_NAME = 'Guest';

// "What should we call you?" — asked once, before the first order, and remembered on the phone.
// Skipping orders as "Guest". The café calls this name when the order is ready.
export default function NameStep({ initialName = '', isPlacing, onSubmit, onCancel }) {
  const inputId = useId();
  const [name, setName] = useState(initialName === GUEST_NAME ? '' : initialName);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isPlacing) return;
    const cleaned = name.trim().replace(/\s+/g, ' ');
    if (!cleaned) return setError('Type your name, or tap Skip.');
    if (cleaned.length > MAX_NAME_LENGTH) {
      return setError(`Use at most ${MAX_NAME_LENGTH} letters.`);
    }
    onSubmit(cleaned);
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
      <Input
        id={inputId}
        label="What should we call you?"
        hint="The café calls this name when your order is ready."
        error={error}
        value={name}
        maxLength={MAX_NAME_LENGTH + 10}
        autoComplete="given-name"
        autoFocus
        onChange={(event) => {
          setName(event.target.value);
          if (error) setError('');
        }}
      />
      <Button type="submit" variant="accent" aria-disabled={isPlacing || undefined}>
        <ShoppingBag size={24} aria-hidden="true" />
        {isPlacing ? 'Placing order…' : 'Place order'}
      </Button>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          aria-disabled={isPlacing || undefined}
          onClick={() => !isPlacing && onSubmit(GUEST_NAME)}
        >
          Skip
        </Button>
        <Button
          variant="secondary"
          aria-disabled={isPlacing || undefined}
          onClick={() => !isPlacing && onCancel()}
        >
          Back
        </Button>
      </div>
    </form>
  );
}
