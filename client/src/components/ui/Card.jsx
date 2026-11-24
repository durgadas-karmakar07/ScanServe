export default function Card({ className = '', ...props }) {
  return <div className={`rounded-card bg-surface p-5 shadow-card ${className}`} {...props} />;
}
