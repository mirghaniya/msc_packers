import { lazy, Suspense, useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroCarousel } from "@/components/HeroCarousel";
import { FeaturedProducts } from "@/components/FeaturedProducts";

const PromotionalBanner = lazy(() => import("@/components/PromotionalBanner").then(m => ({ default: m.PromotionalBanner })));
const BrandCarousel = lazy(() => import("@/components/BrandCarousel").then(m => ({ default: m.BrandCarousel })));
const TestimonialSlider = lazy(() => import("@/components/TestimonialSlider").then(m => ({ default: m.TestimonialSlider })));

/** Renders children only when the sentinel enters the viewport */
const LazySection = ({ children, minHeight = "200px" }: { children: React.ReactNode; minHeight?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? children : <div style={{ minHeight }} />}
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroCarousel />
        <FeaturedProducts />
        <LazySection minHeight="200px">
          <Suspense fallback={<div className="min-h-[200px]" />}>
            <PromotionalBanner />
          </Suspense>
        </LazySection>
        <LazySection minHeight="300px">
          <Suspense fallback={<div className="min-h-[300px]" />}>
            <BrandCarousel />
          </Suspense>
        </LazySection>
        <LazySection minHeight="300px">
          <Suspense fallback={<div className="min-h-[300px]" />}>
            <TestimonialSlider />
          </Suspense>
        </LazySection>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
