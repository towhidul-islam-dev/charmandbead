"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;
exports.POST = POST;

var _server = require("next/server");

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _content = require("@/models/content");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// GET: Load all FAQs and Policies
function GET() {
  var faqs, policies;
  return regeneratorRuntime.async(function GET$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context.next = 5;
          return regeneratorRuntime.awrap(_content.FAQ.find().sort({
            order: 1
          }));

        case 5:
          faqs = _context.sent;
          _context.next = 8;
          return regeneratorRuntime.awrap(_content.Policy.find());

        case 8:
          policies = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json({
            faqs: faqs,
            policies: policies
          }, {
            status: 200
          }));

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", _server.NextResponse.json({
            error: "Failed to fetch content"
          }, {
            status: 500
          }));

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 12]]);
} // POST: Save or Update Content


function POST(req) {
  var body, category, data, savedFaqs, type, content_en, content_bn, updatedPolicy;
  return regeneratorRuntime.async(function POST$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(req.json());

        case 5:
          body = _context2.sent;
          category = body.category, data = body.data;

          if (!(category === "FAQ")) {
            _context2.next = 14;
            break;
          }

          _context2.next = 10;
          return regeneratorRuntime.awrap(_content.FAQ.deleteMany({}));

        case 10:
          _context2.next = 12;
          return regeneratorRuntime.awrap(_content.FAQ.insertMany(data));

        case 12:
          savedFaqs = _context2.sent;
          return _context2.abrupt("return", _server.NextResponse.json(savedFaqs, {
            status: 200
          }));

        case 14:
          if (!(category === "Policy")) {
            _context2.next = 20;
            break;
          }

          type = data.type, content_en = data.content_en, content_bn = data.content_bn; // Find policy by type (e.g., 'refund') and update, or create if missing

          _context2.next = 18;
          return regeneratorRuntime.awrap(_content.Policy.findOneAndUpdate({
            type: type
          }, {
            content_en: content_en,
            content_bn: content_bn,
            updatedAt: new Date()
          }, {
            upsert: true,
            "new": true
          }));

        case 18:
          updatedPolicy = _context2.sent;
          return _context2.abrupt("return", _server.NextResponse.json(updatedPolicy, {
            status: 200
          }));

        case 20:
          return _context2.abrupt("return", _server.NextResponse.json({
            error: "Invalid Category"
          }, {
            status: 400
          }));

        case 23:
          _context2.prev = 23;
          _context2.t0 = _context2["catch"](0);
          console.error("API ERROR:", _context2.t0);
          return _context2.abrupt("return", _server.NextResponse.json({
            error: "Internal Server Error"
          }, {
            status: 500
          }));

        case 27:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 23]]);
}