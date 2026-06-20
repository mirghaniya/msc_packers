import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSeo } from "@/lib/useSeo";
import { Link } from "react-router-dom";
import { CheckCircle, Box, Printer, Truck, Sparkles, Package, Palette } from "lucide-react";
import guideHero from "@/assets/guide-packaging-hero.jpg";

const FAQS = [
  {
    q: "What is the minimum order quantity for custom jewellery boxes?",
    a: "For standard custom jewellery boxes with logo printing, our MOQ starts at 100 pieces. For premium rigid boxes with foil embossing, the minimum is typically 200 pieces. Velvet pouches and satin bags can be customised from as low as 50 pieces. Contact us for exact quotes based on your design."
  },
  {
    q: "How long does it take to manufacture custom jewellery packaging?",
    a: "Standard custom orders take 10-15 business days after design approval. For large bulk orders above 1,000 pieces, production time may extend to 3-4 weeks. Rush orders are available at an additional cost. We deliver across India via reliable courier partners."
  },
  {
    q: "Which material is best for luxury jewellery packaging?",
    a: "Rigid cardboard with velvet or suede lining is the gold standard for luxury jewellery packaging. It offers excellent protection, a premium unboxing experience, and holds embossing beautifully. For mid-range budgets, high-quality coated paper boxes with foam inserts are a popular choice."
  },
  {
    q: "Can you deliver custom packaging to cities outside Delhi?",
    a: "Absolutely. We are a Delhi-based manufacturer with a Pan-India delivery network. We ship custom jewellery packaging to Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Jaipur, Surat, Pune, Ahmedabad, and every major city and town across India."
  }
];

