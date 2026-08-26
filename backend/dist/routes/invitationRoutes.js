"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invitationController_1 = require("../controllers/invitationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/event/:eventId', auth_1.authenticateToken, invitationController_1.getInvitationByEvent);
router.put('/event/:eventId', auth_1.authenticateToken, invitationController_1.updateInvitation);
// Public invitation viewer & RSVP endpoints
router.get('/public/:token', invitationController_1.getPublicInvitationByToken);
router.post('/public/:token/rsvp', invitationController_1.submitPublicRSVP);
exports.default = router;
