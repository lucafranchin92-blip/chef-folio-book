import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, ChefHat, User, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-primary" />
            <span className="font-serif text-xl text-foreground">
              Private<span className="text-primary">Chef</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`font-sans text-sm tracking-wide transition-colors ${
                isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Browse Chefs
            </Link>
            <Link
              to="/reservations"
              className={`font-sans text-sm tracking-wide transition-colors ${
                isActive("/reservations") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Reservations
            </Link>
            <Link
              to="/cart"
              className="relative text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs font-sans font-medium rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
            <Button variant="gold" size="sm">
              <User className="w-4 h-4 mr-1" />
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-sans text-sm tracking-wide ${
                  isActive("/") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Browse Chefs
              </Link>
              <Link
                to="/reservations"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-sans text-sm tracking-wide ${
                  isActive("/reservations") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                My Reservations
              </Link>
              <Button variant="gold" size="default" className="w-full">
                <User className="w-4 h-4 mr-1" />
                Sign In
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
