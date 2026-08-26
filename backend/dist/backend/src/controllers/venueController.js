"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVenue = exports.bookVenue = exports.getVenueById = exports.getVenues = void 0;
const Venue_1 = require("../models/Venue");
const Booking_1 = require("../models/Booking");
/**
 * Calculate distance in km between two lat/lng pairs using Haversine formula
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
};
const getVenues = async (req, res) => {
    try {
        const { city, minPrice, maxPrice, minCapacity, indoor, outdoor, ac, parking, catering, search, userLat, userLng, radiusKm, } = req.query;
        const filter = { isAvailable: true };
        if (city) {
            filter.city = new RegExp(city, 'i');
        }
        if (minPrice || maxPrice) {
            filter.pricePerDay = {};
            if (minPrice)
                filter.pricePerDay.$gte = Number(minPrice);
            if (maxPrice)
                filter.pricePerDay.$lte = Number(maxPrice);
        }
        if (minCapacity) {
            filter['capacity.max'] = { $gte: Number(minCapacity) };
        }
        if (indoor === 'true')
            filter['features.indoor'] = true;
        if (outdoor === 'true')
            filter['features.outdoor'] = true;
        if (ac === 'true')
            filter['features.ac'] = true;
        if (parking === 'true')
            filter['features.parking'] = true;
        if (catering === 'true')
            filter['features.cateringAvailable'] = true;
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { city: new RegExp(search, 'i') },
                { address: new RegExp(search, 'i') },
            ];
        }
        let venues = await Venue_1.Venue.find(filter).sort({ rating: -1, pricePerDay: 1 });
        // If user coordinates provided, compute distance for each venue
        if (userLat && userLng) {
            const uLat = Number(userLat);
            const uLng = Number(userLng);
            let venueList = venues.map((v) => {
                const dist = calculateDistanceKm(uLat, uLng, v.latitude, v.longitude);
                return {
                    ...v.toObject(),
                    distanceKm: dist,
                };
            });
            if (radiusKm) {
                venueList = venueList.filter((v) => v.distanceKm <= Number(radiusKm));
            }
            venueList.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
            res.json({ success: true, count: venueList.length, venues: venueList });
            return;
        }
        res.json({ success: true, count: venues.length, venues });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getVenues = getVenues;
const getVenueById = async (req, res) => {
    try {
        const { id } = req.params;
        const venue = await Venue_1.Venue.findById(id);
        if (!venue) {
            res.status(404).json({ success: false, message: 'Venue not found.' });
            return;
        }
        // Nearby facilities mock/heuristic
        const nearbyFacilities = [
            { type: 'Hotel', name: `${venue.name} Guest Suites`, distance: '0.2 km' },
            { type: 'Parking', name: 'Valet & Covered Parking Bay', distance: 'On Premise' },
            { type: 'Hospital', name: `${venue.city} Multi-Speciality Clinic`, distance: '2.5 km' },
            { type: 'Transit', name: `${venue.city} Central Junction Station`, distance: '4.0 km' },
        ];
        res.json({ success: true, venue, nearbyFacilities });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getVenueById = getVenueById;
const bookVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const { eventId, eventDate, bookingNotes } = req.body;
        const venue = await Venue_1.Venue.findById(id);
        if (!venue) {
            res.status(404).json({ success: false, message: 'Venue not found.' });
            return;
        }
        const advanceRate = 0.25; // 25% Advance booking deposit
        const advancePaid = Math.round(venue.pricePerDay * advanceRate);
        const balanceDue = venue.pricePerDay - advancePaid;
        const booking = await Booking_1.Booking.create({
            eventId,
            userId: req.user?.id,
            itemType: 'VENUE',
            itemId: venue._id.toString(),
            itemName: venue.name,
            amount: venue.pricePerDay,
            advancePaid: 0,
            balanceDue: venue.pricePerDay,
            status: 'PENDING',
            eventDate,
            bookingNotes,
        });
        res.status(201).json({
            success: true,
            message: 'Venue booking requested! Proceed to confirm via advance payment.',
            booking,
            suggestedAdvanceAmount: advancePaid,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.bookVenue = bookVenue;
const createVenue = async (req, res) => {
    try {
        const venue = await Venue_1.Venue.create(req.body);
        res.status(201).json({ success: true, message: 'Venue created successfully.', venue });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createVenue = createVenue;
