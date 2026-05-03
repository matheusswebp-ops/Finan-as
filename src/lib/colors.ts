/**
 * Category palette tokens. Each category stores its color as one of these
 * keys in the database. UI components map them to CSS variables.
 */
export const CATEGORY_COLORS = [
  "cat-1",
  "cat-2",
  "cat-3",
  "cat-4",
  "cat-5",
  "cat-6",
  "cat-7",
  "cat-8",
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export function categoryHsl(color: string): string {
  const fallback = "var(--cat-8)";
  if (!CATEGORY_COLORS.includes(color as CategoryColor)) return `hsl(${fallback})`;
  return `hsl(var(--${color}))`;
}

export function categoryBgSoft(color: string): string {
  return `hsl(var(--${color}) / 0.15)`;
}

export const CATEGORY_LABELS: Record<CategoryColor, string> = {
  "cat-1": "Laranja",
  "cat-2": "Ciano",
  "cat-3": "Roxo",
  "cat-4": "Verde",
  "cat-5": "Amarelo",
  "cat-6": "Rosa",
  "cat-7": "Teal",
  "cat-8": "Cinza",
};
