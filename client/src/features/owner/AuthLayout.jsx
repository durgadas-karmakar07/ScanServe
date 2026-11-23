import Card from '../../components/ui/Card.jsx';
import Wordmark from '../../components/Wordmark.jsx';

// Text links under the auth forms still need a 48px tap area (Design.md, touch targets).
export const AUTH_LINK_CLASS =
  'inline-flex min-h-12 items-center px-1 font-semibold text-primary underline';

// Shared frame for the owner login and register pages.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-center gap-6 px-4 py-10">
      <header className="flex flex-col gap-4">
        <Wordmark size="lg" />
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 font-bold">{title}</h1>
          <p className="text-text-muted">{subtitle}</p>
        </div>
      </header>
      <Card>{children}</Card>
      <p className="text-center">{footer}</p>
    </main>
  );
}
