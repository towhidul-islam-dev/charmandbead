"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _generativeAi = require("@google/generative-ai");

var _mongodb = _interopRequireDefault(require("@/lib/mongodb"));

var _Recommendation = _interopRequireDefault(require("@/models/Recommendation"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var genAI = new _generativeAi.GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function POST(req) {
  var _ref, imageUrl, userName, userNote, model, imageResp, buffer, contentType, imageData, prompt, result, responseText, aiAnalysis, cleanJson, existing, newRec;

  return regeneratorRuntime.async(function POST$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(req.json());

        case 3:
          _ref = _context.sent;
          imageUrl = _ref.imageUrl;
          userName = _ref.userName;
          userNote = _ref.userNote;
          _context.next = 9;
          return regeneratorRuntime.awrap((0, _mongodb["default"])());

        case 9:
          // 1. Initialize Gemini
          model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            generationConfig: {
              responseMimeType: "application/json"
            }
          }); // 2. Fetch image and detect mime type

          _context.next = 12;
          return regeneratorRuntime.awrap(fetch(imageUrl));

        case 12:
          imageResp = _context.sent;
          _context.next = 15;
          return regeneratorRuntime.awrap(imageResp.arrayBuffer());

        case 15:
          buffer = _context.sent;
          contentType = imageResp.headers.get("content-type") || "image/jpeg";
          imageData = {
            inlineData: {
              data: Buffer.from(buffer).toString("base64"),
              mimeType: contentType
            }
          };
          prompt = "Analyze this product image for a boutique store. \n    Return a JSON object with exactly these keys: category, style, and tags. \n    Example: {\"category\": \"Flower Bead\", \"style\": \"Vintage\", \"tags\": [\"floral\", \"glass\"]}";
          _context.next = 21;
          return regeneratorRuntime.awrap(model.generateContent([prompt, imageData]));

        case 21:
          result = _context.sent;
          responseText = result.response.text(); // 3. Robust JSON Parsing

          try {
            cleanJson = responseText.replace(/```json|```/g, "").trim();
            aiAnalysis = JSON.parse(cleanJson);
          } catch (parseError) {
            aiAnalysis = {
              category: "Unique Item",
              style: "Modern",
              tags: ["community-pick"]
            };
          } // 4. SMART GROUPING LOGIC
          // We look for an existing trend by Category and Style


          _context.next = 26;
          return regeneratorRuntime.awrap(_Recommendation["default"].findOne({
            "aiAnalysis.category": {
              $regex: new RegExp("^".concat(aiAnalysis.category, "$"), "i")
            },
            "aiAnalysis.style": {
              $regex: new RegExp("^".concat(aiAnalysis.style, "$"), "i")
            }
          }));

        case 26:
          existing = _context.sent;

          if (!existing) {
            _context.next = 34;
            break;
          }

          existing.votes += 1;
          existing.imageUrl = imageUrl; // Update to the most recent image
          // AI Logic: Append note to the existing record's notes array

          if (userNote && userNote.trim() !== "") {
            existing.notes.push({
              body: userNote,
              userName: userName || "Anonymous"
            });
          }

          _context.next = 33;
          return regeneratorRuntime.awrap(existing.save());

        case 33:
          return _context.abrupt("return", Response.json(existing));

        case 34:
          _context.next = 36;
          return regeneratorRuntime.awrap(_Recommendation["default"].create({
            imageUrl: imageUrl,
            userName: userName || "Anonymous",
            // Store the initial note in the array if provided
            notes: userNote && userNote.trim() !== "" ? [{
              body: userNote,
              userName: userName || "Anonymous"
            }] : [],
            aiAnalysis: {
              category: aiAnalysis.category,
              style: aiAnalysis.style,
              tags: aiAnalysis.tags || []
            }
          }));

        case 36:
          newRec = _context.sent;
          return _context.abrupt("return", Response.json(newRec));

        case 40:
          _context.prev = 40;
          _context.t0 = _context["catch"](0);
          console.error("🚨 SERVER ERROR:", _context.t0);
          return _context.abrupt("return", Response.json({
            error: _context.t0.message
          }, {
            status: 500
          }));

        case 44:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 40]]);
}