"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportEventAttendanceCSV = exports.getEventAttendance = exports.getEventCheckIns = exports.processEventCheckIn = exports.getMyQRTicket = exports.generateEventQR = void 0;
const qrService_1 = require("../services/qrService");
const Event_1 = require("../models/Event");
const Guest_1 = require("../models/Guest");
/**
 * POST /api/events/:eventId/qr
 * Generate/retrieve QR ticket for guest or event
 */
const generateEventQR = async (req, res) => {
    try {
        const { eventId } = req.params;
        const guestId = req.body.guestId || req.query.guestId;
        if (guestId) {
            const ticket = await qrService_1.QRService.getOrCreateGuestQRTicket(eventId, guestId);
            res.json({
                success: true,
                token: ticket.token,
                qrDataUrl: ticket.qrDataUrl,
                eventId,
                guestId,
                guest: ticket.guest,
            });
            return;
        }
        const token = qrService_1.QRService.generateSignedToken(eventId, null, req.user?.id);
        const qrDataUrl = await qrService_1.QRService.generateQRCodeDataUrl(token);
        res.json({
            success: true,
            token,
            qrDataUrl,
            eventId,
            userId: req.user?.id || null,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Could not generate QR ticket.' });
    }
};
exports.generateEventQR = generateEventQR;
/**
 * GET /api/events/:eventId/my-qr
 * Get current authenticated user's personal QR ticket
 */
const getMyQRTicket = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication required to view QR ticket.' });
            return;
        }
        const ticketData = await qrService_1.QRService.getOrCreateUserQRTicket(eventId, userId);
        res.json({
            success: true,
            token: ticketData.token,
            qrDataUrl: ticketData.qrDataUrl,
            event: ticketData.event,
            guest: ticketData.guest,
            user: ticketData.user,
            status: ticketData.qrCode.status,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Could not fetch your QR ticket.' });
    }
};
exports.getMyQRTicket = getMyQRTicket;
/**
 * POST /api/events/:eventId/check-in
 * Organizer / Authorized Event Staff Gate Entry Scan
 */
const processEventCheckIn = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { qrToken, token, gateName } = req.body;
        const tokenToVerify = qrToken || token;
        if (!tokenToVerify) {
            res.status(400).json({
                success: false,
                message: 'QR Token is required for gate check-in.',
            });
            return;
        }
        const checkInResult = await qrService_1.QRService.processCheckIn(tokenToVerify.trim(), eventId, req.user?.id, gateName || 'Main Gate');
        res.json(checkInResult);
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Check-in verification failed.' });
    }
};
exports.processEventCheckIn = processEventCheckIn;
/**
 * GET /api/events/:eventId/check-ins
 * Check-in audit history
 */
const getEventCheckIns = async (req, res) => {
    try {
        const { eventId } = req.params;
        const checkIns = await qrService_1.QRService.getCheckInAuditHistory(eventId);
        res.json({
            success: true,
            checkIns,
            count: checkIns.length,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Could not fetch check-in history.' });
    }
};
exports.getEventCheckIns = getEventCheckIns;
/**
 * GET /api/events/:eventId/attendance
 * Real-time event attendance summary and guest list
 */
const getEventAttendance = async (req, res) => {
    try {
        const { eventId } = req.params;
        const [summary, guests, checkIns] = await Promise.all([
            qrService_1.QRService.getAttendanceSummary(eventId),
            Guest_1.Guest.find({ eventId }).sort({ checkInStatus: -1, name: 1 }),
            qrService_1.QRService.getCheckInAuditHistory(eventId),
        ]);
        res.json({
            success: true,
            summary,
            guests,
            checkIns,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Could not fetch attendance data.' });
    }
};
exports.getEventAttendance = getEventAttendance;
/**
 * GET /api/events/:eventId/attendance/export
 * Export attendance report as CSV
 */
const exportEventAttendanceCSV = async (req, res) => {
    try {
        const { eventId } = req.params;
        const csvData = await qrService_1.QRService.exportAttendanceCSV(eventId);
        const event = await Event_1.Event.findById(eventId);
        const eventName = (event?.name || 'event').replace(/[^a-zA-Z0-9]/g, '_');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="attendance_${eventName}_${Date.now()}.csv"`);
        res.send(csvData);
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Could not export attendance report.' });
    }
};
exports.exportEventAttendanceCSV = exportEventAttendanceCSV;
