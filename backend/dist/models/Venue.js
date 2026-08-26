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
exports.Venue = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const VenueSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    capacity: {
        min: { type: Number, default: 50 },
        max: { type: Number, required: true },
    },
    pricePerDay: { type: Number, required: true, index: true },
    rating: { type: Number, default: 4.8, index: true },
    reviewCount: { type: Number, default: 0 },
    photos: [{ type: String }],
    features: {
        indoor: { type: Boolean, default: true },
        outdoor: { type: Boolean, default: true },
        parking: { type: Boolean, default: true },
        parkingCapacity: { type: Number, default: 100 },
        ac: { type: Boolean, default: true },
        cateringAvailable: { type: Boolean, default: true },
        roomsAvailable: { type: Number, default: 20 },
        alcoholAllowed: { type: Boolean, default: false },
        powerBackup: { type: Boolean, default: true },
    },
    vendorName: { type: String, required: true },
    vendorPhone: { type: String },
    vendorEmail: { type: String },
    isAvailable: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: true },
}, { timestamps: true });
VenueSchema.index({ city: 1, pricePerDay: 1, rating: -1 });
exports.Venue = mongoose_1.default.model('Venue', VenueSchema);
