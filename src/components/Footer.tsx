import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { SEO_CATEGORIES } from "@/lib/seoCategories";
const MSME_LOGO_URL =
  "https://fjpunfvhezivlhyrnyym.supabase.co/storage/v1/object/public/product-images/site/msme-logo.png?width=320&quality=80&format=webp";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-playfair font-bold text-xl">MIRGHANIYA SUPER CENTRE</h3>
            <p className="text-sm opacity-90 font-inter">
              Premium jewelry packaging and display solutions for businesses worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-playfair font-semibold text-lg">Quick Links</h4>
            <ul className="grid grid-cols-2 gap-2 font-inter">
              <li>
                <Link to="/" className="text-sm hover:text-secondary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm hover:text-secondary transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-secondary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/guides/custom-jewellery-packaging" className="text-sm hover:text-secondary transition-colors">
                  Guide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-secondary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm hover:text-secondary transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="text-sm hover:text-secondary transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-playfair font-semibold text-lg">Contact Us</h4>
            <ul className="space-y-2 font-inter">
              <li className="flex items-start space-x-2 text-sm">
                <Phone className="h-4 w-4 mt-0.5" />
                <span className="flex flex-col">
                  <a href="tel:+918851882465" className="hover:text-secondary transition-colors">+91 88518 82465</a>
                  <a href="tel:+919313931002" className="hover:text-secondary transition-colors">+91 93139 31002</a>
                </span>
              </li>
              <li className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>mirghaniyasupetcentre@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>Usmanpur, Delhi, India - 110053</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="font-playfair font-semibold text-lg">Follow Us</h4>
            <a
              href="https://www.instagram.com/mirghaniyasupercentre/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-secondary transition-colors"
            >
              <Instagram className="h-6 w-6" />
              <span className="text-sm font-inter">@mirghaniyasupercentre</span>
            </a>
            <div className="pt-4 flex justify-center md:justify-start">
              <img
                src={MSME_LOGO_URL}
                alt="Ministry of MSME, Government of India - Registered MSME Logo"
                width={160}
                height={80}
                loading="lazy"
                className="w-32 sm:w-36 md:w-40 h-auto object-contain brightness-0 invert"
              />
            </div>
          </div>
        </div>

        <nav aria-label="Product categories" className="mt-8 pt-8 border-t border-background/20">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-inter text-sm opacity-90">
            {SEO_CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/${c.slug}`} className="hover:text-secondary transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 pt-8 border-t border-background/20 text-center">
          <p className="text-sm opacity-90 font-inter">
            © {new Date().getFullYear()} MIRGHANIYA SUPER CENTRE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};