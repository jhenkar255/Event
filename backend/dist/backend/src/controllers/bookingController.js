"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.createBooking = exports.getEventBookings = exports.getOrganizerBookings = exports.getMyBookings = void 0;
const Booking_1 = require("../models/Booking");
const Event_1 = require("../models/Event");
const mongoose_1 = __importDefault(require("mongoose"));
// 1. Get current logged-in user's booked services
const getMyBookings = async (req, res) => {
    try {
        const rawUserId = req.user?.id || req.user?._id || req.user?.userId;
        if (!rawUserId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const userId = mongoose_1.default.isValidObjectId(rawUserId) ? new mongoose_1.default.Types.ObjectId(rawUserId) : rawUserId;
        // Find all events created by this user or direct bookings
        const userEvents = await Event_1.Event.find({
            $or: [{ createdBy: userId }, { createdBy: rawUserId }],
        }).select('_id');
        const eventIds = userEvents.map((e) => e._id);
        const bookings = await Booking_1.Booking.find({
            $or: [{ userId }, { userId: rawUserId }, { eventId: { $in: eventIds } }],
        })
            .populate('eventId', 'name date location status bannerImage')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: bookings.length,
            bookings,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyBookings = getMyBookings;
// 2. Get bookings for events managed by organizer
const getOrganizerBookings = async (req, res) => {
    try {
        const rawOrganizerId = req.user?.id || req.user?._id || req.user?.userId;
        if (!rawOrganizerId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const organizerId = mongoose_1.default.isValidObjectId(rawOrganizerId)
            ? new mongoose_1.default.Types.ObjectId(rawOrganizerId)
            : rawOrganizerId;
        // Find all events where createdBy = organizerId OR organizerId = organizerId OR assignedStaff contains organizerId
        const organizerEvents = await Event_1.Event.find({
            $or: [
                { createdBy: organizerId },
                { createdBy: rawOrganizerId },
                { organizerId: organizerId },
                { organizerId: rawOrganizerId },
                { assignedStaff: organizerId },
                { assignedStaff: rawOrganizerId },
            ],
        }).select('_id name');
        const eventIds = organizerEvents.map((e) => e._id);
        const bookings = await Booking_1.Booking.find({
            $or: [
                { eventId: { $in: eventIds } },
                { userId: organizerId },
                { userId: rawOrganizerId },
            ],
        })
            .populate('eventId', 'name date location status guestCount budget')
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: bookings.length,
            bookings,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getOrganizerBookings = getOrganizerBookings;
// 3. Get bookings for a specific event
const getEventBookings = async (req, res) => {
    try {
        const { eventId } = req.params;
        const bookings = await Booking_1.Booking.find({ eventId })
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: bookings.length,
            bookings,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getEventBookings = getEventBookings;
// 4. Create a new service booking
const createBooking = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { eventId, itemType, itemId, itemName, amount, advancePaid, balanceDue, eventDate, bookingNotes, } = req.body;
        if (!eventId || !itemType || !itemName || amount === undefined) {
            res.status(400).json({ success: false, message: 'Missing required booking fields' });
            return;
        }
        const booking = await Booking_1.Booking.create({
            eventId,
            userId,
            itemType,
            itemId: itemId || `item-${Date.now()}`,
            itemName,
            amount: Number(amount),
            advancePaid: Number(advancePaid || 0),
            balanceDue: Number(balanceDue !== undefined ? balanceDue : amount - (advancePaid || 0)),
            status: 'CONFIRMED',
            eventDate: eventDate || new Date().toISOString().split('T')[0],
            bookingNotes,
        });
        res.status(201).json({
            success: true,
            message: 'Service booked successfully!',
            booking,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createBooking = createBooking;
// 5. Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const booking = await Booking_1.Booking.findByIdAndUpdate(id, { status }, { new: true })
            .populate('eventId', 'name date')
            .populate('userId', 'name email');
        if (!booking) {
            res.status(404).json({ success: false, message: 'Booking not found' });
            return;
        }
        res.json({
            success: true,
            message: `Booking status updated to ${status}`,
            booking,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateBookingStatus = updateBookingStatus;
