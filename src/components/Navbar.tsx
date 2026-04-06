import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

const LOGO_STORAGE_URL = "https://fjpunfvhezivlhyrnyym.supabase.co/storage/v1/object/public/product-images/logo/logo.png";
const optimizedLogo = getOptimizedImageUrl(LOGO_STORAGE_URL, { width: 48, height: 48, quality: 60 });
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "./ui/badge";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { cartCount } = useCart();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 md:space-x-3 group">
            <img src={optimizedLogo} alt="MIRGHANIYA SUPER CENTRE" width={48} height={48} className="h-10 w-10 md:h-12 md:w-12 object-contain transition-transform group-hover:scale-105" />
            <span className="font-playfair font-bold text-sm md:text-xl" style={{ color: '#4B164C' }}>
              Mirghaniya Super Centre
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-inter">
              Home
            </Link>
            <Link to="/products" className="text-foreground hover:text-primary transition-colors font-inter">
              Products
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-inter">
              About
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-inter">
              Contact
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" aria-label="Shopping cart">
              <Button variant="ghost" size="icon" className="relative" aria-label="Shopping cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="icon" title="Admin Panel">
                      <Shield className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard">
                  <Button variant="ghost" size="icon" aria-label="User dashboard">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="hidden md:inline-flex">
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="hidden md:inline-flex">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border animate-fade-in">
            <Link
              to="/"
              className="block py-2 text-foreground hover:text-primary transition-colors font-inter"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block py-2 text-foreground hover:text-primary transition-colors font-inter"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/about"
              className="block py-2 text-foreground hover:text-primary transition-colors font-inter"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block py-2 text-foreground hover:text-primary transition-colors font-inter"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            {!user && (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
            )}
            {user && (
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                Logout
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};