"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const qrController_1 = require("../controllers/qrController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/event/:eventId', auth_1.authenticateToken, qrController_1.generateEventQR);
router.post('/checkin', auth_1.authenticateToken, qrController_1.verifyAndCheckInQR);
exports.default = router;
