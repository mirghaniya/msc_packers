import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, ArrowLeft, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useState, useEffect, useCallback } from "react";
import { SuggestedProducts } from "@/components/SuggestedProducts";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { ProductReviews } from "@/components/ProductReviews";
import { useSeo, SITE } from "@/lib/useSeo";
import { parseProductId, productPath } from "@/lib/slug";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { primarySeoCategory } from "@/lib/seoCategories";
import { ProductShareButton } from "@/components/ProductShareButton";

const TruncatedDescription = ({ text, wordLimit = 30 }: { text: string; wordLimit?: number }) => {
  const [expanded, setExpanded] = useState(false);
  const words = text.split(/\s+/);
  const isLong = words.length > wordLimit;

  if (!isLong) return <p className="text-muted-foreground leading-relaxed">{text}</p>;

  return (
    <div>
      <p className="text-muted-foreground leading-relaxed">
        {expanded ? text : words.slice(0, wordLimit).join(" ") + "..."}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-primary text-sm font-medium mt-1 hover:underline"
      >
        {expanded ? "See less description" : "See more description"}
      </button>
    </div>
  );
};

const ProductDetail = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Legacy URLs carry the UUID (/product/<uuid> or /product/<slug>-<uuid>);
  // clean URLs carry only the slug.
  const legacyId = parseProductId(idParam);
  const slugParam = legacyId ? undefined : idParam;
  const { addToCart, isLoading: isAddingToCart } = useCart();
  const { toggleFavorite, isFavorite, isPending: isFavoritePending } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedSlideIndex, setRelatedSlideIndex] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", legacyId ?? slugParam],
    queryFn: async () => {
      const query = supabase.from("products").select("*");
      const { data, error } = legacyId
        ? await query.eq("id", legacyId).maybeSingle()
        : await query.eq("slug", slugParam!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!(legacyId || slugParam),
  });

  const id = product?.id ?? legacyId;

  // Old UUID-based URLs resolve, then permanently move to the clean slug URL.
  useEffect(() => {
    if (!product) return;
    const clean = productPath(product);
    if (window.location.pathname !== clean) {
      navigate(clean, { replace: true });
    }
  }, [product, navigate]);

  const { data: productImages } = useQuery({
    queryKey: ["product-images", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", product?.category, id],
    queryFn: async () => {
      if (!product) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", product.category)
        .neq("id", id)
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: !!product,
  });

  const allImages = product
    ? [{ image_url: product.image_url, id: "main", media_type: "image" as string }, ...((productImages || []) as any[])]
    : [];

  const isDisplayStand = product?.category === "Display Stands";

  // Cover image = designated primary (products.image_url); otherwise the first
  // valid gallery image. The brand logo is only used when neither exists.
  const coverImage =
    (product?.image_url || "").trim() ||
    ((productImages || []) as any[]).find((i) => i.media_type !== "video" && i.image_url)?.image_url ||
    undefined;

  const productImageUrl = coverImage
    ? getOptimizedImageUrl(coverImage, { width: 1200, height: 1200 })
    : `${SITE}/images/hero-bg.jpg`;

  const seoAlt = product
    ? (product as any).seo_image_alt?.trim() || `${product.name} | Mirghaniya Super Centre (MSC Packers)`
    : "";

  const seoCategory = product ? primarySeoCategory(product) : undefined;

  const buildDescription = () => {
    if (!product) return "Premium wholesale jewellery packaging and display stands from Mirghaniya Super Centre, Delhi.";
    const custom = ((product as any).meta_description || "").trim();
    if (custom) return custom.slice(0, 160);
    const base = (product.description || "").trim();
    const fallback = `Buy ${product.name} (${product.category}) wholesale from Mirghaniya Super Centre, Delhi. Premium jewellery packaging with Pan-India delivery.`;
    const candidate = base.length >= 50 ? base : `${base ? base + ". " : ""}${fallback}`;
    return candidate.slice(0, 158);
  };

  const keywords: string[] = product ? ((product as any).meta_keywords || []) : [];

  useSeo({
    title: product
      ? ((product as any).meta_title?.trim() ||
        (`${product.name} | Mirghaniya Super Centre`.length <= 60
          ? `${product.name} | Mirghaniya Super Centre`
          : product.name.length <= 60
            ? product.name
            : `${product.name.slice(0, 57).trimEnd()}...`))
      : "Product — Mirghaniya Super Centre",
    description: buildDescription(),
    path: product ? productPath(product) : undefined,
    image: productImageUrl,
    imageAlt: seoAlt,
    imageWidth: 1200,
    imageHeight: 1200,
    ogType: "product",
    extraMeta: product
      ? [
          ...(keywords.length ? [{ name: "keywords", content: keywords.join(", ") }] : []),
          { property: "og:image:secure_url", content: productImageUrl },
          { property: "og:image:type", content: "image/webp" },
          { name: "twitter:image:alt", content: seoAlt },
          { property: "product:brand", content: "Mirghaniya Super Centre" },
          { property: "product:availability", content: (product.stock_quantity ?? 1) > 0 ? "in stock" : "out of stock" },
          { property: "product:condition", content: "new" },
          { property: "product:price:amount", content: String(product.price ?? "") },
          { property: "product:price:currency", content: "INR" },
          { property: "product:retailer_item_id", content: product.sr_number || product.id },
          { property: "product:category", content: product.category || "Jewellery Packaging" },
        ]
      : undefined,
    jsonLd: product
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description || `${product.name} from Mirghaniya Super Centre`,
            sku: product.sr_number || product.id,
            category: product.category,
            image: productImageUrl ? [productImageUrl] : undefined,
            brand: { "@type": "Brand", name: "Mirghaniya Super Centre" },
            offers: {
              "@type": "Offer",
              price: String(product.price ?? ""),
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              url: `${SITE}${productPath(product)}`,
            },
          },
          breadcrumbJsonLd(
            seoCategory
              ? [
                  { name: "Home", path: "/" },
                  { name: "Products", path: "/products" },
                  { name: seoCategory.name, path: `/${seoCategory.slug}` },
                  { name: product.name, path: productPath(product) },
                ]
              : [
                  { name: "Home", path: "/" },
                  { name: "Products", path: "/products" },
                  { name: product.name, path: productPath(product) },
                ],
          ),
        ]
      : undefined,
  });

  const getEnquiryUrl = (productName: string) => {
    const message = encodeURIComponent(`Hi, I would like to enquire about: ${productName}`);
    return `https://wa.me/918851882465?text=${message}`;
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  // Auto-slide for related products
  const nextRelatedSlide = useCallback(() => {
    if (!relatedProducts || relatedProducts.length <= 2) return;
    setRelatedSlideIndex((prev) => (prev + 1) % relatedProducts.length);
  }, [relatedProducts]);

  const prevRelatedSlide = () => {
    if (!relatedProducts || relatedProducts.length <= 2) return;
    setRelatedSlideIndex((prev) => (prev - 1 + relatedProducts.length) % relatedProducts.length);
  };

  useEffect(() => {
    if (!relatedProducts || relatedProducts.length <= 2) return;
    const interval = setInterval(nextRelatedSlide, 2000);
    return () => clearInterval(interval);
  }, [relatedProducts, nextRelatedSlide]);

  const getVisibleProducts = (products: any[], startIndex: number, count: number) => {
    if (!products || products.length === 0) return [];
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(products[(startIndex + i) % products.length]);
    }
    return result;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading product...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Link to="/products">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Products", path: "/products" },
              ...(seoCategory ? [{ name: seoCategory.name, path: `/${seoCategory.slug}` }] : []),
              { name: product.name },
            ]}
          />

          <Link to="/products" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {allImages[currentImageIndex]?.media_type === "video" ? (
                  <video
                    src={allImages[currentImageIndex]?.image_url}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                  />
                ) : (
                  <img
                    src={getOptimizedImageUrl(allImages[currentImageIndex]?.image_url, { width: 800, height: 800 })}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {allImages.length > 1 && (
                  <>
                    <Button variant="ghost" size="icon" aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" onClick={prevImage}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" onClick={nextImage}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={isFavorite(product.id) ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white shadow-md"
                  onClick={() => toggleFavorite(product.id)}
                  disabled={isFavoritePending}
                >
                  <Heart className={`h-5 w-5 transition-colors ${isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"}`} />
                </Button>
                <ProductShareButton
                  productId={product.id}
                  productName={product.name}
                  className="absolute top-16 right-4 bg-white/80 hover:bg-white shadow-md h-10 w-10"
                  iconClassName="h-5 w-5 text-muted-foreground transition-colors hover:text-primary"
                />
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Show image ${index + 1} of ${product.name}`}
                      aria-current={index === currentImageIndex}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${index === currentImageIndex ? "border-primary" : "border-transparent"}`}
                    >
                      {img.media_type === "video" ? (
                        <div className="relative w-full h-full bg-black">
                          <video src={img.image_url} className="w-full h-full object-cover" muted playsInline />
                          <span className="absolute bottom-0.5 left-0.5 bg-black/70 text-white text-[9px] px-1 rounded">▶</span>
                        </div>
                      ) : (
                        <img src={getOptimizedImageUrl(img.image_url, { width: 150, height: 150 })} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <p className="text-sm font-inter uppercase tracking-wide text-secondary mb-2">{product.category}</p>
              <h1 className="font-playfair font-bold text-[24px] lg:text-4xl text-foreground mb-2">{product.name}</h1>
              <p className="text-sm text-muted-foreground mb-4">SR No: {product.sr_number}</p>
              <p className="font-inter font-bold text-3xl text-primary mb-6">₹{product.price}</p>

              {product.description && (
                <div className="mb-8">
                  <h2 className="font-playfair font-semibold text-lg mb-2">Description</h2>
                  <TruncatedDescription text={product.description} />
                </div>
              )}

              <div className="flex flex-col gap-4 mb-8">
                {(product.show_add_to_cart ?? true) && !isDisplayStand && (
                  <Button size="lg" className="w-full" onClick={() => addToCart(product.id)} disabled={isAddingToCart}>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                )}
                {(product.show_enquiry ?? true) && (
                  <a
                    href={getEnquiryUrl(product.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8 w-full"
                  >
                    Enquiry on WhatsApp
                  </a>
                )}
                {(product.show_call_now ?? true) && (
                  <a
                    href="tel:+918851882465"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Now
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Related Products Slider */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="font-playfair font-bold text-3xl text-foreground mb-8">Related Products</h2>
              <div className="relative">
                {relatedProducts.length > 2 && (
                  <>
                    <Button variant="ghost" size="icon" aria-label="Previous related product" className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md" onClick={prevRelatedSlide}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Next related product" className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md" onClick={nextRelatedSlide}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 overflow-hidden">
                  {getVisibleProducts(relatedProducts, relatedSlideIndex, Math.min(4, relatedProducts.length)).map((relatedProduct) => (
                    <Link key={`related-${relatedProduct.id}-${relatedSlideIndex}`} to={productPath(relatedProduct)}>
                      <Card className="group overflow-hidden hover:shadow-elegant transition-all duration-300">
                        <CardContent className="p-0">
                          <div className="relative overflow-hidden aspect-square">
                            <img src={getOptimizedImageUrl(relatedProduct.image_url, { width: 400, height: 400 })} alt={relatedProduct.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                          </div>
                          <div className="p-4">
                            <p className="text-xs font-inter uppercase tracking-wide text-secondary mb-1">{relatedProduct.category}</p>
                            <h3 className="font-playfair font-semibold text-sm md:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">{relatedProduct.name}</h3>
                            <p className="font-inter font-bold text-lg md:text-xl text-primary mt-2">₹{relatedProduct.price}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          <SuggestedProducts currentProductId={id!} category={product.category} />
          <ProductReviews productId={id!} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
