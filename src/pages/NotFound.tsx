import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSeo } from "@/lib/useSeo";
import { SEO_CATEGORIES } from "@/lib/seoCategories";

const NotFound = () => {
  const location = useLocation();

  useSeo({
    title: "Page Not Found (404) | Mirghaniya Super Centre",
    description:
      "The page you requested could not be found. Browse our wholesale jewellery boxes, trays, pouches, display stands and carry bags instead.",
    path: "/404",
    extraMeta: [{ name: "robots", content: "noindex, follow" }],
  });

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="font-inter text-sm uppercase tracking-widest text-secondary mb-2">Error 404</p>
        <h1 className="font-playfair font-bold text-4xl md:text-5xl text-foreground mb-4">Page not found</h1>
        <p className="font-inter text-muted-foreground mb-10">
          The page you were looking for doesn’t exist or has moved. Try one of these instead.
        </p>

        <h2 className="font-playfair font-semibold text-2xl mb-4">Popular Categories</h2>
        <ul className="flex flex-wrap justify-center gap-3 font-inter text-sm mb-10">
          {SEO_CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link to={`/${c.slug}`} className="inline-block px-3 py-2 rounded-md border hover:bg-accent transition-colors">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="flex flex-wrap justify-center gap-4 font-inter text-sm">
          <li><Link to="/" className="text-primary hover:underline">Home</Link></li>
          <li><Link to="/products" className="text-primary hover:underline">All Products</Link></li>
          <li><Link to="/search" className="text-primary hover:underline">Search</Link></li>
          <li><Link to="/sitemap" className="text-primary hover:underline">Sitemap</Link></li>
          <li><Link to="/contact" className="text-primary hover:underline">Contact</Link></li>
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
