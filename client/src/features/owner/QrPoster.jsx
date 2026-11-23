import { LoaderCircle, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const STEPS = [
  'Scan with your phone camera',
  'Order from your phone',
  'Pay after eating: UPI or cash',
];

// Printable poster for the menu board. The QR is drawn as an image (data: URL), which the
// Content-Security-Policy allows and which needs no innerHTML.
export default function QrPoster() {
  const { restaurant } = useAuth();
  const menuUrl = `${window.location.origin}/m/${restaurant.slug}`;
  const [qr, setQr] = useState({ status: 'loading', dataUrl: '' });

  useEffect(() => {
    let isCurrent = true;
    QRCode.toDataURL(menuUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 720,
      color: { dark: '#1C1917', light: '#FFFFFF' },
    })
      .then((dataUrl) => isCurrent && setQr({ status: 'ready', dataUrl }))
      .catch(() => isCurrent && setQr({ status: 'error', dataUrl: '' }));
    return () => {
      isCurrent = false;
    };
  }, [menuUrl]);

  return (
    <>
      <div className="flex flex-col gap-1 print:hidden">
        <h1 className="text-h1 font-bold">QR poster</h1>
        <p className="text-text-muted">
          Print it and put it on your menu board or tables. The QR keeps working even if you change
          the menu or the café name.
        </p>
      </div>

      <article className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-4 rounded-card border border-border bg-surface p-6 text-center print:max-w-none print:border-0 print:p-0">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">Scan to order</p>
        <h2 className="text-h1 font-bold break-words print:text-display">{restaurant.name}</h2>
        {qr.status === 'loading' && (
          <div className="flex aspect-square w-full max-w-[320px] items-center justify-center">
            <LoaderCircle size={24} className="animate-spin text-primary" aria-hidden="true" />
            <span className="sr-only">Making your QR code…</span>
          </div>
        )}
        {qr.status === 'error' && (
          <Alert>Could not make the QR code. Please reload the page.</Alert>
        )}
        {qr.status === 'ready' && (
          <img
            src={qr.dataUrl}
            alt={`QR code that opens ${menuUrl}`}
            className="aspect-square w-full max-w-[320px] print:max-w-[110mm]"
          />
        )}
        <ol className="flex flex-col gap-1 text-left">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-2">
              <span className="font-bold text-primary tabular-nums">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="text-sm break-all text-text-muted">{menuUrl}</p>
      </article>

      <div className="flex flex-col gap-2 print:hidden">
        <Button onClick={() => window.print()} disabled={qr.status !== 'ready'}>
          <Printer size={24} aria-hidden="true" />
          Print poster
        </Button>
        <p className="text-sm text-text-muted">
          The customer menu page is coming soon. You can print the poster now; the same QR will open
          it.
        </p>
      </div>
    </>
  );
}
