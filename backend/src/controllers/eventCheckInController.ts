import { Request, Response } from 'express';
import { QRService } from '../services/qrService';
import { AuthRequest } from '../middleware/auth';
import { Event } from '../models/Event';
import { Guest } from '../models/Guest';

/**
 * POST /api/events/:eventId/qr
 * Generate/retrieve QR ticket for guest or event
 */
export const generateEventQR = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const guestId = req.body.guestId || (req.query.guestId as string);

    if (guestId) {
      const ticket = await QRService.getOrCreateGuestQRTicket(eventId, guestId);
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

    const token = QRService.generateSignedToken(eventId, null, req.user?.id);
    const qrDataUrl = await QRService.generateQRCodeDataUrl(token);

    res.json({
      success: true,
      token,
      qrDataUrl,
      eventId,
      userId: req.user?.id || null,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Could not generate QR ticket.' });
  }
};

/**
 * GET /api/events/:eventId/my-qr
 * Get current authenticated user's personal QR ticket
 */
export const getMyQRTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required to view QR ticket.' });
      return;
    }

    const ticketData = await QRService.getOrCreateUserQRTicket(eventId, userId);

    res.json({
      success: true,
      token: ticketData.token,
      qrDataUrl: ticketData.qrDataUrl,
      event: ticketData.event,
      guest: ticketData.guest,
      user: ticketData.user,
      status: ticketData.qrCode.status,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Could not fetch your QR ticket.' });
  }
};

/**
 * POST /api/events/:eventId/check-in
 * Organizer / Authorized Event Staff Gate Entry Scan
 */
export const processEventCheckIn = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const checkInResult = await QRService.processCheckIn(
      tokenToVerify.trim(),
      eventId,
      req.user?.id,
      gateName || 'Main Gate'
    );

    res.json(checkInResult);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Check-in verification failed.' });
  }
};

/**
 * GET /api/events/:eventId/check-ins
 * Check-in audit history
 */
export const getEventCheckIns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const checkIns = await QRService.getCheckInAuditHistory(eventId);

    res.json({
      success: true,
      checkIns,
      count: checkIns.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Could not fetch check-in history.' });
  }
};

/**
 * GET /api/events/:eventId/attendance
 * Real-time event attendance summary and guest list
 */
export const getEventAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const [summary, guests, checkIns] = await Promise.all([
      QRService.getAttendanceSummary(eventId),
      Guest.find({ eventId }).sort({ checkInStatus: -1, name: 1 }),
      QRService.getCheckInAuditHistory(eventId),
    ]);

    res.json({
      success: true,
      summary,
      guests,
      checkIns,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Could not fetch attendance data.' });
  }
};

/**
 * GET /api/events/:eventId/attendance/export
 * Export attendance report as CSV
 */
export const exportEventAttendanceCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const csvData = await QRService.exportAttendanceCSV(eventId);
    const event = await Event.findById(eventId);
    const eventName = (event?.name || 'event').replace(/[^a-zA-Z0-9]/g, '_');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${eventName}_${Date.now()}.csv"`);
    res.send(csvData);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Could not export attendance report.' });
  }
};
