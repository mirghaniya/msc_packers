import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface SuggestedProductsProps {
  currentProductId: string;
  category?: string;
}

export const SuggestedProducts = ({ currentProductId, category }: SuggestedProductsProps) => {
  const { data: suggestedProducts } = useQuery({
    queryKey: ["suggested-products", currentProductId],
    queryFn: async () => {
      // Get products from different categories or random featured products
      let query = supabase
        .from("products")
        .select("*")
        .neq("id", currentProductId)
        .limit(8);
      
      const { data, error } = await query;

      if (error) throw error;
      
      // Filter out products from the same category if we have enough variety
      const otherCategoryProducts = data.filter(p => p.category !== category);
      const sameCategoryProducts = data.filter(p => p.category === category);
      
      // Prefer products from other categories, but include same category if needed
      return [...otherCategoryProducts, ...sameCategoryProducts].slice(0, 4);
    },
    enabled: !!currentProductId,
  });

  if (!suggestedProducts || suggestedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="font-playfair font-bold text-3xl text-foreground mb-8">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {suggestedProducts.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`}>
            <Card className="group overflow-hidden hover:shadow-elegant transition-all duration-300 h-full">
              <CardContent className="p-0">
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-inter uppercase tracking-wide text-secondary mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-playfair font-semibold text-sm md:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="font-inter font-bold text-lg md:text-xl text-primary mt-2">
                    ₹{product.price}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
