const MAX_SLUG_LENGTH = 40;

// "Royal Café & Momos" -> "royal-cafe-momos". NFKD splits "é" into "e" + an accent mark, and
// \p{M} removes the marks. Names in Bengali or Hindi script give an empty result, and the
// owner types the link name themselves.
export function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, '');
}
