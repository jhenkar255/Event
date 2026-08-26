"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveStream = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AnnouncementSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toLocaleTimeString() },
    sender: { type: String, default: 'Organizer' },
}, { _id: false });
const LiveStreamSchema = new mongoose_1.Schema({
    eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Event', required: true, unique: true, index: true },
    streamUrl: { type: String, default: 'https://www.youtube.com/embed/live_stream?channel=DEMO' },
    provider: {
        type: String,
        enum: ['YOUTUBE_LIVE', 'EMBEDDED', 'CUSTOM'],
        default: 'YOUTUBE_LIVE',
    },
    status: {
        type: String,
        enum: ['NOT_STARTED', 'LIVE', 'ENDED'],
        default: 'NOT_STARTED',
        index: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    scheduledStartTime: { type: String },
    viewerCount: { type: Number, default: 0 },
    isPrivate: { type: Boolean, default: false },
    accessCode: { type: String },
    announcements: [AnnouncementSchema],
}, { timestamps: true });
exports.LiveStream = mongoose_1.default.model('LiveStream', LiveStreamSchema);
