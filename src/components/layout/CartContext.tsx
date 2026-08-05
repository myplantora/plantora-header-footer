import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type CartContextValue = {
  count: number;
  addItem: (qty?: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const value = useMemo<CartContextValue>(
    () => ({
      count,
      addItem: (qty = 1) => setCount((c) => c + qty),
      clear: () => setCount(0),
    }),
    [count],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
