/** * 🟢 CENTRAL CATEGORY DNA
 * This is the single source of truth for all categories and sub-categories.
 */
export const CATEGORY_DNA = [
  // MAIN CATEGORIES (24-character hex strings for MongoDB compatibility)
  { _id: "65cd1234567890abcdef0001", name: "Resin Art", slug: "resin-art", parentId: null },
  { _id: "65cd1234567890abcdef0002", name: "Jewelry Making", slug: "jewelry-making", parentId: null },
  { _id: "65cd1234567890abcdef0003", name: "Packaging", slug: "packaging", parentId: null },

  // SUB-CATEGORIES FOR RESIN ART (Matching parentId to 0001)
  { _id: "65cd1234567890abcdef0004", name: "Epoxy Resin", slug: "epoxy-resin", parentId: "65cd1234567890abcdef0001" },
  { _id: "65cd1234567890abcdef0005", name: "UV Resin", slug: "uv-resin", parentId: "65cd1234567890abcdef0001" },
  { _id: "65cd1234567890abcdef0006", name: "Silicone Molds", slug: "silicone-molds", parentId: "65cd1234567890abcdef0001" },

  // SUB-CATEGORIES FOR JEWELRY (Matching parentId to 0002)
  { _id: "65cd1234567890abcdef0007", name: "Charms & Pendants", slug: "charms", parentId: "65cd1234567890abcdef0002" },
  { _id: "65cd1234567890abcdef0008", name: "Tools & Pliers", slug: "tools", parentId: "65cd1234567890abcdef0002" },
  { _id: "65cd1234567890abcdef0009", name: "Beading Wires", slug: "beading-wires", parentId: "65cd1234567890abcdef0002" },
];