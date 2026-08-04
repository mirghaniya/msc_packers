// SEO-friendly slug helpers for product URLs.
// Product URLs look like /product/gold-ring-box-<uuid>. The UUID stays at the
// end so existing /product/<uuid> links keep working.

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70)
    .replace(/^-|-$/g, "");
}

export function productPath(product: { id: string; name?: string | null }): string {
  const s = slugify(product.name || "");
  return s ? `/product/${s}-${product.id}` : `/product/${product.id}`;
}

/** Extract the raw product id from a slugged route param. */
export function parseProductId(param?: string): string | undefined {
  if (!param) return undefined;
  const match = param.match(UUID_RE);
  return match ? match[0] : param;
}
