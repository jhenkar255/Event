"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postAnnouncement = exports.updateLiveStream = exports.getLiveStream = void 0;
const LiveStream_1 = require("../models/LiveStream");
const Event_1 = require("../models/Event");
const socketService_1 = require("../services/socketService");
const getLiveStream = async (req, res) => {
    try {
        const { eventId } = req.params;
        let stream = await LiveStream_1.LiveStream.findOne({ eventId });
        if (!stream) {
            const event = await Event_1.Event.findById(eventId);
            stream = await LiveStream_1.LiveStream.create({
                eventId,
                title: `${event?.name || 'Grand Indian Event'} - Live Stream`,
                streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Fallback stream embed
                status: 'NOT_STARTED',
            });
        }
        res.json({ success: true, stream });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getLiveStream = getLiveStream;
const updateLiveStream = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { streamUrl, provider, status, title, description, scheduledStartTime, isPrivate, accessCode } = req.body;
        const stream = await LiveStream_1.LiveStream.findOneAndUpdate({ eventId }, { streamUrl, provider, status, title, description, scheduledStartTime, isPrivate, accessCode }, { new: true, upsert: true });
        // Notify all viewers in room
        socketService_1.SocketService.emitToEvent(eventId, 'stream:status_change', {
            status: stream.status,
            streamUrl: stream.streamUrl,
            title: stream.title,
        });
        res.json({ success: true, message: 'Live stream settings updated.', stream });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateLiveStream = updateLiveStream;
const postAnnouncement = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { message, sender } = req.body;
        const newAnnouncement = {
            id: `ann-${Date.now()}`,
            message,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            sender: sender || 'Event Command Center',
        };
        const stream = await LiveStream_1.LiveStream.findOneAndUpdate({ eventId }, { $push: { announcements: newAnnouncement } }, { new: true, upsert: true });
        // Broadcast announcement in real-time
        socketService_1.SocketService.emitToEvent(eventId, 'announcement:broadcast', newAnnouncement);
        res.json({ success: true, announcement: newAnnouncement });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.postAnnouncement = postAnnouncement;
