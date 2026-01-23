import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

const AdminFeaturedProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from("products")
        .update({ is_featured })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products-featured"] });
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
      toast({ title: "Product updated" });
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });

  const featuredCount = products?.filter((p) => p.is_featured).length || 0;

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair text-4xl font-bold">Featured Products</h1>
            <p className="text-muted-foreground mt-2">
              {featuredCount} of {products?.length || 0} products are featured (recommended: 4)
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading products...</p>
        ) : products && products.length > 0 ? (
          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id} className={product.is_featured ? "border-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded overflow-hidden bg-muted">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-playfair font-semibold text-lg">
                          {product.name}
                        </h3>
                        {product.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {product.category} | SR: {product.sr_number} | ₹{product.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Featured</span>
                      <Switch
                        checked={product.is_featured}
                        onCheckedChange={(checked) =>
                          toggleFeaturedMutation.mutate({ id: product.id, is_featured: checked })
                        }
                        disabled={toggleFeaturedMutation.isPending}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFeaturedProducts;
