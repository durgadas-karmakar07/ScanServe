export default function Card({ className = '', ...props }) {
  return (
    <div className={`rounded-card border border-border bg-surface p-4 ${className}`} {...props} />
  );
}
