import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, GripVertical, Plus } from "lucide-react";

interface MultiImageUploadProps {
  productId: string;
  existingImages: { id: string; image_url: string; display_order: number }[];
  onImagesChange: () => void;
}

export const MultiImageUpload = ({
  productId,
  existingImages,
  onImagesChange,
}: MultiImageUploadProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.name}`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File too large: ${file.name}`);
        }

        // Create unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `products/${productId}/${Date.now()}-${index}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(data.path);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Save to product_images table
      const nextOrder = existingImages.length > 0
        ? Math.max(...existingImages.map((img) => img.display_order)) + 1
        : 1;

      const insertData = uploadedUrls.map((url, index) => ({
        product_id: productId,
        image_url: url,
        display_order: nextOrder + index,
      }));

      const { error: insertError } = await supabase
        .from("product_images")
        .insert(insertData);

      if (insertError) throw insertError;

      toast({
        title: "Images uploaded",
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
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
            <img
              src={image.image_url}
              alt="Product"
              className="w-full h-full object-cover"
            />
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
        accept="image/jpeg,image/png,image/webp,image/gif"
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
        {isUploading ? "Uploading..." : "Upload Multiple Images"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Supported formats: JPG, PNG, WebP, GIF. Max 5MB each.
      </p>
    </div>
  );
};
