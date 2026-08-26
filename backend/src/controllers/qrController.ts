import { Request, Response } from 'express';
import { QRService } from '../services/qrService';
import { Guest } from '../models/Guest';
import { SocketService } from '../services/socketService';

export const generateEventQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { guestId } = req.query;

    const token = QRService.generateSignedToken(eventId, guestId as string);
    const qrDataUrl = await QRService.generateQRCodeDataUrl(token);

    res.json({
      success: true,
      token,
      qrDataUrl,
      eventId,
      guestId: guestId || null,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyAndCheckInQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, eventId } = req.body;

    if (!token || !eventId) {
      res.status(400).json({ success: false, message: 'QR Token and Event ID are required.' });
      return;
    }

    const checkInResult = await QRService.processCheckIn(
      token,
      eventId,
      (req as any).user?.id,
      req.body.gateName || 'Main Gate'
    );

    if (checkInResult.success && !checkInResult.alreadyCheckedIn && checkInResult.guest) {
      // Broadcast real-time guest entry to event room for Live Command Center
      const totalCheckedIn = await Guest.countDocuments({ eventId, checkInStatus: true });

      SocketService.emitToEvent(eventId, 'guest:checked_in', {
        guest: checkInResult.guest,
        timestamp: checkInResult.checkInTime,
        totalCheckedIn,
      });
    }

    res.json(checkInResult);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
