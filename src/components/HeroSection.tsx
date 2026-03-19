import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
const heroImage = "/images/hero-bg.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <h1 className="font-playfair font-bold text-5xl md:text-6xl lg:text-7xl text-white mb-6 animate-fade-in">
            Luxury Jewelry Packaging
          </h1>
          <p className="font-inter text-lg md:text-xl text-white/90 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Elevate your brand with our premium packaging and display solutions. Exquisite quality meets sophisticated design.
          </p>
          <Link to="/products">
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-foreground font-inter font-semibold group animate-fade-in shadow-elegant"
              style={{ animationDelay: "0.2s" }}
            >
              Explore Collection
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};