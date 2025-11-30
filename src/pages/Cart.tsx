import { Link } from "react-router-dom";
import { ShoppingCart, ChefHat, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

const Cart = () => {
  // Placeholder - in real app, would fetch from context/database
  const cartItems: any[] = [];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-serif mb-6">My Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-xl mb-2">Your Cart is Empty</h2>
            <p className="text-muted-foreground font-sans mb-6 max-w-sm mx-auto">
              Browse our talented chefs and add their services to your cart
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
            {/* Cart items would go here */}
            <div className="border-t border-border pt-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-sans text-muted-foreground">Subtotal</span>
                <span className="font-serif text-xl">$0.00</span>
              </div>
              <Button variant="gold" className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Cart;
