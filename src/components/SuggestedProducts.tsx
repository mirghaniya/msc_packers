import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { useState, useEffect, useCallback } from "react";

interface SuggestedProductsProps {
  currentProductId: string;
  category?: string;
}

export const SuggestedProducts = ({ currentProductId, category }: SuggestedProductsProps) => {
  const [slideIndex, setSlideIndex] = useState(0);

  const { data: suggestedProducts } = useQuery({
    queryKey: ["suggested-products", currentProductId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .neq("id", currentProductId)
        .limit(8);
      if (error) throw error;
      const otherCategoryProducts = data.filter(p => p.category !== category);
      const sameCategoryProducts = data.filter(p => p.category === category);
      return [...otherCategoryProducts, ...sameCategoryProducts].slice(0, 8);
    },
    enabled: !!currentProductId,
  });

  const nextSlide = useCallback(() => {
    if (!suggestedProducts || suggestedProducts.length <= 2) return;
    setSlideIndex((prev) => (prev + 1) % suggestedProducts.length);
  }, [suggestedProducts]);

  const prevSlide = () => {
    if (!suggestedProducts || suggestedProducts.length <= 2) return;
    setSlideIndex((prev) => (prev - 1 + suggestedProducts.length) % suggestedProducts.length);
  };

  useEffect(() => {
    if (!suggestedProducts || suggestedProducts.length <= 2) return;
    const interval = setInterval(nextSlide, 2000);
    return () => clearInterval(interval);
  }, [suggestedProducts, nextSlide]);

  if (!suggestedProducts || suggestedProducts.length === 0) return null;

  const getVisibleProducts = (products: any[], startIndex: number, count: number) => {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(products[(startIndex + i) % products.length]);
    }
    return result;
  };

  return (
    <div className="mt-16">
      <h2 className="font-playfair font-bold text-3xl text-foreground mb-8">You May Also Like</h2>
      <div className="relative">
        {suggestedProducts.length > 2 && (
          <>
            <Button variant="ghost" size="icon" className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md" onClick={prevSlide}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md" onClick={nextSlide}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 overflow-hidden">
          {getVisibleProducts(suggestedProducts, slideIndex, Math.min(4, suggestedProducts.length)).map((product) => (
            <Link key={`suggested-${product.id}-${slideIndex}`} to={`/product/${product.id}`}>
              <Card className="group overflow-hidden hover:shadow-elegant transition-all duration-300 h-full">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden aspect-square">
                    <img src={getOptimizedImageUrl(product.image_url, { width: 320, height: 320 })} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-inter uppercase tracking-wide text-secondary mb-1">{product.category}</p>
                    <h3 className="font-playfair font-semibold text-sm md:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                    <p className="font-inter font-bold text-lg md:text-xl text-primary mt-2">₹{product.price}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
