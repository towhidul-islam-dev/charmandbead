"use strict";
'use server';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createReview = createReview;
exports.getAllReviews = getAllReviews;
exports.deleteReview = deleteReview;
exports.updateReview = updateReview;
exports.getFeaturedReviews = getFeaturedReviews;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Review = _interopRequireDefault(require("@/models/Review"));

var _cache = require("next/cache");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * 1. Create a Review
 */
function createReview(formData) {
  var isForm, description, imageUrl, rating, isFeatured, newReview;
  return regeneratorRuntime.async(function createReview$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          // Support both FormData (from Admin) and Plain Objects (from User Dashboard)
          isForm = formData instanceof FormData;
          description = isForm ? formData.get('description') : formData.description;
          imageUrl = isForm ? formData.get('imageUrl') : formData.imageUrl;
          rating = isForm ? formData.get('rating') : formData.rating;
          isFeatured = isForm ? formData.get('isFeatured') === 'true' : formData.isFeatured;

          if (!(!imageUrl || !description)) {
            _context.next = 10;
            break;
          }

          return _context.abrupt("return", {
            success: false,
            error: "Image and description are required."
          });

        case 10:
          _context.next = 12;
          return regeneratorRuntime.awrap(_Review["default"].create({
            description: description,
            imageUrl: imageUrl,
            rating: Number(rating) || 5,
            // Default to 5 if not provided
            isFeatured: isFeatured || false
          }));

        case 12:
          newReview = _context.sent;
          (0, _cache.revalidatePath)('/admin/reviews');
          (0, _cache.revalidatePath)('/');
          return _context.abrupt("return", {
            success: true,
            message: "Review posted successfully!",
            review: JSON.parse(JSON.stringify(newReview))
          });

        case 18:
          _context.prev = 18;
          _context.t0 = _context["catch"](0);
          console.error("❌ DB Create Error:", _context.t0);
          return _context.abrupt("return", {
            success: false,
            error: _context.t0.message
          });

        case 22:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 18]]);
}
/**
 * 2. Get All Reviews
 */


function getAllReviews() {
  var reviews;
  return regeneratorRuntime.async(function getAllReviews$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(_Review["default"].find().sort({
            createdAt: -1
          }).lean());

        case 5:
          reviews = _context2.sent;
          return _context2.abrupt("return", {
            success: true,
            reviews: JSON.parse(JSON.stringify(reviews))
          });

        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", {
            success: false,
            error: _context2.t0.message
          });

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 9]]);
}
/**
 * 3. Delete a Review
 * Explicitly exported to fix build error
 */


function deleteReview(id) {
  var result;
  return regeneratorRuntime.async(function deleteReview$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(_Review["default"].findByIdAndDelete(id));

        case 5:
          result = _context3.sent;

          if (result) {
            _context3.next = 8;
            break;
          }

          return _context3.abrupt("return", {
            success: false,
            error: "Review not found"
          });

        case 8:
          (0, _cache.revalidatePath)('/admin/reviews');
          (0, _cache.revalidatePath)('/');
          return _context3.abrupt("return", {
            success: true,
            message: "Review deleted successfully"
          });

        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3["catch"](0);
          return _context3.abrupt("return", {
            success: false,
            error: "Failed to delete review"
          });

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 13]]);
}
/**
 * 4. Update Review
 */


function updateReview(id, updateData) {
  return regeneratorRuntime.async(function updateReview$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context4.next = 5;
          return regeneratorRuntime.awrap(_Review["default"].findByIdAndUpdate(id, updateData, {
            "new": true
          }));

        case 5:
          (0, _cache.revalidatePath)('/');
          (0, _cache.revalidatePath)('/admin/reviews');
          return _context4.abrupt("return", {
            success: true,
            message: "Review updated successfully"
          });

        case 10:
          _context4.prev = 10;
          _context4.t0 = _context4["catch"](0);
          return _context4.abrupt("return", {
            success: false,
            error: "Failed to update review"
          });

        case 13:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 10]]);
}
/**
 * 5. Get Featured Reviews
 */


function getFeaturedReviews() {
  var reviews;
  return regeneratorRuntime.async(function getFeaturedReviews$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context5.next = 5;
          return regeneratorRuntime.awrap(_Review["default"].find({
            isFeatured: true
          }).sort({
            createdAt: -1
          }).limit(8).lean());

        case 5:
          reviews = _context5.sent;
          return _context5.abrupt("return", {
            success: true,
            reviews: JSON.parse(JSON.stringify(reviews))
          });

        case 9:
          _context5.prev = 9;
          _context5.t0 = _context5["catch"](0);
          return _context5.abrupt("return", {
            success: false,
            reviews: [],
            error: _context5.t0.message
          });

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 9]]);
}