import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";
import aboutJewelry1 from "@/assets/about-jewelry-1.jpg";
import aboutCraftsmanship from "@/assets/about-craftsmanship.jpg";
import aboutWarehouse from "@/assets/about-warehouse.jpg";
import aboutTeam from "@/assets/about-team.jpg";

const About = () => {
  useEffect(() => {
    document.title = "About Mirghaniya Super Centre | Leading Jewellery Packaging Supplier in Delhi Since 1990";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Learn about Mirghaniya Super Centre – Delhi's premier wholesale jewellery packaging supplier since 1990. 500+ happy clients, 1M+ products delivered, 100+ varieties of jewellery boxes, display stands, trays & pouches with Pan-India shipping.");
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-luxury py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair font-bold text-5xl md:text-6xl text-white mb-6">
              About Mirghaniya Super Centre
            </h1>
            <p className="font-inter text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              India's trusted wholesale supplier of premium jewellery packaging boxes, display stands, trays, pouches and gift items — crafting excellence since 1990.
            </p>
          </div>
        </div>

        {/* Our Story Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <span className="text-primary font-semibold uppercase tracking-wider text-sm">Our Story</span>
                <h2 className="font-playfair font-bold text-4xl md:text-5xl text-foreground mt-2 mb-6">
                  30+ Years as Delhi's Leading Jewellery Packaging Supplier
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  Founded in 1990 in Usmanpur, Delhi, <strong>Mirghaniya Super Centre</strong> began as a small
                  family business with a clear vision: to provide premium jewellery packaging solutions that help
                  jewellery shops and wholesalers elevate their brand presentation.
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  Over three decades, we've grown into one of India's most trusted <strong>jewellery packaging wholesalers</strong>,
                  serving 500+ satisfied clients across the country. From <strong>velvet ring boxes</strong> and
                  <strong> necklace display stands</strong> to <strong>custom printed gift boxes</strong> and
                  <strong> eco-friendly pouches</strong>, we offer everything a jewellery business needs.
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  What sets us apart is our commitment to quality at affordable prices, our extensive catalogue of
                  100+ product varieties, and reliable <strong>Pan-India shipping</strong> that ensures your packaging
                  arrives on time, every time.
                </p>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <img
                    src={aboutJewelry1}
                    alt="Premium jewellery packaging boxes and display items by Mirghaniya Super Centre"
                    className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                    width={600}
                    height={450}
                    loading="eager"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg hidden md:block">
                    <p className="font-playfair font-bold text-3xl">30+</p>
                    <p className="text-sm opacity-90">Years of Excellence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Craftsmanship Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative">
                  <img
                    src={aboutCraftsmanship}
                    alt="Artisan handcrafting premium velvet jewellery box at Mirghaniya workshop"
                    className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                    width={600}
                    height={450}
                    loading="lazy"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-secondary text-secondary-foreground p-6 rounded-xl shadow-lg hidden md:block">
                    <p className="font-playfair font-bold text-3xl">100%</p>
                    <p className="text-sm opacity-90">Quality Assured</p>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-primary font-semibold uppercase tracking-wider text-sm">Craftsmanship & Quality</span>
                <h2 className="font-playfair font-bold text-4xl md:text-5xl text-foreground mt-2 mb-6">
                  Handcrafted Jewellery Packaging Made with Passion
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  Every <strong>jewellery box</strong>, <strong>display stand</strong>, and <strong>packaging pouch</strong> we
                  produce is a testament to our dedication to quality craftsmanship. Our skilled artisans combine traditional
                  Indian handcraft techniques with modern manufacturing precision to deliver packaging that truly stands out
                  on your showroom counter.
                </p>
                <ul className="space-y-4">
                  {[
                    "Premium materials — velvet, leather, wood, acrylic & eco-friendly options",
                    "Rigorous quality checks at every production stage",
                    "Custom branding, printing & logo embossing available",
                    "Bulk order discounts for jewellery wholesalers & retailers"
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

        {/* Products & Mission Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <span className="text-primary font-semibold uppercase tracking-wider text-sm">Our Products & Mission</span>
                <h2 className="font-playfair font-bold text-4xl md:text-5xl text-foreground mt-2 mb-6">
                  100+ Varieties of Jewellery Packaging & Display Solutions
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  We stock a comprehensive range of <strong>jewellery packaging products</strong> including ring boxes,
                  earring boxes, necklace boxes, bangle boxes, pendant boxes, watch boxes, bracelet boxes, mangalsutra boxes,
                  anklet boxes, and premium gift boxes. Our <strong>display solutions</strong> include T-bar stands, bust stands,
                  necklace stands, earring trees, rotating stands, countertop displays, and showcase trays in velvet, foam,
                  and leatherette finishes.
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
                    <p className="font-playfair font-bold text-3xl text-primary">100+</p>
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
                  alt="Mirghaniya Super Centre warehouse with jewellery packaging inventory ready for Pan-India shipping"
                  className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                  width={600}
                  height={450}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src={aboutTeam}
                  alt="Mirghaniya Super Centre team of jewellery packaging experts in Delhi"
                  className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                  width={600}
                  height={450}
                  loading="lazy"
                />
              </div>
              <div>
                <span className="text-primary font-semibold uppercase tracking-wider text-sm">Our Team</span>
                <h2 className="font-playfair font-bold text-4xl md:text-5xl text-foreground mt-2 mb-6">
                  Why Jewellers Across India Choose Mirghaniya Super Centre
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  Behind every beautifully crafted jewellery box and display stand is our dedicated team of professionals
                  who work tirelessly to ensure your complete satisfaction. From custom design consultation to express
                  delivery across India, we're committed to exceeding your expectations at every step.
                </p>
                <div className="bg-gradient-luxury text-white p-6 rounded-xl">
                  <h3 className="font-playfair font-bold text-xl mb-3">Why Choose Mirghaniya Super Centre?</h3>
                  <ul className="space-y-2 text-white/90">
                    <li>✓ Competitive wholesale pricing without compromising quality</li>
                    <li>✓ Custom solutions — logo printing, embossing & bespoke designs</li>
                    <li>✓ Fast and reliable Pan-India shipping via trusted couriers</li>
                    <li>✓ Dedicated customer support team available Mon–Sat</li>
                    <li>✓ Bulk order discounts for jewellery shops & wholesalers</li>
                    <li>✓ Eco-friendly and sustainable packaging options</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-foreground text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "What types of jewellery packaging does Mirghaniya Super Centre offer?",
                  a: "We offer a complete range including ring boxes, earring boxes, necklace boxes, pendant boxes, bangle boxes, watch boxes, bracelet boxes, gift boxes, velvet pouches, satin pouches, display trays, T-bar stands, bust stands, necklace stands, earring trees, rotating display stands, and much more — over 100 product varieties in total."
                },
                {
                  q: "Do you offer custom branding and logo printing on jewellery boxes?",
                  a: "Yes! We provide custom logo printing, gold/silver foil embossing, custom colour options, and bespoke packaging designs tailored to your jewellery brand. Minimum order quantities apply for custom orders."
                },
                {
                  q: "Do you deliver jewellery packaging across India?",
                  a: "Absolutely. We ship to all major cities and towns across India via reliable courier services. Whether you're in Delhi, Mumbai, Kolkata, Chennai, Bangalore, Hyderabad, Jaipur, Surat, or any other city — we deliver to your doorstep."
                },
                {
                  q: "What are your minimum order quantities for wholesale jewellery packaging?",
                  a: "Minimum order quantities vary by product. For standard jewellery boxes, we accept orders from as low as 50 pieces. For custom printed or branded packaging, minimum quantities may be higher. Contact us for specific product MOQs."
                },
                {
                  q: "Where is Mirghaniya Super Centre located?",
                  a: "Our showroom and warehouse is located in Usmanpur, Delhi - 110053, India. You can visit us Monday through Saturday, 10 AM to 8 PM, or order online for convenient delivery anywhere in India."
                }
              ].map((faq, i) => (
                <div key={i} className="bg-muted/30 p-6 rounded-xl">
                  <h3 className="font-semibold text-lg text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-luxury">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-white mb-4">
              Ready to Elevate Your Jewellery Packaging?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Join 500+ satisfied jewellery businesses across India who trust Mirghaniya Super Centre for their packaging and display needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                Browse Our Products
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Get a Custom Quote
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
