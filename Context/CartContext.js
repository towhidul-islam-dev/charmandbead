"use client";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

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
      // Distinguish between updating quantity (Cart Page) and adding new (Product Page)
      if (product.uniqueKey && typeof variantOrDelta === "number") {
        targetUniqueKey = product.uniqueKey;
        qChange = variantOrDelta;
      } else {
        const pId = (product._id?.$oid || product._id || product.productId).toString();
        const vId = (variantOrDelta?._id?.$oid || variantOrDelta?._id || product.variantId)?.toString();
        
        targetUniqueKey = product.uniqueKey || `${pId}-${vId || "std"}`;
        qChange = Number(quantity);
        isNewAddition = true;
      }

      const existingIndex = prev.findIndex(
        (item) => item.uniqueKey === targetUniqueKey,
      );

      // --- 🟢 STEP 2: UPDATE EXISTING ---
      if (existingIndex !== -1) {
        const updatedCart = [...prev];
        const item = updatedCart[existingIndex];
        const itemMoq = Number(item.minOrderQuantity) || 1;
        const availableStock = Number(item.stock) || 0;

        let newQty = item.quantity + qChange;

        // 🛡️ Stock Boundary Protection
        if (newQty > availableStock) {
          newQty = availableStock; 
        }
        
        // 🛡️ MOQ Protection
        if (!isNewAddition && newQty < itemMoq) newQty = itemMoq;

        // If no actual change in quantity, don't trigger a re-render
        if (item.quantity === newQty && !isNewAddition) return prev;

        updatedCart[existingIndex] = { ...item, quantity: newQty };
        return updatedCart;
      }

      // --- 🟢 STEP 3: ADD NEW ---
      const itemMoq = Number(
        product.minOrderQuantity || variantOrDelta?.minOrderQuantity || 1,
      );
      const availableStock = Number(variantOrDelta?.stock ?? product.stock ?? 0);
      
      // Normalize IDs to plain strings for the Backend
      const finalProductId = (product._id?.$oid || product._id || product.productId).toString();
      const finalVariantId = (variantOrDelta?._id?.$oid || variantOrDelta?._id || product.variantId)?.toString() || null;

      const newItem = {
        productId: finalProductId, 
        variantId: finalVariantId,
        uniqueKey: targetUniqueKey,
        name: product.name,
        price: Number(variantOrDelta?.price || product.price || 0),
        imageUrl: variantOrDelta?.image || variantOrDelta?.imageUrl || product.imageUrl || "/placeholder.png",
        size: variantOrDelta?.size || product.size || "N/A",
        color: variantOrDelta?.color || product.color || "Default",
        minOrderQuantity: itemMoq,
        stock: availableStock,
        // Ensure initial quantity doesn't exceed stock or fall below MOQ
        quantity: Math.min(availableStock, Math.max(itemMoq, qChange)),
        sku: variantOrDelta?.sku || product.sku || "N/A",
      };

      return [...prev, newItem];
    });
  };

  const removeFromCart = (uniqueKey) => {
    setCart((prev) => prev.filter((item) => item.uniqueKey !== uniqueKey));
  };

  const deleteSelectedItems = useCallback((selectedKeys) => {
    if (!selectedKeys || selectedKeys.length === 0) return;
    setCart((prev) =>
      prev.filter((item) => !selectedKeys.includes(item.uniqueKey)),
    );
  }, []);

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        deleteSelectedItems,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);