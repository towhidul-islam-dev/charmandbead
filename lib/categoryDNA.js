/** * 🟢 CENTRAL CATEGORY DNA
 * Single source of truth for IDs, Names, and Parent-Child relationships.
 */

// --- 🛠️ THE BUILDER ENGINE ---
const build = (name, idNum, parentId = null) => {
  const hexId = `65cd1234567890abcdef${String(idNum).padStart(4, "0")}`;
  return {
    _id: hexId,
    name: name,
    slug: name.toLowerCase().replace(/ & /g, "-and-").replace(/\s+/g, "-"),
    parentId: parentId,
  };
};

// --- 📁 1. DEFINE MAIN CATEGORY CONSTANTS ---
const RESIN_CHARMS = build("Resin charms", 100);
const ACRYLIC_CHARMS = build("Acrylic Charms", 200);
const SILVER_CHARMS = build("Silver charms", 300);
const FLOWER_CHARMS = build("Flower Charms", 400);
const PENDANT = build("Pendant", 500);
const RAW_MATERIALS = build("Basic Raw materials", 600);
const PLIER = build("Plier", 700);
const KEY_RING = build("Key ring", 800);
const FRUIT_CHARM = build("Fruit charm", 900);
const FOOD_CHARMS = build("Food charms", 1000);
const PEARL_CHARM = build("Pearl charm", 1100);
const LEAF_CHARM = build("Leaf charm", 1200);
const CERAMIC_CHARMS = build("Ceramic charms", 1300);
const BEADS = build("Beads", 1400);
const CORD_THREAD = build("Cord/Thread", 1500);
const STAINLESS_STEEL = build("Stainless steel materials", 1600);
const CCB_BEADS = build("CCB beads", 1700);
const LETTER_BEADS = build("Letter beads", 1800);
const BOX = build("Box", 1900);
const PACKAGING = build("Packaging material", 2000);
const CARTOON = build("Cartoon characters", 2100);
const SPACER = build("Spacer", 2200);
const PHONE_ACCESSORIES = build("Phone Accessories", 2300);

