// How long ago something happened, for order cards: "just now", "5 min ago", then the time for
// earlier today ("at 2:15 pm") and the date for an earlier day ("on 23 Nov"). Ready-but-unpaid
// orders can stay open for days, so a minute count alone would read "2880 min ago".
export function timeAgo(iso, now) {
  const date = new Date(iso);
  const minutes = Math.floor((now - date.getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const isToday = date.toDateString() === new Date(now).toDateString();
  return isToday
    ? `at ${date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`
    : `on ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
}
