"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const guestController_1 = require("../controllers/guestController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/event/:eventId', auth_1.authenticateToken, guestController_1.getGuestsByEvent);
router.post('/event/:eventId', auth_1.authenticateToken, (0, validation_1.validateRequest)(validation_1.guestSchema), guestController_1.addGuest);
router.post('/event/:eventId/import', auth_1.authenticateToken, guestController_1.importGuestsCsv);
router.put('/:id', auth_1.authenticateToken, guestController_1.updateGuest);
router.delete('/:id', auth_1.authenticateToken, guestController_1.deleteGuest);
router.put('/:id/rsvp', guestController_1.updateRSVP); // Open for guest response
exports.default = router;
