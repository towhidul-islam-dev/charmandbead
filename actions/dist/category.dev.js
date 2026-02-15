"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDynamicCategoryStructure = getDynamicCategoryStructure;
exports.deleteCategoryAction = deleteCategoryAction;

var _Category = _interopRequireDefault(require("@/models/Category"));

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Product = _interopRequireDefault(require("@/models/Product"));

var _cache = require("next/cache");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getDynamicCategoryStructure() {
  var allCategories, structure, parents;
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
          structure = {}; // 1. Find all parent categories (those with no parentId)

          parents = allCategories.filter(function (cat) {
            return !cat.parentId;
          }); // 2. Map their children

          parents.forEach(function (parent) {
            structure[parent.name] = allCategories.filter(function (child) {
              return String(child.parentId) === String(parent._id);
            }).map(function (child) {
              return child.name;
            });
          });
          return _context.abrupt("return", structure);

        case 9:
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
            message: "Cannot delete. This category has sub-categories."
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
            message: "Cannot delete. Products are still assigned to this category."
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
          return _context2.abrupt("return", {
            success: false,
            message: "Delete failed."
          });

        case 22:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 19]]);
}