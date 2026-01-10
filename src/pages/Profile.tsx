import { User, Settings, HelpCircle, ShoppingCart, LogOut, Calendar, ChefHat, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import LocationSettings from "@/components/LocationSettings";
import { useLocation } from "@/contexts/LocationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { userLocation, setUserLocation } = useLocation();
  const { user, signOut, loading, userRole } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You've been signed out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-serif mb-6">Profile</h1>

        {/* Location Settings */}
        <div className="mb-8">
          <LocationSettings
            location={userLocation}
            onLocationChange={setUserLocation}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : user ? (
          /* Authenticated State */
          <>
            <div className="text-center py-8 mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-serif text-xl mb-1">{user.user_metadata?.full_name || "User"}</h2>
              <p className="text-muted-foreground font-sans text-sm">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              {userRole === 'chef' && (
                <Link to="/chef-dashboard" className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left">
                  <ChefHat className="w-5 h-5 text-muted-foreground" />
                  <span className="font-sans">Chef Dashboard</span>
                </Link>
              )}
              <Link to="/my-bookings" className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left">
                <ClipboardList className="w-5 h-5 text-muted-foreground" />
                <span className="font-sans">My Bookings</span>
              </Link>
              <Link to="/reservations" className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="font-sans">My Reservations</span>
              </Link>
              <Link to="/cart" className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left">
                <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                <span className="font-sans">My Cart</span>
              </Link>
              <button className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="font-sans">Settings</span>
              </button>
              <button className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span className="font-sans">Help & Support</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-destructive/50 transition-colors text-left text-destructive"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-sans">Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          /* Guest State */
          <>
            <div className="text-center py-12 mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-serif text-xl mb-2">Welcome, Guest</h2>
              <p className="text-muted-foreground font-sans mb-6 max-w-sm mx-auto">
                Sign in to manage your reservations and save your favorite chefs
              </p>
              <Link to="/auth">
                <Button variant="gold" size="lg">
                  Sign In or Create Account
                </Button>
              </Link>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              <Link to="/cart" className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left">
                <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                <span className="font-sans">My Cart</span>
              </Link>
              <button className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="font-sans">Settings</span>
              </button>
              <button className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span className="font-sans">Help & Support</span>
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Profile;
