import { LoaderCircle, Store } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useFocusFirstError } from '../../hooks/useFocusFirstError.js';
import { slugify } from '../../lib/slug.js';
import AuthLayout, { AUTH_LINK_CLASS } from './AuthLayout.jsx';

const EMPTY_FORM = {
  restaurantName: '',
  slug: '',
  upiId: '',
  ownerName: '',
  email: '',
  password: '',
};

export default function RegisterPage() {
  const { status, register } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  // The link name follows the café name until the owner edits it themselves.
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formRef, alertRef } = useFocusFirstError(formError);

  if (status === 'authenticated') return <Navigate to="/owner" replace />;

  const updateField = (event) => {
    const { name, value } = event.target;
    if (name === 'slug') setIsSlugEdited(true);
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'restaurantName' && !isSlugEdited ? { slug: slugify(value) } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setFormError(null);
    try {
      await register(form);
    } catch (err) {
      setFieldErrors(err.fields ?? {});
      setFormError({ message: err.message, isCredentials: err.code === 'INVALID_CREDENTIALS' });
      setIsSubmitting(false);
    }
  };

  const menuLink = `${window.location.host}/m/${form.slug || 'your-cafe'}`;

  return (
    <AuthLayout
      title="Create your café"
      subtitle="Takes about a minute. You can change these details later."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/owner/login" className={AUTH_LINK_CLASS}>
            Log in
          </Link>
        </>
      }
    >
      <form ref={formRef} className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {formError && (
          <Alert ref={alertRef}>
            {formError.message}
            {formError.isCredentials && ' If you already have an account, log in instead.'}
          </Alert>
        )}
        <Input
          id="restaurantName"
          name="restaurantName"
          label="Café name"
          autoComplete="organization"
          required
          value={form.restaurantName}
          onChange={updateField}
          error={fieldErrors.restaurantName}
        />
        <Input
          id="slug"
          name="slug"
          label="Menu link name"
          hint={`Customers open: ${menuLink}`}
          autoCapitalize="none"
          spellCheck={false}
          required
          value={form.slug}
          onChange={updateField}
          error={fieldErrors.slug}
        />
        <Input
          id="upiId"
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
        <Input
          id="ownerName"
          name="ownerName"
          label="Your name"
          autoComplete="name"
          required
          value={form.ownerName}
          onChange={updateField}
          error={fieldErrors.ownerName}
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={form.email}
          onChange={updateField}
          error={fieldErrors.email}
        />
        <Input
          id="password"
          name="password"
          type={isPasswordVisible ? 'text' : 'password'}
          label="Password"
          hint="At least 8 characters"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={updateField}
          error={fieldErrors.password}
        />
        <label className="flex min-h-12 items-center gap-3">
          <input
            type="checkbox"
            className="size-6 accent-primary"
            checked={isPasswordVisible}
            onChange={(event) => setIsPasswordVisible(event.target.checked)}
          />
          Show password
        </label>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
          ) : (
            <Store size={24} aria-hidden="true" />
          )}
          {isSubmitting ? 'Creating your café…' : 'Create café'}
        </Button>
      </form>
    </AuthLayout>
  );
}
