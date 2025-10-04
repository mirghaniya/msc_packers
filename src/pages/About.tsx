import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-luxury py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair font-bold text-5xl text-white mb-4">
              About Us
            </h1>
            <p className="font-inter text-lg text-white/90 max-w-2xl mx-auto">
              Crafting excellence in jewelry packaging since 2010
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-8 font-inter">
            <div>
              <h2 className="font-playfair font-bold text-3xl text-foreground mb-4">
                Our Story
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                MIRGHANIYA SUPER CENTRE was founded with a vision to provide premium jewelry
                packaging solutions that elevate brands and create memorable unboxing experiences.
                Over the years, we've grown to become a trusted partner for jewelry businesses
                worldwide, known for our commitment to quality and attention to detail.
              </p>
            </div>

            <div>
              <h2 className="font-playfair font-bold text-3xl text-foreground mb-4">
                Our Mission
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We believe that every piece of jewelry deserves packaging that matches its beauty
                and value. Our mission is to provide businesses with elegant, high-quality
                packaging solutions that enhance their brand image and delight their customers.
              </p>
            </div>

            <div>
              <h2 className="font-playfair font-bold text-3xl text-foreground mb-4">
                Why Choose Us
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Premium materials and exquisite craftsmanship</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Custom solutions tailored to your brand</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Competitive pricing without compromising quality</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Worldwide shipping and excellent customer support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;