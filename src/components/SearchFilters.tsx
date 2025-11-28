import { Search, SlidersHorizontal, MapPin, ChevronDown } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { chefs } from "@/data/chefs";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCuisine: string | null;
  onCuisineChange: (cuisine: string | null) => void;
  selectedCity: string | null;
  onCityChange: (city: string | null) => void;
}

const cuisines = [
  "All",
  "French",
  "Italian",
  "Japanese",
  "Mexican",
  "American",
  "Mediterranean",
];

// Extract unique cities from chefs data
const cities = ["All Cities", ...Array.from(new Set(chefs.map((chef) => chef.location)))];

const SearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedCuisine,
  onCuisineChange,
  selectedCity,
  onCityChange,
}: SearchFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by chef name, cuisine..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card border-border h-12"
          />
        </div>
        
        {/* City Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="elegant" className="h-12 px-4 gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">{selectedCity || "All Cities"}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border z-50">
            {cities.map((city) => (
              <DropdownMenuItem
                key={city}
                onClick={() => onCityChange(city === "All Cities" ? null : city)}
                className={`cursor-pointer ${
                  (city === "All Cities" && !selectedCity) || selectedCity === city
                    ? "bg-primary/10 text-primary"
                    : ""
                }`}
              >
                {city}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cuisine Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {cuisines.map((cuisine) => (
          <Button
            key={cuisine}
            variant={
              (cuisine === "All" && !selectedCuisine) || selectedCuisine === cuisine
                ? "gold"
                : "elegant"
            }
            size="sm"
            onClick={() => onCuisineChange(cuisine === "All" ? null : cuisine)}
            className="flex-shrink-0"
          >
            {cuisine}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SearchFilters;
