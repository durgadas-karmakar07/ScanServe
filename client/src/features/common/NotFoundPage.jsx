import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-h1 font-bold">Page not found</h1>
      <p className="text-text-muted">This link does not open anything in ScanServe.</p>
      <Link
        to="/"
        className="inline-flex min-h-13 items-center justify-center rounded-xl bg-primary px-5 text-lg font-semibold text-white hover:bg-primary-hover"
      >
        Go to home
      </Link>
    </main>
  );
}
