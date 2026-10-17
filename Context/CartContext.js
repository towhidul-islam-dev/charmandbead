"use client";
import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const isFetchingServerCart = useRef(false);

  // Helper sanitizer to guarantee basePrice, uniqueKey, and clean IDs
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
        pricingTiers: item.pricingTiers || [],
      };
    });
  };

  // 1. Load Cart (Database if logged in, or localStorage if guest)
  useEffect(() => {
    if (status === "loading") return;

    setIsLoaded(false);

    if (session?.user) {
      isFetchingServerCart.current = true;

      // Fetch cart directly from database
      fetch("/api/cart")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.items)) {
            setCart(sanitizeItems(data.items));
          }
        })
        .catch((err) => console.error("Failed to load server cart:", err))
        .finally(() => {
          isFetchingServerCart.current = false;
          setIsLoaded(true);
        });
    } else {
      // --- GUEST USER ---
      const savedCart = localStorage.getItem("charm_cart");
      if (savedCart) {
        try {
          setCart(sanitizeItems(JSON.parse(savedCart)));
        } catch (e) {
          setCart([]);
        }
      } else {
        setCart([]);
      }
      setIsLoaded(true);
    }
  }, [status, session?.user]);

  // 2. Sync Cart Changes
  useEffect(() => {
    if (!isLoaded || isFetchingServerCart.current) return;

    if (session?.user) {
      // Save directly to database
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      }).catch((err) => console.error("Failed to sync cart to server:", err));
    } else {
      // Save to localStorage for guests
      localStorage.setItem("charm_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded, session?.user]);

  const addToCart = (product, variantOrDelta, quantity = 0) => {
    setCart((prev) => {
      let targetUniqueKey;
      let qChange;

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
      }

      const existingIndex = prev.findIndex((item) => item.uniqueKey === targetUniqueKey);

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
        pricingTiers: product.pricingTiers || variantOrDelta?.pricingTiers || [],
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

  const processedCart = useMemo(() => {
    const productTotals = cart.reduce((acc, item) => {
      const pId = (item.productId?.$oid || item.productId || "").toString();
      acc[pId] = (acc[pId] || 0) + Number(item.quantity || 0);
      return acc;
    }, {});

    return cart.map((item) => {
      const pId = (item.productId?.$oid || item.productId || "").toString();
      const vId = (item.variantId?.$oid || item.variantId || "std").toString();
      const calculatedPrice = Number(item.basePrice || item.price || 0);

      const totalQtyForThisProduct = productTotals[pId] || 0;
      let activePrice = calculatedPrice;

      if (item.pricingTiers && Array.isArray(item.pricingTiers) && item.pricingTiers.length > 0) {
        const sortedTiers = [...item.pricingTiers].sort((a, b) => b.minQuantity - a.minQuantity);
        const applicableTier = sortedTiers.find((tier) => totalQtyForThisProduct >= Number(tier.minQuantity));

        if (applicableTier) {
          activePrice = Number(applicableTier.unitPrice);
        }
      }

      return {
        ...item,
        productId: pId,
        variantId: vId === "std" ? null : vId,
        uniqueKey: item.uniqueKey || `${pId}-${vId}`,
        basePrice: calculatedPrice,
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
    } else {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [] }),
      }).catch((err) => console.error("Failed to clear server cart:", err));
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
        isLoaded,
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