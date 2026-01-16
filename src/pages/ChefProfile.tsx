import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, Loader2, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import BookingRequestForm from "@/components/BookingRequestForm";
import ReviewsList from "@/components/ReviewsList";
import { supabase } from "@/integrations/supabase/client";

interface ChefProfile {
  id: string;
  name: string;
  specialty: string;
  location: string;
  experience: string;
  description: string;
  cuisines: string[];
  price_range: string;
  available: boolean;
  image_url: string | null;
  rating: number;
  review_count: number;
}

const ChefProfilePage = () => {
  const { id } = useParams();
  const [chef, setChef] = useState<ChefProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchChef();
    }
  }, [id]);

  const fetchChef = async () => {
    try {
      const { data, error } = await supabase
        .from("chef_profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      setChef(data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching chef:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!chef) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Chef not found</p>
          <Link to="/">
            <Button variant="gold">Back to Browse</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-serif text-lg">Chef Profile</h1>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chef Info */}
          <div>
            {/* Profile Header */}
            <div className="flex gap-4 mb-6">
              {chef.image_url ? (
                <img
                  src={chef.image_url}
                  alt={chef.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-muted flex items-center justify-center">
                  <ChefHat className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-serif text-2xl text-foreground">{chef.name}</h2>
                    <p className="text-primary font-sans">{chef.specialty}</p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {chef.price_range}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="text-foreground font-sans">{chef.rating?.toFixed(1) || "0.0"}</span>
                  <span className="text-muted-foreground text-sm">
                    ({chef.review_count || 0} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground text-sm font-sans mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {chef.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {chef.experience}
                  </span>
                </div>
              </div>
            </div>

            {/* Cuisines */}
            <div className="flex gap-2 flex-wrap mb-6">
              {chef.cuisines.map((cuisine) => (
                <Badge key={cuisine} variant="outline">
                  {cuisine}
                </Badge>
              ))}
            </div>

            {/* About */}
            <div className="mb-6">
              <h3 className="font-serif text-lg text-foreground mb-2">About</h3>
              <p className="text-muted-foreground font-sans leading-relaxed">
                {chef.description}
              </p>
            </div>

            {/* Availability Status */}
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    chef.available ? "bg-green-500" : "bg-muted-foreground"
                  }`}
                />
                <span className="font-sans text-sm">
                  {chef.available
                    ? "Available for bookings"
                    : "Currently unavailable"}
                </span>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-8">
              <h3 className="font-serif text-lg text-foreground mb-4">
                Reviews ({chef.review_count || 0})
              </h3>
              <ReviewsList chefId={chef.id} />
            </div>
          </div>

          {/* Booking Section */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-serif text-xl text-foreground mb-6">
              Book This Chef
            </h3>

            {chef.available ? (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Send a booking request to {chef.name}. They'll review your event details and respond within 24 hours.
                </p>
                <BookingRequestForm chefId={chef.id} chefName={chef.name} />
                <p className="text-muted-foreground font-sans text-xs text-center">
                  Free to request • Pay after confirmation
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  This chef is currently not accepting new bookings.
                </p>
                <Link to="/">
                  <Button variant="outline">Browse Other Chefs</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ChefProfilePage;
