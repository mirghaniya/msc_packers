import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { SITE } from "@/lib/useSeo";

export type Crumb = { name: string; path?: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE}${c.path ?? "/"}`,
    })),
  };
}

export const Breadcrumbs = ({ items }: { items: Crumb[] }) => (
  <nav aria-label="Breadcrumb" className="mb-4">
    <ol className="flex flex-wrap items-center gap-1 text-sm font-inter text-muted-foreground">
      {items.map((item, i) => (
        <li key={`${item.name}-${i}`} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />}
          {item.path && i < items.length - 1 ? (
            <Link to={item.path} className="hover:text-primary transition-colors">
              {item.name}
            </Link>
          ) : (
            <span aria-current="page" className="text-foreground">
              {item.name}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);
