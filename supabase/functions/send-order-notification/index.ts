import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const VALID_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

interface OrderNotificationRequest {
  orderId: string;
  newStatus: string;
  userEmail?: string;
  userName?: string;
  userId?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Admin check
    const { data: adminRole } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single();
    if (!adminRole) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { orderId, newStatus, userEmail, userName, userId }: OrderNotificationRequest = await req.json();

    if (!orderId || !newStatus) {
      return new Response(JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate status
    if (!VALID_STATUSES.includes(newStatus)) {
      return new Response(JSON.stringify({ error: "Invalid status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders").select(`*, order_items(*)`).eq("id", orderId).single();
    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Resolve email: use provided email, or look up from auth.users
    let resolvedEmail = userEmail;
    let resolvedName = userName || "Valued Customer";

    if (!resolvedEmail) {
      const targetUserId = userId || order.user_id;
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
      if (authUser?.user?.email) {
        resolvedEmail = authUser.user.email;
      }
      if (!resolvedName || resolvedName === "Valued Customer") {
        const { data: profile } = await supabaseAdmin
          .from("profiles").select("full_name").eq("id", targetUserId).single();
        if (profile?.full_name) resolvedName = profile.full_name;
      }
    }

    if (!resolvedEmail) {
      return new Response(JSON.stringify({ error: "No email found for this customer" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const safeName = escapeHtml(resolvedName);
    const safeStatus = escapeHtml(newStatus);

    const getStatusMessage = (status: string) => {
      switch (status) {
        case "Processing": return "Your order is now being processed. We're preparing your items for shipment.";
        case "Shipped": return "Great news! Your order has been shipped and is on its way to you.";
        case "Delivered": return "Your order has been delivered successfully. Thank you for shopping with Mirghaniya Super Centre!";
        case "Cancelled": return "Your order has been cancelled. If you have any questions, please contact our support team.";
        default: return `Your order status has been updated to: ${safeStatus}`;
      }
    };

    const statusColors: Record<string, string> = {
      Pending: "#f59e0b", Processing: "#3b82f6", Shipped: "#8b5cf6",
      Delivered: "#22c55e", Cancelled: "#ef4444",
    };
    const statusColor = statusColors[newStatus] || "#4B164C";

    const orderItemsHtml = order.order_items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(String(item.product_name))}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${Number(item.quantity)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${Number(item.total_price)}</td>
      </tr>
    `).join("");

    const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Order Status Update</title></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4B164C 0%, #DD88CF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Mirghaniya Super Centre</h1>
    <p style="color: rgba(255,255,255,0.9); margin-top: 5px;">Order Status Update</p>
  </div>
  <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p style="color: #333; font-size: 16px;">Hello ${safeName},</p>
    <div style="background: #f8f9fa; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0;">
      <p style="margin: 0; color: #333;">${getStatusMessage(newStatus)}</p>
    </div>
    <div style="margin: 25px 0;">
      <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> #${escapeHtml(orderId.slice(0, 8))}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Current Status:</strong>
        <span style="background: ${statusColor}; color: white; padding: 3px 10px; border-radius: 15px; font-size: 12px;">${safeStatus}</span>
      </p>
    </div>
    <h3 style="color: #4B164C; border-bottom: 2px solid #DD88CF; padding-bottom: 10px;">Order Details</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
      <thead><tr style="background: #f8f9fa;">
        <th style="padding: 10px; text-align: left; color: #4B164C;">Product</th>
        <th style="padding: 10px; text-align: center; color: #4B164C;">Qty</th>
        <th style="padding: 10px; text-align: right; color: #4B164C;">Price</th>
      </tr></thead>
      <tbody>${orderItemsHtml}</tbody>
      <tfoot><tr style="background: #f8f9fa;">
        <td colspan="2" style="padding: 15px; font-weight: bold; color: #4B164C;">Total Amount</td>
        <td style="padding: 15px; text-align: right; font-weight: bold; color: #4B164C; font-size: 18px;">₹${Number(order.total_amount)}</td>
      </tr></tfoot>
    </table>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
      <p>If you have any questions, feel free to contact us at:</p>
      <p><strong>Phone:</strong> +91 88518 82465</p>
      <p><strong>Email:</strong> mirghaniyasupetcentre@gmail.com</p>
      <p style="margin-top: 20px;">Thank you for choosing Mirghaniya Super Centre!</p>
    </div>
  </div>
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>&copy; 2024 Mirghaniya Super Centre. All rights reserved.</p>
    <p>Usmanpur, Delhi, India - 110053</p>
  </div>
</div></body></html>`;

    let emailSent = false;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const emailResponse = await resend.emails.send({
          from: "Mirghaniya Super Centre <onboarding@resend.dev>",
          to: [resolvedEmail],
          subject: `Order Status Update - #${orderId.slice(0, 8)} - ${newStatus}`,
          html: emailHtml,
        });
        if (emailResponse.error) {
          console.error("Resend error:", JSON.stringify(emailResponse.error));
        } else {
          emailSent = true;
          console.log("Email sent to:", resolvedEmail);
        }
      } catch (emailErr) {
        console.error("Email sending error:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: emailSent ? `Notification sent to ${resolvedEmail}` : `Email not configured`, emailSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
