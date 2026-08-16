import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { productPath } from "@/lib/slug";

interface ProductShareButtonProps {
  productId: string;
  productName: string;
  /** Extra classes for positioning (defaults to sitting below the favourite icon) */
  className?: string;
  iconClassName?: string;
}

export const ProductShareButton = ({
  productId,
  productName,
  className = "absolute top-12 right-2 bg-white/80 hover:bg-white shadow-md h-8 w-8 md:top-14 md:h-10 md:w-10",
  iconClassName = "h-4 w-4 md:h-5 md:w-5 text-muted-foreground transition-colors hover:text-primary",
}: ProductShareButtonProps) => {
  const { toast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}${productPath(productId, productName)}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: productName,
          text: `Check out ${productName} at Mirghaniya Super Centre`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Product link copied to clipboard" });
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      toast({
        title: "Unable to share",
        description: "Please copy the link from the address bar.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Share ${productName}`}
      className={className}
      onClick={handleShare}
    >
      <Share2 className={iconClassName} />
    </Button>
  );
};
