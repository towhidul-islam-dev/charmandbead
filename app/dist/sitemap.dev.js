"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = sitemap;

var _data = require("@/lib/data");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function sitemap() {
  var baseUrl, _ref, success, products, productEntries;

  return regeneratorRuntime.async(function sitemap$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // 🟢 IMPORTANT: Use your actual live domain here for production
          baseUrl = "https://your-charm-store-domain.com";
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap((0, _data.getProducts)());

        case 4:
          _ref = _context.sent;
          success = _ref.success;
          products = _ref.products;

          if (!(!success || !products)) {
            _context.next = 9;
            break;
          }

          throw new Error("Failed to fetch products for sitemap");

        case 9:
          productEntries = products.map(function (product) {
            return {
              url: "".concat(baseUrl, "/product/").concat(product._id),
              // Use the serialized createdAt date from your data.js
              lastModified: new Date(product.createdAt),
              changeFrequency: 'daily',
              priority: 0.7
            };
          });
          return _context.abrupt("return", [{
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1.0
          }, {
            url: "".concat(baseUrl, "/shop"),
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9
          }].concat(_toConsumableArray(productEntries)));

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](1);
          console.error("Sitemap generation error:", _context.t0); // Fallback to static pages so the site doesn't crash

          return _context.abrupt("return", [{
            url: baseUrl,
            lastModified: new Date()
          }, {
            url: "".concat(baseUrl, "/shop"),
            lastModified: new Date()
          }]);

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 13]]);
}