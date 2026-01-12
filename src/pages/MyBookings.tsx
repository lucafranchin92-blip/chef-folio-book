import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Users, ChefHat, MessageSquare, Star } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ReviewForm from "@/components/ReviewForm";

interface BookingWithChef {
  id: string;
  chef_id: string;
  event_date: string;
  event_time: string;
  event_type: string;
  guest_count: number;
  message: string | null;
  status: string;
  chef_response: string | null;
  created_at: string;
  chef_profiles: {
    name: string;
    specialty: string;
    image_url: string | null;
  } | null;
}

const MyBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithChef[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());
  const [reviewDialogOpen, setReviewDialogOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchBookings();

      // Subscribe to real-time updates for this buyer's bookings
      const channel = supabase
        .channel('my_bookings_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'booking_requests',
            filter: `buyer_id=eq.${user.id}`
          },
          () => {
            fetchBookings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("booking_requests")
      .select(`
        *,
        chef_profiles (
          name,
          specialty,
          image_url
        )
      `)
      .eq("buyer_id", user!.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data as BookingWithChef[]);
      
      // Check which bookings have been reviewed
      const bookingIds = data.map((b) => b.id);
      if (bookingIds.length > 0) {
        const { data: reviews } = await supabase
          .from("reviews")
          .select("booking_id")
          .in("booking_id", bookingIds);
        
        if (reviews) {
          setReviewedBookings(new Set(reviews.map((r) => r.booking_id).filter(Boolean) as string[]));
        }
      }
    }
    setLoading(false);
  };

  const handleReviewSuccess = (bookingId: string) => {
    setReviewedBookings((prev) => new Set([...prev, bookingId]));
    setReviewDialogOpen(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">
                Browse our talented chefs and send your first booking request!
              </p>
              <Button onClick={() => navigate("/")}>Browse Chefs</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {booking.chef_profiles?.image_url ? (
                        <img
                          src={booking.chef_profiles.image_url}
                          alt={booking.chef_profiles.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <ChefHat className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {booking.chef_profiles?.name || "Chef"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {booking.chef_profiles?.specialty}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(booking.event_date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.event_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.guest_count} guests</span>
                    </div>
                    <div>
                      <Badge variant="outline">{booking.event_type}</Badge>
                    </div>
                  </div>

                  {booking.message && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Your message:</span> {booking.message}
                      </p>
                    </div>
                  )}

                  {booking.chef_response && (
                    <div className="bg-primary/10 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">Chef's response:</span>{" "}
                          {booking.chef_response}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground">
                      Requested on {format(new Date(booking.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    
                    {booking.status === "accepted" && !reviewedBookings.has(booking.id) && (
                      <Dialog open={reviewDialogOpen === booking.id} onOpenChange={(open) => setReviewDialogOpen(open ? booking.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Star className="h-4 w-4" />
                            Leave Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Review {booking.chef_profiles?.name}</DialogTitle>
                          </DialogHeader>
                          <ReviewForm
                            chefId={booking.chef_id}
                            bookingId={booking.id}
                            onSuccess={() => handleReviewSuccess(booking.id)}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {reviewedBookings.has(booking.id) && (
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        Reviewed
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default MyBookings;
