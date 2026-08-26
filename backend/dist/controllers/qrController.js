"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAndCheckInQR = exports.generateEventQR = void 0;
const qrService_1 = require("../services/qrService");
const Guest_1 = require("../models/Guest");
const socketService_1 = require("../services/socketService");
const generateEventQR = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { guestId } = req.query;
        const token = qrService_1.QRService.generateSignedToken(eventId, guestId);
        const qrDataUrl = await qrService_1.QRService.generateQRCodeDataUrl(token);
        res.json({
            success: true,
            token,
            qrDataUrl,
            eventId,
            guestId: guestId || null,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.generateEventQR = generateEventQR;
const verifyAndCheckInQR = async (req, res) => {
    try {
        const { token, eventId } = req.body;
        if (!token || !eventId) {
            res.status(400).json({ success: false, message: 'QR Token and Event ID are required.' });
            return;
        }
        const checkInResult = await qrService_1.QRService.processCheckIn(token, eventId, req.user?.id, req.body.gateName || 'Main Gate');
        if (checkInResult.success && !checkInResult.alreadyCheckedIn && checkInResult.guest) {
            // Broadcast real-time guest entry to event room for Live Command Center
            const totalCheckedIn = await Guest_1.Guest.countDocuments({ eventId, checkInStatus: true });
            socketService_1.SocketService.emitToEvent(eventId, 'guest:checked_in', {
                guest: checkInResult.guest,
                timestamp: checkInResult.checkInTime,
                totalCheckedIn,
            });
        }
        res.json(checkInResult);
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.verifyAndCheckInQR = verifyAndCheckInQR;
