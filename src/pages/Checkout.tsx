import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) return;
    setIsProcessing(true);

    try {
      // Use secure server-side validation function to create order
      // This prevents price manipulation attacks by validating prices on the server
      const cartItemsPayload = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const { data: orderId, error: orderError } = await supabase.rpc(
        "create_validated_order",
        { p_cart_items: cartItemsPayload }
      );

      if (orderError) throw orderError;

      // Clear local cart state (DB cart already cleared by the function)
      await clearCart();

      // Simulate WhatsApp message
      const message = `Order Confirmation\nOrder ID: ${orderId}\nTotal: $${cartTotal.toFixed(2)}\nThank you for your order!`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");

      toast({
        title: "Order Placed Successfully",
        description: "Your order has been confirmed",
      });

      navigate("/dashboard");
    } catch (error) {
      // Log only in development to prevent information leakage
      if (import.meta.env.DEV) {
        console.error("Checkout error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-luxury py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair font-bold text-5xl text-white mb-4">
              Checkout
            </h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-playfair text-2xl font-semibold mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.product.price}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${(item.quantity * item.product.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
