"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDynamicCategoryStructure = getDynamicCategoryStructure;
exports.deleteCategoryAction = deleteCategoryAction;
exports.saveCategoryAction = saveCategoryAction;

var _Category = _interopRequireDefault(require("@/models/Category"));

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Product = _interopRequireDefault(require("@/models/Product"));

var _cache = require("next/cache");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Fetches both the nested structure and the flat array of categories.
 * Useful for both the Product Form dropdowns and the Category Manager.
 */
function getDynamicCategoryStructure() {
  var allCategories, serializedCategories, structure, parents;
  return regeneratorRuntime.async(function getDynamicCategoryStructure$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 2:
          _context.next = 4;
          return regeneratorRuntime.awrap(_Category["default"].find().lean());

        case 4:
          allCategories = _context.sent;
          serializedCategories = JSON.parse(JSON.stringify(allCategories));
          structure = {}; // 1. Find all parent categories (those with no parentId)

          parents = serializedCategories.filter(function (cat) {
            return !cat.parentId;
          }); // 2. Map their children

          parents.forEach(function (parent) {
            structure[parent.name] = serializedCategories.filter(function (child) {
              return String(child.parentId) === String(parent._id);
            }).map(function (child) {
              return child.name;
            });
          });
          return _context.abrupt("return", {
            structure: structure,
            // e.g., { "Beads": ["Crystal", "Glass"], "Charms": [...] }
            raw: serializedCategories // Full flat list for the CategoryManager modal

          });

        case 10:
        case "end":
          return _context.stop();
      }
    }
  });
}

function deleteCategoryAction(id) {
  var hasChildren, hasProducts;
  return regeneratorRuntime.async(function deleteCategoryAction$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(_Category["default"].findOne({
            parentId: id
          }));

        case 5:
          hasChildren = _context2.sent;

          if (!hasChildren) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", {
            success: false,
            message: "Hierarchy Protection: This category has sub-categories that must be removed first."
          });

        case 8:
          _context2.next = 10;
          return regeneratorRuntime.awrap(_Product["default"].findOne({
            $or: [{
              category: id
            }, {
              subCategory: id
            }]
          }));

        case 10:
          hasProducts = _context2.sent;

          if (!hasProducts) {
            _context2.next = 13;
            break;
          }

          return _context2.abrupt("return", {
            success: false,
            message: "Inventory Protection: Products are still assigned to this category."
          });

        case 13:
          _context2.next = 15;
          return regeneratorRuntime.awrap(_Category["default"].findByIdAndDelete(id));

        case 15:
          (0, _cache.revalidatePath)("/admin/categories");
          return _context2.abrupt("return", {
            success: true
          });

        case 19:
          _context2.prev = 19;
          _context2.t0 = _context2["catch"](0);
          console.error("Delete Error:", _context2.t0);
          return _context2.abrupt("return", {
            success: false,
            message: "Sync Error: Could not delete category."
          });

        case 23:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 19]]);
}
/**
 * New helper to save/update categories
 */


function saveCategoryAction(formData) {
  var name, parentId, newCategory;
  return regeneratorRuntime.async(function saveCategoryAction$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          name = formData.get("name");
          parentId = formData.get("parentId") || null;

          if (name) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", {
            success: false,
            message: "Name is required"
          });

        case 7:
          _context3.next = 9;
          return regeneratorRuntime.awrap(_Category["default"].create({
            name: name,
            parentId: parentId
          }));

        case 9:
          newCategory = _context3.sent;
          (0, _cache.revalidatePath)("/admin/categories");
          (0, _cache.revalidatePath)("/admin/products/create"); // Revalidate where the dropdowns live

          return _context3.abrupt("return", {
            success: true,
            data: JSON.parse(JSON.stringify(newCategory))
          });

        case 15:
          _context3.prev = 15;
          _context3.t0 = _context3["catch"](0);
          return _context3.abrupt("return", {
            success: false,
            message: "Failed to create category"
          });

        case 18:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 15]]);
}