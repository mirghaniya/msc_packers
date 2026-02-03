import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroCarousel } from "@/components/HeroCarousel";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { TestimonialSlider } from "@/components/TestimonialSlider";
import { BrandCarousel } from "@/components/BrandCarousel";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroCarousel />
        <FeaturedProducts />
        <PromotionalBanner />
        <BrandCarousel />
        <TestimonialSlider />
      </main>
      <Footer />
    </div>
  );
};

export default Index;