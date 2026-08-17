// SEO-friendly slug helpers for product URLs.
// Public product URLs are /product/<slug> — no UUID exposed.
// Legacy /product/<uuid> and /product/<slug>-<uuid> links still resolve and
// are redirected to the clean slug URL by the product detail page.

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120)
    .replace(/^-|-$/g, "");
}

type ProductLike = { id: string; name?: string | null; slug?: string | null };

export function productPath(product: ProductLike): string {
  const s = (product.slug || "").trim() || slugify(product.name || "");
  return s ? `/product/${s}` : `/product/${product.id}`;
}

/** Extract the raw product id from a legacy route param (slug-uuid or uuid). */
export function parseProductId(param?: string): string | undefined {
  if (!param) return undefined;
  const match = param.match(UUID_RE);
  return match ? match[0] : undefined;
}
