import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, User, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const BottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/cart", icon: ShoppingCart, label: "Cart", badge: totalItems },
    { path: "/reservations", icon: Calendar, label: "Bookings" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border md:hidden safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label, badge }) => (
          <Link
            key={path}
            to={path}
            className={`relative flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
              isActive(path) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {badge && badge > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-sans font-medium rounded-full flex items-center justify-center">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </div>
            <span className="text-xs font-sans">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
