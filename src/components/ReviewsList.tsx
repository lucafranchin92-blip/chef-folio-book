import { useState, useEffect } from "react";
import { Star, User, ChefHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  chef_reply: string | null;
  chef_reply_at: string | null;
}

interface ReviewsListProps {
  chefId: string;
}

const ReviewsList = ({ chefId }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();

    // Real-time subscription
    const channel = supabase
      .channel(`reviews-${chefId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews",
          filter: `chef_id=eq.${chefId}`,
        },
        () => fetchReviews()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chefId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, chef_reply, chef_reply_at")
        .eq("chef_id", chefId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching reviews:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-2" />
            <div className="h-3 bg-muted rounded w-full mb-1" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-6">
        No reviews yet. Be the first to leave a review!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="p-4 rounded-lg bg-card border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(review.created_at), "MMM d, yyyy")}
            </span>
          </div>
          {review.comment && (
            <p className="text-sm text-foreground">{review.comment}</p>
          )}
          
          {/* Chef Reply */}
          {review.chef_reply && (
            <div className="mt-3 ml-4 pl-4 border-l-2 border-primary/30">
              <div className="flex items-center gap-2 mb-1">
                <ChefHat className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">Chef's Response</span>
                {review.chef_reply_at && (
                  <span className="text-xs text-muted-foreground">
                    • {format(new Date(review.chef_reply_at), "MMM d, yyyy")}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{review.chef_reply}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;
