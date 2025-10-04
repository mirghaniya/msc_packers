import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { TestimonialSlider } from "@/components/TestimonialSlider";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturedProducts />
        <PromotionalBanner />
        <TestimonialSlider />
      </main>
      <Footer />
    </div>
  );
};

export default Index;