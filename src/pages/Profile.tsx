import { User, Settings, HelpCircle, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-serif mb-6">Profile</h1>

        {/* Guest State */}
        <div className="text-center py-12 mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-xl mb-2">Welcome, Guest</h2>
          <p className="text-muted-foreground font-sans mb-6 max-w-sm mx-auto">
            Sign in to manage your reservations and save your favorite chefs
          </p>
          <Button variant="gold" size="lg">
            Sign In or Create Account
          </Button>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="font-sans">Settings</span>
          </button>
          <button className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors text-left">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-sans">Help & Support</span>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
