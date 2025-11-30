import { Link } from "react-router-dom";
import { ShoppingCart, ChefHat, Trash2, Plus, Minus } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif">My Cart</h1>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground">
              Clear All
            </Button>
          )}
        </div>

        {items.length === 0 ? (
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
            {items.map((item) => (
              <div
                key={`${item.chef.id}-${item.serviceType}`}
                className="flex gap-4 p-4 bg-card border border-border rounded-lg"
              >
                <img
                  src={item.chef.image}
                  alt={item.chef.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg truncate">{item.chef.name}</h3>
                  <p className="text-sm text-muted-foreground font-sans">{item.serviceType}</p>
                  <p className="text-sm text-muted-foreground font-sans">
                    {item.date} • {item.guests} guests
                  </p>
                  <p className="font-serif text-primary mt-1">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.chef.id, item.serviceType)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.chef.id, item.serviceType, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full border border-border hover:border-primary transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-sans w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.chef.id, item.serviceType, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full border border-border hover:border-primary transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t border-border pt-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-sans text-muted-foreground">Subtotal</span>
                <span className="font-serif text-xl">${totalPrice.toFixed(2)}</span>
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
