"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _server = require("next/server");

function POST(req) {
  var _ref, consignmentId, authResponse, authData, trackingResponse, trackingResult;

  return regeneratorRuntime.async(function POST$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(req.json());

        case 3:
          _ref = _context.sent;
          consignmentId = _ref.consignmentId;

          if (consignmentId) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: "Consignment ID is required"
          }, {
            status: 400
          }));

        case 7:
          _context.next = 9;
          return regeneratorRuntime.awrap(fetch('https://api-hermes.pathao.com/aladdin/api/v1/issue-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              client_id: process.env.PATHAO_CLIENT_ID,
              client_secret: process.env.PATHAO_CLIENT_SECRET,
              grant_type: "client_credentials"
            })
          }));

        case 9:
          authResponse = _context.sent;
          _context.next = 12;
          return regeneratorRuntime.awrap(authResponse.json());

        case 12:
          authData = _context.sent;

          if (!(!authResponse.ok || !authData.access_token)) {
            _context.next = 16;
            break;
          }

          console.error("Pathao Auth Error Response:", authData);
          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: authData.message || "Pathao authentication failed."
          }, {
            status: 401
          }));

        case 16:
          _context.next = 18;
          return regeneratorRuntime.awrap(fetch("https://api-hermes.pathao.com/aladdin/api/v1/orders/".concat(consignmentId, "/tracking"), {
            method: 'GET',
            headers: {
              'Authorization': "Bearer ".concat(authData.access_token),
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }));

        case 18:
          trackingResponse = _context.sent;
          _context.next = 21;
          return regeneratorRuntime.awrap(trackingResponse.json());

        case 21:
          trackingResult = _context.sent;

          if (trackingResponse.ok) {
            _context.next = 25;
            break;
          }

          console.error("Pathao Tracking Error Response:", trackingResult);
          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            message: trackingResult.message || "Failed to fetch tracking details from Pathao"
          }, {
            status: trackingResponse.status
          }));

        case 25:
          return _context.abrupt("return", _server.NextResponse.json({
            success: true,
            data: trackingResult.data || trackingResult
          }));

        case 28:
          _context.prev = 28;
          _context.t0 = _context["catch"](0);
          console.error("Tracking Route Exception:", _context.t0);
          return _context.abrupt("return", _server.NextResponse.json({
            success: false,
            error: "Tracking service unavailable"
          }, {
            status: 500
          }));

        case 32:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 28]]);
}