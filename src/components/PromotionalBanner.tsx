import { Award, Shield, Sparkles } from "lucide-react";

export const PromotionalBanner = () => {
  return (
    <section className="py-20 bg-gradient-luxury">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-playfair font-bold text-4xl md:text-5xl text-white mb-4">
            Why Choose Us
          </h2>
          <p className="font-inter text-lg text-white/90 max-w-2xl mx-auto">
            Experience unparalleled quality and service with every purchase
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-6">
              <Award className="h-8 w-8 text-foreground" />
            </div>
            <h3 className="font-playfair font-semibold text-2xl text-white mb-4">
              Premium Quality
            </h3>
            <p className="font-inter text-white/80">
              Handcrafted with the finest materials to ensure lasting elegance
            </p>
          </div>

          <div
            className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-6">
              <Shield className="h-8 w-8 text-foreground" />
            </div>
            <h3 className="font-playfair font-semibold text-2xl text-white mb-4">
              Trusted Worldwide
            </h3>
            <p className="font-inter text-white/80">
              Serving businesses globally with reliable shipping and support
            </p>
          </div>

          <div
            className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-6">
              <Sparkles className="h-8 w-8 text-foreground" />
            </div>
            <h3 className="font-playfair font-semibold text-2xl text-white mb-4">
              Custom Solutions
            </h3>
            <p className="font-inter text-white/80">
              Tailored packaging options to match your brand identity
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};