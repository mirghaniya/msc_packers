import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WHATSAPP_NUMBER = "918851882465";

interface OrderConfirmationRequest {
  orderId: string;
  userEmail: string;
  userName: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    console.log("Starting order confirmation email process...");
    console.log("RESEND_API_KEY configured:", resendApiKey ? "yes" : "no");

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate JWT and get user
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.log("Invalid token:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authenticatedUserId = user.id;
    console.log("Authenticated user:", authenticatedUserId);

    // Parse request body
    const { orderId, userEmail, userName }: OrderConfirmationRequest = await req.json();
    console.log("Processing order confirmation for:", { orderId, userEmail, userName });

    // Validate input
    if (!orderId || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`*, order_items(*)`)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify order ownership - user can only send confirmation for their own orders
    // OR if the user is an admin (checking admin role)
    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", authenticatedUserId)
      .eq("role", "admin")
      .single();

    const isAdmin = !!adminRole;
    const isOrderOwner = order.user_id === authenticatedUserId;

    if (!isAdmin && !isOrderOwner) {
      console.log("Unauthorized: User does not own this order and is not admin");
      return new Response(
        JSON.stringify({ error: "Unauthorized: You can only request confirmations for your own orders" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Order fetched successfully:", order.id);

    // Create order items HTML
    const orderItemsHtml = order.order_items.map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.product_sr_number}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.unit_price}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.total_price}</td>
      </tr>
    `).join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4B164C 0%, #DD88CF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Order Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">Thank you for your purchase</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello ${userName || "Valued Customer"},</p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0;">
              <p style="margin: 0; color: #166534; font-weight: 600;">Your order has been placed successfully!</p>
              <p style="margin: 5px 0 0 0; color: #166534;">We're preparing your items and will notify you once they're shipped.</p>
            </div>
            
            <div style="margin: 25px 0; background: #f8f9fa; padding: 15px; border-radius: 8px;">
              <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> #${orderId.slice(0, 8)}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> <span style="background: #f59e0b; color: white; padding: 3px 10px; border-radius: 15px; font-size: 12px;">Pending</span></p>
            </div>
            
            <h3 style="color: #4B164C; border-bottom: 2px solid #DD88CF; padding-bottom: 10px; margin-top: 30px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; color: #4B164C;">Product</th>
                  <th style="padding: 12px; text-align: center; color: #4B164C;">SR No.</th>
                  <th style="padding: 12px; text-align: center; color: #4B164C;">Qty</th>
                  <th style="padding: 12px; text-align: right; color: #4B164C;">Unit Price</th>
                  <th style="padding: 12px; text-align: right; color: #4B164C;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
              </tbody>
              <tfoot>
                <tr style="background: linear-gradient(135deg, #4B164C 0%, #DD88CF 100%);">
                  <td colspan="4" style="padding: 15px; font-weight: bold; color: white;">Grand Total</td>
                  <td style="padding: 15px; text-align: right; font-weight: bold; color: white; font-size: 18px;">₹${order.total_amount}</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>📦 What's Next?</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e; font-size: 14px;">
                <li>We'll verify your order and begin processing</li>
                <li>You'll receive an email when your order is shipped</li>
                <li>Track your order status from your dashboard</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
              <p>If you have any questions, feel free to contact us at:</p>
              <p><strong>Phone:</strong> +91 88518 82465</p>
              <p><strong>Email:</strong> mirghaniyasupercentre@gmail.com</p>
              <p style="margin-top: 20px; color: #4B164C; font-weight: 600;">Thank you for choosing Mirghaniya Super Centre!</p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2024 Mirghaniya Super Centre. All rights reserved.</p>
            <p>Usmanpur, Delhi, India - 110053</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend
    let emailSent = false;
    
    if (resendApiKey) {
      try {
        console.log("Initializing Resend...");
        const resend = new Resend(resendApiKey);
        
        console.log("Sending order confirmation email to:", userEmail);
        const emailResponse = await resend.emails.send({
          from: "Mirghaniya Super Centre <onboarding@resend.dev>",
          to: [userEmail],
          subject: `Order Confirmed! #${orderId.slice(0, 8)} - Mirghaniya Super Centre`,
          html: emailHtml,
        });

        console.log("Resend response:", JSON.stringify(emailResponse));
        
        if (emailResponse.error) {
          console.error("Resend email error:", JSON.stringify(emailResponse.error));
        } else {
          emailSent = true;
          console.log("Order confirmation email sent successfully to:", userEmail);
        }
      } catch (emailErr) {
        console.error("Email sending error:", emailErr);
      }
    } else {
      console.log("RESEND_API_KEY not configured");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: emailSent 
          ? `Order confirmation sent to ${userEmail}` 
          : `Email not sent (Resend not configured)`,
        emailSent
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
