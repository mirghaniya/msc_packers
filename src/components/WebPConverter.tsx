import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, RefreshCw, Check, Image as ImageIcon } from "lucide-react";

interface WebPConverterProps {
  onConvertedUpload: (url: string) => void;
  bucket?: string;
  folder?: string;
}

export const WebPConverter = ({
  onConvertedUpload,
  bucket = "product-images",
  folder = "products",
}: WebPConverterProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedPreview, setConvertedPreview] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [quality, setQuality] = useState(80);
  const [originalSize, setOriginalSize] = useState(0);
  const [convertedSize, setConvertedSize] = useState(0);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG, JPEG, or PNG image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max 20MB allowed",
        variant: "destructive",
      });
      return;
    }

    setSourceFile(file);
    setOriginalSize(file.size);
    setConvertedBlob(null);
    setConvertedPreview(null);
    setConvertedSize(0);

    const reader = new FileReader();
    reader.onload = () => setSourcePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, [toast]);

  const convertToWebP = useCallback(async () => {
    if (!sourceFile) return;

    setIsConverting(true);
    try {
      const img = new Image();
      const loadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
      });

      img.src = URL.createObjectURL(sourceFile);
      await loadPromise;

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Conversion failed"))),
          "image/webp",
          quality / 100
        );
      });

      setConvertedBlob(blob);
      setConvertedSize(blob.size);
      setConvertedPreview(URL.createObjectURL(blob));

      URL.revokeObjectURL(img.src);

      toast({ title: "Converted to WebP successfully!" });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  }, [sourceFile, quality, toast]);

  const uploadWebP = useCallback(async () => {
    if (!convertedBlob) return;

    setIsUploading(true);
    try {
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, convertedBlob, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/webp",
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onConvertedUpload(publicUrl);

      toast({ title: "WebP image uploaded successfully!" });

      // Reset
      setSourceFile(null);
      setSourcePreview(null);
      setConvertedBlob(null);
      setConvertedPreview(null);
      setOriginalSize(0);
      setConvertedSize(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast({
        title: "Upload failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [convertedBlob, bucket, folder, onConvertedUpload, toast]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const savings = originalSize > 0 && convertedSize > 0
    ? Math.round((1 - convertedSize / originalSize) * 100)
    : 0;

  return (
    <div className="space-y-4 rounded-lg border border-dashed p-4 bg-muted/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw className="h-4 w-4 text-primary" />
        Convert to WebP & Upload
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!sourceFile ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs">Select JPG/PNG to convert</span>
        </button>
      ) : (
        <div className="space-y-3">
          {/* Preview row */}
          <div className="flex gap-3 items-start">
            {sourcePreview && (
              <div className="text-center">
                <img src={sourcePreview} alt="Original" className="w-20 h-20 object-cover rounded border" />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Original ({formatSize(originalSize)})
                </p>
              </div>
            )}
            {convertedPreview && (
              <>
                <div className="flex items-center self-center text-muted-foreground">→</div>
                <div className="text-center">
                  <img src={convertedPreview} alt="WebP" className="w-20 h-20 object-cover rounded border" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    WebP ({formatSize(convertedSize)})
                  </p>
                </div>
                {savings > 0 && (
                  <div className="self-center">
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      -{savings}% smaller
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quality slider */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Quality: {quality}%</label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="flex-1 h-1.5 accent-primary"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSourceFile(null);
                setSourcePreview(null);
                setConvertedBlob(null);
                setConvertedPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Change
            </Button>
            {!convertedBlob ? (
              <Button
                type="button"
                size="sm"
                onClick={convertToWebP}
                disabled={isConverting}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isConverting ? "animate-spin" : ""}`} />
                {isConverting ? "Converting..." : "Convert to WebP"}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={uploadWebP}
                disabled={isUploading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                {isUploading ? "Uploading..." : "Upload WebP"}
              </Button>
            )}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">
        Convert JPG/PNG → WebP for 30-80% smaller file sizes. Better performance & SEO.
      </p>
    </div>
  );
};
