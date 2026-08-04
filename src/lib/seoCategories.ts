// SEO landing-category definitions. These are marketing/search categories that
// sit on top of the database product categories, so every product is reachable
// from at least one crawlable category page.

export type SeoCategory = {
  slug: string;
  name: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
  dbCategories?: string[];
  keywords?: string[];
  faqs: { q: string; a: string }[];
};

export const SEO_CATEGORIES: SeoCategory[] = [
  {
    slug: "ring-boxes",
    name: "Ring Boxes",
    h1: "Wholesale Ring Boxes for Jewellers",
    title: "Ring Boxes Wholesale | Jewellery Ring Box Manufacturer",
    description:
      "Buy wholesale ring boxes in velvet, leatherette and premium finishes. Bulk ring packaging for jewellers with custom branding and Pan-India delivery. MOQ 100 pcs.",
    intro:
      "Our ring boxes are built for retail counters and gifting — snug slot inserts, soft velvet interiors and durable hinges. Available in bulk with custom logo printing.",
    keywords: ["ring"],
    faqs: [
      { q: "What is the minimum order quantity for ring boxes?", a: "The minimum order quantity is 100 pieces per design." },
      { q: "Can ring boxes be printed with our logo?", a: "Yes. We offer foil stamping and screen printing on ring boxes for bulk orders." },
      { q: "Do you deliver ring boxes across India?", a: "Yes, we ship Pan-India from our Delhi facility." },
    ],
  },
  {
    slug: "necklace-boxes",
    name: "Necklace Boxes",
    h1: "Necklace Boxes & Set Boxes Wholesale",
    title: "Necklace Boxes Wholesale | Jewellery Set Box Supplier",
    description:
      "Wholesale necklace boxes and jewellery set boxes with padded inserts. Bulk necklace packaging for showrooms and online sellers. Custom sizes, MOQ 100 pcs.",
    intro:
      "Necklace and set boxes with cushioned inserts that hold chains, pendants and full sets securely during display and transit.",
    keywords: ["necklace", "neckless", "pendant", "set box"],
    faqs: [
      { q: "Do necklace boxes come with inserts?", a: "Yes, most necklace boxes include padded inserts or hooks to hold chains in place." },
      { q: "Are custom sizes available?", a: "Yes, custom sizes are available for bulk orders above the 100 piece minimum." },
    ],
  },
  {
    slug: "jewellery-boxes",
    name: "Jewellery Boxes",
    h1: "Wholesale Jewellery Boxes & Packaging Boxes",
    title: "Jewellery Boxes Wholesale | Packaging Boxes Manufacturer",
    description:
      "Wholesale jewellery boxes for rings, earrings, bangles and sets. Premium packaging boxes from a Delhi manufacturer with custom branding and Pan-India delivery.",
    intro:
      "A complete range of jewellery boxes — stock boxes, gift boxes and premium presentation boxes for every category of ornament.",
    dbCategories: ["Stock Boxes", "Gift Items"],
    keywords: ["box"],
    faqs: [
      { q: "What materials are your jewellery boxes made from?", a: "We use rigid board, leatherette, velvet-lined and paper-wrapped finishes depending on the model." },
      { q: "Can I order mixed designs in one order?", a: "Yes, as long as each design meets the 100 piece minimum." },
    ],
  },
  {
    slug: "display-stands",
    name: "Display Stands",
    h1: "Jewellery Display Stands for Showrooms",
    title: "Jewellery Display Stands | Showroom Display Supplier",
    description:
      "Jewellery display stands for rings, bangles, chains and earrings. Counter and window display solutions for showrooms, exhibitions and retail stores in India.",
    intro:
      "Counter, window and exhibition display stands designed to present jewellery at the right angle and height for customers.",
    dbCategories: ["Display Stands"],
    keywords: ["stand", "display", "bust", "easel"],
    faqs: [
      { q: "Are display stands available for purchase online?", a: "Display stands are sold on enquiry so we can confirm size, finish and freight before dispatch." },
      { q: "Do you make custom display stands?", a: "Yes, custom display units are made to order for showrooms and exhibitions." },
    ],
  },
  {
    slug: "trays",
    name: "Jewellery Trays",
    h1: "Jewellery Display Trays Wholesale",
    title: "Jewellery Trays Wholesale | Display Tray Supplier India",
    description:
      "Wholesale jewellery display trays with velvet inserts for rings, bangles and chains. Stackable counter trays for showrooms. Bulk supply with Pan-India delivery.",
    intro:
      "Stackable display trays with slotted and flat velvet inserts, ideal for counters, safes and showcase drawers.",
    keywords: ["tray"],
    faqs: [
      { q: "Are trays stackable?", a: "Yes, our standard trays are designed to stack inside showcases and safes." },
      { q: "Which insert options are available?", a: "Ring slots, bangle rolls, chain pads and plain velvet inserts." },
    ],
  },
  {
    slug: "pouches",
    name: "Jewellery Pouches",
    h1: "Jewellery Pouches & Potli Bags Wholesale",
    title: "Jewellery Pouches Wholesale | Velvet Potli Bag Supplier",
    description:
      "Wholesale jewellery pouches, velvet potli bags and drawstring packaging. Lightweight, budget-friendly bulk pouches with custom printing. MOQ 100 pcs.",
    intro:
      "Soft velvet and satin pouches for gifting, courier packing and everyday retail handovers — light, protective and inexpensive in bulk.",
    keywords: ["pouch", "potli", "drawstring"],
    faqs: [
      { q: "Can pouches be branded?", a: "Yes, we print logos on velvet and satin pouches for bulk orders." },
      { q: "What sizes do pouches come in?", a: "Standard sizes range from small ring pouches to large set pouches." },
    ],
  },
  {
    slug: "carry-bags",
    name: "Carry Bags",
    h1: "Jewellery Carry Bags & Shopping Bags",
    title: "Jewellery Carry Bags Wholesale | Branded Shopping Bags",
    description:
      "Wholesale jewellery carry bags, paper shopping bags and purses with custom branding. Durable retail carry bags for showrooms, delivered Pan-India. MOQ 100 pcs.",
    intro:
      "Retail carry bags and purses that finish the customer experience — sturdy handles, clean printing and sizes matched to your boxes.",
    dbCategories: ["Bags", "Purses"],
    keywords: ["bag", "purse", "carry"],
    faqs: [
      { q: "Can carry bags be printed with our store name?", a: "Yes, custom printed carry bags are available above the 100 piece minimum." },
      { q: "What materials are used for carry bags?", a: "Paper, non-woven and premium laminated options are available." },
    ],
  },
];

export function getSeoCategory(slug?: string) {
  return SEO_CATEGORIES.find((c) => c.slug === slug);
}

/** True when a product belongs to this SEO category. */
export function productMatchesCategory(
  product: { name?: string | null; description?: string | null; category?: string | null },
  category: SeoCategory,
): boolean {
  if (category.dbCategories?.includes(product.category || "")) return true;
  const haystack = `${product.name || ""} ${product.description || ""}`.toLowerCase();
  return (category.keywords || []).some((k) => haystack.includes(k.toLowerCase()));
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
