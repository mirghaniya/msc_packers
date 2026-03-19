import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
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

  const getEnquiryUrl = (productName: string) => {
    const message = encodeURIComponent(`Hi, I would like to enquire about: ${productName}`);
    return `https://wa.me/918851882465?text=${message}`;
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {products?.map((product, index) => (
            <Card
              key={product.id}
              className="group overflow-hidden hover:shadow-elegant transition-all duration-300 animate-fade-in border-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={getOptimizedImageUrl(product.image_url, { width: 500, height: 500 })}
                    alt={product.name}
                    width={400}
                    height={400}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Favorite Heart Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-md h-8 w-8 md:h-10 md:w-10"
                    onClick={() => toggleFavorite(product.id)}
                    disabled={isFavoritePending}
                    aria-label={isFavorite(product.id) ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
                  >
                    <Heart
                      className={`h-4 w-4 md:h-5 md:w-5 transition-colors ${
                        isFavorite(product.id)
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground hover:text-red-500"
                      }`}
                    />
                  </Button>
                </div>
                <div className="p-3 md:p-6">
                  <p className="text-xs font-inter uppercase tracking-wide text-muted-foreground mb-1 md:mb-2">
                    {product.category}
                  </p>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-playfair font-semibold text-sm md:text-xl text-foreground mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mt-2 md:mt-4 mb-2 md:mb-3">
                    <span className="font-inter font-bold text-lg md:text-2xl text-primary">
                      ₹{product.price}
                    </span>
                  </div>
                  <div className="flex gap-1 md:gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 group/btn text-xs md:text-sm h-8 md:h-9"
                      onClick={() => addToCart(product.id)}
                      disabled={isAddingToCart}
                    >
                      <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 group-hover/btn:rotate-12 transition-transform" />
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                    <a
                      href={getEnquiryUrl(product.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 md:h-9 px-2 md:px-3"
                    >
                      Enquiry
                    </a>
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