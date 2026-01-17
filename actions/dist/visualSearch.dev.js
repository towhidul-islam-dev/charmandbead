"use strict";
"use server";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchByImage = searchByImage;

var _openai = _interopRequireDefault(require("openai"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var openai = new _openai["default"]({
  apiKey: process.env.OPENAI_API_KEY
});

function searchByImage(formData) {
  var file, bytes, buffer, base64Image, response, label;
  return regeneratorRuntime.async(function searchByImage$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          file = formData.get("image");

          if (file) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", {
            success: false,
            message: "No image provided"
          });

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap(file.arrayBuffer());

        case 6:
          bytes = _context.sent;
          buffer = Buffer.from(bytes);
          base64Image = buffer.toString("base64");
          _context.next = 11;
          return regeneratorRuntime.awrap(openai.chat.completions.create({
            model: "gpt-4o-mini",
            // Fast and cheap for visual tagging
            messages: [{
              role: "user",
              content: [{
                type: "text",
                text: "Identify the main material or product in this image. Return only ONE or TWO words (e.g., 'Pink Beads', 'Crystal', 'Gold Wire')."
              }, {
                type: "image_url",
                image_url: {
                  url: "data:image/jpeg;base64,".concat(base64Image)
                }
              }]
            }]
          }));

        case 11:
          response = _context.sent;
          label = response.choices[0].message.content.trim();
          return _context.abrupt("return", {
            success: true,
            label: label
          });

        case 16:
          _context.prev = 16;
          _context.t0 = _context["catch"](0);
          console.error("Visual Search Error:", _context.t0);
          return _context.abrupt("return", {
            success: false,
            message: "Failed to analyze image"
          });

        case 20:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 16]]);
}