// Dishes arrive sorted by the order the owner added them; categories appear in the order of
// their first dish. Returns [[category, items], ...].
export function groupByCategory(items) {
  const groups = new Map();
  for (const item of items) {
    if (!groups.has(item.category)) groups.set(item.category, []);
    groups.get(item.category).push(item);
  }
  return [...groups.entries()];
}
