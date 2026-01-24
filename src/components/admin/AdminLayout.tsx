import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Package, ShoppingBag, LogOut, Tags, Users, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Featured", href: "/admin/featured", icon: Tags },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Hero Slides", href: "/admin/hero-slides", icon: Image },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Users", href: "/admin/users", icon: Users },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r min-h-screen flex flex-col">
          <div className="p-6">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="Logo" className="h-10 w-10" />
              <span className="font-playfair font-bold text-lg">Admin Panel</span>
            </Link>
          </div>
          <nav className="px-4 space-y-2 flex-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-inter">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full sm:w-auto justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
};
