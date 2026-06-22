import { useEffect } from "react";

const SITE_URL = "https://mirghaniyasupercentre.lovable.app";

type SeoOptions = {
  title: string;
  description: string;
  path?: string; // defaults to current location
  image?: string;
  imageAlt?: string;
  imageWidth?: string | number;
  imageHeight?: string | number;
  ogType?: string; // e.g. "website" (default) or "product"
  twitterCard?: string; // e.g. "summary_large_image" (default) or "summary"
  extraMeta?: Array<{ name?: string; property?: string; content: string }>;
  jsonLd?: Record<string, any> | Record<string, any>[];
};

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    Object.entries(attrs).forEach(([k, v]) => {
      if (k !== "content") el!.setAttribute(k, v);
    });
    document.head.appendChild(el);
  }
  if (attrs.content !== undefined) el.setAttribute("content", attrs.content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const JSONLD_ID = "seo-route-jsonld";

export function useSeo({ title, description, path, image, imageAlt, imageWidth, imageHeight, ogType, twitterCard, extraMeta, jsonLd }: SeoOptions) {
  useEffect(() => {
    const url = SITE_URL + (path ?? window.location.pathname);

    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertLink("canonical", url);

    upsertMeta('meta[property="og:type"]', { property: "og:type", content: ogType || "website" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: twitterCard || "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    if (image) {
      upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
      upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
    }
    if (imageAlt) {
      upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: imageAlt });
    }
    if (imageWidth) {
      upsertMeta('meta[property="og:image:width"]', { property: "og:image:width", content: String(imageWidth) });
    }
    if (imageHeight) {
      upsertMeta('meta[property="og:image:height"]', { property: "og:image:height", content: String(imageHeight) });
    }

    // Route-specific extra meta tags — tracked so we can clean them up on unmount
    const addedExtras: HTMLMetaElement[] = [];
    (extraMeta || []).forEach((m) => {
      const el = document.createElement("meta");
      if (m.name) el.setAttribute("name", m.name);
      if (m.property) el.setAttribute("property", m.property);
      el.setAttribute("content", m.content);
      el.setAttribute("data-seo", "route-meta");
      document.head.appendChild(el);
      addedExtras.push(el);
    });

    // Remove previous route-specific JSON-LD
    document.querySelectorAll(`script[data-seo="${JSONLD_ID}"]`).forEach((n) => n.remove());
    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      blocks.forEach((block) => {
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.setAttribute("data-seo", JSONLD_ID);
        s.text = JSON.stringify(block);
        document.head.appendChild(s);
      });
    }

    return () => {
      document.querySelectorAll(`script[data-seo="${JSONLD_ID}"]`).forEach((n) => n.remove());
      addedExtras.forEach((el) => el.remove());
    };
  }, [title, description, path, image, imageAlt, imageWidth, imageHeight, ogType, twitterCard, JSON.stringify(extraMeta), JSON.stringify(jsonLd)]);
}

export const SITE = SITE_URL;
