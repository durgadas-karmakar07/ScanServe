import { LoaderCircle, Save } from 'lucide-react';
import { useState } from 'react';
import { createMenuItem, updateMenuItem } from '../../../api/menu.js';
import Alert from '../../../components/ui/Alert.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import Sheet from '../../../components/ui/Sheet.jsx';
import Switch from '../../../components/ui/Switch.jsx';
import VegMark from '../../../components/ui/VegMark.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { useFocusFirstError } from '../../../hooks/useFocusFirstError.js';

const toForm = (dish) => ({
  name: dish?.name ?? '',
  category: dish?.category ?? '',
  price: dish ? String(dish.price) : '',
  isVeg: dish?.isVeg ?? null,
  isAvailable: dish?.isAvailable ?? true,
});

// Add or edit one dish. `dish` is null when adding. Mount it with a `key` per dish so the form
// starts fresh each time it opens.
export default function DishSheet({ dish, categories, onClose, onSaved }) {
  const { withAuth } = useAuth();
  const [form, setForm] = useState(() => toForm(dish));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { formRef, alertRef } = useFocusFirstError(formError);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setFieldErrors({});
    setFormError(null);
    // An empty or non-numeric price is sent as null so the server explains what is missing.
    const price = form.price.trim() === '' ? null : Number(form.price);
    const body = { ...form, price: Number.isFinite(price) ? price : null };
    try {
      const { item } = dish
        ? await withAuth(updateMenuItem, dish.id, body)
        : await withAuth(createMenuItem, body);
      onSaved(item, Boolean(dish));
    } catch (err) {
      setFieldErrors(err.fields ?? {});
      setFormError({ message: err.message });
      setIsSaving(false);
    }
  };

  return (
    <Sheet title={dish ? 'Edit dish' : 'Add a dish'} onClose={onClose} isBusy={isSaving}>
      <form ref={formRef} className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {formError && <Alert ref={alertRef}>{formError.message}</Alert>}
        <Input
          id="dish-name"
          name="name"
          label="Dish name"
          hint="For example: Egg chowmein"
          required
          value={form.name}
          onChange={updateField}
          error={fieldErrors.name}
        />
        <Input
          id="dish-category"
          name="category"
          label="Category"
          hint="For example: Snacks, Rice, Drinks"
          list="dish-category-options"
          required
          value={form.category}
          onChange={updateField}
          error={fieldErrors.category}
        />
        <datalist id="dish-category-options">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <Input
          id="dish-price"
          name="price"
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          label="Price (₹)"
          hint="Whole rupees, for example 120"
          required
          value={form.price}
          onChange={updateField}
          error={fieldErrors.price}
        />
        <fieldset className="flex flex-col gap-2" aria-describedby="dish-type-error">
          <legend className="mb-2 font-semibold">Veg or non-veg</legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: true, label: 'Veg' },
              { value: false, label: 'Non-veg' },
            ].map((option) => (
              <label
                key={option.label}
                className={`flex min-h-13 items-center gap-3 rounded-xl border px-4 has-focus-visible:outline-2 has-focus-visible:outline-primary ${form.isVeg === option.value ? 'border-primary bg-primary-soft' : 'border-border'}`}
              >
                <input
                  type="radio"
                  name="isVeg"
                  className="sr-only"
                  checked={form.isVeg === option.value}
                  onChange={() => setForm((current) => ({ ...current, isVeg: option.value }))}
                />
                <VegMark isVeg={option.value} isDecorative />
                {option.label}
              </label>
            ))}
          </div>
          {fieldErrors.isVeg && (
            <p id="dish-type-error" className="text-sm text-danger">
              {fieldErrors.isVeg}
            </p>
          )}
        </fieldset>
        <Switch
          label="Available today"
          description="Turn off when it is sold out."
          checked={form.isAvailable}
          onChange={(isAvailable) => setForm((current) => ({ ...current, isAvailable }))}
        />
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
            ) : (
              <Save size={24} aria-hidden="true" />
            )}
            {isSaving ? 'Saving…' : 'Save dish'}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
