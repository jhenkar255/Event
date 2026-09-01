"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChecklist = exports.deleteEvent = exports.updateEvent = exports.getEventById = exports.createEvent = exports.getEvents = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Event_1 = require("../models/Event");
const Guest_1 = require("../models/Guest");
const Payment_1 = require("../models/Payment");
const LiveStream_1 = require("../models/LiveStream");
const EventSchedule_1 = require("../models/EventSchedule");
const EventDesign_1 = require("../models/EventDesign");
const SeatingLayout_1 = require("../models/SeatingLayout");
const Invitation_1 = require("../models/Invitation");
const Booking_1 = require("../models/Booking");
const constants_1 = require("../shared/constants");
const socketService_1 = require("../services/socketService");
const mockEvents_1 = require("../shared/mockEvents");
const getEvents = async (req, res) => {
    try {
        const filter = {};
        // Regular users see only their own events if requested, otherwise public discovery events
        if (req.query.userId) {
            filter.createdBy = req.query.userId;
        }
        else if (req.query.myEvents === 'true' && req.user?.id) {
            filter.createdBy = req.user.id;
        }
        if (req.query.type && req.query.type !== 'All') {
            filter.type = req.query.type;
        }
        const categoryParam = (req.query.category || '').trim();
        if (categoryParam && categoryParam !== 'All') {
            const catRegex = new RegExp(categoryParam, 'i');
            filter.$or = [
                { category: catRegex },
                { subcategory: catRegex },
                { type: catRegex },
            ];
        }
        if (req.query.status && req.query.status !== 'All') {
            filter.status = req.query.status;
        }
        if (req.query.city && req.query.city !== 'All') {
            filter['location.city'] = new RegExp(req.query.city, 'i');
        }
        const formatParam = (req.query.eventType || req.query.eventFormat || req.query.format);
        if (formatParam && formatParam !== 'All') {
            const formatRegex = new RegExp(formatParam, 'i');
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { eventFormat: formatRegex },
                    { eventType: formatRegex },
                ]
            });
        }
        if (req.query.priceType === 'FREE') {
            filter.$or = [{ isFree: true }, { price: 0 }, { ticketPrice: 0 }];
        }
        else if (req.query.priceType === 'PAID') {
            filter.$or = [{ price: { $gt: 0 } }, { ticketPrice: { $gt: 0 } }];
        }
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filter.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { institutionName: searchRegex },
                { organizerName: searchRegex },
                { 'location.city': searchRegex },
                { 'location.address': searchRegex },
                { category: searchRegex },
                { subcategory: searchRegex },
            ];
        }
        let events = await Event_1.Event.find(filter).populate('venue').sort({ isFeatured: -1, date: 1, createdAt: -1 });
        // If database has 0 events and no restrictive user filter, return rich multi-category showcase events
        if (events.length === 0 && !req.query.myEvents && !req.query.userId) {
            let filteredFallback = [...mockEvents_1.SAMPLE_SHOWCASE_EVENTS];
            if (categoryParam && categoryParam !== 'All') {
                const catLower = categoryParam.toLowerCase();
                filteredFallback = filteredFallback.filter(e => (e.category && e.category.toLowerCase().includes(catLower)) ||
                    (e.subcategory && e.subcategory.toLowerCase().includes(catLower)) ||
                    (e.type && e.type.toLowerCase().includes(catLower)));
            }
            if (formatParam && formatParam !== 'All') {
                const fmtLower = formatParam.toLowerCase();
                filteredFallback = filteredFallback.filter(e => (e.eventFormat && e.eventFormat.toLowerCase().includes(fmtLower)) ||
                    (e.eventType && e.eventType.toLowerCase().includes(fmtLower)));
            }
            if (req.query.city && req.query.city !== 'All') {
                const cLower = req.query.city.toLowerCase();
                filteredFallback = filteredFallback.filter(e => e.location?.city?.toLowerCase().includes(cLower));
            }
            if (req.query.search) {
                const s = req.query.search.toLowerCase();
                filteredFallback = filteredFallback.filter(e => e.name.toLowerCase().includes(s) ||
                    (e.description && e.description.toLowerCase().includes(s)) ||
                    (e.location?.city && e.location.city.toLowerCase().includes(s)) ||
                    (e.category && e.category.toLowerCase().includes(s)) ||
                    (e.subcategory && e.subcategory.toLowerCase().includes(s)));
            }
            events = filteredFallback;
        }
        res.json({ success: true, count: events.length, events });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getEvents = getEvents;
