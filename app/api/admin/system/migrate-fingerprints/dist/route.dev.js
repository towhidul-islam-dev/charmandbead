"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET = GET;

var _server = require("next/server");

var _generativeAi = require("@google/generative-ai");

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Recommendation = _interopRequireDefault(require("@/models/Recommendation"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var genAI = new _generativeAi.GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function GET(req) {
  var authHeader, isCron, isAdminManual, model, itemsToUpdate, updatedCount, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item, imageResp, buffer, imageData, prompt, result, fingerprint;

  return regeneratorRuntime.async(function GET$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 3:
          // 1. Security Check (Same as the Smart-Merge logic)
          authHeader = req.headers.get("authorization");
          isCron = authHeader === "Bearer ".concat(process.env.CRON_SECRET);
          isAdminManual = req.nextUrl.searchParams.get("admin") === "true";

          if (!(!isCron && !isAdminManual)) {
            _context.next = 8;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            error: "Unauthorized"
          }, {
            status: 401
          }));

        case 8:
          model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
          }); // 2. Find all items missing a visualFingerprint

          _context.next = 11;
          return regeneratorRuntime.awrap(_Recommendation["default"].find({
            $or: [{
              "aiAnalysis.visualFingerprint": {
                $exists: false
              }
            }, {
              "aiAnalysis.visualFingerprint": ""
            }, {
              "aiAnalysis.visualFingerprint": null
            }]
          }));

        case 11:
          itemsToUpdate = _context.sent;

          if (!(itemsToUpdate.length === 0)) {
            _context.next = 14;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            success: true,
            message: "All items already have fingerprints."
          }));

        case 14:
          updatedCount = 0; // 3. Process each item

          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 18;
          _iterator = itemsToUpdate[Symbol.iterator]();

        case 20:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 46;
            break;
          }

          item = _step.value;
          _context.prev = 22;
          _context.next = 25;
          return regeneratorRuntime.awrap(fetch(item.imageUrl));

        case 25:
          imageResp = _context.sent;
          _context.next = 28;
          return regeneratorRuntime.awrap(imageResp.arrayBuffer());

        case 28:
          buffer = _context.sent;
          imageData = {
            inlineData: {
              data: Buffer.from(buffer).toString("base64"),
              mimeType: "image/jpeg"
            }
          };
          prompt = "Identify this item. \n        Return ONLY a 2-word uppercase hyphenated string.\n        RULES: No colors, no plurals, no extra text.\n        Example: \"SILK-DRESS\", \"GOLD-EARRING\", \"DENIM-JACKET\".";
          _context.next = 33;
          return regeneratorRuntime.awrap(model.generateContent([prompt, imageData]));

        case 33:
          result = _context.sent;
          fingerprint = result.response.text().trim().replace(/['"`\n]/g, "").toUpperCase(); // Save standardized fingerprint to MongoDB

          _context.next = 37;
          return regeneratorRuntime.awrap(_Recommendation["default"].findByIdAndUpdate(item._id, {
            "aiAnalysis.visualFingerprint": fingerprint
          }));

        case 37:
          updatedCount++;
          _context.next = 43;
          break;

        case 40:
          _context.prev = 40;
          _context.t0 = _context["catch"](22);
          console.error("Failed to update item ".concat(item._id, ":"), _context.t0.message);

        case 43:
          _iteratorNormalCompletion = true;
          _context.next = 20;
          break;

        case 46:
          _context.next = 52;
          break;

        case 48:
          _context.prev = 48;
          _context.t1 = _context["catch"](18);
          _didIteratorError = true;
          _iteratorError = _context.t1;

        case 52:
          _context.prev = 52;
          _context.prev = 53;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 55:
          _context.prev = 55;

          if (!_didIteratorError) {
            _context.next = 58;
            break;
          }

          throw _iteratorError;

        case 58:
          return _context.finish(55);

        case 59:
          return _context.finish(52);

        case 60:
          return _context.abrupt("return", _server.NextResponse.json({
            success: true,
            message: "Successfully backfilled ".concat(updatedCount, " items."),
            count: updatedCount
          }));

        case 63:
          _context.prev = 63;
          _context.t2 = _context["catch"](0);
          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            error: _context.t2.message
          }, {
            status: 500
          }));

        case 66:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 63], [18, 48, 52, 60], [22, 40], [53,, 55, 59]]);
}