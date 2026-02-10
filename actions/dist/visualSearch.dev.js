"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchByImage = searchByImage;

var _generativeAi = require("@google/generative-ai");

/**
 * Initialize Gemini with your free API Key.
 * Note: Ensure GEMINI_API_KEY is defined in your .env.local
 */
var genAI = new _generativeAi.GoogleGenerativeAI(process.env.GEMINI_API_KEY); // We use gemini-1.5-flash because it's fast, accurate for images, and has a generous free tier.

var model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest"
});

function searchByImage(formData) {
  var file, mimeType, bytes, base64Image, prompt, result, response, text, label;
  return regeneratorRuntime.async(function searchByImage$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log("Checking Key:", process.env.GEMINI_API_KEY ? "Key Found" : "Key MISSING");
          _context.prev = 1;
          file = formData.get("image");

          if (!(!file || file.size === 0)) {
            _context.next = 5;
            break;
          }

          return _context.abrupt("return", {
            success: false,
            message: "No image provided"
          });

        case 5:
          // 1. Process the image for the Gemini SDK
          mimeType = file.type || "image/jpeg";
          _context.next = 8;
          return regeneratorRuntime.awrap(file.arrayBuffer());

        case 8:
          bytes = _context.sent;
          base64Image = Buffer.from(bytes).toString("base64"); // 2. Construct the prompt for jewelry identification

          prompt = "You are an e-commerce assistant for a jewelry supply brand called Charm & Bead. " + "Identify the main material or jewelry component in this image. " + "Return only the name of the object, e.g., 'Blue Beads' or 'Heart Charm'. " + "Do not use punctuation or full sentences."; // 3. Call the Gemini API

          _context.next = 13;
          return regeneratorRuntime.awrap(model.generateContent([prompt, {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          }]));

        case 13:
          result = _context.sent;
          _context.next = 16;
          return regeneratorRuntime.awrap(result.response);

        case 16:
          response = _context.sent;
          text = response.text(); // 4. Clean the output (Remove quotes and periods)

          label = text.trim().replace(/[.\x22]/g, "");
          return _context.abrupt("return", {
            success: true,
            label: label
          });

        case 22:
          _context.prev = 22;
          _context.t0 = _context["catch"](1);
          console.error("Gemini Vision API Error:", _context.t0.message); // Specific error handling for common free-tier issues

          if (!_context.t0.message.includes("429")) {
            _context.next = 27;
            break;
          }

          return _context.abrupt("return", {
            success: false,
            message: "The AI is a bit busy. Please wait 30 seconds and try again!"
          });

        case 27:
          if (!_context.t0.message.includes("API key not valid")) {
            _context.next = 29;
            break;
          }

          return _context.abrupt("return", {
            success: false,
            message: "System configuration error: Invalid API Key."
          });

        case 29:
          return _context.abrupt("return", {
            success: false,
            message: "AI failed to recognize the image. Please try again."
          });

        case 30:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 22]]);
}