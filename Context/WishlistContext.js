"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch & Merge Wishlist based on Auth State
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      
      if (session?.user) {
        try {
          // --- MERGE LOGIC ---
          const guestSaved = localStorage.getItem("wishlist_guest");
          if (guestSaved) {
            const guestItems = JSON.parse(guestSaved);
            if (guestItems.length > 0) {
              // 💡 Corrected to PLURAL 'users'
              const mergeRes = await fetch("/api/users/wishlist/merge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productIds: guestItems.map(p => p._id) }),
              });
              
              if (mergeRes.ok) {
                localStorage.removeItem("wishlist_guest");
                toast.success("Guest items synced to your account! ✨");
              }
            }
          }

          // 💡 Corrected to PLURAL 'users'
          const res = await fetch("/api/users/wishlist");
          if (res.ok) {
            const data = await res.json();
            setWishlist(data || []);
          }
        } catch (err) {
          console.error("Failed to sync wishlist", err);
        }
      } else {
        const saved = localStorage.getItem("wishlist_guest");
        if (saved) {
          setWishlist(JSON.parse(saved));
        } else {
          setWishlist([]);
        }
      }
      setLoading(false);
    };

    loadWishlist();
  }, [session]);

  // 2. Persist LocalStorage for guests only
  useEffect(() => {
    if (!session && !loading) {
      localStorage.setItem("wishlist_guest", JSON.stringify(wishlist));
    }
  }, [wishlist, session, loading]);

  const toggleWishlist = async (product) => {
    const productId = product._id;
    const isExist = wishlist.some((item) => item._id === productId);

    const updated = isExist 
      ? wishlist.filter((item) => item._id !== productId)
      : [...wishlist, product];
    
    setWishlist(updated);

    if (session) {
      try {
        // 💡 FIXED HERE: Changed /api/user/ to /api/users/
        const res = await fetch("/api/users/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        
        if (!res.ok) throw new Error();
        toast.success(isExist ? "Removed from wishlist" : "Added to wishlist");
      } catch (err) {
        setWishlist(wishlist); // Rollback
        toast.error("Cloud sync failed");
      }
    } else {
      toast.success(isExist ? "Removed from guest wishlist" : "Added to guest wishlist");
    }
  };

  const removeFromWishlist = async (productId) => {
    const productToRemove = wishlist.find(p => p._id === productId);
    if (productToRemove) {
      await toggleWishlist(productToRemove);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, removeFromWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);