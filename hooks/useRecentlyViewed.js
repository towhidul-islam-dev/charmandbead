// hooks/useRecentlyViewed.js
export const addToRecentlyViewed = (product) => {
  if (typeof window === "undefined" || !product) return;

  const storageKey = "recently_viewed_j_materials";
  const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");

  // Keep only unique items, and limit to the last 4-8 items
  const filtered = existing.filter((item) => item._id !== product._id);
  const updated = [product, ...filtered].slice(0, 8); 

  localStorage.setItem(storageKey, JSON.stringify(updated));
};