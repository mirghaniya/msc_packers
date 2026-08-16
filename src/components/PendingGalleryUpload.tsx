import { useRef, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { convertImageToWebP } from "@/lib/webp";
import { Plus, X, Upload } from "lucide-react";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 20 * 1024 * 1024;

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
}

export const PendingGalleryUpload = ({ files, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isConverting, setIsConverting] = useState(false);

  const previews = useMemo(
    () =>
      files.map((f) => ({
        file: f,
        url: URL.createObjectURL(f),
        isVideo: VIDEO_TYPES.includes(f.type),
      })),
    [files]
  );

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    const valid: File[] = [];
    for (const f of Array.from(selected)) {
      const isVideo = VIDEO_TYPES.includes(f.type);
      const isImage = IMAGE_TYPES.includes(f.type);
      if (!isVideo && !isImage) continue;
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (f.size > maxSize) continue;
      valid.push(f);
    }
    if (inputRef.current) inputRef.current.value = "";
    if (valid.length === 0) return;

    setIsConverting(true);
    try {
      const processed: File[] = [];
      for (const f of valid) {
        processed.push(
          VIDEO_TYPES.includes(f.type) ? f : await convertImageToWebP(f)
        );
      }
      onChange([...files, ...processed]);
    } finally {
      setIsConverting(false);
    }
  };

  const remove = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {previews.map((p, idx) => (
          <div
            key={idx}
            className="relative group w-24 h-24 rounded-lg overflow-hidden border"
          >
            {p.isVideo ? (
              <video src={p.url} className="w-full h-full object-cover" muted playsInline />
            ) : (
              <img src={p.url} alt="" className="w-full h-full object-cover" />
            )}
            {p.isVideo && (
              <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                VIDEO
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-6 w-6" />
          <span className="text-xs">Add</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isConverting}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isConverting ? "Converting to WebP..." : "Add Images or Videos"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Images: JPG, PNG, WebP, GIF (max 5MB) — JPG/PNG are auto-converted to WebP. Videos: MP4, WebM, MOV (max 20MB). Select multiple files to batch add; uploaded after the product is created.
      </p>
    </div>
  );
};
