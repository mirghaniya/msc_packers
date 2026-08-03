import { lazy, Suspense, useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroCarousel } from "@/components/HeroCarousel";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { useSeo } from "@/lib/useSeo";

const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
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
    <div
      ref={ref}
      style={{
        contentVisibility: visible ? "visible" : "auto",
        containIntrinsicSize: `1px ${minHeight}`,
      } as React.CSSProperties}
    >
      {visible ? children : <div style={{ minHeight }} />}
    </div>
  );
};

const Index = () => {
  useSeo({
    title: "Mirghaniya Super Centre | Jewellery Packaging & Display",
    description:
      "Mirghaniya Super Centre supplies premium jewellery boxes, display stands, trays, pouches and carry bags to jewellers across India. Wholesale pricing.",
    path: "/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Jewellery Packaging & Display Products",
      url: "https://mscpackers.in/",
      description:
        "Wholesale jewellery packaging and display products: jewellery boxes, ring boxes, necklace boxes, display stands, trays, pouches and carry bags.",
      isPartOf: { "@type": "WebSite", name: "Mirghaniya Super Centre", url: "https://mscpackers.in" },
    },
  });

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
      <LazySection minHeight="200px">
        <Suspense fallback={<div className="min-h-[200px]" />}>
          <Footer />
        </Suspense>
      </LazySection>
    </div>
  );
};

export default Index;
