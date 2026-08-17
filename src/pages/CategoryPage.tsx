import { useMemo } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { ProductGrid } from "@/components/ProductGrid";
import { useSeo, SITE } from "@/lib/useSeo";
import { SEO_CATEGORIES, faqJsonLd, getSeoCategory, productMatchesCategory } from "@/lib/seoCategories";

const PAGE_SIZE = 24;

const CategoryPage = () => {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  const [searchParams] = useSearchParams();
  const category = getSeoCategory(slug);
  const page = Math.max(1, Number(searchParams.get("page") || 1));

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data;
    },
  });

  const matched = useMemo(() => {
    if (!products || !category) return [];
    return products.filter((p) => productMatchesCategory(p, category));
  }, [products, category]);

  const totalPages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = matched.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const basePath = `/${slug}`;
  const canonicalPath = currentPage > 1 ? `${basePath}?page=${currentPage}` : basePath;
  const pageSuffix = currentPage > 1 ? ` – Page ${currentPage}` : "";

  useSeo({
    title: category ? `${category.title}${pageSuffix}`.slice(0, 70) : "Category — Mirghaniya Super Centre",
    description: category?.description || "Wholesale jewellery packaging from Mirghaniya Super Centre.",
    path: canonicalPath,
    jsonLd: category
      ? [
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: category.name, path: basePath },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: category.h1,
            description: category.description,
            url: `${SITE}${basePath}`,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: pageItems.length,
              itemListElement: pageItems.map((p, i) => ({
                "@type": "ListItem",
                position: (currentPage - 1) * PAGE_SIZE + i + 1,
                name: p.name,
                url: `${SITE}${productPath(p)}`,
              })),
            },
          },
          faqJsonLd(category.faqs),
        ]
      : undefined,
  });

  if (!category) return <Navigate to="/products" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-luxury py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair font-bold text-4xl md:text-5xl text-white mb-4">{category.h1}</h1>
            <p className="font-inter text-lg text-white/90 max-w-2xl mx-auto">{category.intro}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Products", path: "/products" },
              { name: category.name },
            ]}
          />

          {isLoading ? (
            <p className="font-inter text-muted-foreground py-12 text-center">Loading products...</p>
          ) : pageItems.length > 0 ? (
            <>
              <ProductGrid products={pageItems as any} />
              {totalPages > 1 && (
                <nav aria-label="Pagination" className="flex justify-center gap-2 mt-10 font-inter text-sm">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <Link
                      key={n}
                      to={n === 1 ? basePath : `${basePath}?page=${n}`}
                      aria-current={n === currentPage ? "page" : undefined}
                      className={`px-3 py-2 rounded-md border transition-colors ${
                        n === currentPage ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                      }`}
                    >
                      {n}
                    </Link>
                  ))}
                </nav>
              )}
            </>
          ) : (
            <div className="py-6">
              <p className="font-inter text-muted-foreground mb-8">
                {category.name} are made to order for wholesale buyers — call{" "}
                <a href="tel:+918851882465" className="text-primary hover:underline">+91 88518 82465</a> or send an
                enquiry for current designs, sizes and rates. In the meantime, here are products currently in stock.
              </p>
              <h2 className="font-playfair font-bold text-2xl text-foreground mb-6">Currently Available Products</h2>
              <ProductGrid products={(products || []).slice(0, 8) as any} />
              <p className="font-inter text-sm text-muted-foreground mt-6">
                <Link to="/products" className="text-primary hover:underline">Browse the full catalogue</Link>
              </p>
            </div>
          )}

          <FaqSection faqs={category.faqs} heading={`${category.name} — Frequently Asked Questions`} />

          <section className="mt-16" aria-labelledby="other-categories">
            <h2 id="other-categories" className="font-playfair font-bold text-2xl text-foreground mb-4">
              Explore Other Categories
            </h2>
            <ul className="flex flex-wrap gap-3 font-inter text-sm">
              {SEO_CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => (
                <li key={c.slug}>
                  <Link to={`/${c.slug}`} className="inline-block px-3 py-2 rounded-md border hover:bg-accent transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/products" className="inline-block px-3 py-2 rounded-md border hover:bg-accent transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
