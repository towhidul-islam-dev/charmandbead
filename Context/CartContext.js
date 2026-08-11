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
      if (product.uniqueKey && typeof variantOrDelta === "number") {
        targetUniqueKey = product.uniqueKey;
        qChange = variantOrDelta;
      } else {
        const pId = (product._id?.$oid || product._id || product.productId)?.toString();
        const vId = (variantOrDelta?._id?.$oid || variantOrDelta?._id || product.variantId)?.toString();
        
        targetUniqueKey = product.uniqueKey || `${pId}-${vId || "std"}`;
        qChange = Number(quantity);
        isNewAddition = true;
      }

      const existingIndex = prev.findIndex((item) => item.uniqueKey === targetUniqueKey);

      // --- 🟢 STEP 2: UPDATE EXISTING ---
      if (existingIndex !== -1) {
        const updatedCart = [...prev];
        const item = updatedCart[existingIndex];
        const itemMoq = Number(item.minOrderQuantity) || 1;
        const availableStock = Number(item.stock) || 0;

        let rawQty = isNewAddition ? item.quantity + qChange : item.quantity + qChange;
        let newQty = Math.min(availableStock, Math.max(itemMoq, rawQty));

        if (item.quantity === newQty) return prev;

        updatedCart[existingIndex] = { ...item, quantity: newQty };
        return updatedCart;
      }

      // --- 🟢 STEP 3: ADD NEW ---
      const itemMoq = Number(product.minOrderQuantity || variantOrDelta?.minOrderQuantity || 1);
      const availableStock = Number(variantOrDelta?.stock ?? product.stock ?? 0);
      
      const finalProductId = (product._id?.$oid || product._id || product.productId)?.toString();
      const finalVariantId = (variantOrDelta?._id?.$oid || variantOrDelta?._id || product.variantId)?.toString() || null;

      let computedVariantName = product.variantName || variantOrDelta?.name || "";
      if (!computedVariantName && (variantOrDelta?.color || variantOrDelta?.size)) {
        computedVariantName = `${variantOrDelta.color || ""} ${variantOrDelta.size || ""}`.trim();
      } else if (!computedVariantName && variantOrDelta?.sku) {
        computedVariantName = `SKU: ${variantOrDelta.sku}`;
      } else if (!computedVariantName) {
        computedVariantName = "Standard Variant";
      }

      const newItem = {
        productId: finalProductId, 
        variantId: finalVariantId,
        uniqueKey: targetUniqueKey,
        name: product.name,
        variantName: computedVariantName,
        basePrice: Number(variantOrDelta?.price || product.price || 0),
        price: Number(variantOrDelta?.price || product.price || 0), 
        pricingTiers: product.pricingTiers || [], 
        imageUrl: variantOrDelta?.image || variantOrDelta?.imageUrl || product.imageUrl || "/placeholder.png",
        size: variantOrDelta?.size || product.size || "N/A",
        color: variantOrDelta?.color || product.color || "Default",
        minOrderQuantity: itemMoq,
        stock: availableStock,
        quantity: Math.min(availableStock, Math.max(itemMoq, qChange)),
        sku: variantOrDelta?.sku || product.sku || "N/A",
      };

      return [...prev, newItem];
    });
  };

  // --- 🟢 DYNAMIC PRICE CALCULATION ---
  const processedCart = useMemo(() => {
    const productTotals = cart.reduce((acc, item) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      return acc;
    }, {});

    return cart.map((item) => {
      const totalQtyForThisProduct = productTotals[item.productId];
      let activePrice = item.basePrice || item.price;

      if (item.pricingTiers && item.pricingTiers.length > 0) {
        const sortedTiers = [...item.pricingTiers].sort((a, b) => b.minQuantity - a.minQuantity);
        const applicableTier = sortedTiers.find((tier) => totalQtyForThisProduct >= tier.minQuantity);
        
        if (applicableTier) {
          activePrice = applicableTier.unitPrice;
        }
      }

      return { ...item, price: activePrice };
    });
  }, [cart]);

  const removeFromCart = useCallback((uniqueKey) => {
    setCart((prev) => prev.filter((item) => item.uniqueKey !== uniqueKey));
  }, []);

  // --- 🟢 ROBUST MULTI-KEY DELETE ---
  const deleteSelectedItems = useCallback((selectedKeys) => {
    if (!selectedKeys || !Array.isArray(selectedKeys) || selectedKeys.length === 0) return;

    const keyset = new Set(selectedKeys.map((k) => (k?.$oid || k || "").toString()));

    setCart((prev) =>
      prev.filter((item) => {
        const itemKey = (item.uniqueKey || "").toString();
        const itemProdId = (item.productId || "").toString();
        const itemVarId = (item.variantId || "").toString();

        return !(keyset.has(itemKey) || keyset.has(itemProdId) || keyset.has(itemVarId));
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem("charm_cart");
  }, []);

  const cartTotal = useMemo(() => {
    return processedCart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [processedCart]);

  const cartCount = useMemo(() => {
    return processedCart.reduce((acc, item) => acc + item.quantity, 0);
  }, [processedCart]);

  return (
    <CartContext.Provider
      value={{
        cart: processedCart, 
        rawCart: cart,      
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