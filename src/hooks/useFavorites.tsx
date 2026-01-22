import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's favorites (just product IDs for quick lookup)
  const { data: favoriteIds = [], isLoading } = useQuery({
    queryKey: ["user-favorite-ids", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((f) => f.product_id);
    },
    enabled: !!user,
  });

  // Add to favorites
  const addFavoriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        product_id: productId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorite-ids"] });
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      toast({
        title: "Added to Favorites",
        description: "Product added to your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to favorites.",
        variant: "destructive",
      });
    },
  });

  // Remove from favorites
  const removeFavoriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorite-ids"] });
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      toast({
        title: "Removed from Favorites",
        description: "Product removed from favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites.",
        variant: "destructive",
      });
    },
  });

  const toggleFavorite = (productId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add favorites.",
        variant: "destructive",
      });
      return;
    }
    
    if (favoriteIds.includes(productId)) {
      removeFavoriteMutation.mutate(productId);
    } else {
      addFavoriteMutation.mutate(productId);
    }
  };

  const isFavorite = (productId: string) => favoriteIds.includes(productId);

  return {
    favoriteIds,
    isLoading,
    toggleFavorite,
    isFavorite,
    isPending: addFavoriteMutation.isPending || removeFavoriteMutation.isPending,
  };
};
