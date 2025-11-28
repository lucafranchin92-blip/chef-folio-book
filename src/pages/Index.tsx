import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ChefCard from "@/components/ChefCard";
import SearchFilters from "@/components/SearchFilters";
import { chefs } from "@/data/chefs";
import { ChefHat } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";

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
  const { userLocation } = useLocation();

  const filteredChefs = useMemo(() => {
    const filtered = chefs.filter((chef) => {
      const matchesSearch =
        chef.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chef.cuisines.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCuisine =
        !selectedCuisine || chef.cuisines.includes(selectedCuisine);

      return matchesSearch && matchesCuisine;
    });

    // Sort by location proximity if user has set location
    if (userLocation) {
      return filtered.sort((a, b) => {
        const scoreA = getLocationScore(a.location, userLocation);
        const scoreB = getLocationScore(b.location, userLocation);
        return scoreB - scoreA; // Higher score = closer match
      });
    }

    return filtered;
  }, [searchQuery, selectedCuisine, userLocation]);

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

        {/* Search & Filters */}
        <div className="mb-8">
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCuisine={selectedCuisine}
            onCuisineChange={setSelectedCuisine}
          />
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground font-sans text-sm">
            {filteredChefs.length} chef{filteredChefs.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Chef Grid */}
        {filteredChefs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChefs.map((chef) => (
              <ChefCard key={chef.id} chef={chef} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-sans">No chefs found matching your criteria</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
