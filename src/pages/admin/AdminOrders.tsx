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
            .select("full_name, phone")
            .eq("id", order.user_id)
            .single();
          return { ...order, profile };
        })
      );
      
      return ordersWithProfiles;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Order status updated" });
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
                  </div>
                  <div className="flex gap-4 items-center">
                    <Badge className={getStatusColor(order.status || "Pending")}>
                      {order.status}
                    </Badge>
                    <Select
                      value={order.status || "Pending"}
                      onValueChange={(status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled") =>
                        updateStatusMutation.mutate({ id: order.id, status })
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
                          SR: {item.product_sr_number} | Qty: {item.quantity} × ${item.unit_price}
                        </p>
                      </div>
                      <span className="font-semibold">${item.total_price}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span className="text-primary">${order.total_amount}</span>
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
