import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";
import { Pencil, Trash2, Plus, Images } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ImageUpload";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { WebPConverter } from "@/components/WebPConverter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Validate image URL for security
const validateImageUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url || url.trim() === "") return { valid: true }; // Allow empty
  
  try {
    const parsed = new URL(url);
    
    // Only allow HTTPS
    if (parsed.protocol !== "https:") {
      return { valid: false, error: "Only HTTPS URLs are allowed" };
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
};

interface ProductFormData {
  name: string;
  sr_number: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  stock_quantity: string;
  is_featured: boolean;
}

const initialFormData: ProductFormData = {
  name: "",
  sr_number: "",
  description: "",
  price: "",
  category: "Bags",
  image_url: "",
  stock_quantity: "0",
  is_featured: false,
};

const AdminProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageInputMethod, setImageInputMethod] = useState<"upload" | "url" | "webp">("upload");
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch additional images for the editing product
  const { data: productImages, refetch: refetchProductImages } = useQuery({
    queryKey: ["product-images", editingProduct?.id],
    queryFn: async () => {
      if (!editingProduct) return [];
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", editingProduct.id)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!editingProduct,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("products").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product created successfully" });
      resetForm();
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("products").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product updated successfully" });
      resetForm();
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product deleted successfully" });
    },
  });

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setEditingProduct(null);
    setImageInputMethod("upload");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate image URL if provided via URL method
    if (imageInputMethod === "url" && formData.image_url) {
      const imageValidation = validateImageUrl(formData.image_url);
      if (!imageValidation.valid) {
        toast({
          title: "Invalid Image URL",
          description: imageValidation.error,
          variant: "destructive",
        });
        return;
      }
    }
    
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sr_number: product.sr_number,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url || "",
      stock_quantity: product.stock_quantity?.toString() || "0",
      is_featured: product.is_featured || false,
    });
    setImageInputMethod(product.image_url?.includes("supabase") ? "upload" : "url");
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  // Handle individual field changes to prevent full re-render issues
  const handleFieldChange = useCallback((field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="font-playfair text-2xl md:text-4xl font-bold">Products</h1>
          <Button onClick={handleAddNew} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-playfair text-xl md:text-2xl">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Product Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>SR Number</Label>
                <Input
                  value={formData.sr_number}
                  onChange={(e) => handleFieldChange("sr_number", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleFieldChange("price", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => handleFieldChange("stock_quantity", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(val) => handleFieldChange("category", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bags">Bags</SelectItem>
                    <SelectItem value="Purses">Purses</SelectItem>
                    <SelectItem value="Display Stands">Display Stands</SelectItem>
                    <SelectItem value="Stock Boxes">Stock Boxes</SelectItem>
                    <SelectItem value="Gift Items">Gift Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Product Image</Label>
                <p className="text-xs text-muted-foreground mt-1">Recommended: 800 × 800 px (square). Formats: JPG, PNG, WebP. Max 5MB.</p>
                <Tabs value={imageInputMethod} onValueChange={(v) => setImageInputMethod(v as "upload" | "url" | "webp")} className="mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="webp" className="text-green-600">WebP Convert</TabsTrigger>
                    <TabsTrigger value="url">URL</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="pt-4">
                    <ImageUpload
                      onUpload={handleImageUpload}
                      currentImageUrl={formData.image_url}
                    />
                  </TabsContent>
                  <TabsContent value="webp" className="pt-4">
                    <WebPConverter onConvertedUpload={handleImageUpload} />
                  </TabsContent>
                  <TabsContent value="url" className="pt-4">
                    <Input
                      value={formData.image_url}
                      onChange={(e) => handleFieldChange("image_url", e.target.value)}
                      placeholder="https://..."
                    />
                    {formData.image_url && (
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="mt-2 w-32 h-32 object-cover rounded-lg border"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Multiple Images Section - Only show when editing */}
              {editingProduct && (
                <div>
                  <Label className="flex items-center gap-2">
                    <Images className="h-4 w-4" />
                    Gallery Images (for carousel)
                  </Label>
                   <p className="text-xs text-muted-foreground mb-2">
                    Add multiple images for the product carousel. Recommended: 800 × 800 px (square). Max 5MB each.
                  </p>
                  <MultiImageUpload
                    productId={editingProduct.id}
                    existingImages={productImages || []}
                    onImagesChange={() => refetchProductImages()}
                  />
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products?.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-32 md:h-48 object-cover rounded mb-3"
                />
                <h3 className="font-playfair font-semibold text-base md:text-lg mb-1 truncate">{product.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2">SR: {product.sr_number}</p>
                <p className="font-bold text-primary mb-3">₹{product.price}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                    <Pencil className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;