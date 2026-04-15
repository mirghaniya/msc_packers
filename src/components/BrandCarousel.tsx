import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

const getVisibleCount = (brandsLength: number | undefined) => {
  if (typeof window === 'undefined') return 4;
  const mq1024 = window.matchMedia('(min-width: 1024px)');
  const mq640 = window.matchMedia('(min-width: 640px)');
  const max = brandsLength || 4;
  if (mq1024.matches) return Math.min(max, 4);
  if (mq640.matches) return Math.min(max, 3);
  return Math.min(max, 2);
};

export const BrandCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const {
    data: brands
  } = useQuery({
    queryKey: ["brand-testimonials"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("brand_testimonials").select("*").eq("is_active", true).order("display_order", {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });

  // Handle responsive visible count using matchMedia (avoids forced reflow)
  useEffect(() => {
    const update = () => setVisibleCount(getVisibleCount(brands?.length));
    update();
    const mq1024 = window.matchMedia('(min-width: 1024px)');
    const mq640 = window.matchMedia('(min-width: 640px)');
    mq1024.addEventListener('change', update);
    mq640.addEventListener('change', update);
    return () => {
      mq1024.removeEventListener('change', update);
      mq640.removeEventListener('change', update);
    };
  }, [brands]);
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
  return <section className="py-12 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="font-playfair font-bold text-3xl md:text-4xl text-foreground mb-2">Our Clients</h2>
          <p className="font-inter text-muted-foreground">
            Our quality packaging solutions are trusted by top jewelry brands
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex transition-transform duration-700 ease-in-out items-center" style={{
          transform: `translateX(-${currentIndex * 100 / visibleCount}%)`
        }}>
            {/* Duplicate for infinite scroll effect */}
            {[...brands, ...brands].map((brand, index) => <div key={`${brand.id}-${index}`} className="flex-shrink-0 box-border px-3 sm:px-4 md:px-8" style={{
            width: `${100 / visibleCount}%`
          }}>
                <div className="flex items-center justify-center h-28 sm:h-36 md:h-44 lg:h-48">
                  <img
                    src={getOptimizedImageUrl(brand.logo_url, { width: 160, quality: 55 })}
                    srcSet={`${getOptimizedImageUrl(brand.logo_url, { width: 160, quality: 55 })} 160w, ${getOptimizedImageUrl(brand.logo_url, { width: 240, quality: 60 })} 240w, ${getOptimizedImageUrl(brand.logo_url, { width: 400, quality: 65 })} 400w`}
                    sizes="(max-width: 640px) 160px, (max-width: 1024px) 240px, 400px"
                    alt={brand.name}
                    width={240}
                    height={170}
                    loading="lazy"
                    className="max-h-20 sm:max-h-26 md:max-h-34 lg:max-h-40 w-auto max-w-[80%] sm:max-w-[78%] md:max-w-[82%] lg:max-w-[85%] grayscale hover:grayscale-0 transition-all shadow-none object-contain"
                  />
                </div>
              </div>)}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center mt-6 space-x-1">
          {brands.map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 p-2 box-content rounded-full transition-all duration-300 bg-clip-content ${index === currentIndex % brands.length ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`} aria-label={`Go to slide ${index + 1}`} />)}
        </div>
      </div>
    </section>;
};