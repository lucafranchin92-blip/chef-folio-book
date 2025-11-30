import { createContext, useContext, useState, ReactNode } from "react";
import { Chef } from "@/types/chef";

export interface CartItem {
  chef: Chef;
  serviceType: string;
  date: string;
  guests: number;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (chefId: string, serviceType: string) => void;
  updateQuantity: (chefId: string, serviceType: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.chef.id === newItem.chef.id && item.serviceType === newItem.serviceType
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (chefId: string, serviceType: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.chef.id === chefId && item.serviceType === serviceType))
    );
  };

  const updateQuantity = (chefId: string, serviceType: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(chefId, serviceType);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.chef.id === chefId && item.serviceType === serviceType
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
