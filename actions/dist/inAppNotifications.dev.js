"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNotificationsAction = getNotificationsAction;
exports.markAsReadAction = markAsReadAction;
exports.createInAppNotification = createInAppNotification;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Notification = _interopRequireDefault(require("@/models/Notification"));

var _cache = require("next/cache");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Adjust path to your DB config
// Adjust path to your Model

/**
 * Fetches notifications based on User ID and Global status
 */
function getNotificationsAction(userId) {
  var notifications;
  return regeneratorRuntime.async(function getNotificationsAction$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(_Notification["default"].find({
            recipientId: {
              $in: ["GLOBAL", userId]
            }
          }).sort({
            createdAt: -1
          }).limit(20));

        case 5:
          notifications = _context.sent;
          return _context.abrupt("return", {
            success: true,
            data: JSON.parse(JSON.stringify(notifications))
          });

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](0);
          console.error("Fetch Notif Error:", _context.t0);
          return _context.abrupt("return", {
            success: false,
            data: []
          });

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 9]]);
}
/**
 * Marks a specific notification as read in the DB
 */


function markAsReadAction(notificationId) {
  return regeneratorRuntime.async(function markAsReadAction$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(_Notification["default"].findByIdAndUpdate(notificationId, {
            isRead: true
          }));

        case 5:
          // Optional: clears the cache for the layout/navbar
          (0, _cache.revalidatePath)("/");
          return _context2.abrupt("return", {
            success: true
          });

        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", {
            success: false
          });

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 9]]);
}
/**
 * Creates a notification (Used by SuccessPage and ProductForm)
 */


function createInAppNotification(_ref) {
  var title, message, type, recipientId, link, newNotif;
  return regeneratorRuntime.async(function createInAppNotification$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          title = _ref.title, message = _ref.message, type = _ref.type, recipientId = _ref.recipientId, link = _ref.link;
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 4:
          _context3.next = 6;
          return regeneratorRuntime.awrap(_Notification["default"].create({
            title: title,
            message: message,
            type: type,
            recipientId: recipientId,
            link: link,
            isRead: false,
            createdAt: new Date()
          }));

        case 6:
          newNotif = _context3.sent;
          return _context3.abrupt("return", {
            success: true,
            data: JSON.parse(JSON.stringify(newNotif))
          });

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](1);
          console.error("Create Notif Error:", _context3.t0);
          return _context3.abrupt("return", {
            success: false
          });

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 10]]);
}