import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useState, useEffect, useCallback } from "react";
import { SuggestedProducts } from "@/components/SuggestedProducts";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { ProductReviews } from "@/components/ProductReviews";

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
  const { id } = useParams<{ id: string }>();
  const { addToCart, isLoading: isAddingToCart } = useCart();
  const { toggleFavorite, isFavorite, isPending: isFavoritePending } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedSlideIndex, setRelatedSlideIndex] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

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
    ? [{ image_url: product.image_url, id: "main" }, ...(productImages || [])]
    : [];

  const isDisplayStand = product?.category === "Display Stands";

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
          <Link to="/products" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={getOptimizedImageUrl(allImages[currentImageIndex]?.image_url, { width: 800, height: 800 })}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {allImages.length > 1 && (
                  <>
                    <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" onClick={prevImage}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" onClick={nextImage}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white shadow-md"
                  onClick={() => toggleFavorite(product.id)}
                  disabled={isFavoritePending}
                >
                  <Heart className={`h-5 w-5 transition-colors ${isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"}`} />
                </Button>
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${index === currentImageIndex ? "border-primary" : "border-transparent"}`}
                    >
                      <img src={getOptimizedImageUrl(img.image_url, { width: 150, height: 150 })} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <p className="text-sm font-inter uppercase tracking-wide text-secondary mb-2">{product.category}</p>
              <h1 className="font-playfair font-bold text-4xl text-foreground mb-2">{product.name}</h1>
              <p className="text-sm text-muted-foreground mb-4">SR No: {product.sr_number}</p>
              <p className="font-inter font-bold text-3xl text-primary mb-6">₹{product.price}</p>

              {product.description && (
                <div className="mb-8">
                  <h3 className="font-playfair font-semibold text-lg mb-2">Description</h3>
                  <TruncatedDescription text={product.description} />
                </div>
              )}

              <div className="flex flex-col gap-4 mb-8">
                {!isDisplayStand && (
                  <Button size="lg" className="w-full" onClick={() => addToCart(product.id)} disabled={isAddingToCart}>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                )}
                <a
                  href={getEnquiryUrl(product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8 w-full"
                >
                  Enquiry on WhatsApp
                </a>
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
                    <Button variant="ghost" size="icon" className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md" onClick={prevRelatedSlide}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md" onClick={nextRelatedSlide}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 overflow-hidden">
                  {getVisibleProducts(relatedProducts, relatedSlideIndex, Math.min(4, relatedProducts.length)).map((relatedProduct) => (
                    <Link key={`related-${relatedProduct.id}-${relatedSlideIndex}`} to={`/product/${relatedProduct.id}`}>
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
