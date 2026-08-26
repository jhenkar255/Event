import crypto from 'crypto';
import QRCode from 'qrcode';
import mongoose from 'mongoose';
import { Guest } from '../models/Guest';
import { Event } from '../models/Event';
import { EventQRCode } from '../models/EventQRCode';
import { EventCheckIn } from '../models/EventCheckIn';
import { User } from '../models/User';
import { SocketService } from './socketService';
import { IAttendanceSummary, CheckInResultType } from '../shared/types';

export class QRService {
  private static signingSecret =
    process.env.QR_SIGNING_SECRET || 'utsavmitra_qr_token_signing_secret_key_2026_auspicious';

  /**
   * Compute SHA-256 hash of token for indexed database storage
   */
  public static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Create cryptographically signed, unguessable token for an event or guest/user
   */
  public static generateSignedToken(
    eventId: string,
    guestId?: string | null,
    userId?: string | null,
    expiresInDays: number = 30
  ): string {
    const timestamp = Date.now();
    const expiresAt = timestamp + expiresInDays * 24 * 60 * 60 * 1000;
    const nonce = crypto.randomBytes(8).toString('hex');
    const rawPayload = `${eventId}:${guestId || 'NONE'}:${userId || 'NONE'}:${timestamp}:${expiresAt}:${nonce}`;
    
    const signature = crypto
      .createHmac('sha256', this.signingSecret)
      .update(rawPayload)
      .digest('hex')
      .substring(0, 24);

    const tokenPayload = {
      e: eventId,
      g: guestId || null,
      u: userId || null,
      t: timestamp,
      exp: expiresAt,
      s: signature,
      n: nonce,
    };

    return Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  }

