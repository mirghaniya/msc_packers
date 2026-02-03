import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactNotificationRequest {
  name: string;
  email: string;
  message: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    // Parse request body
    const { name, email, message }: ContactNotificationRequest = await req.json();

    // Validate input
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Admin email - you can change this to your admin email
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
              <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #4B164C;">${email}</a></p>
            </div>
            
            <h3 style="color: #4B164C; border-bottom: 2px solid #DD88CF; padding-bottom: 10px;">Message</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #DD88CF;">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="mailto:${email}?subject=Re: Your inquiry at Mirghaniya Super Centre" 
                 style="background: #4B164C; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block;">
                Reply to Customer
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Mirghaniya Super Centre. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend if API key is available
    let emailSent = false;
    console.log("Checking RESEND_API_KEY:", resendApiKey ? "configured" : "not configured");
    
    if (resendApiKey) {
      try {
        console.log("Initializing Resend with API key");
        const resend = new Resend(resendApiKey);
        
        console.log("Sending notification email to admin:", adminEmail);
        const emailResponse = await resend.emails.send({
          from: "Mirghaniya Super Centre <onboarding@resend.dev>",
          to: [adminEmail],
          subject: `New Contact Message from ${name}`,
          html: emailHtml,
          replyTo: email,
        });

        console.log("Resend response:", JSON.stringify(emailResponse));
        
        if (emailResponse.error) {
          console.error("Resend email error:", JSON.stringify(emailResponse.error));
        } else {
          emailSent = true;
          console.log("Notification email sent successfully, ID:", emailResponse.data?.id);
        }
      } catch (emailErr) {
        console.error("Email sending error:", emailErr);
      }
    } else {
      console.log("RESEND_API_KEY not configured, skipping email");
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
