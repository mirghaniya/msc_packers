import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigate } from "react-router-dom";

const UserDashboard = () => {
  const { user, loading } = useAuth();

  const { data: orders } = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: "bg-yellow-500",
      Processing: "bg-blue-500",
      Shipped: "bg-purple-500",
      Delivered: "bg-green-500",
      Cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-luxury py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair font-bold text-5xl text-white mb-4">
              My Dashboard
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="font-playfair text-3xl font-semibold mb-8">Order History</h2>
          {!orders || orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No orders yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-playfair">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status || "Pending")}>
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.order_items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.product_name} (x{item.quantity})
                          </span>
                          <span>₹{item.total_price}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">₹{order.total_amount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
