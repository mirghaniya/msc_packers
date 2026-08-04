import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { lazy, Suspense, useEffect, useState } from "react";
import Index from "./pages/Index";
import { SEO_CATEGORIES } from "@/lib/seoCategories";

const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const FloatingWhatsApp = lazy(() => import("@/components/FloatingWhatsApp").then(m => ({ default: m.FloatingWhatsApp })));

// Defer non-critical UI (toasts, floating WA) until the browser is idle so they
// don't compete with hero rendering for main-thread time on first paint.
function useIdleMount(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as any;
    const cb = () => setReady(true);
    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(cb, { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(cb, 1500);
    return () => window.clearTimeout(t);
  }, []);
  return ready;
}

const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const About = lazy(() => import("./pages/About"));
const CustomJewelleryPackagingGuide = lazy(() => import("./pages/CustomJewelleryPackagingGuide"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminHeroSlides = lazy(() => import("./pages/admin/AdminHeroSlides"));
const AdminFeaturedProducts = lazy(() => import("./pages/admin/AdminFeaturedProducts"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminBrandTestimonials = lazy(() => import("./pages/admin/AdminBrandTestimonials"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const DeferredChrome = () => {
  const ready = useIdleMount();
  if (!ready) return null;
  return (
    <>
      <Suspense fallback={null}><Toaster /></Suspense>
      <Suspense fallback={null}><Sonner /></Suspense>
      <Suspense fallback={null}><FloatingWhatsApp /></Suspense>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/products" element={<Products />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            {SEO_CATEGORIES.map((c) => (
              <Route key={c.slug} path={`/${c.slug}`} element={<CategoryPage />} />
            ))}
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/guides/custom-jewellery-packaging" element={<CustomJewelleryPackagingGuide />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/hero-slides" element={<AdminHeroSlides />} />
            <Route path="/admin/featured" element={<AdminFeaturedProducts />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/brand-testimonials" element={<AdminBrandTestimonials />} />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          <DeferredChrome />
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;