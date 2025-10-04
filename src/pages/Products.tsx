import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Products = () => {
  const [category, setCategory] = useState<string>("all");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      let query = supabase.from("products").select("*");
      
      if (category !== "all") {
        query = query.eq("category", category as any);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-luxury py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair font-bold text-5xl text-white mb-4">
              Our Collection
            </h1>
            <p className="font-inter text-lg text-white/90 max-w-2xl mx-auto">
              Browse our exquisite selection of jewelry packaging and display solutions
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="Bags">Bags</SelectItem>
                <SelectItem value="Purses">Purses</SelectItem>
                <SelectItem value="Display Stands">Display Stands</SelectItem>
                <SelectItem value="Stock Boxes">Stock Boxes</SelectItem>
                <SelectItem value="Gift Items">Gift Items</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="font-inter text-muted-foreground">Loading products...</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="group overflow-hidden hover:shadow-elegant transition-all duration-300"
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-inter uppercase tracking-wide text-secondary mb-2">
                        {product.category}
                      </p>
                      <h3 className="font-playfair font-semibold text-xl text-foreground mb-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-inter font-bold text-2xl text-primary">
                          ${product.price}
                        </span>
                        <Link to={`/products/${product.id}`}>
                          <Button size="sm" variant="default">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="font-inter text-muted-foreground">No products found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;