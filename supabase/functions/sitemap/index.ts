import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch all products
    const { data: products, error } = await supabase
      .from("products")
      .select("id, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    const baseUrl = "https://mirghaniya-super-centre.lovable.app";
    const today = new Date().toISOString().split("T")[0];

    // Static pages
    const staticPages = [
      { loc: "/", changefreq: "daily", priority: "1.0" },
      { loc: "/products", changefreq: "daily", priority: "0.9" },
      { loc: "/about", changefreq: "monthly", priority: "0.7" },
      { loc: "/contact", changefreq: "monthly", priority: "0.7" },
      { loc: "/auth", changefreq: "monthly", priority: "0.5" },
      { loc: "/cart", changefreq: "weekly", priority: "0.6" },
    ];

    // Generate static page URLs
    const staticUrls = staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("");

    // Generate product page URLs
    const productUrls = (products || []).map(product => {
      const lastmod = product.updated_at 
        ? new Date(product.updated_at).toISOString().split("T")[0] 
        : today;
      return `
  <url>
    <loc>${baseUrl}/products/${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${productUrls}
</urlset>`;

    console.log(`Generated sitemap with ${staticPages.length} static pages and ${products?.length || 0} products`);

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mirghaniya-super-centre.lovable.app/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        headers: {
          "Content-Type": "application/xml",
          ...corsHeaders,
        },
      }
    );
  }
});
