import { Link } from "react-router-dom";
import { Calendar, ChefHat } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

const Reservations = () => {
  // Placeholder - in real app, would fetch from database
  const reservations: any[] = [];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-serif mb-6">My Reservations</h1>

        {reservations.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-xl mb-2">No Reservations Yet</h2>
            <p className="text-muted-foreground font-sans mb-6 max-w-sm mx-auto">
              Book your first private chef experience and it will appear here
            </p>
            <Link to="/">
              <Button variant="gold">
                <ChefHat className="w-4 h-4 mr-2" />
                Browse Chefs
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Reservation cards would go here */}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Reservations;