const CustomJewelleryPackagingGuide = () => {
  useSeo({
    title: "Custom Jewellery Packaging for Startups — Delhi Manufacturer | Mirghaniya Super Centre",
    description: "Learn how to package jewellery for sale with custom boxes, velvet pouches & logo embossing. Delhi manufacturer offering Pan-India delivery. MOQs from 50 pieces.",
    path: "/guides/custom-jewellery-packaging",
    image: "https://mirghaniyasupercentre.lovable.app" + guideHero,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Custom Jewellery Packaging for Startups: A Complete Guide",
      description: "Learn how small businesses can use custom boxes and branding to elevate their product presentation. Covers material choices, logo embossing, and minimum order quantities.",
      author: {
        "@type": "Organization",
        name: "Mirghaniya Super Centre",
        url: "https://mirghaniyasupercentre.lovable.app"
      },
      publisher: {
        "@type": "Organization",
        name: "Mirghaniya Super Centre",
        logo: {
          "@type": "ImageObject",
          url: "https://fjpunfvhezivlhyrnyym.supabase.co/storage/v1/object/public/product-images/logo/logo.png"
        }
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://mirghaniyasupercentre.lovable.app/guides/custom-jewellery-packaging"
      }
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative">
          <img
            src={guideHero}
            alt="Custom jewellery packaging boxes and pouches arranged for display"
            className="w-full h-[300px] md:h-[400px] object-cover"
            width={1200}
            height={600}
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <span className="inline-block px-3 py-1 bg-primary/90 text-white text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
                Guide
              </span>
              <h1 className="font-playfair font-bold text-3xl md:text-5xl text-white mb-4 leading-tight">
                Custom Jewellery Packaging for Startups
              </h1>
              <p className="text-white/90 text-base md:text-lg max-w-2xl">
                How small businesses can use custom boxes, velvet pouches and logo embossing to elevate product presentation and build a memorable brand.
              </p>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Custom Jewellery Packaging Guide</span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Intro */}
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed text-lg">
              For jewellery startups and small businesses, packaging is not just a container — it is a powerful branding tool that shapes first impressions, builds trust, and encourages repeat purchases. Whether you sell handmade silver earrings online or run a boutique jewellery store in Jaipur, the right <strong>custom jewellery packaging</strong> can set your brand apart from competitors.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg mt-4">
              At <strong>Mirghaniya Super Centre</strong>, a Delhi-based jewellery packaging manufacturer with over three decades of experience, we have helped more than 500 jewellery businesses across India design packaging that reflects their brand identity. In this guide, we share everything you need to know about <strong>how to package jewellery for sale</strong>, from material choices and logo embossing techniques to minimum order quantities and Pan-India delivery.
            </p>
          </div>

          {/* Why Custom Packaging Matters */}
          <section className="mt-16">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-foreground mb-6">
              Why Custom Jewellery Packaging Matters for Startups
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[
                {
                  icon: Sparkles,
                  title: "First Impressions",
                  desc: "Beautiful packaging creates an unboxing experience that customers remember and share on social media."
                },
                {
                  icon: Package,
                  title: "Brand Recognition",
                  desc: "Consistent colours, logos and materials make your brand instantly recognisable in a crowded market."
                },
                {
                  icon: Box,
                  title: "Product Protection",
                  desc: "Quality boxes and inserts prevent scratches, tarnish and damage during shipping and storage."
                }
              ].map((item, i) => (
                <div key={i} className="bg-muted/30 p-6 rounded-xl">
                  <item.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Material Choices */}
          <section className="mt-16">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-foreground mb-6">
              Material Choices: Velvet vs. Rigid Boxes vs. Pouches
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              Choosing the right material is the foundation of effective jewellery packaging. Each option offers a different balance of cost, luxury feel and durability. Here is how the most popular materials compare for Indian jewellery startups.
            </p>

            <div className="space-y-6">
              {/* Velvet Boxes */}
              <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Palette className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-bold text-xl text-foreground mb-2">Velvet Jewellery Boxes</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Velvet boxes are the most popular choice for Indian jewellery brands. The soft, plush interior protects delicate pieces from scratches while the exterior exudes luxury. Available in classic colours like maroon, navy, black and royal blue, velvet boxes are ideal for rings, earrings, pendants and bangles.
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Best for: Rings, earrings, pendants, small necklaces",
                        "Price range: Budget-friendly to mid-range",
                        "Customisation: Logo printing, foil stamping, ribbon closures",
                        "MOQ: 50 pieces for standard sizes"
                      ].map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Rigid Boxes */}
              <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Box className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-bold text-xl text-foreground mb-2">Rigid (Setup) Boxes</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Rigid boxes, also known as setup boxes, are thick cardboard boxes wrapped in premium paper or fabric. They offer unmatched structural strength and a high-end feel that elevates even simple jewellery pieces. These are the go-to choice for luxury brands and high-value gift sets.
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Best for: Premium necklaces, watch sets, bridal jewellery, gift boxes",
                        "Price range: Mid-range to premium",
                        "Customisation: Full-colour printing, foil embossing, magnetic closures, ribbon pulls",
                        "MOQ: 200 pieces for custom designs"
                      ].map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Pouches */}
              <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-playfair font-bold text-xl text-foreground mb-2">Velvet & Satin Pouches</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Pouches are a versatile, lightweight option perfect for e-commerce brands that need to minimise shipping costs. They can be used as primary packaging for lower-value items or as secondary protection inside rigid boxes. Drawstring pouches in velvet, satin or organza are favourites among modern Indian jewellery startups.
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Best for: E-commerce shipping, budget jewellery, add-on packaging",
                        "Price range: Highly economical",
                        "Customisation: Screen printing, gold/silver logo foil, custom drawstrings",
                        "MOQ: 100 pieces for custom printing"
                      ].map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="mt-16">
            <h3 className="font-playfair font-bold text-2xl text-foreground mb-6">Quick Comparison: Which Packaging is Right for You?</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                    <th className="text-left p-4 font-semibold text-foreground">Velvet Box</th>
                    <th className="text-left p-4 font-semibold text-foreground">Rigid Box</th>
                    <th className="text-left p-4 font-semibold text-foreground">Pouch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Luxury Feel", "High", "Very High", "Moderate"],
                    ["Protection", "Good", "Excellent", "Basic"],
                    ["Cost per Unit", "Low", "Medium-High", "Very Low"],
                    ["Custom Logo", "Yes", "Yes", "Yes"],
                    ["Shipping Weight", "Light", "Heavier", "Very Light"],
                    ["Best For", "Daily wear jewellery", "Premium & bridal", "Budget / online"]
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                      {row.map((cell, j) => (
                        <td key={j} className="p-4 text-muted-foreground">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Logo Embossing */}
          <section className="mt-16">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-foreground mb-6">
              Logo Embossing & Printing Techniques for Jewellery Boxes
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              Your logo is the face of your brand. On jewellery packaging, it needs to be crisp, elegant and durable. At our Delhi manufacturing facility, we offer several branding techniques tailored to different materials and budgets.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Printer,
                  title: "Gold & Silver Foil Stamping",
                  desc: "The most popular choice for luxury jewellery packaging. A heated die presses metallic foil onto the box surface, creating a reflective, tactile impression that catches light beautifully. Works best on rigid boxes and velvet lids."
                },
                {
                  icon: Printer,
                  title: "Screen Printing",
                  desc: "Ideal for bold, colourful logos on velvet boxes and pouches. This technique uses mesh screens to transfer ink directly onto the material. It is cost-effective for medium-volume orders and allows for multi-colour designs."
                },
                {
                  icon: Printer,
                  title: "Debossing & Embossing",
                  desc: "Creates a three-dimensional effect by pressing the logo into (deboss) or out of (emboss) the box surface. Best suited for rigid cardboard and leatherette materials. No ink is used, giving a subtle, sophisticated finish."
                },
                {
                  icon: Printer,
                  title: "UV Printing",
                  desc: "A modern digital technique that cures ink instantly with ultraviolet light. UV printing supports photorealistic images, gradients and fine details. It is perfect for full-colour artwork on paper-wrapped rigid boxes."
                }
              ].map((item, i) => (
                <div key={i} className="bg-muted/30 p-6 rounded-xl">
                  <item.icon className="h-6 w-6 text-primary mb-3" />
                  <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* MOQ Section */}
          <section className="mt-16">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-foreground mb-6">
              Minimum Order Quantities (MOQ) for Custom Jewellery Packaging
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              One of the biggest concerns for startups is whether manufacturers will accept small orders. As a Delhi-based jewellery packaging supplier that works extensively with emerging brands, we have structured our MOQs to be startup-friendly while keeping per-unit costs competitive.
            </p>

            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { product: "Velvet Ring Boxes", moq: "50 pcs", price: "₹45–₹120 each" },
                  { product: "Velvet Earring Boxes", moq: "50 pcs", price: "₹35–₹90 each" },
                  { product: "Rigid Necklace Boxes", moq: "200 pcs", price: "₹120–₹300 each" },
                  { product: "Velvet Drawstring Pouches", moq: "100 pcs", price: "₹15–₹40 each" },
                  { product: "Satin Pouches (Custom Logo)", moq: "100 pcs", price: "₹20–₹50 each" },
                  { product: "Premium Gift Box Sets", moq: "100 pcs", price: "₹180–₹450 each" }
                ].map((item, i) => (
                  <div key={i} className="bg-card rounded-lg p-4 border border-border">
                    <p className="font-semibold text-foreground text-sm">{item.product}</p>
                    <p className="text-primary font-bold mt-1">MOQ: {item.moq}</p>
                    <p className="text-muted-foreground text-xs mt-1">{item.price}</p>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-sm mt-6">
                Prices vary based on size, material grade, customisation complexity and order volume. Bulk orders above 500 pieces receive significant discounts. Contact us for a detailed quotation tailored to your brand.
              </p>
            </div>
          </section>

          {/* Pan-India Delivery */}
          <section className="mt-16">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-foreground mb-6">
              Pan-India Delivery from Delhi
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-6">
              Being located in Delhi, India&apos;s largest wholesale jewellery packaging hub, gives us a strategic advantage. We ship to every state and union territory through trusted courier and logistics partners. Whether your business is in Mumbai, Bangalore, Hyderabad, Kolkata, Jaipur, Surat or a smaller town, your custom packaging will reach you safely and on time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Truck, title: "All-India Shipping", desc: "We deliver to every pincode in India through DTDC, Delhivery, Blue Dart and India Post." },
                { icon: Box, title: "Secure Packaging", desc: "Your custom boxes are packed in corrugated cartons with bubble wrap to prevent transit damage." },
                { icon: CheckCircle, title: "Order Tracking", desc: "Receive tracking numbers for every shipment so you and your customers know exactly when orders will arrive." },
                { icon: Sparkles, title: "Sample Orders", desc: "Not sure what you need? Order a sample kit with material swatches and print quality references before committing to a bulk order." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-muted/30 p-4 rounded-lg">
                  <item.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                    <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-16">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-foreground mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-muted/30 p-6 rounded-xl">
                  <h3 className="font-semibold text-lg text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-playfair font-bold text-2xl md:text-3xl text-white mb-4">
              Ready to Create Your Custom Jewellery Packaging?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Get in touch with Mirghaniya Super Centre for a free consultation and quotation. We help startups design packaging that sells.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                Browse Products
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Get a Custom Quote
              </Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default CustomJewelleryPackagingGuide;
