import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, MessageCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import { Link } from "react-router-dom";

const Products = () => {
  const [category, setCategory] = useState<string>("all");
  const { addToCart, isLoading: isAddingToCart } = useCart();
  const { toggleFavorite, isFavorite, isPending: isFavoritePending } = useFavorites();

  // Fetch categories from database
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

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

  const handleEnquiry = (productName: string) => {
    const message = encodeURIComponent(`Hi, I would like to enquire about: ${productName}`);
    window.open(`https://wa.me/918851882465?text=${message}`, "_blank");
  };

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
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
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
                      {/* Favorite Heart Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-md"
                        onClick={() => toggleFavorite(product.id)}
                        disabled={isFavoritePending}
                      >
                        <Heart
                          className={`h-5 w-5 transition-colors ${
                            isFavorite(product.id)
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground hover:text-red-500"
                          }`}
                        />
                      </Button>
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
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-inter font-bold text-2xl text-primary">
                          ₹{product.price}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          className="flex-1"
                          onClick={() => addToCart(product.id)}
                          disabled={isAddingToCart}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEnquiry(product.name)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
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