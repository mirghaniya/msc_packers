import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Check, Image as ImageIcon, X, Plus } from "lucide-react";

interface FileItem {
  id: string;
  file: File;
  sourcePreview: string;
  convertedBlob: Blob | null;
  convertedPreview: string | null;
  originalSize: number;
  convertedSize: number;
  status: "pending" | "converting" | "converted" | "uploading" | "uploaded" | "error";
}

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
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(80);

  const handleFilesSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const newFiles: FileItem[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (!validTypes.includes(file.type)) {
        toast({ title: `Skipped: ${file.name}`, description: "Only JPG/PNG allowed", variant: "destructive" });
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast({ title: `Skipped: ${file.name}`, description: "Max 20MB", variant: "destructive" });
        return;
      }

      const preview = URL.createObjectURL(file);
      newFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        file,
        sourcePreview: preview,
        convertedBlob: null,
        convertedPreview: null,
        originalSize: file.size,
        convertedSize: 0,
        status: "pending",
      });
    });

    setFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [toast]);

  const convertFile = async (item: FileItem, q: number): Promise<FileItem> => {
    const img = new Image();
    const loadPromise = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load"));
    });
    img.src = URL.createObjectURL(item.file);
    await loadPromise;

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Conversion failed"))),
        "image/webp",
        q / 100
      );
    });

    URL.revokeObjectURL(img.src);

    return {
      ...item,
      convertedBlob: blob,
      convertedPreview: URL.createObjectURL(blob),
      convertedSize: blob.size,
      status: "converted",
    };
  };

  const convertAll = useCallback(async () => {
    setIsProcessing(true);
    const pending = files.filter((f) => f.status === "pending");

    for (const item of pending) {
      setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "converting" } : f)));
      try {
        const converted = await convertFile(item, quality);
        setFiles((prev) => prev.map((f) => (f.id === item.id ? converted : f)));
      } catch {
        setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "error" } : f)));
      }
    }

    setIsProcessing(false);
    toast({ title: `${pending.length} image(s) converted!` });
  }, [files, quality, toast]);

  const uploadAll = useCallback(async () => {
    setIsProcessing(true);
    const converted = files.filter((f) => f.status === "converted" && f.convertedBlob);
    let uploaded = 0;

    for (const item of converted) {
      setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "uploading" } : f)));
      try {
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, item.convertedBlob!, { cacheControl: "3600", upsert: false, contentType: "image/webp" });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
        onConvertedUpload(publicUrl);

        setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "uploaded" } : f)));
        uploaded++;
      } catch {
        setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "error" } : f)));
      }
    }

    setIsProcessing(false);
    toast({ title: `${uploaded} WebP image(s) uploaded!` });

    // Clear uploaded files after a short delay
    setTimeout(() => {
      setFiles((prev) => prev.filter((f) => f.status !== "uploaded"));
    }, 1500);
  }, [files, bucket, folder, onConvertedUpload, toast]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) {
        URL.revokeObjectURL(item.sourcePreview);
        if (item.convertedPreview) URL.revokeObjectURL(item.convertedPreview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((f) => {
      URL.revokeObjectURL(f.sourcePreview);
      if (f.convertedPreview) URL.revokeObjectURL(f.convertedPreview);
    });
    setFiles([]);
  }, [files]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const hasPending = files.some((f) => f.status === "pending");
  const hasConverted = files.some((f) => f.status === "converted");
  const totalOriginal = files.reduce((s, f) => s + f.originalSize, 0);
  const totalConverted = files.reduce((s, f) => s + f.convertedSize, 0);
  const totalSavings = totalOriginal > 0 && totalConverted > 0
    ? Math.round((1 - totalConverted / totalOriginal) * 100)
    : 0;

  return (
    <div className="space-y-4 rounded-lg border border-dashed p-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <RefreshCw className="h-4 w-4 text-primary" />
          Batch Convert to WebP & Upload
        </div>
        {files.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={clearAll} className="h-6 text-xs">
            Clear All
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        multiple
        onChange={handleFilesSelect}
        className="hidden"
      />

      {files.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs">Select multiple JPG/PNG images to convert</span>
        </button>
      ) : (
        <div className="space-y-3">
          {/* File grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {files.map((item) => (
              <div key={item.id} className="relative group">
                <img
                  src={item.convertedPreview || item.sourcePreview}
                  alt={item.file.name}
                  className={`w-full aspect-square object-cover rounded border ${
                    item.status === "uploaded" ? "ring-2 ring-green-500" :
                    item.status === "error" ? "ring-2 ring-destructive" :
                    item.status === "converting" || item.status === "uploading" ? "opacity-60" : ""
                  }`}
                />
                {/* Status badge */}
                <span className={`absolute bottom-0.5 left-0.5 text-[8px] px-1 rounded font-medium ${
                  item.status === "pending" ? "bg-muted text-muted-foreground" :
                  item.status === "converting" ? "bg-primary/80 text-primary-foreground" :
                  item.status === "converted" ? "bg-accent text-accent-foreground" :
                  item.status === "uploading" ? "bg-primary/80 text-primary-foreground" :
                  item.status === "uploaded" ? "bg-green-600 text-white" :
                  "bg-destructive text-destructive-foreground"
                }`}>
                  {item.status === "pending" && formatSize(item.originalSize)}
                  {item.status === "converting" && "Converting..."}
                  {item.status === "converted" && `${formatSize(item.convertedSize)}`}
                  {item.status === "uploading" && "Uploading..."}
                  {item.status === "uploaded" && "✓ Done"}
                  {item.status === "error" && "Error"}
                </span>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}

            {/* Add more */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span className="text-[9px]">Add</span>
            </button>
          </div>

          {/* Summary */}
          {totalConverted > 0 && totalSavings > 0 && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{formatSize(totalOriginal)} → {formatSize(totalConverted)}</span>
              <span className="font-semibold text-green-600">-{totalSavings}% total</span>
            </div>
          )}

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
          <div className="flex gap-2 flex-wrap">
            {hasPending && (
              <Button type="button" size="sm" onClick={convertAll} disabled={isProcessing}>
                <RefreshCw className={`h-4 w-4 mr-1 ${isProcessing ? "animate-spin" : ""}`} />
                Convert All ({files.filter((f) => f.status === "pending").length})
              </Button>
            )}
            {hasConverted && (
              <Button
                type="button"
                size="sm"
                onClick={uploadAll}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4 mr-1" />
                Upload All WebP ({files.filter((f) => f.status === "converted").length})
              </Button>
            )}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">
        Select multiple JPG/PNG images → Convert all to WebP → Upload all at once. 30-80% smaller files.
      </p>
    </div>
  );
};
