import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote, Wallet, MapPin, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

type PaymentMethod = "upi" | "card" | "cod";

const Checkout = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Fetch user addresses
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["user-addresses-checkout", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Auto-select default address
      if (data && data.length > 0) {
        const defaultAddr = data.find(a => a.is_default) || data[0];
        setSelectedAddressId(defaultAddr.id);
      }
      
      return data;
    },
    enabled: !!user,
  });

  // Fetch user profile for email
  const { data: profile } = useQuery({
    queryKey: ["user-profile-checkout", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!selectedAddressId) {
      toast({
        title: "Address Required",
        description: "Please select a delivery address.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Use secure server-side validation function to create order
      const cartItemsPayload = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const { data: orderId, error: orderError } = await supabase.rpc(
        "create_validated_order",
        { p_cart_items: cartItemsPayload }
      );

      if (orderError) throw orderError;

      // Send order confirmation email
      const userEmail = profile?.email || user.email;
      if (userEmail) {
        try {
          await supabase.functions.invoke("send-order-confirmation", {
            body: {
              orderId,
              userEmail,
              userName: profile?.full_name || "Customer",
            },
          });
          console.log("Order confirmation email sent");
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
          // Don't fail the order if email fails
        }
      }

      // Clear local cart state
      await clearCart();

      // Get selected address for WhatsApp message
      const selectedAddress = addresses?.find(a => a.id === selectedAddressId);
      const addressText = selectedAddress 
        ? `${selectedAddress.address_line1}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.postal_code}`
        : "";

      // Handle payment based on method
      const paymentMethodText = paymentMethod === "upi" ? "UPI" : paymentMethod === "card" ? "Card" : "Cash on Delivery";
      
      if (paymentMethod === "upi") {
        // Redirect to UPI payment
        const upiId = "8851882465@upi";
        const upiUrl = `upi://pay?pa=${upiId}&pn=Mirghaniya%20Super%20Centre&am=${cartTotal.toFixed(2)}&cu=INR&tn=Order%20${orderId.slice(0, 8)}`;
        window.location.href = upiUrl;
      } else if (paymentMethod === "card") {
        // For card payments, show message and redirect to WhatsApp for now
        const message = `🛍️ *New Order - Card Payment*\n\nOrder ID: #${orderId.slice(0, 8)}\nPayment: ${paymentMethodText}\nTotal: ₹${cartTotal.toFixed(2)}\n\n📍 Delivery Address:\n${addressText}\n\nPlease share card payment details.`;
        const whatsappUrl = `https://wa.me/918851882465?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
      } else {
        // COD - send WhatsApp notification
        const message = `🛍️ *New Order - COD*\n\nOrder ID: #${orderId.slice(0, 8)}\nPayment: ${paymentMethodText}\nTotal: ₹${cartTotal.toFixed(2)}\n\n📍 Delivery Address:\n${addressText}\n\nThank you for your order!`;
        const whatsappUrl = `https://wa.me/918851882465?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
      }

      toast({
        title: "Order Placed Successfully",
        description: "Your order has been confirmed. Check your email for details.",
      });

      navigate("/dashboard");
    } catch (error) {
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

  const hasNoAddresses = !addressesLoading && (!addresses || addresses.length === 0);

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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-6">
            {/* Address Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {addressesLoading ? (
                  <p className="text-muted-foreground">Loading addresses...</p>
                ) : hasNoAddresses ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You need to add at least one address before checkout.{" "}
                      <Link to="/dashboard" className="underline font-medium">
                        Add address in your dashboard
                      </Link>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <RadioGroup
                    value={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                    className="space-y-3"
                  >
                    {addresses?.map((address) => (
                      <div
                        key={address.id}
                        className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-muted-foreground/50"
                        }`}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                        <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{address.label}</span>
                            {address.is_default && (
                              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} - {address.postal_code}
                          </p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="space-y-3"
                >
                  <div
                    className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === "upi"
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setPaymentMethod("upi")}
                  >
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Wallet className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">UPI</p>
                        <p className="text-sm text-muted-foreground">Pay using UPI apps like GPay, PhonePe, Paytm</p>
                      </div>
                    </Label>
                  </div>

                  <div
                    className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Credit / Debit Card</p>
                        <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                      </div>
                    </Label>
                  </div>

                  <div
                    className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === "cod"
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Cash on Delivery (COD)</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ₹{item.product.price}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ₹{(item.quantity * item.product.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || hasNoAddresses || !selectedAddressId}
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
