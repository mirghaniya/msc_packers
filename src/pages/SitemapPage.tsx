import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { useSeo } from "@/lib/useSeo";
import { SEO_CATEGORIES } from "@/lib/seoCategories";
import { productPath } from "@/lib/slug";

const PAGES = [
  { path: "/", name: "Home" },
  { path: "/products", name: "All Products" },
  { path: "/search", name: "Search Products" },
  { path: "/guides/custom-jewellery-packaging", name: "Custom Jewellery Packaging Guide" },
  { path: "/about", name: "About Us" },
  { path: "/contact", name: "Contact Us" },
];

const SitemapPage = () => {
  const { data: products } = useQuery({
    queryKey: ["products", "sitemap"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id,name,slug,category").order("name");
      if (error) throw error;
      return data;
    },
  });

  useSeo({
    title: "Sitemap | Mirghaniya Super Centre",
    description:
      "HTML sitemap of Mirghaniya Super Centre — browse every jewellery packaging category, product page and guide in one place.",
    path: "/sitemap",
    jsonLd: breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Sitemap", path: "/sitemap" }]),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Sitemap" }]} />
        <h1 className="font-playfair font-bold text-3xl md:text-4xl text-foreground mb-8">Sitemap</h1>

        <section className="mb-10" aria-labelledby="sitemap-pages">
          <h2 id="sitemap-pages" className="font-playfair font-semibold text-2xl mb-3">Pages</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 font-inter text-sm">
            {PAGES.map((p) => (
              <li key={p.path}>
                <Link to={p.path} className="text-primary hover:underline">{p.name}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10" aria-labelledby="sitemap-categories">
          <h2 id="sitemap-categories" className="font-playfair font-semibold text-2xl mb-3">Categories</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 font-inter text-sm">
            {SEO_CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/${c.slug}`} className="text-primary hover:underline">{c.name}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sitemap-products">
          <h2 id="sitemap-products" className="font-playfair font-semibold text-2xl mb-3">Products</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 font-inter text-sm">
            {(products || []).map((p) => (
              <li key={p.id}>
                <Link to={productPath(p)} className="text-primary hover:underline">{p.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SitemapPage;
