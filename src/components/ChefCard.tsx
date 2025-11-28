import { Link } from "react-router-dom";
import { Star, MapPin, Clock } from "lucide-react";
import { Badge } from "./ui/badge";
import { Chef } from "@/types/chef";
import { useLocation } from "@/contexts/LocationContext";

interface ChefCardProps {
  chef: Chef;
}

const isNearby = (chefLocation: string, userLocation: string): boolean => {
  if (!userLocation) return false;
  const chefParts = chefLocation.toLowerCase().split(/[,\s]+/).filter(Boolean);
  const userParts = userLocation.toLowerCase().split(/[,\s]+/).filter(Boolean);
  return userParts.some(part => 
    chefParts.some(chefPart => chefPart.includes(part) || part.includes(chefPart))
  );
};

const ChefCard = ({ chef }: ChefCardProps) => {
  const { userLocation } = useLocation();
  const nearby = isNearby(chef.location, userLocation);
  return (
    <Link to={`/chef/${chef.id}`} className="block group">
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={chef.image}
            alt={chef.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {!chef.available && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-muted-foreground font-sans text-sm">Currently Unavailable</span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            {nearby && (
              <Badge className="bg-green-600 text-white">
                Near you
              </Badge>
            )}
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
              {chef.priceRange}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">
                {chef.name}
              </h3>
              <p className="text-primary text-sm font-sans">{chef.specialty}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-foreground font-sans text-sm">{chef.rating}</span>
              <span className="text-muted-foreground text-xs">({chef.reviewCount})</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground text-xs font-sans mt-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {chef.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {chef.experience}
            </span>
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {chef.cuisines.slice(0, 3).map((cuisine) => (
              <Badge key={cuisine} variant="outline" className="text-xs">
                {cuisine}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChefCard;
