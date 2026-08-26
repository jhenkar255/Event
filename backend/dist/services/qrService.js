"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const qrcode_1 = __importDefault(require("qrcode"));
const Guest_1 = require("../models/Guest");
class QRService {
    static signingSecret = process.env.QR_SIGNING_SECRET || 'utsavmitra_qr_token_signing_secret_key_2026';
    /**
     * Create cryptographically signed token for an event or specific guest
     */
    static generateSignedToken(eventId, guestId) {
        const timestamp = Date.now();
        const nonce = crypto_1.default.randomBytes(4).toString('hex');
        const rawPayload = `${eventId}:${guestId || 'OPEN'}:${timestamp}:${nonce}`;
        const signature = crypto_1.default
            .createHmac('sha256', this.signingSecret)
            .update(rawPayload)
            .digest('hex')
            .substring(0, 16);
        const tokenPayload = {
            e: eventId,
            g: guestId || null,
            t: timestamp,
            s: signature,
            n: nonce,
        };
        return Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
    }
    /**
     * Decode and cryptographically verify a QR token
     */
    static verifySignedToken(token) {
        try {
            const decodedStr = Buffer.from(token, 'base64url').toString('utf-8');
            const payload = JSON.parse(decodedStr);
            if (!payload.e || !payload.t || !payload.s || !payload.n) {
                return { isValid: false, error: 'Malformed QR token structure.' };
            }
            const rawPayload = `${payload.e}:${payload.g || 'OPEN'}:${payload.t}:${payload.n}`;
            const expectedSignature = crypto_1.default
                .createHmac('sha256', this.signingSecret)
                .update(rawPayload)
                .digest('hex')
                .substring(0, 16);
            if (expectedSignature !== payload.s) {
                return { isValid: false, error: 'Cryptographic signature mismatch. Invalid or forged QR code.' };
            }
            return {
                isValid: true,
                eventId: payload.e,
                guestId: payload.g,
                timestamp: payload.t,
            };
        }
        catch (err) {
            return { isValid: false, error: 'Could not decode QR token.' };
        }
    }
    /**
     * Generate QR Code Data URL image
     */
    static async generateQRCodeDataUrl(content) {
        return qrcode_1.default.toDataURL(content, {
            errorCorrectionLevel: 'H',
            margin: 2,
            color: {
                dark: '#7A1F2B', // Deep Maroon
                light: '#FFF8EC', // Warm Ivory
            },
            width: 320,
        });
    }
    /**
     * Process gate entry check-in for a scanned QR token
     */
    static async processCheckIn(scannedToken, targetEventId) {
        const verification = this.verifySignedToken(scannedToken);
        if (!verification.isValid) {
            return {
                success: false,
                message: verification.error || 'Invalid QR code.',
            };
        }
        if (verification.eventId !== targetEventId) {
            return {
                success: false,
                message: 'This pass belongs to a different celebration. Access Denied.',
            };
        }
        // If it's a specific guest token
        if (verification.guestId) {
            const guest = await Guest_1.Guest.findById(verification.guestId);
            if (!guest) {
                return { success: false, message: 'Guest record not found in system.' };
            }
            if (guest.checkInStatus) {
                return {
                    success: true,
                    alreadyCheckedIn: true,
                    message: `⚠️ Guest "${guest.name}" was ALREADY checked in at ${guest.checkInTime || 'earlier today'}.`,
                    guest: guest.toObject(),
                    checkInTime: guest.checkInTime,
                };
            }
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
            return {
                success: true,
                alreadyCheckedIn: false,
                message: `✅ Check-in Successful! Welcome ${guest.name} (${guest.relationship || 'Guest'})`,
                guest: guest.toObject(),
                checkInTime,
            };
        }
        // General event entry token
        return {
            success: true,
            alreadyCheckedIn: false,
            message: '✅ Valid Event Entry Pass verified.',
            checkInTime: new Date().toLocaleTimeString(),
        };
    }
}
exports.QRService = QRService;
