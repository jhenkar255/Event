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
exports.Invitation = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const InvitationSchema = new mongoose_1.Schema({
    eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Event', required: true, unique: true, index: true },
    templateId: { type: String, default: 'royal-rajasthani' },
    title: { type: String, required: true },
    hostNames: { type: String, required: true },
    eventDate: { type: String, required: true },
    eventTime: { type: String, required: true },
    venueName: { type: String, required: true },
    venueAddress: { type: String, required: true },
    customMessage: { type: String, required: true },
    shlokaOrQuote: { type: String },
    themeColor: { type: String, default: '#7A1F2B' },
    musicUrl: { type: String },
    coverImage: { type: String },
    photos: [{ type: String }],
    shareUrlToken: {
        type: String,
        unique: true,
        index: true,
        default: () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
    },
}, { timestamps: true });
exports.Invitation = mongoose_1.default.model('Invitation', InvitationSchema);
