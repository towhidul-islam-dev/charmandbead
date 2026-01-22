"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.submitContactForm = submitContactForm;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Contact = _interopRequireDefault(require("@/models/Contact"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// import { sendEmail } from "@/lib/mail"; // This will now work!
function submitContactForm(formData) {
  var emailBody;
  return regeneratorRuntime.async(function submitContactForm$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(_Contact["default"].create({
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }));

        case 5:
          // 2. Format the body for the email
          emailBody = "\n      <p><strong>Name:</strong> ".concat(formData.name, "</p>\n      <p><strong>Email:</strong> ").concat(formData.email, "</p>\n      <p><strong>Subject:</strong> ").concat(formData.subject, "</p>\n      <hr style=\"border: none; border-top: 1px solid #FBB6E6; margin: 20px 0;\" />\n      <p style=\"white-space: pre-wrap;\">").concat(formData.message, "</p>\n    "); // 3. Send the mail

          _context.next = 8;
          return regeneratorRuntime.awrap(sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: "New Contact: ".concat(formData.subject),
            html: emailBody
          }));

        case 8:
          return _context.abrupt("return", {
            success: true
          });

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          console.error("CONTACT_SUBMIT_ERROR:", _context.t0);
          return _context.abrupt("return", {
            success: false,
            message: "Error sending message."
          });

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 11]]);
}