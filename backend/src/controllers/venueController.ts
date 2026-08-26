import { Request, Response } from 'express';
import { Venue } from '../models/Venue';
import { Booking } from '../models/Booking';
import { AuthRequest } from '../middleware/auth';

/**
 * Calculate distance in km between two lat/lng pairs using Haversine formula
 */
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

export const getVenues = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      minCapacity,
      indoor,
      outdoor,
      ac,
      parking,
      catering,
      search,
      userLat,
      userLng,
      radiusKm,
    } = req.query;

    const filter: any = { isAvailable: true };

    if (city) {
      filter.city = new RegExp(city as string, 'i');
    }
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }
    if (minCapacity) {
      filter['capacity.max'] = { $gte: Number(minCapacity) };
    }
    if (indoor === 'true') filter['features.indoor'] = true;
    if (outdoor === 'true') filter['features.outdoor'] = true;
    if (ac === 'true') filter['features.ac'] = true;
    if (parking === 'true') filter['features.parking'] = true;
    if (catering === 'true') filter['features.cateringAvailable'] = true;

    if (search) {
      filter.$or = [
        { name: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
        { city: new RegExp(search as string, 'i') },
        { address: new RegExp(search as string, 'i') },
      ];
    }

    let venues = await Venue.find(filter).sort({ rating: -1, pricePerDay: 1 });

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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVenueById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const venue = await Venue.findById(id);
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bookVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { eventId, eventDate, bookingNotes } = req.body;

    const venue = await Venue.findById(id);
    if (!venue) {
      res.status(404).json({ success: false, message: 'Venue not found.' });
      return;
    }

    const advanceRate = 0.25; // 25% Advance booking deposit
    const advancePaid = Math.round(venue.pricePerDay * advanceRate);
    const balanceDue = venue.pricePerDay - advancePaid;

    const booking = await Booking.create({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const venue = await Venue.create(req.body);
    res.status(201).json({ success: true, message: 'Venue created successfully.', venue });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
