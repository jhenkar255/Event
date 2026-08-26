"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRSVP = exports.importGuestsCsv = exports.deleteGuest = exports.updateGuest = exports.addGuest = exports.getGuestsByEvent = void 0;
const Guest_1 = require("../models/Guest");
const qrService_1 = require("../services/qrService");
const socketService_1 = require("../services/socketService");
const getGuestsByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const guests = await Guest_1.Guest.find({ eventId }).sort({ name: 1 });
        const total = guests.length;
        const accepted = guests.filter((g) => g.rsvpStatus === 'ACCEPTED').length;
        const declined = guests.filter((g) => g.rsvpStatus === 'DECLINED').length;
        const pending = guests.filter((g) => g.rsvpStatus === 'PENDING').length;
        const checkedIn = guests.filter((g) => g.checkInStatus).length;
        res.json({
            success: true,
            guests,
            stats: {
                total,
                accepted,
                declined,
                pending,
                checkedIn,
                totalHeadcount: guests.reduce((sum, g) => sum + 1 + (g.plusGuests || 0), 0),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getGuestsByEvent = getGuestsByEvent;
const addGuest = async (req, res) => {
    try {
        const { eventId } = req.params;
        const guest = new Guest_1.Guest({
            ...req.body,
            eventId,
        });
        // Generate signed QR token for this guest
        const qrToken = qrService_1.QRService.generateSignedToken(eventId, guest._id.toString());
        guest.qrToken = qrToken;
        await guest.save();
        res.status(201).json({ success: true, message: 'Guest added successfully.', guest });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addGuest = addGuest;
const updateGuest = async (req, res) => {
    try {
        const { id } = req.params;
        const guest = await Guest_1.Guest.findByIdAndUpdate(id, req.body, { new: true });
        if (!guest) {
            res.status(404).json({ success: false, message: 'Guest not found.' });
            return;
        }
        res.json({ success: true, message: 'Guest updated successfully.', guest });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateGuest = updateGuest;
const deleteGuest = async (req, res) => {
    try {
        const { id } = req.params;
        await Guest_1.Guest.findByIdAndDelete(id);
        res.json({ success: true, message: 'Guest removed successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteGuest = deleteGuest;
const importGuestsCsv = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { guestList } = req.body; // Array of guest objects
        if (!Array.isArray(guestList) || guestList.length === 0) {
            res.status(400).json({ success: false, message: 'Invalid or empty guest list.' });
            return;
        }
        const createdGuests = [];
        for (const item of guestList) {
            const guest = new Guest_1.Guest({
                eventId,
                name: item.name || 'Invited Guest',
                email: item.email || '',
                phone: item.phone || '',
                relationship: item.relationship || 'Relative',
                group: item.group || 'General',
                mealPreference: item.mealPreference || 'Veg',
                plusGuests: Number(item.plusGuests || 0),
                assignedTable: item.assignedTable || '',
            });
            guest.qrToken = qrService_1.QRService.generateSignedToken(eventId, guest._id.toString());
            await guest.save();
            createdGuests.push(guest);
        }
        res.status(201).json({
            success: true,
            message: `Successfully imported ${createdGuests.length} guests with unique QR passes!`,
            count: createdGuests.length,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.importGuestsCsv = importGuestsCsv;
const updateRSVP = async (req, res) => {
    try {
        const { id } = req.params;
        const { rsvpStatus, mealPreference, plusGuests } = req.body;
        const guest = await Guest_1.Guest.findByIdAndUpdate(id, { rsvpStatus, mealPreference, plusGuests }, { new: true });
        if (!guest) {
            res.status(404).json({ success: false, message: 'Guest not found.' });
            return;
        }
        // Emit live RSVP update to event room
        socketService_1.SocketService.emitToEvent(guest.eventId.toString(), 'guest:rsvp_update', {
            guestId: guest._id,
            name: guest.name,
            rsvpStatus: guest.rsvpStatus,
        });
        res.json({ success: true, message: 'RSVP updated successfully.', guest });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateRSVP = updateRSVP;
