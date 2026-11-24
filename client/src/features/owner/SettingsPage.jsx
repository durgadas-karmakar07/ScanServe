import { LoaderCircle, LogOut, Save } from 'lucide-react';
import { useState } from 'react';
import { logoutEverywhere } from '../../api/auth.js';
import { updateRestaurant } from '../../api/restaurant.js';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Sheet from '../../components/ui/Sheet.jsx';
import Switch from '../../components/ui/Switch.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useFocusFirstError } from '../../hooks/useFocusFirstError.js';
import { useToast } from '../../hooks/useToast.js';
import BrandingCard from './BrandingCard.jsx';

const toForm = (restaurant) => ({
  name: restaurant.name,
  tagline: restaurant.tagline ?? '',
  upiId: restaurant.upiId,
});

export default function SettingsPage() {
  const { staff, restaurant, withAuth, setRestaurant, logout } = useAuth();
  const [isConfirmingLogoutAll, setIsConfirmingLogoutAll] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [logoutAllError, setLogoutAllError] = useState('');

  // For a lost phone or a login left on someone else's device: every login of this owner stops
  // working, including this one, and kitchen screens disconnect.
  const confirmLogoutAll = async () => {
    setIsLoggingOutAll(true);
    setLogoutAllError('');
    try {
      await withAuth(logoutEverywhere);
      logout();
    } catch (err) {
      setLogoutAllError(err.message);
      setIsLoggingOutAll(false);
    }
  };
  const { showToast } = useToast();
  const [form, setForm] = useState(() => toForm(restaurant));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingOrders, setIsTogglingOrders] = useState(false);
  const { formRef, alertRef } = useFocusFirstError(formError);

  const isChanged = Object.entries(form).some(([key, value]) => value !== (restaurant[key] ?? ''));
  const menuLink = `${window.location.host}/m/${restaurant.slug}`;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setFieldErrors({});
    setFormError(null);
    try {
      const { restaurant: saved } = await withAuth(updateRestaurant, form);
      setRestaurant(saved);
      setForm(toForm(saved));
      showToast('Café details saved');
    } catch (err) {
      setFieldErrors(err.fields ?? {});
      setFormError({ message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleOrders = async (isAcceptingOrders) => {
    setIsTogglingOrders(true);
    try {
      const { restaurant: saved } = await withAuth(updateRestaurant, { isAcceptingOrders });
      setRestaurant(saved);
      showToast(saved.isAcceptingOrders ? 'Taking orders again' : 'Orders paused');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsTogglingOrders(false);
    }
  };

  return (
    <>
      <h1 className="text-h1 font-bold">Settings</h1>

      <Card>
        <Switch
          label="Taking orders"
          description={
            restaurant.isAcceptingOrders
              ? 'Customers can order now.'
              : 'Paused: customers can see the menu but cannot order.'
          }
          checked={restaurant.isAcceptingOrders}
          disabled={isTogglingOrders}
          onChange={toggleOrders}
        />
      </Card>

      <Card>
        <form ref={formRef} className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <h2 className="text-h2 font-semibold">Café details</h2>
          {formError && <Alert ref={alertRef}>{formError.message}</Alert>}
          <Input
            id="settings-name"
            name="name"
            label="Café name"
            autoComplete="organization"
            required
            value={form.name}
            onChange={updateField}
            error={fieldErrors.name}
          />
          <Input
            id="settings-tagline"
            name="tagline"
            label="One line about your café (optional)"
            hint="Shown under your name, e.g. Home-style Bengali food"
            maxLength={80}
            value={form.tagline}
            onChange={updateField}
            error={fieldErrors.tagline}
          />
          <Input
            id="settings-upi"
            name="upiId"
            label="UPI ID for payments"
            hint="Money goes straight to this UPI ID, e.g. royalcafe@okaxis"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={form.upiId}
            onChange={updateField}
            error={fieldErrors.upiId}
          />
          <Button type="submit" disabled={!isChanged || isSaving}>
            {isSaving ? (
              <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
            ) : (
              <Save size={24} aria-hidden="true" />
            )}
            {isSaving ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </Card>

      <BrandingCard />

      <Card className="flex flex-col gap-3">
        <h2 className="text-h2 font-semibold">Menu link</h2>
        <p className="font-semibold break-all">{menuLink}</p>
        <p className="text-sm text-text-muted">
          This link cannot be changed, because it is printed on your QR poster.
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-h2 font-semibold">Account</h2>
          <p>{staff.name}</p>
          <p className="break-all text-text-muted">{staff.email}</p>
        </div>
        <p className="text-sm text-text-muted">
          Lost a phone, or logged in on someone else's device? Log out everywhere ends every login,
          including this one and the kitchen screen.
        </p>
        <Button
          variant="secondary"
          isFullWidth={false}
          onClick={() => {
            setLogoutAllError('');
            setIsConfirmingLogoutAll(true);
          }}
        >
          <LogOut size={24} aria-hidden="true" />
          Log out everywhere
        </Button>
      </Card>

      {isConfirmingLogoutAll && (
        <Sheet
          title="Log out on every device?"
          isBusy={isLoggingOutAll}
          onClose={() => !isLoggingOutAll && setIsConfirmingLogoutAll(false)}
        >
          <p className="text-text-muted">
            You will need to log in again here, on the kitchen screen and on every other device.
          </p>
          {logoutAllError && <Alert>{logoutAllError}</Alert>}
          <Button variant="secondary" onClick={() => setIsConfirmingLogoutAll(false)}>
            Stay logged in
          </Button>
          <Button
            variant="danger"
            aria-disabled={isLoggingOutAll || undefined}
            onClick={() => !isLoggingOutAll && confirmLogoutAll()}
          >
            {isLoggingOutAll ? 'Logging out…' : 'Log out everywhere'}
          </Button>
        </Sheet>
      )}
    </>
  );
}
