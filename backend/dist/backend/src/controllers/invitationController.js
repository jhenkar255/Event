"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPublicRSVP = exports.getPublicInvitationByToken = exports.updateInvitation = exports.getInvitationByEvent = void 0;
const Invitation_1 = require("../models/Invitation");
const Event_1 = require("../models/Event");
const Guest_1 = require("../models/Guest");
const qrService_1 = require("../services/qrService");
const getInvitationByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        let invitation = await Invitation_1.Invitation.findOne({ eventId });
        if (!invitation) {
            const event = await Event_1.Event.findById(eventId);
            if (!event) {
                res.status(404).json({ success: false, message: 'Event not found.' });
                return;
            }
            invitation = await Invitation_1.Invitation.create({
                eventId,
                templateId: 'royal-rajasthani',
                title: event.name,
                hostNames: 'The Family Cordially Invites You',
                eventDate: event.date,
                eventTime: event.startTime || '10:00 AM',
                venueName: event.location.address,
                venueAddress: `${event.location.city}, ${event.location.state}`,
                customMessage: 'We request the honour of your auspicious presence and blessings as we celebrate this joyous milestone.',
                shlokaOrQuote: 'मंगलम् भगवान् विष्णुः मङ्गलम् गरुडध्वजः | मङ्गलम् पुण्डरीकाक्षः मङ्गलाय तनो हरिः',
                themeColor: '#7A1F2B',
            });
        }
        // Generate generic event QR data URL
        const openToken = qrService_1.QRService.generateSignedToken(eventId);
        const qrDataUrl = await qrService_1.QRService.generateQRCodeDataUrl(openToken);
        res.json({ success: true, invitation, eventQrDataUrl: qrDataUrl });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getInvitationByEvent = getInvitationByEvent;
const updateInvitation = async (req, res) => {
    try {
        const { eventId } = req.params;
        const invitation = await Invitation_1.Invitation.findOneAndUpdate({ eventId }, req.body, {
            new: true,
            upsert: true,
        });
        res.json({ success: true, message: 'Digital invitation template saved.', invitation });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateInvitation = updateInvitation;
const getPublicInvitationByToken = async (req, res) => {
    try {
        const { token } = req.params;
        const invitation = await Invitation_1.Invitation.findOne({ shareUrlToken: token }).populate('eventId');
        if (!invitation) {
            res.status(404).json({ success: false, message: 'Invitation card not found or expired.' });
            return;
        }
        const event = invitation.eventId;
        const openToken = qrService_1.QRService.generateSignedToken(event._id.toString());
        const qrDataUrl = await qrService_1.QRService.generateQRCodeDataUrl(openToken);
        res.json({
            success: true,
            invitation,
            event: {
                id: event._id,
                name: event.name,
                type: event.type,
                culturalTradition: event.culturalTradition,
                date: event.date,
                startTime: event.startTime,
                location: event.location,
                theme: event.theme,
            },
            qrDataUrl,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPublicInvitationByToken = getPublicInvitationByToken;
const submitPublicRSVP = async (req, res) => {
    try {
        const { token } = req.params;
        const { name, email, phone, rsvpStatus, mealPreference, plusGuests } = req.body;
        const invitation = await Invitation_1.Invitation.findOne({ shareUrlToken: token });
        if (!invitation) {
            res.status(404).json({ success: false, message: 'Invitation not found.' });
            return;
        }
        // Look for existing guest or create new guest record
        let guest = await Guest_1.Guest.findOne({ eventId: invitation.eventId, email: email?.toLowerCase().trim() });
        if (guest) {
            guest.name = name || guest.name;
            guest.phone = phone || guest.phone;
            guest.rsvpStatus = rsvpStatus || 'ACCEPTED';
            guest.mealPreference = mealPreference || 'Veg';
            guest.plusGuests = plusGuests !== undefined ? Number(plusGuests) : guest.plusGuests;
            await guest.save();
        }
        else {
            guest = new Guest_1.Guest({
                eventId: invitation.eventId,
                name: name || 'Valued Guest',
                email: email ? email.toLowerCase().trim() : '',
                phone: phone || '',
                relationship: 'Relative',
                rsvpStatus: rsvpStatus || 'ACCEPTED',
                mealPreference: mealPreference || 'Veg',
                plusGuests: Number(plusGuests || 0),
                invitationStatus: 'OPENED',
            });
            guest.qrToken = qrService_1.QRService.generateSignedToken(invitation.eventId.toString(), guest._id.toString());
            await guest.save();
        }
        const guestQrDataUrl = await qrService_1.QRService.generateQRCodeDataUrl(guest.qrToken || '');
        res.status(201).json({
            success: true,
            message: 'Dhanyawad! Your RSVP has been confirmed.',
            guest,
            guestQrDataUrl,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.submitPublicRSVP = submitPublicRSVP;
