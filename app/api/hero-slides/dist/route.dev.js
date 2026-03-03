"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;
exports.POST = POST;

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _HeroSlide = _interopRequireDefault(require("@/models/HeroSlide"));

var _server = require("next/server");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function GET(req) {
  var _ref, searchParams, isAdmin, query, slides;

  return regeneratorRuntime.async(function GET$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          _ref = new URL(req.url), searchParams = _ref.searchParams;
          isAdmin = searchParams.get("admin") === "true"; // 🟢 THE FIX: 
          // For non-admins, we find slides where isActive is true 
          // OR where isActive does not exist (for old data)

          query = isAdmin ? {} : {
            $or: [{
              isActive: true
            }, {
              isActive: {
                $exists: false
              }
            }]
          };
          _context.next = 8;
          return regeneratorRuntime.awrap(_HeroSlide["default"].find(query).sort({
            priority: -1
          }));

        case 8:
          slides = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json(slides));

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](0);
          console.error("GET ERROR:", _context.t0);
          return _context.abrupt("return", _server.NextResponse.json({
            error: "Failed to fetch"
          }, {
            status: 500
          }));

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 12]]);
}

function POST(req) {
  var body, slide;
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

          if (!(!body.image || !body.title)) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", _server.NextResponse.json({
            error: "Missing required fields"
          }, {
            status: 400
          }));

        case 8:
          _context2.next = 10;
          return regeneratorRuntime.awrap(_HeroSlide["default"].create({
            title: body.title,
            link: body.link,
            image: body.image,
            priority: Number(body.priority) || 0,
            format: body.format || "image",
            isActive: true // Force new banners to be active

          }));

        case 10:
          slide = _context2.sent;
          return _context2.abrupt("return", _server.NextResponse.json(slide, {
            status: 201
          }));

        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](0);
          console.error("SAVE ERROR:", _context2.t0);
          return _context2.abrupt("return", _server.NextResponse.json({
            error: "Failed to save to DB"
          }, {
            status: 500
          }));

        case 18:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 14]]);
}