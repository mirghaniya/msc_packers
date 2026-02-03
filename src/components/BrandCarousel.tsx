import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const BrandCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: brands } = useQuery({
    queryKey: ["brand-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_testimonials")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!brands || brands.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % brands.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [brands]);

  if (!brands || brands.length === 0) {
    return null;
  }

  // For sliding effect, we'll show multiple logos
  const visibleCount = Math.min(brands.length, 5);

  return (
    <section className="py-12 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="font-playfair font-bold text-3xl md:text-4xl text-foreground mb-2">
            Trusted By Leading Brands
          </h2>
          <p className="font-inter text-muted-foreground">
            Our quality packaging solutions are trusted by top jewelry brands
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex * 100) / visibleCount}%)`,
            }}
          >
            {/* Duplicate for infinite scroll effect */}
            {[...brands, ...brands].map((brand, index) => (
              <div
                key={`${brand.id}-${index}`}
                className="flex-shrink-0 px-4 md:px-8"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <div className="bg-background rounded-lg p-4 md:p-6 shadow-soft hover:shadow-elegant transition-shadow flex items-center justify-center h-20 md:h-24">
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="max-h-12 md:max-h-16 max-w-full object-contain grayscale hover:grayscale-0 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {brands.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex % brands.length
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
