import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import aboutJewelry1 from "@/assets/about-jewelry-1.jpg";
import aboutCraftsmanship from "@/assets/about-craftsmanship.jpg";
import aboutWarehouse from "@/assets/about-warehouse.jpg";
import aboutTeam from "@/assets/about-team.jpg";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-luxury py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair font-bold text-5xl md:text-6xl text-white mb-6">
              About Us
            </h1>
            <p className="font-inter text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Crafting excellence in jewelry packaging since 2010. We believe every piece of jewelry deserves packaging that matches its beauty.
            </p>
          </div>
        </div>

        {/* Our Story Section - Image Right */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <span className="text-primary font-semibold uppercase tracking-wider text-sm">Our Story</span>
                <h2 className="font-playfair font-bold text-4xl md:text-5xl text-foreground mt-2 mb-6">
                  A Legacy of Excellence
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  MIRGHANIYA SUPER CENTRE was founded with a vision to provide premium jewelry
                  packaging solutions that elevate brands and create memorable unboxing experiences.
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Over the years, we've grown to become a trusted partner for jewelry businesses
                  across India and worldwide, known for our commitment to quality, attention to detail,
                  and exceptional customer service. What started as a small family business in Delhi
                  has now become a leading name in the jewelry packaging industry.
                </p>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <img 
                    src={aboutJewelry1} 
                    alt="Premium jewelry packaging products" 
                    className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg hidden md:block">
                    <p className="font-playfair font-bold text-3xl">15+</p>
                    <p className="text-sm opacity-90">Years of Excellence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Craftsmanship Section - Image Left */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative">
                  <img 
                    src={aboutCraftsmanship} 
                    alt="Artisan crafting jewelry box" 
                    className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-secondary text-secondary-foreground p-6 rounded-xl shadow-lg hidden md:block">
                    <p className="font-playfair font-bold text-3xl">100%</p>
                    <p className="text-sm opacity-90">Handcrafted Quality</p>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-primary font-semibold uppercase tracking-wider text-sm">Craftsmanship</span>
                <h2 className="font-playfair font-bold text-4xl md:text-5xl text-foreground mt-2 mb-6">
                  Made with Passion
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  Every product we create is a testament to our dedication to quality craftsmanship.
                  Our skilled artisans combine traditional techniques with modern precision to deliver
                  packaging that truly stands out.
                </p>
                <ul className="space-y-4">
                  {[
                    "Premium materials sourced from trusted suppliers",
                    "Handcrafted attention to every detail",
                    "Quality checks at every production stage",
                    "Eco-friendly options available"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                      </span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section - Image Right */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <span className="text-primary font-semibold uppercase tracking-wider text-sm">Our Mission</span>
                <h2 className="font-playfair font-bold text-4xl md:text-5xl text-foreground mt-2 mb-6">
                  Elevating Every Brand
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  We believe that every piece of jewelry deserves packaging that matches its beauty
                  and value. Our mission is to provide businesses with elegant, high-quality
                  packaging solutions that enhance their brand image and delight their customers.
                </p>
                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className="text-center p-6 bg-muted/50 rounded-xl">
                    <p className="font-playfair font-bold text-3xl text-primary">500+</p>
                    <p className="text-sm text-muted-foreground mt-1">Happy Clients</p>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-xl">
                    <p className="font-playfair font-bold text-3xl text-primary">1M+</p>
                    <p className="text-sm text-muted-foreground mt-1">Products Delivered</p>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-xl">
                    <p className="font-playfair font-bold text-3xl text-primary">50+</p>
                    <p className="text-sm text-muted-foreground mt-1">Product Varieties</p>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-xl">
                    <p className="font-playfair font-bold text-3xl text-primary">Pan India</p>
                    <p className="text-sm text-muted-foreground mt-1">Delivery Network</p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <img 
                  src={aboutWarehouse} 
                  alt="Our warehouse and logistics" 
                  className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Team Section - Image Left */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src={aboutTeam} 
                  alt="Our dedicated team" 
                  className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                />
              </div>
              <div>
                <span className="text-primary font-semibold uppercase tracking-wider text-sm">Our Team</span>
                <h2 className="font-playfair font-bold text-4xl md:text-5xl text-foreground mt-2 mb-6">
                  Dedicated to Your Success
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  Behind every beautiful package is our dedicated team of professionals who work
                  tirelessly to ensure your complete satisfaction. From design to delivery, we're
                  committed to exceeding your expectations.
                </p>
                <div className="bg-gradient-luxury text-white p-6 rounded-xl">
                  <h3 className="font-playfair font-bold text-xl mb-3">Why Choose Us?</h3>
                  <ul className="space-y-2 text-white/90">
                    <li>✓ Competitive pricing without compromising quality</li>
                    <li>✓ Custom solutions tailored to your brand</li>
                    <li>✓ Fast and reliable Pan-India shipping</li>
                    <li>✓ Dedicated customer support team</li>
                    <li>✓ Bulk order discounts available</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-luxury">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-white mb-4">
              Ready to Elevate Your Packaging?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Join thousands of satisfied jewelry businesses who trust us for their packaging needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/products" 
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                Browse Products
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
