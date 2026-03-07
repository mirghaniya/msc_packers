import { lazy, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroCarousel } from "@/components/HeroCarousel";

const FeaturedProducts = lazy(() => import("@/components/FeaturedProducts").then(m => ({ default: m.FeaturedProducts })));
const PromotionalBanner = lazy(() => import("@/components/PromotionalBanner").then(m => ({ default: m.PromotionalBanner })));
const BrandCarousel = lazy(() => import("@/components/BrandCarousel").then(m => ({ default: m.BrandCarousel })));
const TestimonialSlider = lazy(() => import("@/components/TestimonialSlider").then(m => ({ default: m.TestimonialSlider })));

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroCarousel />
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <FeaturedProducts />
          <PromotionalBanner />
          <BrandCarousel />
          <TestimonialSlider />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;