import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Chef } from "@/types/chef";
import { Badge } from "@/components/ui/badge";

interface FeaturedChefsProps {
  chefs: Chef[];
}

const FeaturedChefs = ({ chefs }: FeaturedChefsProps) => {
  // Get top 4 chefs by rating
  const featuredChefs = chefs
    .filter((chef) => chef.rating >= 4.5)
    .slice(0, 4);

  if (featuredChefs.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-primary fill-primary" />
        <h2 className="text-xl font-serif text-foreground">Featured Chefs</h2>
        <Badge variant="secondary" className="text-xs">Top Rated</Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {featuredChefs.map((chef) => (
          <Link
            key={chef.id}
            to={`/chef/${chef.id}`}
            className="group relative overflow-hidden rounded-xl aspect-[3/4] bg-card border border-border hover:border-primary/50 transition-all duration-300"
          >
            <img
              src={chef.image}
              alt={chef.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-sm font-medium text-foreground">{chef.rating.toFixed(1)}</span>
              </div>
              <h3 className="font-serif text-lg text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
                {chef.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {chef.specialty}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedChefs;
