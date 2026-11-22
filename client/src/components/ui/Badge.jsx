const TONES = {
  neutral: 'bg-border text-text',
  info: 'bg-info text-white',
  success: 'bg-success text-white',
  danger: 'bg-danger text-white',
};

// Status is always shown as colour and a word, never colour alone (Design.md).
export default function Badge({ tone = 'neutral', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
