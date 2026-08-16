import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "../lib/types";

interface CartContextValue {
  tableNumber: number | null;
  setTableNumber: (n: number | null) => void;
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  lastOrderId: string | null;
  setLastOrderId: (id: string | null) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function storageKey(table: number | null) {
  return `kafeflow_cart_${table ?? "default"}`;
}

const LAST_ORDER_KEY = "kafeflow_last_order_id";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [tableNumber, setTableNumberState] = useState<number | null>(() => {
    const raw = localStorage.getItem("kafeflow_table");
    return raw ? Number(raw) : null;
  });

  const [lastOrderId, setLastOrderIdState] = useState<string | null>(() =>
    localStorage.getItem(LAST_ORDER_KEY)
  );

  const setLastOrderId = useCallback((id: string | null) => {
    setLastOrderIdState(id);
    if (id) localStorage.setItem(LAST_ORDER_KEY, id);
    else localStorage.removeItem(LAST_ORDER_KEY);
  }, []);

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey(tableNumber));
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const setTableNumber = useCallback((n: number | null) => {
    setTableNumberState(n);
    if (n !== null) localStorage.setItem("kafeflow_table", String(n));
    try {
      const raw = localStorage.getItem(storageKey(n));
      setItems(raw ? (JSON.parse(raw) as CartItem[]) : []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey(tableNumber), JSON.stringify(items));
  }, [items, tableNumber]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const incrementItem = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i))
    );
  }, []);

  const decrementItem = useCallback((productId: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [items]
  );

  const value: CartContextValue = {
    tableNumber,
    setTableNumber,
    items,
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
    clearCart,
    totalCount,
    totalPrice,
    lastOrderId,
    setLastOrderId,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
