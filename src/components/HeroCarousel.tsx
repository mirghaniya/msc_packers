import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
const heroImage = "/images/hero-bg.jpg";
import { useState, useEffect } from "react";

interface HeroSlide {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
}

const defaultSlide: HeroSlide = {
  id: "default",
  image_url: heroImage,
  title: "Luxury Jewelry Packaging",
  subtitle: "Elevate your brand with our premium packaging and display solutions. Exquisite quality meets sophisticated design.",
  button_text: "Explore Collection",
  button_link: "/products",
};

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: slides } = useQuery({
    queryKey: ["hero-slides"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // Reuse in-flight prefetch from index.html if available
      const prefetched = (window as any).__heroP as Promise<any> | undefined;
      if (prefetched) {
        try {
          const data = await prefetched;
          (window as any).__heroP = undefined;
          if (Array.isArray(data) && data.length > 0) return data;
        } catch {}
      }
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data && data.length > 0 ? data : [defaultSlide];
    },
  });

  const activeSlides = slides || [defaultSlide];

  // Auto-advance slides
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const currentSlide = activeSlides[currentIndex];

  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 transition-opacity duration-500">
        <img
          src={currentSlide.id === "default" ? currentSlide.image_url : getOptimizedImageUrl(currentSlide.image_url, { width: 1024, quality: 40 })}
          srcSet={currentSlide.id === "default" ? undefined : `${getOptimizedImageUrl(currentSlide.image_url, { width: 480, quality: 30 })} 480w, ${getOptimizedImageUrl(currentSlide.image_url, { width: 768, quality: 35 })} 768w, ${getOptimizedImageUrl(currentSlide.image_url, { width: 1024, quality: 40 })} 1024w, ${getOptimizedImageUrl(currentSlide.image_url, { width: 1440, quality: 45 })} 1440w`}
          sizes="100vw"
          alt={currentSlide.title || "Hero banner"}
          fetchPriority="high"
          decoding="async"
          width={1440}
          height={600}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-2xl">
          <h1 className="font-playfair font-bold text-5xl md:text-6xl lg:text-7xl text-white mb-6 animate-fade-in">
            {currentSlide.title || "Luxury Jewelry Packaging"}
          </h1>
          <p className="font-inter text-lg md:text-xl text-white/90 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {currentSlide.subtitle || "Elevate your brand with our premium packaging and display solutions."}
          </p>
          {currentSlide.button_text && currentSlide.button_link && (
            <Link to={currentSlide.button_link}>
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-foreground font-inter font-semibold group animate-fade-in shadow-elegant"
                style={{ animationDelay: "0.2s" }}
              >
                {currentSlide.button_text}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
