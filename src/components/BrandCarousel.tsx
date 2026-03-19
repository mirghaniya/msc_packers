import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
export const BrandCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
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

  // Handle responsive visible count
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(brands ? Math.min(brands.length, 2) : 2);
      } else {
        setVisibleCount(brands ? Math.min(brands.length, 5) : 5);
      }
    };
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, [brands]);
  useEffect(() => {
    if (!brands || brands.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % brands.length);
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
            {[...brands, ...brands].map((brand, index) => <div key={`${brand.id}-${index}`} className="flex-shrink-0 px-3 sm:px-4 md:px-8" style={{
            width: `${100 / visibleCount}%`
          }}>
                <div className="flex items-center justify-center h-28 sm:h-32 md:h-36">
                  <img src={getOptimizedImageUrl(brand.logo_url, { width: 280, height: 200, quality: 70 })} alt={brand.name} width={250} height={160} loading="lazy" className="max-h-24 sm:max-h-28 md:max-h-32 max-w-full grayscale hover:grayscale-0 transition-all shadow-none object-contain" />
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