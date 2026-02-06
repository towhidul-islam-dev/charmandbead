"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;

var _server = require("next/server");

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Product = _interopRequireDefault(require("@/models/Product"));

var _auth = require("@/lib/auth");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

// ✅ Using the centralized auth helper
// ------------------------------------
// --- 1. GET (READ ALL PRODUCTS) ---
// ------------------------------------
function GET(request) {
  var authError, _ref, searchParams, isNewArrivalParam, filter, products;

  return regeneratorRuntime.async(function GET$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // 🛡️ Use the imported helper directly
          authError = (0, _auth.authorizeAdmin)(request);

          if (!authError) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", authError);

        case 3:
          _context.prev = 3;
          _context.next = 6;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 6:
          _ref = new URL(request.url), searchParams = _ref.searchParams;
          isNewArrivalParam = searchParams.get("newArrival"); // 💡 Filter logic for New Arrivals vs All Products

          filter = {};

          if (isNewArrivalParam === "true") {
            filter = {
              isNewArrival: true
            };
          } // Sorting by newest first to highlight New Arrivals


          _context.next = 12;
          return regeneratorRuntime.awrap(_Product["default"].find(filter).sort({
            createdAt: -1
          }));

        case 12:
          products = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json(products, {
            status: 200
          }));

        case 16:
          _context.prev = 16;
          _context.t0 = _context["catch"](3);
          console.error("API GET Error:", _context.t0);
          return _context.abrupt("return", _server.NextResponse.json({
            message: 'Failed to fetch products'
          }, {
            status: 500
          }));

        case 20:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[3, 16]]);
} // ------------------------------------
// --- 2. POST (CREATE NEW PRODUCT) ---
// ------------------------------------


function POST(request) {
  var authError, newProductData, createdProduct;
  return regeneratorRuntime.async(function POST$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          authError = (0, _auth.authorizeAdmin)(request);

          if (!authError) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", authError);

        case 3:
          _context2.prev = 3;
          _context2.next = 6;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 6:
          _context2.next = 8;
          return regeneratorRuntime.awrap(request.json());

        case 8:
          newProductData = _context2.sent;
          _context2.next = 11;
          return regeneratorRuntime.awrap(_Product["default"].create(newProductData));

        case 11:
          createdProduct = _context2.sent;
          return _context2.abrupt("return", _server.NextResponse.json({
            message: 'Product created successfully',
            product: createdProduct
          }, {
            status: 201
          }));

        case 15:
          _context2.prev = 15;
          _context2.t0 = _context2["catch"](3);
          console.error("API POST Error:", _context2.t0.message);
          return _context2.abrupt("return", _server.NextResponse.json({
            message: 'Failed to create product',
            details: _context2.t0.message
          }, {
            status: 400
          }));

        case 19:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[3, 15]]);
} // ----------------------------------------
// --- 3. PUT (UPDATE EXISTING PRODUCT) ---
// ----------------------------------------


function PUT(request) {
  var authError, _ref2, _id, updateData, updatedProduct;

  return regeneratorRuntime.async(function PUT$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          authError = (0, _auth.authorizeAdmin)(request);

          if (!authError) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", authError);

        case 3:
          _context3.prev = 3;
          _context3.next = 6;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 6:
          _context3.next = 8;
          return regeneratorRuntime.awrap(request.json());

        case 8:
          _ref2 = _context3.sent;
          _id = _ref2._id;
          updateData = _objectWithoutProperties(_ref2, ["_id"]);

          if (_id) {
            _context3.next = 13;
            break;
          }

          return _context3.abrupt("return", _server.NextResponse.json({
            message: 'Product ID is required'
          }, {
            status: 400
          }));

        case 13:
          _context3.next = 15;
          return regeneratorRuntime.awrap(_Product["default"].findByIdAndUpdate(_id, updateData, {
            "new": true,
            runValidators: true
          }));

        case 15:
          updatedProduct = _context3.sent;

          if (updatedProduct) {
            _context3.next = 18;
            break;
          }

          return _context3.abrupt("return", _server.NextResponse.json({
            message: "Product ".concat(_id, " not found")
          }, {
            status: 404
          }));

        case 18:
          return _context3.abrupt("return", _server.NextResponse.json({
            message: "Product updated successfully",
            product: updatedProduct
          }, {
            status: 200
          }));

        case 21:
          _context3.prev = 21;
          _context3.t0 = _context3["catch"](3);
          console.error("API PUT Error:", _context3.t0.message);
          return _context3.abrupt("return", _server.NextResponse.json({
            message: 'Failed to update',
            details: _context3.t0.message
          }, {
            status: 500
          }));

        case 25:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[3, 21]]);
} // -------------------------------------------
// --- 4. DELETE (ARCHIVE/REMOVE PRODUCT) ---
// -------------------------------------------


function DELETE(request) {
  var authError, _ref3, searchParams, productId, archivedProduct;

  return regeneratorRuntime.async(function DELETE$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          authError = (0, _auth.authorizeAdmin)(request);

          if (!authError) {
            _context4.next = 3;
            break;
          }

          return _context4.abrupt("return", authError);

        case 3:
          _context4.prev = 3;
          _context4.next = 6;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 6:
          _ref3 = new URL(request.url), searchParams = _ref3.searchParams;
          productId = searchParams.get('id');

          if (productId) {
            _context4.next = 10;
            break;
          }

          return _context4.abrupt("return", _server.NextResponse.json({
            message: 'Product ID is required'
          }, {
            status: 400
          }));

        case 10:
          _context4.next = 12;
          return regeneratorRuntime.awrap(_Product["default"].findByIdAndUpdate(productId, {
            status: 'Archived'
          }, {
            "new": true
          }));

        case 12:
          archivedProduct = _context4.sent;

          if (archivedProduct) {
            _context4.next = 15;
            break;
          }

          return _context4.abrupt("return", _server.NextResponse.json({
            message: "Product not found"
          }, {
            status: 404
          }));

        case 15:
          return _context4.abrupt("return", _server.NextResponse.json({
            message: "Product archived."
          }, {
            status: 200
          }));

        case 18:
          _context4.prev = 18;
          _context4.t0 = _context4["catch"](3);
          console.error("API DELETE Error:", _context4.t0);
          return _context4.abrupt("return", _server.NextResponse.json({
            message: 'Failed to archive'
          }, {
            status: 500
          }));

        case 22:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[3, 18]]);
}