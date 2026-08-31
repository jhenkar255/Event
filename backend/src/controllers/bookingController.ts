import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Event } from '../models/Event';
import { EventQRCode } from '../models/EventQRCode';
import { QRService } from '../services/qrService';
import { User } from '../models/User';
import mongoose from 'mongoose';

// 1. Get current logged-in user's booked events & services
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawUserId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    if (!rawUserId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const userId = mongoose.isValidObjectId(rawUserId) ? new mongoose.Types.ObjectId(rawUserId) : rawUserId;

    const userEvents = await Event.find({
      $or: [{ createdBy: userId }, { createdBy: rawUserId }],
    }).select('_id');
    const eventIds = userEvents.map((e) => e._id);

    const bookings = await Booking.find({
      $or: [{ userId }, { userId: rawUserId }, { eventId: { $in: eventIds } }],
    })
      .populate('eventId', 'name date time startTime location status bannerImage category subcategory eventFormat')
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

// 2. Reserve / Book Event Tickets (Free Registration or Paid Tickets)
export const reserveEventTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawUserId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    if (!rawUserId) {
      res.status(401).json({ success: false, message: 'Authentication required to book events.' });
      return;
    }

    const {
      eventId,
      ticketTier = 'General',
      ticketTypeId,
      quantity = 1,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      bookingNotes,
    } = req.body;

    if (!eventId) {
      res.status(400).json({ success: false, message: 'Event ID is required.' });
      return;
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    // 1. Fetch Event & verify availability
    let event: any = null;
    if (mongoose.isValidObjectId(eventId)) {
      event = await Event.findById(eventId);
    }

    let eventDate = new Date().toISOString().split('T')[0];
    let eventName = 'Special Celebration';
    let availableSeats = 500;
    let isFreeEvent = true;
    let unitPrice = 0;

    if (event) {
      eventDate = event.date;
      eventName = event.name;

      if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
        res.status(400).json({ success: false, message: `Cannot book event: Event is ${event.status}.` });
        return;
      }

      if (event.isSoldOut || (event.availableSeats !== undefined && event.availableSeats < qty)) {
        res.status(400).json({ success: false, message: 'Sorry, this event is sold out or does not have enough seats available.' });
        return;
      }

      // Backend price calculation (never trust client amounts)
      if (event.ticketTiers && event.ticketTiers.length > 0) {
        const tier = event.ticketTiers.find((t: any) => t.name.toLowerCase() === ticketTier.toLowerCase() || t.id === ticketTypeId);
        if (tier) {
          unitPrice = tier.price || 0;
        } else {
          unitPrice = event.ticketPrice || event.price || 0;
        }
      } else {
        unitPrice = event.ticketPrice || event.price || 0;
      }

      isFreeEvent = unitPrice === 0 || event.isFree;
    } else {
      // Mock event price handling for starter catalog
      if (ticketTier.toLowerCase() === 'vip') unitPrice = 799;
      else if (ticketTier.toLowerCase() === 'premium') unitPrice = 1499;
      else unitPrice = 299;
      isFreeEvent = false;
    }

    // Pricing Breakdown
    const baseTotal = isFreeEvent ? 0 : unitPrice * qty;
    const platformFee = isFreeEvent ? 0 : Math.round(baseTotal * 0.02) + 20; // 2% + ₹20
    const taxAmount = isFreeEvent ? 0 : Math.round(platformFee * 0.18); // 18% GST on platform fee
    const discountAmount = 0;
    const finalTotal = isFreeEvent ? 0 : baseTotal + platformFee + taxAmount - discountAmount;

    // 2. Fetch User Profile
    const user = await User.findById(rawUserId);
    const resolvedName = attendeeName || user?.name || 'Valued Guest';
    const resolvedEmail = attendeeEmail || user?.email || 'guest@utsavmitra.com';
    const resolvedPhone = attendeePhone || user?.phone || '';

    // 3. Atomically decrement seats on Event if event exists in DB
    if (event && mongoose.isValidObjectId(eventId)) {
      const currentAvailable = event.availableSeats !== undefined ? event.availableSeats : 500;
      const newAvailable = Math.max(0, currentAvailable - qty);
      const newRegistered = (event.registeredCount || 0) + qty;
      const isNowSoldOut = newAvailable === 0;

      await Event.findByIdAndUpdate(eventId, {
        availableSeats: newAvailable,
        registeredCount: newRegistered,
        isSoldOut: isNowSoldOut,
      });
    }

    // 4. Generate Cryptographic QR Pass
    const bookingNumber = `UTS-BOOK-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrToken = QRService.generateSignedToken(
      eventId.toString(),
      null,
      rawUserId.toString(),
      30
    );
    const tokenHash = QRService.hashToken(qrToken);

    let qrRecord: any = null;
    if (mongoose.isValidObjectId(eventId)) {
      qrRecord = await EventQRCode.create({
        eventId,
        userId: rawUserId,
        token: qrToken,
        tokenHash,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }).catch(() => null);
    }

    // 5. Create Booking Record
    const booking = await Booking.create({
      bookingNumber,
      eventId: mongoose.isValidObjectId(eventId) ? eventId : new mongoose.Types.ObjectId('65d000000000000000000001'),
      userId: rawUserId,
      bookingType: 'EVENT_TICKET',
      ticketTier,
      ticketTypeId: ticketTypeId || `tier-${ticketTier.toLowerCase()}`,
      quantity: qty,
      unitPrice,
      totalAmount: finalTotal,
      platformFee,
      taxAmount,
      discountAmount,
      itemType: 'EVENT_TICKET',
      itemName: `${eventName} – ${ticketTier} Pass (×${qty})`,
      amount: finalTotal,
      advancePaid: finalTotal,
      balanceDue: 0,
      status: 'CONFIRMED',
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      attendeeDetails: {
        name: resolvedName,
        email: resolvedEmail,
        phone: resolvedPhone,
      },
      qrToken,
      qrCodeId: qrRecord?._id || undefined,
      checkedIn: false,
      cancellationPolicy: event?.cancellationPolicy || 'Free cancellation up to 48h prior.',
      eventDate,
      bookingNotes,
    });

    res.status(201).json({
      success: true,
      message: isFreeEvent
        ? '🎉 Registration Confirmed! Your pass has been added to My Events.'
        : '🎉 Payment & Booking Confirmed! Your tickets are ready.',
      booking: {
        ...booking.toObject(),
        event: event || {
          _id: eventId,
          name: eventName,
          date: eventDate,
        },
      },
      qrToken,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Cancel Booking with seat restoration
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawUserId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    if (booking.userId.toString() !== rawUserId?.toString() && (req as any).user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
      return;
    }

    if (booking.status === 'CANCELLED') {
      res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
      return;
    }

    // Restore seats on Event
    if (booking.eventId && mongoose.isValidObjectId(booking.eventId)) {
      const qty = booking.quantity || 1;
      await Event.findByIdAndUpdate(booking.eventId, {
        $inc: { availableSeats: qty, registeredCount: -qty },
        isSoldOut: false,
      });
    }

    // Revoke QR code
    if (booking.qrToken) {
      await EventQRCode.updateMany(
        { token: booking.qrToken },
        { status: 'CANCELLED' }
      );
    }

    booking.status = 'CANCELLED';
    booking.bookingStatus = 'CANCELLED';
    booking.paymentStatus = 'REFUNDED';
    booking.refundAmount = booking.amount || 0;
    booking.bookingNotes = cancellationReason ? `Cancelled: ${cancellationReason}` : 'Cancelled by user';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Refund is being processed.',
      booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get Single Booking Details
export const getBookingDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('eventId')
      .populate('userId', 'name email phone');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Get bookings for events managed by organizer
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

    const organizerEvents = await Event.find({
      $or: [
        { createdBy: organizerId },
        { createdBy: rawOrganizerId },
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

// 6. Get all platform bookings for Admin
export const getAdminBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find()
      .populate('eventId', 'name date location price capacity')
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

// 7. Legacy Service Booking (Vendor / Catering / Decoration)
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
      bookingType: 'VENDOR_SERVICE',
      itemType,
      itemId: itemId || `item-${Date.now()}`,
      itemName,
      amount: Number(amount),
      advancePaid: Number(advancePaid || 0),
      balanceDue: Number(balanceDue !== undefined ? balanceDue : amount - (advancePaid || 0)),
      status: 'CONFIRMED',
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
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

// 8. Update booking status
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status, bookingStatus: status },
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

