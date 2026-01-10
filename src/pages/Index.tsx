import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import ChefCard from "@/components/ChefCard";
import SearchFilters from "@/components/SearchFilters";
import FeaturedChefs from "@/components/FeaturedChefs";
import { ChefHat } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import { supabase } from "@/integrations/supabase/client";
import { Chef } from "@/types/chef";
import { Skeleton } from "@/components/ui/skeleton";

// Simple location matching - checks if locations share city/state keywords
const getLocationScore = (chefLocation: string, userLocation: string): number => {
  if (!userLocation) return 0;
  
  const chefParts = chefLocation.toLowerCase().split(/[,\s]+/).filter(Boolean);
  const userParts = userLocation.toLowerCase().split(/[,\s]+/).filter(Boolean);
  
  let score = 0;
  for (const userPart of userParts) {
    if (chefParts.some(part => part.includes(userPart) || userPart.includes(part))) {
      score += 1;
    }
  }
  return score;
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const { userLocation } = useLocation();

  useEffect(() => {
    fetchChefs();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('chef_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chef_profiles'
        },
        () => {
          fetchChefs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchChefs = async () => {
    const { data, error } = await supabase
      .from("chef_profiles")
      .select("*")
      .order("rating", { ascending: false });

    if (!error && data) {
      const mappedChefs: Chef[] = data.map((profile) => ({
        id: profile.id,
        name: profile.name,
        specialty: profile.specialty,
        image: profile.image_url || "/placeholder.svg",
        rating: profile.rating || 0,
        reviewCount: profile.review_count || 0,
        priceRange: profile.price_range,
        location: profile.location,
        experience: profile.experience,
        description: profile.description,
        cuisines: profile.cuisines,
        available: profile.available ?? true,
      }));
      setChefs(mappedChefs);
    }
    setLoading(false);
  };

  const filteredChefs = useMemo(() => {
    const filtered = chefs.filter((chef) => {
      const matchesSearch =
        chef.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.cuisines.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCuisine =
        !selectedCuisine || chef.cuisines.includes(selectedCuisine);

      const matchesCity =
        !selectedCity || chef.location === selectedCity;

      return matchesSearch && matchesCuisine && matchesCity;
    });

    // Sort by location proximity if user has set location
    if (userLocation && !selectedCity) {
      return filtered.sort((a, b) => {
        const scoreA = getLocationScore(a.location, userLocation);
        const scoreB = getLocationScore(b.location, userLocation);
        return scoreB - scoreA; // Higher score = closer match
      });
    }

    return filtered;
  }, [chefs, searchQuery, selectedCuisine, selectedCity, userLocation]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ChefHat className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif mb-2">
            Find Your Perfect <span className="text-primary">Private Chef</span>
          </h1>
          <p className="text-muted-foreground font-sans max-w-lg mx-auto">
            Book world-class chefs for unforgettable dining experiences in your home
          </p>
        </div>

        {/* Featured Chefs */}
        {!loading && !searchQuery && !selectedCuisine && !selectedCity && (
          <FeaturedChefs chefs={chefs} />
        )}

        {/* Search & Filters */}
        <div className="mb-8">
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCuisine={selectedCuisine}
            onCuisineChange={setSelectedCuisine}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
          />
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground font-sans text-sm">
            {loading ? "Loading..." : `${filteredChefs.length} chef${filteredChefs.length !== 1 ? "s" : ""} available`}
          </p>
        </div>

        {/* Chef Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChefs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChefs.map((chef) => (
              <ChefCard key={chef.id} chef={chef} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChefHat className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-sans mb-2">No chefs found matching your criteria</p>
            <p className="text-sm text-muted-foreground">
              {chefs.length === 0 
                ? "Be the first chef to join our marketplace!" 
                : "Try adjusting your search or filters"}
            </p>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
