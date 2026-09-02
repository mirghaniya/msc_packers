import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Filter, Phone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { productPath } from "@/lib/slug";
import { ProductShareButton } from "@/components/ProductShareButton";
import { useFavorites } from "@/hooks/useFavorites";
import { Link } from "react-router-dom";
import { ProductSearch } from "@/components/ProductSearch";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSeo } from "@/lib/useSeo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { SEO_CATEGORIES, faqJsonLd } from "@/lib/seoCategories";

const PRODUCTS_FAQS = [
  { q: "What is the minimum order quantity?", a: "Our minimum order quantity is 100 pieces per design across all jewellery packaging products." },
  { q: "Do you deliver across India?", a: "Yes, we dispatch Pan-India from our Delhi facility, and we also handle bulk export enquiries." },
  { q: "Can packaging be customised with our brand?", a: "Yes, logo printing, foil stamping and custom sizes are available on bulk orders." },
  { q: "How do I get a wholesale price list?", a: "Call us on +91 88518 82465 or send an enquiry from any product page and we will share current wholesale rates." },
];

const Products = () => {
  useSeo({
    title: "Jewellery Packaging & Display Products | Wholesale Online",
    description:
      "Browse wholesale jewellery boxes, ring boxes, necklace boxes, display stands, trays, pouches and carry bags. Filter by category and order with Pan-India delivery.",
    path: "/products",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://mscpackers.in/" },
          { "@type": "ListItem", position: 2, name: "Products", item: "https://mscpackers.in/products" },
        ],
      },
      faqJsonLd(PRODUCTS_FAQS),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Jewellery Packaging & Display Products",
        url: "https://mscpackers.in/products",
      },
    ],
  });
  const [category, setCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get("sort") || "newest";
  const setSort = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "newest") next.delete("sort");
    else next.set("sort", value);
    setSearchParams(next, { replace: true });
  };
  const { addToCart, isLoading: isAddingToCart } = useCart();
  const { toggleFavorite, isFavorite, isPending: isFavoritePending } = useFavorites();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", category, sort],
    queryFn: async () => {
      let query = supabase.from("products").select("*");
      if (category !== "all") {
        query = query.eq("category", category as any);
      }
      switch (sort) {
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "price-low-to-high":
          query = query.order("price", { ascending: true });
          break;
        case "price-high-to-low":
          query = query.order("price", { ascending: false });
          break;
        case "name-a-to-z":
          query = query.order("name", { ascending: true });
          break;
        case "name-z-to-a":
          query = query.order("name", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.sr_number.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [products, searchQuery]);

  const getEnquiryUrl = (productName: string) => {
    const message = encodeURIComponent(`Hi, I would like to enquire about: ${productName}`);
    return `https://wa.me/918851882465?text=${message}`;
  };

  const clearFilters = () => {
    setCategory("all");
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-2 block">Sort By</Label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="price-low-to-high">Price: Low to High</SelectItem>
            <SelectItem value="price-high-to-low">Price: High to Low</SelectItem>
            <SelectItem value="name-a-to-z">Name: A to Z</SelectItem>
            <SelectItem value="name-z-to-a">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium mb-2 block">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {category !== "all" && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear Filter
        </Button>
      )}
    </div>
  );

  const isDisplayStand = (cat: string) => cat === "Display Stands";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-luxury py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair font-bold text-5xl text-white mb-4">
              Jewellery Packaging & Display Stand Collection
            </h1>
            <p className="font-inter text-lg text-white/90 max-w-2xl mx-auto">
              Browse our exquisite selection of jewelry packaging and display solutions
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Products" }]} />

          <nav aria-label="Product categories" className="mb-8">
            <ul className="flex flex-wrap gap-3 font-inter text-sm">
              {SEO_CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link to={`/${c.slug}`} className="inline-block px-3 py-2 rounded-md border hover:bg-accent transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-4 bg-card rounded-lg border p-6">
                <h2 className="font-playfair font-semibold text-lg mb-4">Filters</h2>
                <FilterContent />
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <ProductSearch onSearch={setSearchQuery} />
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle className="font-playfair">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <p className="font-inter text-muted-foreground">Loading products...</p>
                </div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="group overflow-hidden hover:shadow-elegant transition-all duration-300"
                    >
                      <CardContent className="p-0">
                        <Link to={productPath(product)}>
                          <div className="relative overflow-hidden aspect-square">
                            <img
                              src={getOptimizedImageUrl(product.image_url, { width: 280, height: 280, quality: 55 })}
                              srcSet={`${getOptimizedImageUrl(product.image_url, { width: 200, height: 200, quality: 50 })} 200w, ${getOptimizedImageUrl(product.image_url, { width: 280, height: 280, quality: 55 })} 280w, ${getOptimizedImageUrl(product.image_url, { width: 400, height: 400, quality: 60 })} 400w`}
                              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            {product.stock_quantity !== null && product.stock_quantity <= 0 && (
                              <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                                Out of Stock
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={isFavorite(product.id) ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
                              className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-md h-8 w-8 md:h-10 md:w-10"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(product.id);
                              }}
                              disabled={isFavoritePending}
                            >
                              <Heart
                                className={`h-4 w-4 md:h-5 md:w-5 transition-colors ${
                                  isFavorite(product.id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-muted-foreground hover:text-red-500"
                                }`}
                              />
                            </Button>
                            <ProductShareButton productId={product.id} productName={product.name} productSlug={(product as any).slug} />
                          </div>
                        </Link>
                        <div className="p-3 md:p-6">
                          <p className="text-xs font-inter uppercase tracking-wide text-secondary mb-1 md:mb-2">
                            {product.category}
                          </p>
                          <Link to={productPath(product)}>
                            <h3 className="font-playfair font-bold text-[20px] md:text-xl text-foreground mb-1 md:mb-2 hover:text-primary transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between mb-2 md:mb-3">
                            <span className="font-inter font-bold text-lg md:text-2xl text-primary">
                              ₹{product.price}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            {(product.show_add_to_cart ?? true) && !isDisplayStand(product.category) && (
                              <Button
                                size="sm"
                                variant="default"
                                className="w-full text-xs md:text-sm h-8 md:h-9"
                                onClick={() => addToCart(product.id)}
                                disabled={isAddingToCart || (product.stock_quantity !== null && product.stock_quantity <= 0)}
                              >
                                <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                <span className="hidden sm:inline">Add to Cart</span>
                                <span className="sm:hidden">Add</span>
                              </Button>
                            )}
                            {(product.show_enquiry ?? true) && (
                              <a
                                href={getEnquiryUrl(product.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 md:h-9 px-2 md:px-3"
                              >
                                Enquiry
                              </a>
                            )}
                            {(product.show_call_now ?? true) && (
                              <a
                                href="tel:+918851882465"
                                className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-8 md:h-9 px-2 md:px-3"
                              >
                                <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                Call Now
                              </a>
                            )}
                          </div>

                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="font-inter text-muted-foreground">
                    {searchQuery || category !== "all" ? "No products match your filters." : "No products found."}
                  </p>
                  {(searchQuery || category !== "all") && (
                    <Button variant="link" onClick={clearFilters} className="mt-2">
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <FaqSection faqs={PRODUCTS_FAQS} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
