import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import { Link } from "react-router-dom";
import { ProductSearch } from "@/components/ProductSearch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const Products = () => {
  const [category, setCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const { addToCart, isLoading: isAddingToCart } = useCart();
  const { toggleFavorite, isFavorite, isPending: isFavoritePending } = useFavorites();

  // Fetch categories from database
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
    queryKey: ["products", category],
    queryFn: async () => {
      let query = supabase.from("products").select("*");
      
      if (category !== "all") {
        query = query.eq("category", category as any);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Filter products based on search query, price range, and stock
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter((product) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.sr_number.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Price range filter
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      if (product.price < min || product.price > max) return false;

      // Stock filter
      if (inStockOnly && (product.stock_quantity === null || product.stock_quantity <= 0)) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, minPrice, maxPrice, inStockOnly]);

  const getEnquiryUrl = (productName: string) => {
    const message = encodeURIComponent(`Hi, I would like to enquire about: ${productName}`);
    return `https://wa.me/918851882465?text=${message}`;
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setCategory("all");
  };

  const FilterContent = () => (
    <div className="space-y-6">
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

      <div>
        <Label className="text-sm font-medium mb-2 block">Price Range (₹)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2"
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="inStock"
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
        />
        <Label htmlFor="inStock" className="text-sm font-medium cursor-pointer">
          In Stock Only
        </Label>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-luxury py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair font-bold text-5xl text-white mb-4">
              Our Collection
            </h1>
            <p className="font-inter text-lg text-white/90 max-w-2xl mx-auto">
              Browse our exquisite selection of jewelry packaging and display solutions
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-4 bg-card rounded-lg border p-6">
                <h2 className="font-playfair font-semibold text-lg mb-4">Filters</h2>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <ProductSearch onSearch={setSearchQuery} />
                
                {/* Mobile Filter Button */}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="group overflow-hidden hover:shadow-elegant transition-all duration-300"
                    >
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden aspect-square">
                          <img
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          {/* Stock Badge */}
                          {product.stock_quantity !== null && product.stock_quantity <= 0 && (
                            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                              Out of Stock
                            </div>
                          )}
                          {/* Favorite Heart Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-md h-8 w-8 md:h-10 md:w-10"
                            onClick={() => toggleFavorite(product.id)}
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
                        </div>
                        <div className="p-3 md:p-6">
                          <p className="text-xs font-inter uppercase tracking-wide text-secondary mb-1 md:mb-2">
                            {product.category}
                          </p>
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-playfair font-semibold text-sm md:text-xl text-foreground mb-1 md:mb-2 hover:text-primary transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-4 line-clamp-2 hidden md:block">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mb-2 md:mb-3">
                            <span className="font-inter font-bold text-lg md:text-2xl text-primary">
                              ₹{product.price}
                            </span>
                          </div>
                          <div className="flex gap-1 md:gap-2">
                            <Button 
                              size="sm" 
                              variant="default"
                              className="flex-1 text-xs md:text-sm h-8 md:h-9"
                              onClick={() => addToCart(product.id)}
                              disabled={isAddingToCart || (product.stock_quantity !== null && product.stock_quantity <= 0)}
                            >
                              <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              <span className="hidden sm:inline">Add to Cart</span>
                              <span className="sm:hidden">Add</span>
                            </Button>
                            <a
                              href={getEnquiryUrl(product.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 md:h-9 px-2 md:px-3"
                            >
                              Enquiry
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="font-inter text-muted-foreground">
                    {searchQuery || minPrice || maxPrice || inStockOnly ? "No products match your filters." : "No products found."}
                  </p>
                  {(searchQuery || minPrice || maxPrice || inStockOnly) && (
                    <Button variant="link" onClick={clearFilters} className="mt-2">
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
