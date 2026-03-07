import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, FileText, MessageCircle, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

const WHATSAPP_NUMBER = "918851882465";

const getWhatsAppStatusMessage = (order: any) => {
  const orderId = order.id.slice(0, 8);
  const status = order.status || "Pending";
  const items = order.order_items
    .map((item: any) => `• ${item.product_name} (x${item.quantity}) - ₹${item.total_price}`)
    .join("\n");

  const statusMessages: Record<string, string> = {
    Pending: "Your order is received and is awaiting confirmation.",
    Processing: "Your payment has been verified and order is being processed.",
    Shipped: "Your order has been shipped and is on its way!",
    Delivered: "Your order has been delivered. Thank you for shopping with us!",
    Cancelled: "Your order has been cancelled. Contact us for any queries.",
  };

  return `🛍️ *Order Update - Mirghaniya Super Centre*\n\n📦 Order ID: #${orderId}\n📌 Status: *${status}*\n\n${statusMessages[status] || ""}\n\n*Order Items:*\n${items}\n\n💰 *Total: ₹${order.total_amount}*\n\nFor any queries, contact us at +91 88518 82465.\nThank you for choosing Mirghaniya Super Centre!`;
};

const sendWhatsAppUpdate = (order: any) => {
  const phone = order.profile?.phone?.replace(/\D/g, "");
  if (!phone) return null;
  const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;
  const message = getWhatsAppStatusMessage(order);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

const AdminOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (!searchQuery.trim()) return orders;
    
    const query = searchQuery.toLowerCase();
    return orders.filter((order) => 
      order.id.toLowerCase().includes(query) ||
      order.profile?.full_name?.toLowerCase().includes(query) ||
      order.profile?.email?.toLowerCase().includes(query) ||
      order.profile?.phone?.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  // Download ledger as CSV
  const downloadLedger = () => {
    if (!orders || orders.length === 0) {
      toast({ title: "No orders", description: "There are no orders to export.", variant: "destructive" });
      return;
    }

    const headers = ["Order ID", "Date", "Customer Name", "Phone", "Email", "Status", "Items", "Total Amount"];
    const rows = orders.map((order) => [
      order.id.slice(0, 8),
      new Date(order.created_at).toLocaleDateString('en-IN'),
      order.profile?.full_name || "N/A",
      order.profile?.phone || "N/A",
      order.profile?.email || "N/A",
      order.status || "Pending",
      order.order_items.length,
      order.total_amount
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Ledger Downloaded", description: "Orders ledger has been downloaded as CSV." });
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, userEmail, userName, userPhone, userId }: { 
      id: string; 
      status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
      userEmail?: string;
      userName?: string;
      userPhone?: string;
      userId?: string;
    }) => {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status,
          ...(status === "Processing" || status === "Shipped" 
            ? { estimated_delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() }
            : {}
          )
        })
        .eq("id", id);
      if (error) throw error;

      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({ order_id: id, status, notes: `Status updated to ${status}` });
      if (historyError) console.error("Failed to add status history:", historyError);

      // When admin confirms payment, send confirmation email
      if (status === "Processing") {
        try {
          await supabase.functions.invoke("send-order-confirmation", {
            body: { orderId: id, userEmail: userEmail || undefined, userName: userName || "Customer", userId },
          });
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }
      }

      // Send notification for all status updates
      try {
        await supabase.functions.invoke("send-order-notification", {
          body: { orderId: id, newStatus: status, userEmail: userEmail || undefined, userName: userName || "Customer", userId },
        });
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      const message = variables.status === "Processing" 
        ? "Payment confirmed! Customer will be notified via email"
        : "Order status updated, customer notified via email";
      toast({ title: "Status Updated", description: message });
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

  const downloadInvoice = (order: any) => {
    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const billHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - Order #${order.id.slice(0, 8)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
          .invoice { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #4B164C; padding-bottom: 20px; }
          .company-info { display: flex; align-items: flex-start; gap: 15px; }
          .company-logo { width: 60px; height: 60px; object-fit: contain; }
          .company-details h1 { color: #4B164C; font-size: 28px; margin-bottom: 5px; }
          .company-details p { color: #666; font-size: 12px; line-height: 1.6; }
          .invoice-details { text-align: right; }
          .invoice-details h2 { color: #4B164C; font-size: 24px; margin-bottom: 10px; }
          .invoice-details p { font-size: 14px; color: #666; }
          .billing-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .billing-info > div { flex: 1; }
          .billing-info h3 { font-size: 14px; color: #4B164C; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
          .billing-info p { font-size: 14px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #4B164C; color: white; padding: 12px; text-align: left; font-size: 14px; }
          td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals { display: flex; justify-content: flex-end; }
          .totals-table { width: 300px; }
          .totals-table td { padding: 8px 12px; }
          .totals-table .grand-total { background: #f8f8f8; font-weight: bold; font-size: 18px; color: #4B164C; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .status-delivered { background: #22c55e; color: white; }
          .status-other { background: #f59e0b; color: white; }
          @media print { body { padding: 0; } .invoice { border: none; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="company-info">
              <img src="https://fjpunfvhezivlhyrnyym.supabase.co/storage/v1/object/public/product-images/logo.png" alt="Logo" class="company-logo" onerror="this.style.display='none'" />
              <div class="company-details">
                <h1>Mirghaniya Super Centre</h1>
                <p>Premium Jewelry Packaging Solutions</p>
                <p>Usmanpur, Delhi - 110053, India</p>
                <p>Phone: +91 88518 82465</p>
                <p>Email: mirghaniyasupercentre@gmail.com</p>
              </div>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Order ID:</strong> #${order.id.slice(0, 8)}</p>
              <p><strong>Date:</strong> ${orderDate}</p>
              <p><strong>Status:</strong> <span class="status-badge ${order.status === 'Delivered' ? 'status-delivered' : 'status-other'}">${order.status}</span></p>
            </div>
          </div>
          
          <div class="billing-info">
            <div>
              <h3>Bill To</h3>
              <p><strong>${order.profile?.full_name || 'Customer'}</strong></p>
              ${order.profile?.phone ? `<p>Phone: ${order.profile.phone}</p>` : ''}
              ${order.profile?.email ? `<p>Email: ${order.profile.email}</p>` : ''}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>SR No.</th>
                <th>Product</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items.map((item: any) => `
                <tr>
                  <td>${item.product_sr_number}</td>
                  <td>${item.product_name}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">₹${item.unit_price.toLocaleString('en-IN')}</td>
                  <td class="text-right">₹${item.total_price.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <table class="totals-table">
              <tr>
                <td>Subtotal</td>
                <td class="text-right">₹${order.total_amount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Shipping</td>
                <td class="text-right">FREE</td>
              </tr>
              <tr class="grand-total">
                <td>Grand Total</td>
                <td class="text-right">₹${order.total_amount.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
          
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p style="margin-top: 10px;">For any queries, please contact us at +91 88518 82465 or mirghaniyasupercentre@gmail.com</p>
            <p style="margin-top: 20px; font-size: 10px; color: #999;">This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create an iframe to print
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    iframe.contentDocument?.open();
    iframe.contentDocument?.write(billHTML);
    iframe.contentDocument?.close();
    
    // Wait for content to load then print
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="font-playfair text-2xl md:text-4xl font-bold">Orders</h1>
          <Button onClick={downloadLedger} variant="outline" className="w-full sm:w-auto">
            <FileText className="h-4 w-4 mr-2" />
            Download Ledger
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 && searchQuery && (
            <p className="text-center text-muted-foreground py-8">No orders found matching "{searchQuery}"</p>
          )}
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="font-playfair text-lg md:text-xl">
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs md:text-sm mt-1 truncate">
                      <span className="font-medium">{order.profile?.full_name}</span> | {order.profile?.phone}
                    </p>
                    {order.profile?.email && (
                      <p className="text-xs md:text-sm text-muted-foreground truncate">
                        {order.profile.email}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <Badge className={`${getStatusColor(order.status || "Pending")} w-fit`}>
                      {order.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Select
                        value={order.status || "Pending"}
                        onValueChange={(status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled") =>
                          updateStatusMutation.mutate({ 
                            id: order.id, 
                            status,
                            userEmail: order.profile?.email,
                            userName: order.profile?.full_name,
                            userPhone: order.profile?.phone,
                            userId: order.user_id
                          })
                        }
                      >
                        <SelectTrigger className="w-full sm:w-[130px]">
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
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const url = sendWhatsAppUpdate(order);
                          if (url) {
                            window.open(url, "_blank");
                          } else {
                            toast({ title: "No phone number", description: "This customer doesn't have a phone number on file.", variant: "destructive" });
                          }
                        }}
                        title="Send WhatsApp Update"
                        className="text-green-600 hover:text-green-700 hover:border-green-300"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                          try {
                            const response = await supabase.functions.invoke("send-order-notification", {
                              body: {
                                orderId: order.id,
                                newStatus: order.status || "Pending",
                                userEmail: order.profile?.email || undefined,
                                userName: order.profile?.full_name || "Customer",
                                userId: order.user_id,
                              },
                            });
                            if (response.error) throw response.error;
                            const resData = response.data;
                            toast({ title: "Email Sent", description: resData?.message || `Status update email sent to ${order.profile?.email || order.profile?.full_name || 'customer'}` });
                          } catch (err) {
                            console.error("Email send error:", err);
                            toast({ title: "Email Failed", description: "Failed to send status email. Check logs.", variant: "destructive" });
                          }
                        }}
                        title="Send Email Update"
                        className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => downloadInvoice(order)}
                        title="Download Invoice"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between text-xs md:text-sm border-b pb-2 gap-1">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{item.product_name}</p>
                        <p className="text-muted-foreground">
                          SR: {item.product_sr_number} | Qty: {item.quantity} × ₹{item.unit_price}
                        </p>
                      </div>
                      <span className="font-semibold shrink-0">₹{item.total_price}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-base md:text-lg pt-2">
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