// --- 📋 2. EXPORT FINAL DNA LIST ---
export const CATEGORY_DNA = [
  // MAIN CATEGORIES
  RESIN_CHARMS,
  ACRYLIC_CHARMS,
  SILVER_CHARMS,
  FLOWER_CHARMS,
  PENDANT,
  RAW_MATERIALS,
  PLIER,
  KEY_RING,
  FRUIT_CHARM,
  FOOD_CHARMS,
  PEARL_CHARM,
  LEAF_CHARM,
  CERAMIC_CHARMS,
  BEADS,
  CORD_THREAD,
  STAINLESS_STEEL,
  CCB_BEADS,
  LETTER_BEADS,
  BOX,
  PACKAGING,
  CARTOON,
  SPACER,
  PHONE_ACCESSORIES,

  // --- SUB-CATEGORIES ---

  // Resin Charms
  build("Resin star", 101, RESIN_CHARMS._id),
  build("Heart", 102, RESIN_CHARMS._id),
  build("Spiral", 103, RESIN_CHARMS._id),
  build("Fish tail", 104, RESIN_CHARMS._id),
  build("Water drops", 105, RESIN_CHARMS._id),
  build("Moon spacer", 106, RESIN_CHARMS._id),
  build("Star fish", 107, RESIN_CHARMS._id),
  build("Butterfly", 108, RESIN_CHARMS._id),
  build("Bottle", 109, RESIN_CHARMS._id),
  build("Rainbow charm", 110, RESIN_CHARMS._id),

  // Acrylic Charms
  build("Star", 201, ACRYLIC_CHARMS._id),
  build("Heart", 202, ACRYLIC_CHARMS._id),
  build("Bow type-1", 203, ACRYLIC_CHARMS._id),
  build("Bow type-2", 204, ACRYLIC_CHARMS._id),
  build("Cat clow", 205, ACRYLIC_CHARMS._id),
  build("Flower", 206, ACRYLIC_CHARMS._id),
  build("Pentagon star", 207, ACRYLIC_CHARMS._id),
  build("Bow Old", 208, ACRYLIC_CHARMS._id),

  // Silver Charms (The Large List)
  build("Shine sparkle", 301, SILVER_CHARMS._id),
  build("Star", 302, SILVER_CHARMS._id),
  build("Heart", 303, SILVER_CHARMS._id),
  build("Solid heart", 304, SILVER_CHARMS._id),
  build("Solid star", 305, SILVER_CHARMS._id),
  build("Twinkle star", 306, SILVER_CHARMS._id),
  build("Tibetan heart", 307, SILVER_CHARMS._id),
  build("Dotted heart", 308, SILVER_CHARMS._id),
  build("Small thunder", 309, SILVER_CHARMS._id),
  build("Big thunder", 310, SILVER_CHARMS._id),
  build("Hello kitty", 311, SILVER_CHARMS._id),
  build("Small wing", 312, SILVER_CHARMS._id),
  build("Small moon", 313, SILVER_CHARMS._id),
  build("Solid moon", 314, SILVER_CHARMS._id),
  build("Down tilted moon", 315, SILVER_CHARMS._id),
  build("Lucky leaf type-1", 316, SILVER_CHARMS._id),
  build("Lucky leaf type-2", 317, SILVER_CHARMS._id),
  build("Double hook lucky leaf", 318, SILVER_CHARMS._id),
  build("Big lucky leaf", 319, SILVER_CHARMS._id),
  build("Spiral", 320, SILVER_CHARMS._id),
  build("Sunray", 321, SILVER_CHARMS._id),
  build("Solar spark", 322, SILVER_CHARMS._id),
  build("Double hook bow type-1", 323, SILVER_CHARMS._id),
  build("Double hook bow type-2", 324, SILVER_CHARMS._id),
  build("Plain double hook bow", 325, SILVER_CHARMS._id),
  build("Long bow knot", 326, SILVER_CHARMS._id),
  build("Curly bow", 327, SILVER_CHARMS._id),
  build("Small long bow", 328, SILVER_CHARMS._id),
  build("Small bow", 329, SILVER_CHARMS._id),
  build("Spoon type-1", 330, SILVER_CHARMS._id),
  build("Spoon type-2", 331, SILVER_CHARMS._id),
  build("Fork", 332, SILVER_CHARMS._id),
  build("Knife", 333, SILVER_CHARMS._id),
  build("Pan", 334, SILVER_CHARMS._id),
  build("Guitar type-1", 335, SILVER_CHARMS._id),
  build("Guitar type-2", 336, SILVER_CHARMS._id),
  build("Musical note type-1", 337, SILVER_CHARMS._id),
  build("Musical note type-2", 338, SILVER_CHARMS._id),
  build("Musical note type-3", 339, SILVER_CHARMS._id),
  build("Bow", 340, SILVER_CHARMS._id),
  build("Sword", 341, SILVER_CHARMS._id),
  build("Sword knife", 342, SILVER_CHARMS._id),
  build("Spider", 343, SILVER_CHARMS._id),
  build("Spider type-1", 344, SILVER_CHARMS._id),
  build("Flying bat", 345, SILVER_CHARMS._id),
  build("Small bat", 346, SILVER_CHARMS._id),
  build("Cat", 347, SILVER_CHARMS._id),
  build("Lock wing", 348, SILVER_CHARMS._id),
  build("Balloon dog", 349, SILVER_CHARMS._id),
  build("Double hook star", 350, SILVER_CHARMS._id),
  build("Strawberry", 351, SILVER_CHARMS._id),
  build("Small shine sparkle", 352, SILVER_CHARMS._id),

  // Flower Charms
  build("Bell flower", 401, FLOWER_CHARMS._id),
  build("Sakura flower", 402, FLOWER_CHARMS._id),
  build("Orchid flower", 403, FLOWER_CHARMS._id),
  build("Phoenix flower", 404, FLOWER_CHARMS._id),
  build("Tulips flower", 405, FLOWER_CHARMS._id),
  build("Lilly flower", 406, FLOWER_CHARMS._id),
  build("Phoenix folwer", 407, FLOWER_CHARMS._id),

  // Pendant
  build("Heart pendant", 501, PENDANT._id),
  build("Picture frame", 502, PENDANT._id),
  build("Daisy piendant", 503, PENDANT._id),

  // Basic Raw materials
  build("Eye needle pins", 601, RAW_MATERIALS._id),
  build("Flat needle pins", 602, RAW_MATERIALS._id),
  build("Dolphin hook", 603, RAW_MATERIALS._id),
  build("Jump ring", 604, RAW_MATERIALS._id),
  build("Crime hook", 605, RAW_MATERIALS._id),
  build("Crime beads", 606, RAW_MATERIALS._id),
  build("Earring base", 607, RAW_MATERIALS._id),
  build("Big earring base", 608, RAW_MATERIALS._id),
  build("Hair clip base", 609, RAW_MATERIALS._id),
  build("Hijab base", 610, RAW_MATERIALS._id),
  build("Copper wire", 611, RAW_MATERIALS._id),
  build("Ball pins", 612, RAW_MATERIALS._id),
  build("Glue", 613, RAW_MATERIALS._id),
  build("Phone strap", 614, RAW_MATERIALS._id),

  // Plier
  build("Round loop plier", 701, PLIER._id),
  build("Nose plier", 702, PLIER._id),
  build("Wire cutter", 703, PLIER._id),
  build("One Steep Looper plier", 704, PLIER._id),
  build("Concave plier", 705, PLIER._id),

  // Key ring
  build("Star", 801, KEY_RING._id),
  build("Moon", 802, KEY_RING._id),
  build("Sakura", 803, KEY_RING._id),
  build("Heart", 804, KEY_RING._id),
  build("Bunny", 805, KEY_RING._id),
  build("Regular key ring", 806, KEY_RING._id),
  build("Heart frame", 807, KEY_RING._id),
  build("House frame", 808, KEY_RING._id),
  build("Clover frame", 809, KEY_RING._id),
  build("Rectangle frame", 810, KEY_RING._id),
  build("Small rectangle frame", 811, KEY_RING._id),
  build("Buckle Key Ring", 812, KEY_RING._id),

  // Fruit charm
  build("Strawberry", 901, FRUIT_CHARM._id),
  build("Peach", 902, FRUIT_CHARM._id),
  build("Grape", 903, FRUIT_CHARM._id),
  build("Orange", 904, FRUIT_CHARM._id),
  build("Heart apple", 905, FRUIT_CHARM._id),
  build("Bite apple", 906, FRUIT_CHARM._id),
  build("Apple", 907, FRUIT_CHARM._id),
  build("Avocado", 908, FRUIT_CHARM._id),

  // Food charms
  build("Cup cake", 1001, FOOD_CHARMS._id),
  build("Strawberry jam", 1002, FOOD_CHARMS._id),
  build("Juice", 1003, FOOD_CHARMS._id),
  build("Coffee", 1004, FOOD_CHARMS._id),
  build("Steamer food", 1005, FOOD_CHARMS._id),
  build("Cake & Bread", 1006, FOOD_CHARMS._id),

  // Pearl charm
  build("Heart", 1101, PEARL_CHARM._id),
  build("Star", 1102, PEARL_CHARM._id),
  build("Small butterfly", 1103, PEARL_CHARM._id),
  build("Big butterfly", 1104, PEARL_CHARM._id),
  build("Small Bow", 1105, PEARL_CHARM._id),
  build("Bow type-1", 1106, PEARL_CHARM._id),
  build("Bow type-2", 1107, PEARL_CHARM._id),
  build("Bow type-3", 1108, PEARL_CHARM._id),
  build("Flower", 1109, PEARL_CHARM._id),
  build("Bow type-4", 1110, PEARL_CHARM._id),

  // Leaf charm
  build("Small leaf", 1201, LEAF_CHARM._id),
  build("Type-1 dark", 1202, LEAF_CHARM._id),
  build("Type-1 light", 1203, LEAF_CHARM._id),
  build("Type-2 dark", 1204, LEAF_CHARM._id),
  build("Type-2 light", 1205, LEAF_CHARM._id),
  build("Type-3 light", 1206, LEAF_CHARM._id),
  build("Type-3 dark", 1207, LEAF_CHARM._id),
  build("Type-4 light", 1208, LEAF_CHARM._id),
  build("Type-4 dark", 1209, LEAF_CHARM._id),
  build("Resin leaf olive", 1210, LEAF_CHARM._id),
  build("Resin leaf dark green", 1211, LEAF_CHARM._id),

  // Ceramic charms
  build("Fish", 1301, CERAMIC_CHARMS._id),
  build("Lucky leaf", 1302, CERAMIC_CHARMS._id),
  build("Rabbit", 1303, CERAMIC_CHARMS._id),
  build("Butterfly", 1304, CERAMIC_CHARMS._id),
  build("Star", 1305, CERAMIC_CHARMS._id),

  // Beads
  build("Solid glass beads 8mm", 1401, BEADS._id),
  build("Solid glass beads 6mm", 1402, BEADS._id),
  build("Stone beads", 1403, BEADS._id),
  build("Inner texture beads", 1404, BEADS._id),
  build("Crystal beads 8mm", 1405, BEADS._id),
  build("Crystal beads 4mm", 1406, BEADS._id),
  build("Crystal beads 6mm", 1407, BEADS._id),
  build("Pearl beads", 1408, BEADS._id),
  build("Seed beads", 1409, BEADS._id),
  build("Random Shaped stone beads", 14010, BEADS._id),

  // Cord/Thread
  build("Twisted cord", 1501, CORD_THREAD._id),
  build("Jade thread", 1502, CORD_THREAD._id),
  build("Nylon cord", 1503, CORD_THREAD._id),
  build("Stretch cord", 1504, CORD_THREAD._id),
  build("Taiwan wax cord", 1505, CORD_THREAD._id),
  build("Wax cord", 1506, CORD_THREAD._id),

  // Stainless steel materials
  build("Chain", 1601, STAINLESS_STEEL._id),
  build("Jump rings", 1602, STAINLESS_STEEL._id),
  build("Flat needle pins", 1603, STAINLESS_STEEL._id),
  build("Eye needle pins", 1604, STAINLESS_STEEL._id),
  build("Ball pins", 1605, STAINLESS_STEEL._id),
  build("Long loop chain", 1606, STAINLESS_STEEL._id),
  build("Extension chain", 1607, STAINLESS_STEEL._id),
  build("Edge grinding chain", 1608, STAINLESS_STEEL._id),
  build("Regular o-shape chain", 1609, STAINLESS_STEEL._id),
  build("Jump ring", 1610, STAINLESS_STEEL._id),

  // CCB beads
  build("Star", 1701, CCB_BEADS._id),
  build("Heart", 1702, CCB_BEADS._id),
  build("Irregular beads", 1703, CCB_BEADS._id),
  build("Heart Spacer", 1704, CCB_BEADS._id),
  build("Flower", 1705, CCB_BEADS._id),

  // Letter beads
  build("White", 1801, LETTER_BEADS._id),
  build("Black", 1802, LETTER_BEADS._id),
  build("Colorful", 1803, LETTER_BEADS._id),
  build("Heart", 1804, LETTER_BEADS._id),
  build("Number", 1805, LETTER_BEADS._id),

  // Box
  build("Compartment box", 1901, BOX._id),
  build("Ring Tray box", 1902, BOX._id),
  build("Square jewelry box", 1903, BOX._id),
  build("Cover Ring tray", 1904, BOX._id),

  // Packaging material
  build("Transparent packet", 2001, PACKAGING._id),
  build("Double layer packet", 2002, PACKAGING._id),
  build("Mailer Poly", 2003, PACKAGING._id),

  // Cartoon characters
  build("Sanrion charm", 2101, CARTOON._id),
  build("Lucky cat", 2102, CARTOON._id),
  build("Moon cat", 2103, CARTOON._id),
  build("Glitter sanrio", 2104, CARTOON._id),
  build("Labubu", 2105, CARTOON._id),
  build("Sanrio packet", 2106, CARTOON._id),
  build("Sterio puppy", 2107, CARTOON._id),
  build("3d sanrio", 2108, CARTOON._id),
  build("Kitten", 2109, CARTOON._id),
  build("Flat sanrio", 2110, CARTOON._id),

  //Spacer
  build("Spacer Charms", 2201, SPACER._id),

  //Phone Accessories
  build("Phone charms holder", 2301, PHONE_ACCESSORIES._id),
  build("Phone charms holder", 2302, PHONE_ACCESSORIES._id),
  build("Sholder Strap", 2303, PHONE_ACCESSORIES._id),
build("Phone charms holder", 2304, PHONE_ACCESSORIES._id),
build("Phone holder", 2305, PHONE_ACCESSORIES._id),
];

// --- 💡 HELPER EXPORTS ---
export const MAIN_CATEGORIES = CATEGORY_DNA.filter((c) => c.parentId === null);
export const getSubCategories = (parentId) =>
  CATEGORY_DNA.filter((c) => c.parentId === parentId);