const createEvent = async (req, res) => {
    try {
        const rawType = req.body.type || req.body.eventType || 'Wedding';
        let derivedCategory = req.body.category;
        if (!derivedCategory) {
            const typeLower = String(rawType).toLowerCase();
            if (typeLower.includes('hackathon') || typeLower.includes('college') || typeLower.includes('tech') || typeLower.includes('workshop')) {
                derivedCategory = 'Education & College';
            }
            else if (typeLower.includes('corporate') || typeLower.includes('startup') || typeLower.includes('conclave') || typeLower.includes('business')) {
                derivedCategory = 'Corporate & Business';
            }
            else if (typeLower.includes('cultural') || typeLower.includes('festival') || typeLower.includes('concert') || typeLower.includes('dance')) {
                derivedCategory = 'Cultural & Entertainment';
            }
            else if (typeLower.includes('cricket') || typeLower.includes('sports') || typeLower.includes('marathon')) {
                derivedCategory = 'Sports';
            }
            else if (typeLower.includes('religious') || typeLower.includes('puja') || typeLower.includes('havan')) {
                derivedCategory = 'Religious & Traditional';
            }
            else if (typeLower.includes('community') || typeLower.includes('donation') || typeLower.includes('camp')) {
                derivedCategory = 'Community & Social';
            }
            else {
                derivedCategory = 'Wedding & Family';
            }
        }
        const derivedSubcategory = req.body.subcategory || rawType || 'Celebration';
        const derivedEventType = req.body.eventType || req.body.eventFormat || 'OFFLINE';
        const eventData = {
            ...req.body,
            type: rawType,
            category: derivedCategory,
            subcategory: derivedSubcategory,
            eventType: derivedEventType,
            venue: req.body.venue || req.body.venueId || undefined,
            createdBy: req.user?.id,
        };
        // Auto-generate checklist items based on event type if not provided
        if (!eventData.checklist || eventData.checklist.length === 0) {
            const template = constants_1.DEFAULT_CHECKLIST_TEMPLATES[eventData.type] || constants_1.DEFAULT_CHECKLIST_TEMPLATES.Other;
            eventData.checklist = template.map((item, index) => ({
                id: `chk-${Date.now()}-${index}`,
                title: item.title,
                category: item.category,
                isCompleted: false,
            }));
        }
        const event = await Event_1.Event.create(eventData);
        // Initialize accompanying records: LiveStream, Schedule, Design, Seating, Invitation
        await LiveStream_1.LiveStream.create({
            eventId: event._id,
            title: `${event.name} - Live Celebration Broadcast`,
            description: `Watch the auspicious moments of ${event.name} live in high-definition.`,
            status: 'NOT_STARTED',
        });
        await EventSchedule_1.EventSchedule.create({
            eventId: event._id,
            activities: [
                { id: 'act-1', time: '10:00 AM', title: 'Traditional Guest Welcome & Tilak', description: 'Rose water reception & welcome drinks' },
                { id: 'act-2', time: '11:30 AM', title: 'Main Ceremonial Rituals / Activities', description: 'Auspicious rites with family' },
                { id: 'act-3', time: '01:30 PM', title: 'Royal Feast & Banquet Buffet', description: 'Multi-cuisine banquet' },
                { id: 'act-4', time: '04:00 PM', title: 'Celebration, Music & Photo Sessions', description: 'Family photographs and musical troupe' },
            ],
        });
        await EventDesign_1.EventDesign.create({
            eventId: event._id,
            elements: [
                { id: 'el-1', type: 'mandap', x: 450, y: 100, width: 300, height: 200, rotation: 0, color: '#C9A227', label: 'Grand Mandap' },
                { id: 'el-2', type: 'stage', x: 450, y: 350, width: 300, height: 120, rotation: 0, color: '#7A1F2B', label: 'Main Stage' },
                { id: 'el-3', type: 'entrance', x: 500, y: 650, width: 200, height: 80, rotation: 0, color: '#F4A340', label: 'Royal Arch Entrance' },
                { id: 'el-4', type: 'rangoli', x: 550, y: 550, width: 100, height: 100, rotation: 0, color: '#FFB800', label: 'Marigold Rangoli' },
            ],
            themeName: event.theme || 'Royal Cultural Elegance',
        });
        await SeatingLayout_1.SeatingLayout.create({
            eventId: event._id,
            layoutType: 'Round Tables',
            tables: [
                { id: 'tbl-1', name: 'Table 1 - VIP Royal', shape: 'round', x: 200, y: 250, capacity: 8, assignedGuests: [] },
                { id: 'tbl-2', name: 'Table 2 - Bride Family', shape: 'round', x: 200, y: 400, capacity: 8, assignedGuests: [] },
                { id: 'tbl-3', name: 'Table 3 - Groom Family', shape: 'round', x: 900, y: 250, capacity: 8, assignedGuests: [] },
                { id: 'tbl-4', name: 'Table 4 - Friends & Colleagues', shape: 'round', x: 900, y: 400, capacity: 8, assignedGuests: [] },
            ],
            totalSeats: 32,
            assignedSeats: 0,
        });
        const inviteData = req.body.invitation || {};
        await Invitation_1.Invitation.create({
            eventId: event._id,
            templateId: 'royal-rajasthani',
            title: inviteData.title || event.name,
            hostNames: inviteData.hostNames || 'The Family Cordially Invites You',
            eventDate: event.date,
            eventTime: event.startTime || '10:00 AM',
            venueName: event.location.address,
            venueAddress: `${event.location.city}, ${event.location.state}`,
            customMessage: inviteData.customMessage || 'We request the honour of your auspicious presence and blessings as we celebrate this joyous milestone.',
            shlokaOrQuote: inviteData.shlokaOrQuote || 'सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके | शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते',
            themeColor: '#7A1F2B',
        });
        // Auto-create service bookings if services were selected in wizard
        const userId = req.user?.id;
        if (userId) {
            const eventDateStr = event.date || new Date().toISOString().split('T')[0];
            if (req.body.venueId || req.body.venue) {
                await Booking_1.Booking.create({
                    eventId: event._id,
                    userId,
                    itemType: 'VENUE',
                    itemId: String(req.body.venueId || req.body.venue),
                    itemName: `${event.location.address || 'Heritage Celebration Pavilion'}`,
                    amount: 450000,
                    advancePaid: 100000,
                    balanceDue: 350000,
                    status: 'CONFIRMED',
                    eventDate: eventDateStr,
                    bookingNotes: `Venue reservation for ${event.name}`,
                }).catch(() => { });
            }
            if (req.body.cateringId) {
                await Booking_1.Booking.create({
                    eventId: event._id,
                    userId,
                    itemType: 'CATERING',
                    itemId: String(req.body.cateringId),
                    itemName: 'Royal Traditional Feast & Live Counters',
                    amount: Math.round((event.guestCount || 200) * 1200),
                    advancePaid: 50000,
                    balanceDue: Math.round((event.guestCount || 200) * 1200) - 50000,
                    status: 'CONFIRMED',
                    eventDate: eventDateStr,
                    bookingNotes: req.body.cateringNotes || 'Catering buffet with live counters',
                }).catch(() => { });
            }
            if (req.body.decorationId) {
                await Booking_1.Booking.create({
                    eventId: event._id,
                    userId,
                    itemType: 'DECORATION',
                    itemId: String(req.body.decorationId),
                    itemName: 'Mandap, Floral Arch & Ambient Lighting Setup',
                    amount: 180000,
                    advancePaid: 50000,
                    balanceDue: 130000,
                    status: 'CONFIRMED',
                    eventDate: eventDateStr,
                    bookingNotes: 'Heritage floral and mandap theme setup',
                }).catch(() => { });
            }
            if (req.body.entertainmentId) {
                await Booking_1.Booking.create({
                    eventId: event._id,
                    userId,
                    itemType: 'ENTERTAINMENT',
                    itemId: String(req.body.entertainmentId),
                    itemName: 'Traditional Musical Troupe, Shehnai & Photography Crew',
                    amount: 120000,
                    advancePaid: 30000,
                    balanceDue: 90000,
                    status: 'CONFIRMED',
                    eventDate: eventDateStr,
                    bookingNotes: 'Classical artists and photographic coverage',
                }).catch(() => { });
            }
        }
        res.status(201).json({
            success: true,
            message: 'Event created and planning modules initialized successfully!',
            event,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createEvent = createEvent;
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        let event = null;
        if (id && mongoose_1.default.Types.ObjectId.isValid(id)) {
            event = await Event_1.Event.findById(id).populate('venue').populate('createdBy', 'name email phone');
        }
        if (!event && id) {
            event = await Event_1.Event.findOne({ eventId: id }).populate('venue').populate('createdBy', 'name email phone');
        }
        // Fallback: If id is 'demo' or event wasn't found, find the latest seeded / created event
        if (!event) {
            event = await Event_1.Event.findOne().sort({ createdAt: -1 }).populate('venue').populate('createdBy', 'name email phone');
        }
        if (!event) {
            res.status(404).json({ success: false, message: 'Celebration event not found in database.' });
            return;
        }
        // Populate invitation if available
        const invitation = await Invitation_1.Invitation.findOne({ eventId: event._id });
        const eventObj = event.toObject ? event.toObject() : { ...event };
        if (invitation) {
            eventObj.invitation = invitation;
        }
        // Compute live event stats
        const totalGuests = await Guest_1.Guest.countDocuments({ eventId: event._id });
        const acceptedRSVP = await Guest_1.Guest.countDocuments({ eventId: event._id, rsvpStatus: 'ACCEPTED' });
        const checkedInGuests = await Guest_1.Guest.countDocuments({ eventId: event._id, checkInStatus: true });
        const payments = await Payment_1.Payment.find({ eventId: event._id, status: 'SUCCESS' });
        const totalSpent = payments.reduce((acc, p) => acc + (p.totalAmount || p.amount || 0), 0);
        // Compute dynamic risk alerts
        const alerts = [];
        if (totalSpent > event.budget) {
            alerts.push({
                id: 'alert-budget',
                type: 'BUDGET',
                severity: 'HIGH',
                message: `Budget exceeded by ₹${(totalSpent - event.budget).toLocaleString('en-IN')}`,
                suggestedAction: 'Review optional entertainment and floral decor items.',
            });
        }
        if (acceptedRSVP > event.guestCount) {
            alerts.push({
                id: 'alert-capacity',
                type: 'CATERING',
                severity: 'MEDIUM',
                message: `Accepted RSVPs (${acceptedRSVP}) exceed target guest count (${event.guestCount}).`,
                suggestedAction: 'Increase catering plate count to avoid shortage.',
            });
        }
        res.json({
            success: true,
            event: eventObj,
            stats: {
                totalGuests,
                acceptedRSVP,
                checkedInGuests,
                totalSpent,
                remainingBudget: Math.max(0, event.budget - totalSpent),
                checklistCompleted: event.checklist?.filter((c) => c.isCompleted).length || 0,
                checklistTotal: event.checklist?.length || 0,
            },
            dynamicRiskAlerts: alerts,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getEventById = getEventById;
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event_1.Event.findById(id);
        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found.' });
            return;
        }
        // Check authorization
        if (req.user?.role === 'USER' && event.createdBy.toString() !== req.user.id) {
            res.status(403).json({ success: false, message: 'Unauthorized to modify this event.' });
            return;
        }
        const previousStatus = event.status;
        const updatedEvent = await Event_1.Event.findByIdAndUpdate(id, req.body, { new: true });
        // Emit live event status change via WebSockets if status changed
        if (req.body.status && req.body.status !== previousStatus) {
            socketService_1.SocketService.emitToEvent(id, 'event:status_change', {
                status: req.body.status,
                message: `Event status transitioned to ${req.body.status}`,
            });
        }
        res.json({ success: true, message: 'Event updated successfully.', event: updatedEvent });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event_1.Event.findById(id);
        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found.' });
            return;
        }
        if (req.user?.role === 'USER' && event.createdBy.toString() !== req.user.id) {
            res.status(403).json({ success: false, message: 'Unauthorized to delete this event.' });
            return;
        }
        await Event_1.Event.findByIdAndDelete(id);
        await Guest_1.Guest.deleteMany({ eventId: id });
        await LiveStream_1.LiveStream.deleteOne({ eventId: id });
        await EventSchedule_1.EventSchedule.deleteOne({ eventId: id });
        await EventDesign_1.EventDesign.deleteOne({ eventId: id });
        await SeatingLayout_1.SeatingLayout.deleteOne({ eventId: id });
        await Invitation_1.Invitation.deleteOne({ eventId: id });
        res.json({ success: true, message: 'Event and all related records deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteEvent = deleteEvent;
const updateChecklist = async (req, res) => {
    try {
        const { id } = req.params;
        const { checklist } = req.body;
        const event = await Event_1.Event.findByIdAndUpdate(id, { checklist }, { new: true });
        res.json({ success: true, checklist: event?.checklist });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateChecklist = updateChecklist;
