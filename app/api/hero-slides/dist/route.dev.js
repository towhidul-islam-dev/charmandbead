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

// FETCH SLIDES (Used by the Carousel)
function GET(req) {
  var _ref, searchParams, isAdmin, query, slides;

  return regeneratorRuntime.async(function GET$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 2:
          _ref = new URL(req.url), searchParams = _ref.searchParams;
          isAdmin = searchParams.get("admin") === "true"; // If it's the homepage, only fetch { isActive: true }

          query = isAdmin ? {} : {
            isActive: true
          };
          _context.next = 7;
          return regeneratorRuntime.awrap(_HeroSlide["default"].find(query).sort({
            priority: -1
          }));

        case 7:
          slides = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json(slides));

        case 9:
        case "end":
          return _context.stop();
      }
    }
  });
} // SAVE NEW SLIDE (Used by the Admin Form)


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
          _context2.next = 8;
          return regeneratorRuntime.awrap(_HeroSlide["default"].create(body));

        case 8:
          slide = _context2.sent;
          return _context2.abrupt("return", _server.NextResponse.json(slide, {
            status: 201
          }));

        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", _server.NextResponse.json({
            error: "Failed to save slide"
          }, {
            status: 500
          }));

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 12]]);
}