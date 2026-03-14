import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";
import { Pencil, Trash2, Plus, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebPConverter } from "@/components/WebPConverter";

interface BrandFormData {
  name: string;
  logo_url: string;
  display_order: number;
  is_active: boolean;
}

const initialFormData: BrandFormData = {
  name: "",
  logo_url: "",
  display_order: 1,
  is_active: true,
};

const AdminBrandTestimonials = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formData, setFormData] = useState<BrandFormData>(initialFormData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageInputMethod, setImageInputMethod] = useState<"upload" | "url" | "webp">("upload");

  const { data: brands, isLoading } = useQuery({
    queryKey: ["admin-brand-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_testimonials")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BrandFormData) => {
      const { error } = await supabase.from("brand_testimonials").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brand-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["brand-testimonials"] });
      toast({ title: "Brand added successfully" });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BrandFormData> }) => {
      const { error } = await supabase.from("brand_testimonials").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brand-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["brand-testimonials"] });
      toast({ title: "Brand updated successfully" });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("brand_testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brand-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["brand-testimonials"] });
      toast({ title: "Brand deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setEditingBrand(null);
    setImageInputMethod("upload");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.logo_url) {
      toast({ title: "Error", description: "Name and logo are required", variant: "destructive" });
      return;
    }

    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo_url: brand.logo_url,
      display_order: brand.display_order,
      is_active: brand.is_active,
    });
    setImageInputMethod(brand.logo_url?.includes("supabase") ? "upload" : "url");
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleFieldChange = useCallback((field: keyof BrandFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="font-playfair text-2xl md:text-4xl font-bold">Brand Testimonials</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage brand logos for the homepage carousel
            </p>
          </div>
          <Button onClick={handleAddNew} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Brand
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-playfair text-xl">
                {editingBrand ? "Edit Brand" : "Add New Brand"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Brand Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Brand name"
                  required
                />
              </div>

              <div>
                <Label>Brand Logo</Label>
                <Tabs value={imageInputMethod} onValueChange={(v) => setImageInputMethod(v as "upload" | "url" | "webp")} className="mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="webp" className="text-green-600">WebP Convert</TabsTrigger>
                    <TabsTrigger value="url">URL</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="pt-4">
                    <ImageUpload
                      onUpload={(url) => handleFieldChange("logo_url", url)}
                      currentImageUrl={formData.logo_url}
                      folder="brands"
                    />
                  </TabsContent>
                  <TabsContent value="webp" className="pt-4">
                    <WebPConverter
                      onConvertedUpload={(url) => handleFieldChange("logo_url", url)}
                      folder="brands"
                    />
                  </TabsContent>
                  <TabsContent value="url" className="pt-4">
                    <Input
                      value={formData.logo_url}
                      onChange={(e) => handleFieldChange("logo_url", e.target.value)}
                      placeholder="https://..."
                    />
                    {formData.logo_url && (
                      <img
                        src={formData.logo_url}
                        alt="Preview"
                        className="mt-2 h-16 object-contain rounded border p-2"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => handleFieldChange("display_order", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleFieldChange("is_active", checked)}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingBrand ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <p className="text-muted-foreground">Loading brands...</p>
        ) : brands && brands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <Card key={brand.id} className={!brand.is_active ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="max-w-full max-h-full object-contain p-2"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{brand.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Order: {brand.display_order} | {brand.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(brand)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(brand.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No brand testimonials yet</p>
              <Button onClick={handleAddNew} className="mt-4">
                Add Your First Brand
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBrandTestimonials;
