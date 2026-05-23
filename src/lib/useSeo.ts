import { useEffect } from "react";

const SITE_URL = "https://mirghaniyasupercentre.lovable.app";

type SeoOptions = {
  title: string;
  description: string;
  path?: string; // defaults to current location
  image?: string;
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

export function useSeo({ title, description, path, image, jsonLd }: SeoOptions) {
  useEffect(() => {
    const url = SITE_URL + (path ?? window.location.pathname);

    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertLink("canonical", url);

    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    if (image) {
      upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
      upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
    }

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
    };
  }, [title, description, path, image, JSON.stringify(jsonLd)]);
}

export const SITE = SITE_URL;
