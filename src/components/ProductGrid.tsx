import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Phone } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import { productPath } from "@/lib/slug";

type P = {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  stock_quantity: number | null;
  show_add_to_cart?: boolean | null;
  show_enquiry?: boolean | null;
  show_call_now?: boolean | null;
};

const enquiryUrl = (name: string) =>
  `https://wa.me/918851882465?text=${encodeURIComponent(`Hi, I would like to enquire about: ${name}`)}`;

export const ProductGrid = ({ products }: { products: P[] }) => {
  const { addToCart, isLoading: isAddingToCart } = useCart();
  const { toggleFavorite, isFavorite, isPending: isFavoritePending } = useFavorites();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
      {products.map((product) => (
        <Card key={product.id} className="group overflow-hidden hover:shadow-elegant transition-all duration-300">
          <CardContent className="p-0">
            <Link to={productPath(product)}>
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={getOptimizedImageUrl(product.image_url, { width: 280, height: 280, quality: 55 })}
                  srcSet={`${getOptimizedImageUrl(product.image_url, { width: 200, height: 200, quality: 50 })} 200w, ${getOptimizedImageUrl(product.image_url, { width: 280, height: 280, quality: 55 })} 280w, ${getOptimizedImageUrl(product.image_url, { width: 400, height: 400, quality: 60 })} 400w`}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
                  alt={`${product.name} — ${product.category} from Mirghaniya Super Centre`}
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
                      isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
                    }`}
                  />
                </Button>
                <ProductShareButton productId={product.id} productName={product.name} />
              </div>
            </Link>
            <div className="p-3 md:p-6">
              <p className="text-xs font-inter uppercase tracking-wide text-secondary mb-1 md:mb-2">{product.category}</p>
              <Link to={productPath(product)}>
                <h3 className="font-playfair font-bold text-[20px] md:text-xl text-foreground mb-1 md:mb-2 hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <span className="font-inter font-bold text-lg md:text-2xl text-primary">₹{product.price}</span>
              </div>
              <div className="flex flex-col gap-2">
                {(product.show_add_to_cart ?? true) && product.category !== "Display Stands" && (
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
                    href={enquiryUrl(product.name)}
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
  );
};
