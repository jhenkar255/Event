"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const designController_1 = require("../controllers/designController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// 2D Visual Design Canvas
router.get('/events/:eventId/design', auth_1.authenticateToken, designController_1.getEventDesign);
router.post('/events/:eventId/design', auth_1.authenticateToken, designController_1.saveEventDesign);
// Seating Layout & Table Allocation
router.get('/events/:eventId/seating', auth_1.authenticateToken, designController_1.getSeatingLayout);
router.post('/events/:eventId/seating', auth_1.authenticateToken, designController_1.saveSeatingLayout);
router.post('/events/:eventId/seating/assign', auth_1.authenticateToken, designController_1.assignGuestToTable);
exports.default = router;
