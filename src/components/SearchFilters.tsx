import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCuisine: string | null;
  onCuisineChange: (cuisine: string | null) => void;
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

const SearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedCuisine,
  onCuisineChange,
}: SearchFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by chef name, cuisine, or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card border-border h-12"
        />
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
