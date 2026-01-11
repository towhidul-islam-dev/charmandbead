"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // 1. Load from localStorage on mount
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

  /**
   * addToCart handles two scenarios:
   * A) Adding NEW item from Product Page: addToCart(product, variant, qty)
   * B) Updating EXISTING item from Cart Page: addToCart(cartItem, delta)
   */
  const addToCart = (product, variantOrDelta, quantity = 0) => {
    setCart((prev) => {
      let targetProductId, targetVariantId, qChange;

      // DETECT SOURCE: Is 'product' a cart item or a base product?
      const isCartUpdate = !!product.uniqueKey; 

      if (isCartUpdate) {
        // SCENARIO B: Update from Cart Page
        targetProductId = product.productId;
        targetVariantId = product.variantId;
        qChange = Number(variantOrDelta); // This is the increment (+5, -5, etc)
      } else {
        // SCENARIO A: New add from Product Page
        targetProductId = product._id;
        targetVariantId = variantOrDelta?._id || `std-${product._id}`;
        qChange = Number(quantity);
      }

      const existingIndex = prev.findIndex(
        (item) => item.productId === targetProductId && item.variantId === targetVariantId
      );

      // --- LOGIC: UPDATE EXISTING ITEM ---
      if (existingIndex !== -1) {
        const updatedCart = [...prev];
        const item = updatedCart[existingIndex];
        
        // Always respect the MOQ saved inside the cart item
        const itemMoq = Number(item.minOrderQuantity) || 1;
        
        let newQty = item.quantity + qChange;

        // Safety: Never drop below MOQ
        if (newQty < itemMoq) newQty = itemMoq;

        // Prevention: Avoid double-increments in React Strict Mode
        // If the quantity is already where we want it, return current state
        if (item.quantity === newQty && isCartUpdate) return prev;

        updatedCart[existingIndex] = { ...item, quantity: newQty };
        return updatedCart;
      }

      // --- LOGIC: ADD NEW ITEM ---
      // Get MOQ from variant first, then product, default to 1
      const itemMoq = Number(variantOrDelta?.minOrderQuantity || product.minOrderQuantity || 1);
      
      const newItem = {
        productId: targetProductId,
        variantId: targetVariantId,
        uniqueKey: `${targetProductId}-${targetVariantId}`,
        name: product.name,
        price: Number(variantOrDelta?.price || product.price || 0),
        imageUrl: variantOrDelta?.imageUrl || product.imageUrl || "/placeholder.png",
        size: variantOrDelta?.size || "Standard",
        color: variantOrDelta?.color || "Default",
        minOrderQuantity: itemMoq, 
        quantity: Math.max(itemMoq, qChange), // Ensure starting qty >= MOQ
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

  // --- MEMOIZED TOTALS ---
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.length; 
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