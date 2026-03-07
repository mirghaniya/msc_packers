import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HTML-escape user inputs to prevent injection
const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;")
   .replace(/</g, "&lt;")
   .replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;")
   .replace(/'/g, "&#39;");

interface ContactNotificationRequest {
  name: string;
  email: string;
  message: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate the request has the Supabase apikey header (proves it came through our client)
    const apiKey = req.headers.get("apikey");
    const expectedAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!apiKey || apiKey !== expectedAnonKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting: max 5 contact messages per email per hour
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { name, email, message } = body as ContactNotificationRequest;

    // Validate required fields early so we can use email for rate limit check
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limit: count recent messages from this email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabaseAdmin
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("email", email.trim())
      .gte("created_at", oneHourAgo);

    if (!countError && count !== null && count >= 5) {
      return new Response(
        JSON.stringify({ error: "Too many messages. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also enforce a global rate limit: max 20 contact messages total per hour
    const { count: globalCount, error: globalCountError } = await supabaseAdmin
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", oneHourAgo);

    if (!globalCountError && globalCount !== null && globalCount >= 20) {
      return new Response(
        JSON.stringify({ error: "Too many messages. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // Input length validation
    if (typeof name !== "string" || name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name must be 100 characters or less" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (typeof email !== "string" || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Email must be 255 characters or less" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (typeof message !== "string" || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message must be 2000 characters or less" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Escape all user inputs for safe HTML interpolation
    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeMessage = escapeHtml(message.trim());

    const adminEmail = "mirghaniyasupercentre@gmail.com";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Message</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4B164C 0%, #DD88CF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Message</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 5px;">Mirghaniya Super Centre</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #4B164C; margin-top: 0;">Customer Details</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${safeName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #4B164C;">${safeEmail}</a></p>
            </div>
            
            <h3 style="color: #4B164C; border-bottom: 2px solid #DD88CF; padding-bottom: 10px;">Message</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #DD88CF;">
              <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="mailto:${safeEmail}?subject=Re: Your inquiry at Mirghaniya Super Centre" 
                 style="background: #4B164C; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block;">
                Reply to Customer
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Mirghaniya Super Centre. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    let emailSent = false;
    
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        const emailResponse = await resend.emails.send({
          from: "Mirghaniya Super Centre <onboarding@resend.dev>",
          to: [adminEmail],
          subject: `New Contact Message from ${safeName}`,
          html: emailHtml,
          replyTo: email.trim(),
        });

        if (emailResponse.error) {
          console.error("Resend email error:", JSON.stringify(emailResponse.error));
        } else {
          emailSent = true;
        }
      } catch (emailErr) {
        console.error("Email sending error:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: emailSent 
          ? "Admin notification sent successfully" 
          : "Message saved (email notification not configured)",
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
