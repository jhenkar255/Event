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
exports.Catering = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CateringSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, index: true },
    category: {
        type: String,
        enum: [
            'Veg',
            'Non-Veg',
            'Jain',
            'Vegan',
            'South Indian',
            'North Indian',
            'Continental',
            'Royal Rajasthani',
            'Gujarati Thali',
            'Bengali Feast',
        ],
        required: true,
        index: true,
    },
    description: { type: String, required: true },
    pricePerPlate: { type: Number, required: true, index: true },
    minimumGuests: { type: Number, default: 50 },
    menuItems: {
        welcomeDrinks: [{ type: String }],
        starters: [{ type: String }],
        mainCourse: [{ type: String }],
        breadsAndRice: [{ type: String }],
        desserts: [{ type: String }],
        liveCounters: [{ type: String }],
    },
    rating: { type: Number, default: 4.9 },
    vendorName: { type: String, required: true },
    photos: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });
exports.Catering = mongoose_1.default.model('Catering', CateringSchema);
