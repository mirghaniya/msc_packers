/**
 * Transforms a Supabase storage URL to use image transformation (resize + quality).
 * Non-Supabase URLs are returned unchanged.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  if (!url) return "/placeholder.svg";

  const { width, height, quality = 75 } = options;

  // Only transform Supabase storage URLs
  if (!url.includes("/storage/v1/object/public/")) return url;

  // Replace /object/ with /render/image/ for Supabase image transformation
  let transformedUrl = url.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );

  const params = new URLSearchParams();
  if (width) params.set("width", String(width));
  if (height) params.set("height", String(height));
  params.set("quality", String(quality));

  return `${transformedUrl}?${params.toString()}`;
}
