"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketplaceController_1 = require("../controllers/marketplaceController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Decorations
router.get('/decorations', marketplaceController_1.getDecorations);
router.post('/decorations', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('ADMIN', 'ORGANIZER'), marketplaceController_1.createDecoration);
// Catering
router.get('/catering', marketplaceController_1.getCateringPackages);
router.post('/catering', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('ADMIN', 'ORGANIZER'), marketplaceController_1.createCateringPackage);
// Entertainment
router.get('/entertainment', marketplaceController_1.getEntertainment);
router.post('/entertainment', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('ADMIN', 'ORGANIZER'), marketplaceController_1.createEntertainment);
exports.default = router;
