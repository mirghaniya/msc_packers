import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { convertImageToWebP } from "@/lib/webp";
import { Upload, X, GripVertical, Plus } from "lucide-react";

interface MultiImageUploadProps {
  productId: string;
  existingImages: { id: string; image_url: string; display_order: number; media_type?: string }[];
  onImagesChange: () => void;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 20 * 1024 * 1024;

export const MultiImageUpload = ({
  productId,
  existingImages,
  onImagesChange,
}: MultiImageUploadProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const all = Array.from(files);
    setProgress({ done: 0, total: all.length });

    try {
      const uploadPromises = all.map(async (original, index) => {
        const isVideo = VIDEO_TYPES.includes(original.type);
        const isImage = IMAGE_TYPES.includes(original.type);
        if (!isImage && !isVideo) {
          throw new Error(`Invalid file type: ${original.name}`);
        }
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        if (original.size > maxSize) {
          throw new Error(
            `File too large: ${original.name} (max ${isVideo ? "20MB" : "5MB"})`
          );
        }

        // Convert JPG/PNG images to WebP before upload
        const file = isVideo ? original : await convertImageToWebP(original);

        const fileExt = file.name.split(".").pop();
        const fileName = `products/${productId}/${Date.now()}-${index}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(data.path);

        setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));

        return { url: publicUrl, media_type: isVideo ? "video" : "image" };
      });

      const uploaded = await Promise.all(uploadPromises);

      const nextOrder = existingImages.length > 0
        ? Math.max(...existingImages.map((img) => img.display_order)) + 1
        : 1;

      const insertData = uploaded.map((u, index) => ({
        product_id: productId,
        image_url: u.url,
        media_type: u.media_type,
        display_order: nextOrder + index,
      }));

      const { error: insertError } = await supabase
        .from("product_images")
        .insert(insertData);

      if (insertError) throw insertError;

      toast({
        title: "Media uploaded",
        description: `${uploaded.length} file(s) uploaded successfully`,
      });

      onImagesChange();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from("product_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      toast({ title: "Image removed" });
      onImagesChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {existingImages.map((image) => (
          <div
            key={image.id}
            className="relative group w-24 h-24 rounded-lg overflow-hidden border"
          >
            {image.media_type === "video" ? (
              <video
                src={image.image_url}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            ) : (
              <img
                src={image.image_url}
                alt="Product"
                className="w-full h-full object-cover"
              />
            )}
            {image.media_type === "video" && (
              <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                VIDEO
              </span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <GripVertical className="h-4 w-4 text-white cursor-move" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleRemove(image.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add more button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-6 w-6" />
          <span className="text-xs">Add</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading
          ? progress
            ? `Uploading ${progress.done}/${progress.total}...`
            : "Uploading..."
          : "Upload Images or Videos"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Images: JPG, PNG, WebP, GIF (max 5MB) — JPG/PNG are auto-converted to WebP. Videos: MP4, WebM, MOV (max 20MB). Select multiple files to batch upload.
      </p>
    </div>
  );
};
