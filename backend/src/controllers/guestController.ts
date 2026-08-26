import { Request, Response } from 'express';
import { Guest } from '../models/Guest';
import { QRService } from '../services/qrService';
import { SocketService } from '../services/socketService';

export const getGuestsByEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const guests = await Guest.find({ eventId }).sort({ name: 1 });

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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const guest = new Guest({
      ...req.body,
      eventId,
    });

    // Generate signed QR token for this guest
    const qrToken = QRService.generateSignedToken(eventId, guest._id.toString());
    guest.qrToken = qrToken;
    await guest.save();

    res.status(201).json({ success: true, message: 'Guest added successfully.', guest });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const guest = await Guest.findByIdAndUpdate(id, req.body, { new: true });
    if (!guest) {
      res.status(404).json({ success: false, message: 'Guest not found.' });
      return;
    }
    res.json({ success: true, message: 'Guest updated successfully.', guest });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Guest.findByIdAndDelete(id);
    res.json({ success: true, message: 'Guest removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const importGuestsCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { guestList } = req.body; // Array of guest objects

    if (!Array.isArray(guestList) || guestList.length === 0) {
      res.status(400).json({ success: false, message: 'Invalid or empty guest list.' });
      return;
    }

    const createdGuests = [];
    for (const item of guestList) {
      const guest = new Guest({
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
      guest.qrToken = QRService.generateSignedToken(eventId, guest._id.toString());
      await guest.save();
      createdGuests.push(guest);
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdGuests.length} guests with unique QR passes!`,
      count: createdGuests.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRSVP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rsvpStatus, mealPreference, plusGuests } = req.body;

    const guest = await Guest.findByIdAndUpdate(
      id,
      { rsvpStatus, mealPreference, plusGuests },
      { new: true }
    );

    if (!guest) {
      res.status(404).json({ success: false, message: 'Guest not found.' });
      return;
    }

    // Emit live RSVP update to event room
    SocketService.emitToEvent(guest.eventId.toString(), 'guest:rsvp_update', {
      guestId: guest._id,
      name: guest.name,
      rsvpStatus: guest.rsvpStatus,
    });

    res.json({ success: true, message: 'RSVP updated successfully.', guest });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
