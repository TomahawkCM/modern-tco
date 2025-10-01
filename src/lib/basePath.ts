export const BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH && process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : '';

export const withBase = (p: string) => {
  if (!p) return p;
  if (
    p.startsWith('http') ||
    p.startsWith('mailto:') ||
    p.startsWith('tel:') ||
    p.startsWith('#') ||
    p.startsWith('//')
  )
    return p;
  return `${BASE_PATH}${p.startsWith('/') ? p : `/${  p}`}`;
};

