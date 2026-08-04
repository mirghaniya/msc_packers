import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductSearch } from "@/components/ProductSearch";
import { useSeo, SITE } from "@/lib/useSeo";
import { SEO_CATEGORIES } from "@/lib/seoCategories";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data;
    },
  });

  const results = useMemo(() => {
    if (!products) return [];
    if (!q) return products.slice(0, 24);
    const needle = q.toLowerCase();
    return products.filter((p) =>
      [p.name, p.description, p.sr_number, p.category].some((f) => (f || "").toLowerCase().includes(needle)),
    );
  }, [products, q]);

  useSeo({
    title: q
      ? `Search: ${q} | Jewellery Packaging`.slice(0, 60)
      : "Search Jewellery Packaging & Display Products",
    description: q
      ? `Search results for "${q}" — wholesale jewellery boxes, trays, pouches, display stands and carry bags from Mirghaniya Super Centre, Delhi.`.slice(0, 158)
      : "Search our full catalogue of wholesale jewellery boxes, ring boxes, trays, pouches, display stands and carry bags. Pan-India delivery from Delhi.",
    path: q ? `/search?q=${encodeURIComponent(q)}` : "/search",
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Search", path: "/search" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        name: q ? `Search results for ${q}` : "Product search",
        url: `${SITE}/search`,
      },
    ],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Search" }]} />
        <h1 className="font-playfair font-bold text-3xl md:text-4xl text-foreground mb-6">
          {q ? `Search results for “${q}”` : "Search Jewellery Packaging"}
        </h1>
        <div className="mb-8 max-w-xl">
          <ProductSearch
            onSearch={(value: string) => {
              const next = new URLSearchParams(searchParams);
              if (value.trim()) next.set("q", value.trim());
              else next.delete("q");
              setSearchParams(next, { replace: true });
            }}
          />
        </div>

        {isLoading ? (
          <p className="font-inter text-muted-foreground">Loading products...</p>
        ) : results.length > 0 ? (
          <ProductGrid products={results as any} />
        ) : (
          <p className="font-inter text-muted-foreground">No products matched your search.</p>
        )}

        <section className="mt-16" aria-labelledby="search-categories">
          <h2 id="search-categories" className="font-playfair font-bold text-2xl text-foreground mb-4">
            Popular Categories
          </h2>
          <ul className="flex flex-wrap gap-3 font-inter text-sm">
            {SEO_CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/${c.slug}`} className="inline-block px-3 py-2 rounded-md border hover:bg-accent transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
