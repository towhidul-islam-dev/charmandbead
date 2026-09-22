"use client";
import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState([]);
  const isInitialMount = useRef(true);
  const isSyncingFromServer = useRef(false);

  // Helper sanitizer to guarantee basePrice, uniqueKey, and clean IDs on any raw item list
  const sanitizeItems = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map((item) => {
      const pId = (item.productId?.$oid || item.productId || "").toString();
      const vId = (item.variantId?.$oid || item.variantId || "std").toString();
      const calculatedPrice = Number(item.price || item.basePrice || 0);

      return {
        ...item,
        productId: pId,
        variantId: vId === "std" ? null : vId,
        uniqueKey: item.uniqueKey || `${pId}-${vId}`,
        basePrice: Number(item.basePrice || calculatedPrice),
        price: calculatedPrice,
      };
    });
  };

  // 1. Load Cart (From Server if logged in, or localStorage if guest)
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      const localGuestCart = localStorage.getItem("charm_cart");
      let parsedGuestItems = [];
      
      if (localGuestCart) {
        try {
          parsedGuestItems = sanitizeItems(JSON.parse(localGuestCart));
        } catch (e) {
          parsedGuestItems = [];
        }
      }

      fetch("/api/cart")
        .then((res) => res.json())
        .then(async (data) => {
          if (data.success && Array.isArray(data.items)) {
            let finalServerItems = sanitizeItems(data.items);

            if (parsedGuestItems.length > 0) {
              const itemMap = new Map();
              
              finalServerItems.forEach(item => itemMap.set(item.uniqueKey, item));
              
              parsedGuestItems.forEach(guestItem => {
                if (itemMap.has(guestItem.uniqueKey)) {
                  const existing = itemMap.get(guestItem.uniqueKey);
                  itemMap.set(guestItem.uniqueKey, {
                    ...existing,
                    quantity: existing.quantity + guestItem.quantity
                  });
                } else {
                  itemMap.set(guestItem.uniqueKey, guestItem);
                }
              });

              finalServerItems = Array.from(itemMap.values());

              try {
                await fetch("/api/cart", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ items: finalServerItems }),
                });
              } catch (syncErr) {
                console.error("Failed to sync merged guest cart to server:", syncErr);
              }

              localStorage.removeItem("charm_cart");
            }

            isSyncingFromServer.current = true;
            setCart(finalServerItems);
          }
        })
        .catch((err) => console.error("Failed to load server cart:", err));
    } else {
      const savedCart = localStorage.getItem("charm_cart");
      if (savedCart) {
        try {
          setCart(sanitizeItems(JSON.parse(savedCart)));
        } catch (e) {
          setCart([]);
        }
      }
    }
  }, [status, session?.user]);

  // 2. Sync Cart Changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isSyncingFromServer.current) {
      isSyncingFromServer.current = false;
      return;
    }

    if (session?.user) {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      }).catch((err) => console.error("Failed to sync cart to server:", err));
    } else {
      localStorage.setItem("charm_cart", JSON.stringify(cart));
    }
  }, [cart, session?.user]);

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
        
        const vId = (
          variantOrDelta?._id?.$oid || 
          variantOrDelta?._id || 
          variantOrDelta?.variantId || 
          product.variantId || 
          product.variant?._id || 
          "std"
        ).toString();
        
        targetUniqueKey = product.uniqueKey || `${pId}-${vId}`;
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

        let rawQty = item.quantity + qChange;
        let newQty = Math.min(availableStock, Math.max(itemMoq, rawQty));

        if (item.quantity === newQty) return prev;

        updatedCart[existingIndex] = { ...item, quantity: newQty };
        return updatedCart;
      }

      // --- 🟢 STEP 3: ADD NEW ---
      const itemMoq = Number(product.minOrderQuantity || variantOrDelta?.minOrderQuantity || 1);
      const availableStock = Number(variantOrDelta?.stock ?? product.stock ?? 0);
      
      const finalProductId = (product._id?.$oid || product._id || product.productId)?.toString();
      
      const finalVariantId = (
        variantOrDelta?._id?.$oid || 
        variantOrDelta?._id || 
        variantOrDelta?.variantId || 
        product.variantId || 
        product.variant?._id || 
        null
      )?.toString();

      let computedVariantName = product.variantName || variantOrDelta?.name || "";
      if (!computedVariantName && (variantOrDelta?.color || variantOrDelta?.size)) {
        computedVariantName = `${variantOrDelta.color || ""} ${variantOrDelta.size || ""}`.trim();
      } else if (!computedVariantName && variantOrDelta?.sku) {
        computedVariantName = `SKU: ${variantOrDelta.sku}`;
      } else if (!computedVariantName) {
        computedVariantName = "Standard Variant";
      }

      const calculatedPrice = Number(variantOrDelta?.price || product.price || 0);

      const newItem = {
        productId: finalProductId, 
        variantId: finalVariantId,
        uniqueKey: targetUniqueKey || `${finalProductId}-${finalVariantId || "std"}`,
        name: product.name,
        variantName: computedVariantName,
        basePrice: Number(product.basePrice || variantOrDelta?.basePrice || calculatedPrice),
        price: calculatedPrice, 
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

  // --- 🟢 DYNAMIC PRICE CALCULATION & SANITIZATION ---
  const processedCart = useMemo(() => {
    const productTotals = cart.reduce((acc, item) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      return acc;
    }, {});

    return cart.map((item) => {
      const pId = (item.productId?.$oid || item.productId || "").toString();
      const vId = (item.variantId?.$oid || item.variantId || "std").toString();
      const calculatedPrice = Number(item.price || item.basePrice || 0);
      
      const totalQtyForThisProduct = productTotals[item.productId];
      let activePrice = calculatedPrice;

      if (item.pricingTiers && item.pricingTiers.length > 0) {
        const sortedTiers = [...item.pricingTiers].sort((a, b) => b.minQuantity - a.minQuantity);
        const applicableTier = sortedTiers.find((tier) => totalQtyForThisProduct >= tier.minQuantity);
        
        if (applicableTier) {
          activePrice = applicableTier.unitPrice;
        }
      }

      return {
        ...item,
        productId: pId,
        variantId: vId === "std" ? null : vId,
        uniqueKey: item.uniqueKey || `${pId}-${vId}`,
        basePrice: Number(item.basePrice || calculatedPrice),
        price: activePrice,
      };
    });
  }, [cart]);

  const removeFromCart = useCallback((uniqueKey) => {
    setCart((prev) => prev.filter((item) => item.uniqueKey !== uniqueKey));
  }, []);

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
    if (!session?.user) {
      localStorage.removeItem("charm_cart");
    }
  }, [session?.user]);

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