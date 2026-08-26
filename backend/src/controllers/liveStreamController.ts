import { Request, Response } from 'express';
import { LiveStream } from '../models/LiveStream';
import { Event } from '../models/Event';
import { SocketService } from '../services/socketService';

export const getLiveStream = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    let stream = await LiveStream.findOne({ eventId });

    if (!stream) {
      const event = await Event.findById(eventId);
      stream = await LiveStream.create({
        eventId,
        title: `${event?.name || 'Grand Indian Event'} - Live Stream`,
        streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Fallback stream embed
        status: 'NOT_STARTED',
      });
    }

    res.json({ success: true, stream });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLiveStream = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { streamUrl, provider, status, title, description, scheduledStartTime, isPrivate, accessCode } = req.body;

    const stream = await LiveStream.findOneAndUpdate(
      { eventId },
      { streamUrl, provider, status, title, description, scheduledStartTime, isPrivate, accessCode },
      { new: true, upsert: true }
    );

    // Notify all viewers in room
    SocketService.emitToEvent(eventId, 'stream:status_change', {
      status: stream.status,
      streamUrl: stream.streamUrl,
      title: stream.title,
    });

    res.json({ success: true, message: 'Live stream settings updated.', stream });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const postAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { message, sender } = req.body;

    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      message,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      sender: sender || 'Event Command Center',
    };

    const stream = await LiveStream.findOneAndUpdate(
      { eventId },
      { $push: { announcements: newAnnouncement } },
      { new: true, upsert: true }
    );

    // Broadcast announcement in real-time
    SocketService.emitToEvent(eventId, 'announcement:broadcast', newAnnouncement);

    res.json({ success: true, announcement: newAnnouncement });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