  /**
   * Decode and cryptographically verify a QR token
   */
  public static verifySignedToken(token: string): {
    isValid: boolean;
    eventId?: string;
    guestId?: string | null;
    userId?: string | null;
    timestamp?: number;
    expiresAt?: number;
    error?: string;
  } {
    try {
      if (!token || typeof token !== 'string') {
        return { isValid: false, error: 'Invalid QR token provided.' };
      }

      const decodedStr = Buffer.from(token, 'base64url').toString('utf-8');
      const payload = JSON.parse(decodedStr);

      if (!payload.e || !payload.t || !payload.exp || !payload.s || !payload.n) {
        return { isValid: false, error: 'Malformed QR token structure.' };
      }

      const rawPayload = `${payload.e}:${payload.g || 'NONE'}:${payload.u || 'NONE'}:${payload.t}:${payload.exp}:${payload.n}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.signingSecret)
        .update(rawPayload)
        .digest('hex')
        .substring(0, 24);

      if (expectedSignature !== payload.s) {
        return { isValid: false, error: 'Cryptographic signature mismatch. Invalid or forged QR code.' };
      }

      if (Date.now() > payload.exp) {
        return { isValid: false, error: 'QR Pass has expired.', expiresAt: payload.exp };
      }

      return {
        isValid: true,
        eventId: payload.e,
        guestId: payload.g,
        userId: payload.u,
        timestamp: payload.t,
        expiresAt: payload.exp,
      };
    } catch (err: any) {
      return { isValid: false, error: 'Could not decode QR token format.' };
    }
  }

  /**
   * Generate High-Contrast, Indian Cultural QR Code Data URL image
   */
  public static async generateQRCodeDataUrl(content: string): Promise<string> {
    return QRCode.toDataURL(content, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#7A1F2B', // Deep Maroon
        light: '#FFFFFF', // High-contrast White for quick scanner readability
      },
      width: 360,
    });
  }

  /**
   * Get or create secure EventQRCode record for an authenticated user
   */
  public static async getOrCreateUserQRTicket(
    eventId: string,
    userId: string
  ): Promise<{
    qrCode: any;
    token: string;
    qrDataUrl: string;
    event: any;
    guest?: any;
    user: any;
  }> {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found.');
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found.');
    }

    // Check if user has an associated guest record in this event
    let guest = await Guest.findOne({
      eventId,
      $or: [{ email: user.email }, { phone: user.phone }, { name: user.name }],
    });

    let existingQR = await EventQRCode.findOne({
      eventId,
      userId,
      status: { $in: ['ACTIVE', 'USED'] },
    });

    let token: string;
    let qrRecord: any;

    if (existingQR) {
      token = existingQR.token;
      qrRecord = existingQR;
    } else {
      token = this.generateSignedToken(eventId, guest?._id?.toString(), userId);
      const tokenHash = this.hashToken(token);

      qrRecord = await EventQRCode.create({
        eventId,
        guestId: guest?._id || undefined,
        userId,
        token,
        tokenHash,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    const qrDataUrl = await this.generateQRCodeDataUrl(token);

    return {
      qrCode: qrRecord,
      token,
      qrDataUrl,
      event,
      guest,
      user,
    };
  }

  /**
   * Get or create secure EventQRCode record for a specific Guest
   */
  public static async getOrCreateGuestQRTicket(
    eventId: string,
    guestId: string
  ): Promise<{
    qrCode: any;
    token: string;
    qrDataUrl: string;
    guest: any;
    event: any;
  }> {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found.');
    }

    const guest = await Guest.findById(guestId);
    if (!guest) {
      throw new Error('Guest record not found.');
    }

    let existingQR = await EventQRCode.findOne({
      eventId,
      guestId,
      status: { $in: ['ACTIVE', 'USED'] },
    });

    let token: string;
    let qrRecord: any;

    if (existingQR) {
      token = existingQR.token;
      qrRecord = existingQR;
    } else {
      token = this.generateSignedToken(eventId, guestId, undefined);
      const tokenHash = this.hashToken(token);

      qrRecord = await EventQRCode.create({
        eventId,
        guestId,
        token,
        tokenHash,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    const qrDataUrl = await this.generateQRCodeDataUrl(token);

    return {
      qrCode: qrRecord,
      token,
      qrDataUrl,
      guest,
      event,
    };
  }

  /**
   * Process gate entry check-in for a scanned QR token with full security & audit logging
   */
  public static async processCheckIn(
    scannedToken: string,
    targetEventId: string,
    scannerUserId?: string,
    gateName: string = 'Main Gate'
  ): Promise<{
    success: boolean;
    result: CheckInResultType;
    message: string;
    guest?: any;
    alreadyCheckedIn?: boolean;
    checkInTime?: string;
    gateName?: string;
    checkedInBy?: string;
  }> {
    // 1. Verify token signature
    const verification = this.verifySignedToken(scannedToken);

    if (!verification.isValid) {
      const isExpired = verification.error?.includes('expired');
      const resultType: CheckInResultType = isExpired ? 'EXPIRED_QR' : 'INVALID_QR';

      if (mongoose.Types.ObjectId.isValid(targetEventId)) {
        await EventCheckIn.create({
          eventId: targetEventId,
          checkedIn: false,
          gateName,
          result: resultType,
          errorMessage: verification.error || 'Invalid cryptographic signature.',
          checkedInBy: scannerUserId || undefined,
        }).catch(() => {});
      }

      return {
        success: false,
        result: resultType,
        message: isExpired
          ? 'This event pass has expired.'
          : 'This ticket is not valid for this event.',
      };
    }

    // 2. Check event match
    if (verification.eventId !== targetEventId) {
      await EventCheckIn.create({
        eventId: targetEventId,
        checkedIn: false,
        gateName,
        result: 'WRONG_EVENT',
        errorMessage: `Scanned pass belongs to event ${verification.eventId}, not ${targetEventId}.`,
        checkedInBy: scannerUserId || undefined,
      }).catch(() => {});

      return {
        success: false,
        result: 'WRONG_EVENT',
        message: 'This pass belongs to a different celebration. Access Denied.',
      };
    }

    // 3. Find database QR record (or check status)
    const tokenHash = this.hashToken(scannedToken);
    let qrRecord = await EventQRCode.findOne({
      eventId: targetEventId,
      $or: [{ token: scannedToken }, { tokenHash }],
    });

    if (qrRecord && qrRecord.status === 'CANCELLED') {
      await EventCheckIn.create({
        eventId: targetEventId,
        guestId: qrRecord.guestId || undefined,
        qrCodeId: qrRecord._id,
        checkedIn: false,
        gateName,
        result: 'CANCELLED_INVITATION',
        errorMessage: 'Event pass has been cancelled.',
        checkedInBy: scannerUserId || undefined,
      }).catch(() => {});

      return {
        success: false,
        result: 'CANCELLED_INVITATION',
        message: 'Invitation is no longer valid.',
      };
    }

    // 4. Handle Guest Check-in
    if (verification.guestId) {
      const guest = await Guest.findById(verification.guestId);
      if (!guest) {
        return {
          success: false,
          result: 'INVALID_QR',
          message: 'Guest record not found in system.',
        };
      }

      // Check RSVP Status
      if (guest.rsvpStatus === 'DECLINED') {
        await EventCheckIn.create({
          eventId: targetEventId,
          guestId: guest._id,
          qrCodeId: qrRecord?._id || undefined,
          checkedIn: false,
          gateName,
          result: 'CANCELLED_INVITATION',
          errorMessage: 'Guest has declined this invitation.',
          checkedInBy: scannerUserId || undefined,
        }).catch(() => {});

        return {
          success: false,
          result: 'CANCELLED_INVITATION',
          message: 'Guest has declined this invitation.',
        };
      }

      // Check Duplicate Check-In
      if (guest.checkInStatus) {
        // Fetch last checkin details for audit display
        const lastCheckIn = await EventCheckIn.findOne({
          eventId: targetEventId,
          guestId: guest._id,
          checkedIn: true,
        }).sort({ checkedInAt: -1 });

        return {
          success: true,
          alreadyCheckedIn: true,
          result: 'ALREADY_CHECKED_IN',
          message: `⚠️ Guest "${guest.name}" was ALREADY checked in at ${guest.checkInTime || 'earlier today'} via ${lastCheckIn?.gateName || gateName}.`,
          guest: guest.toObject(),
          checkInTime: guest.checkInTime,
          gateName: lastCheckIn?.gateName || gateName,
        };
      }

      // Successful first-time check in
      const checkInTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      guest.checkInStatus = true;
      guest.checkInTime = checkInTime;
      guest.rsvpStatus = 'ACCEPTED';
      await guest.save();

      // Update QR Code
      if (qrRecord) {
        qrRecord.status = 'USED';
        qrRecord.lastUsedAt = new Date();
        await qrRecord.save();
      }

      // Save Audit Check-In Record
      await EventCheckIn.create({
        eventId: targetEventId,
        guestId: guest._id,
        qrCodeId: qrRecord?._id || undefined,
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: scannerUserId ? new mongoose.Types.ObjectId(scannerUserId) : undefined,
        gateName: gateName || 'Main Gate',
        result: 'VALID_CHECKIN',
      });

      // Emit real-time attendance update to Socket.IO room
      const totalCheckedIn = await Guest.countDocuments({
        eventId: targetEventId,
        checkInStatus: true,
      });
      const totalGuests = await Guest.countDocuments({ eventId: targetEventId });

      SocketService.emitToEvent(targetEventId, 'guest:checked_in', {
        guest: guest.toObject(),
        timestamp: checkInTime,
        gateName: gateName || 'Main Gate',
        totalCheckedIn,
        totalGuests,
      });

      let staffName = 'Gate Staff';
      if (scannerUserId) {
        const staff = await User.findById(scannerUserId);
        if (staff) staffName = staff.name;
      }

      return {
        success: true,
        alreadyCheckedIn: false,
        result: 'VALID_CHECKIN',
        message: `✅ Entry Approved! Welcome ${guest.name} (${guest.relationship || 'Guest'})`,
        guest: guest.toObject(),
        checkInTime,
        gateName: gateName || 'Main Gate',
        checkedInBy: staffName,
      };
    }

    // 5. Fallback for Host / User token
    return {
      success: true,
      alreadyCheckedIn: false,
      result: 'VALID_CHECKIN',
      message: '✅ Valid Event Entry Pass verified.',
      checkInTime: new Date().toLocaleTimeString('en-IN'),
      gateName: gateName || 'Main Gate',
    };
  }

  /**
   * Get attendance summary KPIs for an event
   */
  public static async getAttendanceSummary(eventId: string): Promise<IAttendanceSummary> {
    const guests = await Guest.find({ eventId });
    const totalGuests = guests.length;
    const confirmedGuests = guests.filter((g) => g.rsvpStatus === 'ACCEPTED').length;
    const checkedIn = guests.filter((g) => g.checkInStatus).length;
    const notCheckedIn = totalGuests - checkedIn;
    const declined = guests.filter((g) => g.rsvpStatus === 'DECLINED').length;
    const pending = guests.filter((g) => g.rsvpStatus === 'PENDING' || g.rsvpStatus === 'TENTATIVE').length;
    const attendanceRate = totalGuests > 0 ? Math.round((checkedIn / totalGuests) * 100) : 0;

    return {
      totalGuests,
      confirmedGuests,
      checkedIn,
      notCheckedIn,
      declined,
      pending,
      attendanceRate,
    };
  }

  /**
   * Get Check-In Audit Logs
   */
  public static async getCheckInAuditHistory(eventId: string) {
    return EventCheckIn.find({ eventId })
      .populate('guestId', 'name email phone relationship group assignedTable mealPreference')
      .populate('checkedInBy', 'name email role')
      .sort({ checkedInAt: -1 })
      .limit(100);
  }

  /**
   * Export attendance data as structured CSV
   */
  public static async exportAttendanceCSV(eventId: string): Promise<string> {
    const guests = await Guest.find({ eventId });
    const checkIns = await EventCheckIn.find({ eventId, checkedIn: true }).populate('checkedInBy', 'name');

    const checkInMap = new Map<string, any>();
    checkIns.forEach((ci) => {
      if (ci.guestId) {
        checkInMap.set(ci.guestId.toString(), ci);
      }
    });

    const headers = [
      'Guest Name',
      'Relationship',
      'Group',
      'Phone',
      'Email',
      'RSVP Status',
      'Check-In Status',
      'Check-In Time',
      'Gate Name',
      'Verified By',
      'Table Assigned',
      'Dietary Preference',
    ];

    const rows = guests.map((g) => {
      const ci = checkInMap.get(g._id.toString());
      return [
        `"${g.name.replace(/"/g, '""')}"`,
        `"${g.relationship || ''}"`,
        `"${g.group || ''}"`,
        `"${g.phone || ''}"`,
        `"${g.email || ''}"`,
        `"${g.rsvpStatus}"`,
        `"${g.checkInStatus ? 'CHECKED_IN' : 'NOT_CHECKED_IN'}"`,
        `"${g.checkInTime || (ci?.checkedInAt ? new Date(ci.checkedInAt).toLocaleString('en-IN') : '')}"`,
        `"${ci?.gateName || ''}"`,
        `"${ci?.checkedInBy?.name || ''}"`,
        `"${g.assignedTable || 'Open'}"`,
        `"${g.mealPreference || 'Veg'}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
