import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ImageUpload";
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

const AdminProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageInputMethod, setImageInputMethod] = useState<"upload" | "url">("upload");
  const [formData, setFormData] = useState({
    name: "",
    sr_number: "",
    description: "",
    price: "",
    category: "Bags",
    image_url: "",
    stock_quantity: "0",
    is_featured: false,
  });

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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("products").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product created successfully" });
      resetForm();
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
      setEditingProduct(null);
      resetForm();
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

  const resetForm = () => {
    setFormData({
      name: "",
      sr_number: "",
      description: "",
      price: "",
      category: "Bags",
      image_url: "",
      stock_quantity: "0",
      is_featured: false,
    });
    setEditingProduct(null);
    setImageInputMethod("upload");
  };

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
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, image_url: url });
  };

  const ProductForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Product Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>SR Number</Label>
        <Input
          value={formData.sr_number}
          onChange={(e) => setFormData({ ...formData, sr_number: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Stock Quantity</Label>
          <Input
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Category</Label>
        <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
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
        <Tabs value={imageInputMethod} onValueChange={(v) => setImageInputMethod(v as "upload" | "url")} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="url">Image URL</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="pt-4">
            <ImageUpload
              onUpload={handleImageUpload}
              currentImageUrl={formData.image_url}
            />
          </TabsContent>
          <TabsContent value="url" className="pt-4">
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
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
      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          {editingProduct ? "Update Product" : "Create Product"}
        </Button>
        {editingProduct && (
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-playfair text-4xl font-bold">Products</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-playfair text-2xl">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <ProductForm />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <h3 className="font-playfair font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">SR: {product.sr_number}</p>
                <p className="font-bold text-primary mb-4">₹{product.price}</p>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-playfair text-2xl">Edit Product</DialogTitle>
                      </DialogHeader>
                      <ProductForm />
                    </DialogContent>
                  </Dialog>
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
