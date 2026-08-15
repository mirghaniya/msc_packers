/**
 * Client-side WebP conversion helpers for gallery uploads.
 * Videos and existing WebP/GIF files are left untouched.
 */

const CONVERTIBLE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const isConvertibleImage = (file: File) =>
  CONVERTIBLE_TYPES.includes(file.type);

export async function convertImageToWebP(
  file: File,
  options: { quality?: number; maxWidth?: number } = {}
): Promise<File> {
  if (!isConvertibleImage(file)) return file;

  const { quality = 80, maxWidth = 2000 } = options;

  try {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = objectUrl;
    });

    const scale = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality / 100)
    );
    URL.revokeObjectURL(objectUrl);

    if (!blob || blob.size === 0) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    // Fall back to the original file if conversion is not possible
    return file;
  }
}

export async function convertFilesToWebP(
  files: File[],
  options?: { quality?: number; maxWidth?: number }
): Promise<File[]> {
  const out: File[] = [];
  for (const f of files) {
    out.push(await convertImageToWebP(f, options));
  }
  return out;
}
