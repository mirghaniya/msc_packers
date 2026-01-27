import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const AdminOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      // Fetch profiles separately
      const ordersWithProfiles = await Promise.all(
        data.map(async (order) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, phone, email")
            .eq("id", order.user_id)
            .single();
          return { ...order, profile };
        })
      );
      
      return ordersWithProfiles;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, userEmail, userName }: { 
      id: string; 
      status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
      userEmail?: string;
      userName?: string;
    }) => {
      // Update order status
      const { error } = await supabase
        .from("orders")
        .update({ 
          status,
          // Set estimated delivery for Processing/Shipped
          ...(status === "Processing" || status === "Shipped" 
            ? { estimated_delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() }
            : {}
          )
        })
        .eq("id", id);
      if (error) throw error;

      // Add to status history
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: id,
          status,
          notes: `Status updated to ${status}`,
        });
      
      if (historyError) {
        console.error("Failed to add status history:", historyError);
      }

      // Send notification email
      if (userEmail) {
        try {
          const response = await supabase.functions.invoke("send-order-notification", {
            body: { orderId: id, newStatus: status, userEmail, userName: userName || "Customer" },
          });
          console.log("Notification response:", response);
        } catch (notifError) {
          console.error("Failed to send notification:", notifError);
          // Don't fail the mutation if notification fails
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Order status updated", description: "Customer will be notified via email" });
    },
  });

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
    <AdminLayout>
      <div>
        <h1 className="font-playfair text-4xl font-bold mb-8">Orders</h1>
        <div className="space-y-6">
          {orders?.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-playfair">
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm mt-1">
                      Customer: {order.profile?.full_name} | {order.profile?.phone}
                    </p>
                    {order.profile?.email && (
                      <p className="text-sm text-muted-foreground">
                        Email: {order.profile.email}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-4 items-center">
                    <Badge className={getStatusColor(order.status || "Pending")}>
                      {order.status}
                    </Badge>
                    <Select
                      value={order.status || "Pending"}
                      onValueChange={(status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled") =>
                        updateStatusMutation.mutate({ 
                          id: order.id, 
                          status,
                          userEmail: order.profile?.email,
                          userName: order.profile?.full_name
                        })
                      }
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                      <div>
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="text-muted-foreground">
                          SR: {item.product_sr_number} | Qty: {item.quantity} × ₹{item.unit_price}
                        </p>
                      </div>
                      <span className="font-semibold">₹{item.total_price}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{order.total_amount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
