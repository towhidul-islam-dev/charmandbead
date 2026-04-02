"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.POST = POST;

var _server = require("next/server");

function POST(req) {
  var _ref, consignmentId, authResponse, authData, trackingResponse, trackingData;

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
          _context.next = 7;
          return regeneratorRuntime.awrap(fetch('https://api-hermes.pathao.com/aladdin/api/v1/issue-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              client_id: process.env.PATHAO_CLIENT_ID,
              client_secret: process.env.PATHAO_CLIENT_SECRET,
              username: process.env.PATHAO_MERCHANT_EMAIL,
              password: process.env.PATHAO_MERCHANT_PASSWORD,
              grant_type: "password"
            })
          }));

        case 7:
          authResponse = _context.sent;
          _context.next = 10;
          return regeneratorRuntime.awrap(authResponse.json());

        case 10:
          authData = _context.sent;
          _context.next = 13;
          return regeneratorRuntime.awrap(fetch("https://api-hermes.pathao.com/aladdin/api/v1/orders/".concat(consignmentId, "/tracking"), {
            method: 'GET',
            headers: {
              'Authorization': "Bearer ".concat(authData.access_token),
              'Content-Type': 'application/json'
            }
          }));

        case 13:
          trackingResponse = _context.sent;
          _context.next = 16;
          return regeneratorRuntime.awrap(trackingResponse.json());

        case 16:
          trackingData = _context.sent;
          return _context.abrupt("return", _server.NextResponse.json(trackingData));

        case 20:
          _context.prev = 20;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", _server.NextResponse.json({
            error: "Tracking service unavailable"
          }, {
            status: 500
          }));

        case 23:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 20]]);
}