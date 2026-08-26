import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Event } from '../models/Event';
import mongoose from 'mongoose';

// 1. Get current logged-in user's booked services
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawUserId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    if (!rawUserId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const userId = mongoose.isValidObjectId(rawUserId) ? new mongoose.Types.ObjectId(rawUserId) : rawUserId;

    // Find all events created by this user or direct bookings
    const userEvents = await Event.find({
      $or: [{ createdBy: userId }, { createdBy: rawUserId }],
    }).select('_id');
    const eventIds = userEvents.map((e) => e._id);

    const bookings = await Booking.find({
      $or: [{ userId }, { userId: rawUserId }, { eventId: { $in: eventIds } }],
    })
      .populate('eventId', 'name date location status bannerImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get bookings for events managed by organizer
export const getOrganizerBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawOrganizerId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    if (!rawOrganizerId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const organizerId = mongoose.isValidObjectId(rawOrganizerId)
      ? new mongoose.Types.ObjectId(rawOrganizerId)
      : rawOrganizerId;

    // Find all events where createdBy = organizerId OR organizerId = organizerId OR assignedStaff contains organizerId
    const organizerEvents = await Event.find({
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

    const bookings = await Booking.find({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get bookings for a specific event
export const getEventBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const bookings = await Booking.find({ eventId })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Create a new service booking
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const {
      eventId,
      itemType,
      itemId,
      itemName,
      amount,
      advancePaid,
      balanceDue,
      eventDate,
      bookingNotes,
    } = req.body;

    if (!eventId || !itemType || !itemName || amount === undefined) {
      res.status(400).json({ success: false, message: 'Missing required booking fields' });
      return;
    }

    const booking = await Booking.create({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Update booking status
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
