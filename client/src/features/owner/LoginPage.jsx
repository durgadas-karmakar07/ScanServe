import { LoaderCircle, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useFocusFirstError } from '../../hooks/useFocusFirstError.js';
import AuthLayout, { AUTH_LINK_CLASS } from './AuthLayout.jsx';

export default function LoginPage() {
  const { status, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formRef, alertRef } = useFocusFirstError(formError);

  // Once logged in (now or from an earlier visit), go to where the owner was heading.
  if (status === 'authenticated') {
    return <Navigate to={location.state?.from ?? '/owner'} replace />;
  }

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setFormError(null);
    try {
      await login(form);
    } catch (err) {
      setFieldErrors(err.fields ?? {});
      setFormError({ message: err.message });
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      subtitle="Manage your café, menu and orders."
      footer={
        <>
          New to ScanServe?{' '}
          <Link to="/owner/register" className={AUTH_LINK_CLASS}>
            Create your café
          </Link>
        </>
      }
    >
      <form ref={formRef} className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {formError && <Alert ref={alertRef}>{formError.message}</Alert>}
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
          type="password"
          label="Password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={updateField}
          error={fieldErrors.password}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
          ) : (
            <LogIn size={24} aria-hidden="true" />
          )}
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
