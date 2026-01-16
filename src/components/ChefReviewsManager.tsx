import { useState, useEffect } from "react";
import { Star, User, ChefHat, MessageSquare, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  buyer_id: string;
  chef_reply: string | null;
  chef_reply_at: string | null;
}

interface ChefReviewsManagerProps {
  chefId: string;
}

const ChefReviewsManager = ({ chefId }: ChefReviewsManagerProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();

    const channel = supabase
      .channel(`chef-reviews-${chefId}`)
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
        .select("*")
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

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .update({
          chef_reply: replyText.trim(),
          chef_reply_at: new Date().toISOString(),
        })
        .eq("id", reviewId);

      if (error) throw error;

      toast.success("Reply posted successfully!");
      setReplyingTo(null);
      setReplyText("");
      fetchReviews();
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error posting reply:", error);
      }
      toast.error(error.message || "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground mb-2">No reviews yet</h3>
          <p className="text-muted-foreground">
            Reviews from your customers will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
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
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {review.comment && (
              <p className="text-sm text-foreground">{review.comment}</p>
            )}

            {/* Existing Reply */}
            {review.chef_reply && (
              <div className="ml-4 pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ChefHat className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Your Response</span>
                  {review.chef_reply_at && (
                    <span className="text-xs text-muted-foreground">
                      • {format(new Date(review.chef_reply_at), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{review.chef_reply}</p>
              </div>
            )}

            {/* Reply Form */}
            {!review.chef_reply && replyingTo === review.id && (
              <div className="ml-4 pl-4 border-l-2 border-primary/30 space-y-3">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your response to this review..."
                  rows={3}
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {replyText.length}/500 characters
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleSubmitReply(review.id)}
                      disabled={isSubmitting || !replyText.trim()}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1" />
                          Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Reply Button */}
            {!review.chef_reply && replyingTo !== review.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReplyingTo(review.id)}
                className="gap-1"
              >
                <MessageSquare className="w-4 h-4" />
                Reply to Review
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChefReviewsManager;
