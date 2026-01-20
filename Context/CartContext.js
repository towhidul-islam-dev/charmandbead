"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // 1. Load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("charm_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  // 2. Sync to localStorage
  useEffect(() => {
    localStorage.setItem("charm_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, variantOrDelta, quantity = 0) => {
    setCart((prev) => {
      let targetUniqueKey;
      let qChange;
      let isNewAddition = false;

      // --- 🟢 STEP 1: NORMALIZE INPUTS ---
      // Detection logic: If the first argument has a uniqueKey AND the second is a number, it's a Cart Page update.
      if (product.uniqueKey && typeof variantOrDelta === "number") {
        targetUniqueKey = product.uniqueKey;
        qChange = variantOrDelta;
      } else {
        // It's a Product Page addition (Single or Bulk)
        // Ensure we use the uniqueKey generated in the Purchase Section
        targetUniqueKey = product.uniqueKey || `${product._id}-${variantOrDelta?._id || 'std'}`;
        qChange = Number(quantity);
        isNewAddition = true;
      }

      const existingIndex = prev.findIndex((item) => item.uniqueKey === targetUniqueKey);

      // --- 🟢 STEP 2: UPDATE EXISTING ---
      if (existingIndex !== -1) {
        const updatedCart = [...prev];
        const item = updatedCart[existingIndex];
        const itemMoq = Number(item.minOrderQuantity) || 1;
        
        let newQty = item.quantity + qChange;

        // If updating from Cart Page, don't let it drop below MOQ
        if (!isNewAddition && newQty < itemMoq) newQty = itemMoq;

        // Strict mode prevention
        if (item.quantity === newQty && !isNewAddition) return prev;

        updatedCart[existingIndex] = { ...item, quantity: newQty };
        return updatedCart;
      }

      // --- 🟢 STEP 3: ADD NEW ---
      // If we are here, it's a variant that isn't in the cart yet
      const itemMoq = Number(product.minOrderQuantity || variantOrDelta?.minOrderQuantity || 1);
      
      const newItem = {
        productId: product.productId || product._id,
        variantId: variantOrDelta?._id || product.variantId || `std-${product._id}`,
        uniqueKey: targetUniqueKey,
        name: product.name,
        price: Number(product.price || variantOrDelta?.price || 0),
        imageUrl: product.imageUrl || variantOrDelta?.imageUrl || "/placeholder.png",
        size: product.size || variantOrDelta?.size || "Standard",
        color: product.color || variantOrDelta?.color || "Default",
        minOrderQuantity: itemMoq,
        stock: product.stock || variantOrDelta?.stock || 0,
        quantity: Math.max(itemMoq, qChange),
      };

      return [...prev, newItem];
    });
  };

  const removeFromCart = (uniqueKey) => {
    setCart((prev) => prev.filter((item) => item.uniqueKey !== uniqueKey));
  };

  const deleteSelectedItems = (selectedKeys) => {
    if (!selectedKeys || selectedKeys.length === 0) return;
    setCart((prev) => prev.filter((item) => !selectedKeys.includes(item.uniqueKey)));
  };

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0); // Count total units
  }, [cart]);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      deleteSelectedItems, 
      clearCart, 
      cartTotal, 
      cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);