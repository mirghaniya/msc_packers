import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Star, User, BadgeCheck, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  // Fetch reviews
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Check if user has purchased this product and received it
  const { data: canReview } = useQuery({
    queryKey: ["can-review", productId, user?.id],
    queryFn: async () => {
      if (!user) return { canReview: false, orderId: null };

      // Check if user has a delivered order with this product
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select(`
          order_id,
          orders!inner (
            id,
            user_id,
            status
          )
        `)
        .eq("product_id", productId)
        .eq("orders.user_id", user.id)
        .eq("orders.status", "Delivered");

      if (error) throw error;

      // Check if user already reviewed this product
      const { data: existingReview } = await supabase
        .from("product_reviews")
        .select("id")
        .eq("product_id", productId)
        .eq("user_id", user.id)
        .maybeSingle();

      return {
        canReview: orderItems && orderItems.length > 0 && !existingReview,
        orderId: orderItems?.[0]?.order_id || null,
        alreadyReviewed: !!existingReview,
      };
    },
    enabled: !!user,
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user || !canReview?.orderId) throw new Error("Cannot submit review");

      const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        user_id: user.id,
        order_id: canReview.orderId,
        rating,
        title: title.trim() || null,
        content: content.trim() || null,
        is_verified_purchase: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["can-review", productId] });
      toast({ title: "Review submitted successfully!" });
      setRating(5);
      setTitle("");
      setContent("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["can-review", productId] });
      toast({ title: "Review deleted" });
    },
  });

  // Calculate average rating
  const averageRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            className={interactive ? "cursor-pointer" : "cursor-default"}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && setRating(star)}
          >
            <Star
              className={`h-5 w-5 ${
                star <= (interactive ? hoverRating || rating : rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-12">
      <h2 className="font-playfair font-bold text-2xl mb-6">
        Customer Reviews
      </h2>

      {/* Rating Summary */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <p className="text-4xl font-bold">{averageRating.toFixed(1)}</p>
          <div className="flex justify-center my-1">
            {renderStars(Math.round(averageRating))}
          </div>
          <p className="text-sm text-muted-foreground">
            {reviews?.length || 0} reviews
          </p>
        </div>
      </div>

      {/* Write Review Form */}
      {user && canReview?.canReview && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-playfair text-lg">
              Write a Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitReviewMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Rating
                </label>
                {renderStars(rating, true)}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Review Title (optional)
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Review (optional)
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your experience with this product"
                  rows={4}
                  maxLength={1000}
                />
              </div>
              <Button
                type="submit"
                disabled={submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending
                  ? "Submitting..."
                  : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {user && canReview?.alreadyReviewed && (
        <p className="text-sm text-muted-foreground mb-6">
          You have already reviewed this product.
        </p>
      )}

      {!user && (
        <p className="text-sm text-muted-foreground mb-6">
          Please sign in to leave a review after receiving your order.
        </p>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <p className="text-muted-foreground">Loading reviews...</p>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Customer</span>
                        {review.is_verified_purchase && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <BadgeCheck className="h-3 w-3" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  {user?.id === review.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteReviewMutation.mutate(review.id)}
                      disabled={deleteReviewMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="mt-3">
                  {renderStars(review.rating)}
                  {review.title && (
                    <p className="font-semibold mt-2">{review.title}</p>
                  )}
                  {review.content && (
                    <p className="text-muted-foreground mt-2">
                      {review.content}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          No reviews yet. Be the first to review this product!
        </p>
      )}
    </div>
  );
};
