import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, MessageCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const fallbackProducts = [
  {
    id: "1",
    name: "Velvet Jewelry Pouch",
    price: 24.99,
    image_url: product1,
    category: "Purses",
  },
  {
    id: "2",
    name: "Gift Box Collection",
    price: 34.99,
    image_url: product2,
    category: "Gift Items",
  },
  {
    id: "3",
    name: "Display Stand Premium",
    price: 89.99,
    image_url: product3,
    category: "Display Stands",
  },
  {
    id: "4",
    name: "Luxury Shopping Bag",
    price: 15.99,
    image_url: product4,
    category: "Bags",
  },
];

export const FeaturedProducts = () => {
  const { addToCart, isLoading: isAddingToCart } = useCart();
  const { toggleFavorite, isFavorite, isPending: isFavoritePending } = useFavorites();

  const { data: products } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .limit(4);

      if (error) throw error;
      return data && data.length > 0 ? data : fallbackProducts;
    },
  });

  const handleEnquiry = (productName: string) => {
    const message = encodeURIComponent(`Hi, I would like to enquire about: ${productName}`);
    window.open(`https://wa.me/918851882465?text=${message}`, "_blank");
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-playfair font-bold text-4xl md:text-5xl text-foreground mb-4">
            Featured Products
          </h2>
          <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of premium jewelry packaging solutions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products?.map((product, index) => (
            <Card
              key={product.id}
              className="group overflow-hidden hover:shadow-elegant transition-all duration-300 animate-fade-in border-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                  <h3 className="font-playfair font-semibold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-4 mb-3">
                    <span className="font-inter font-bold text-2xl text-primary">
                      ₹{product.price}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 group/btn"
                      onClick={() => addToCart(product.id)}
                      disabled={isAddingToCart}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEnquiry(product.name)}
                    >
                      Enquiry
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/products">
            <Button variant="outline" size="lg" className="font-inter">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};