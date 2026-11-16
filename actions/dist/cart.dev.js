"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateCartItemNote = updateCartItemNote;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Cart = _interopRequireDefault(require("@/models/Cart"));

var _cache = require("next/cache");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function updateCartItemNote(_ref) {
  var userId, productId, variantId, note, cart, itemIndex;
  return regeneratorRuntime.async(function updateCartItemNote$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          userId = _ref.userId, productId = _ref.productId, variantId = _ref.variantId, note = _ref.note;
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 4:
          if (!(!userId || !productId)) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return", {
            success: false,
            message: "Missing user or product information."
          });

        case 6:
          _context.next = 8;
          return regeneratorRuntime.awrap(_Cart["default"].findOne({
            userId: userId
          }));

        case 8:
          cart = _context.sent;

          if (cart) {
            _context.next = 11;
            break;
          }

          return _context.abrupt("return", {
            success: false,
            message: "Cart not found."
          });

        case 11:
          // Match the exact item & variant in the cart
          itemIndex = cart.items.findIndex(function (item) {
            var sameProduct = item.productId.toString() === productId.toString();
            var itemVarId = item.variantId ? item.variantId.toString() : null;
            var targetVarId = variantId ? variantId.toString() : null;
            return sameProduct && itemVarId === targetVarId;
          });

          if (!(itemIndex === -1)) {
            _context.next = 14;
            break;
          }

          return _context.abrupt("return", {
            success: false,
            message: "Item not found in cart."
          });

        case 14:
          cart.items[itemIndex].note = note.trim();
          _context.next = 17;
          return regeneratorRuntime.awrap(cart.save());

        case 17:
          (0, _cache.revalidatePath)("/dashboard/cart");
          return _context.abrupt("return", {
            success: true,
            note: cart.items[itemIndex].note
          });

        case 21:
          _context.prev = 21;
          _context.t0 = _context["catch"](1);
          console.error("UPDATE_CART_NOTE_ERROR:", _context.t0);
          return _context.abrupt("return", {
            success: false,
            message: "Failed to save note to database."
          });

        case 25:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 21]]);
}