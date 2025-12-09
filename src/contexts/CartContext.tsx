import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SpecialOfferItem {
  offer_id: string;
  offer_name: string;
  bundle_price: number;
  products: {
    id: string;
    name: string;
    image_url?: string;
  }[];
  background_color?: string;
  text_color?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image_url?: string;
  quantity: number;
  selected_options: {
    size?: string;
    color?: string;
  };
  // For regular items, these are undefined
  is_special_offer?: boolean;
  special_offer?: SpecialOfferItem;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  addSpecialOffer: (offer: SpecialOfferItem) => void;
  specialOffers: CartItem[];
  regularItems: CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.product_id === item.product_id &&
          JSON.stringify(i.selected_options) === JSON.stringify(item.selected_options) &&
          !i.is_special_offer
      );
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, { ...item, id: `${item.product_id}-${Date.now()}` }];
    });
  };

  const addSpecialOffer = (offer: SpecialOfferItem) => {
    const newItem: CartItem = {
      id: `offer-${offer.offer_id}-${Date.now()}`,
      product_id: offer.offer_id,
      name: offer.offer_name,
      price: offer.bundle_price,
      image_url: offer.products[0]?.image_url,
      quantity: 1,
      selected_options: {},
      is_special_offer: true,
      special_offer: offer,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const specialOffers = items.filter(item => item.is_special_offer);
  const regularItems = items.filter(item => !item.is_special_offer);

  return (
    <CartContext.Provider
      value={{ 
        items, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart, 
        total,
        addSpecialOffer,
        specialOffers,
        regularItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
