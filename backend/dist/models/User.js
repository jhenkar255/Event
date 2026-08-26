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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    fullName: { type: String, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    role: {
        type: String,
        enum: ['USER', 'ORGANIZER', 'ADMIN', 'EMPLOYEE'],
        default: 'USER',
        index: true,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'],
        default: 'ACTIVE',
        index: true,
    },
    emailVerified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },
    profilePhoto: {
        type: String,
        default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    profileImage: { type: String },
    address: { type: String },
    city: { type: String, default: 'Jaipur' },
    state: { type: String, default: 'Rajasthan' },
    // Organizer Details
    organizationName: { type: String, trim: true },
    organizationDescription: { type: String, trim: true },
    businessCategory: { type: String, trim: true },
    experience: { type: String, trim: true },
    services: [{ type: String }],
    documents: [{ type: String }],
    organizerStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
        default: 'APPROVED',
        index: true,
    },
    // Preferences
    dietaryPreference: {
        type: String,
        enum: ['Veg', 'Non-Veg', 'Jain', 'Vegan', 'All'],
        default: 'Veg',
    },
    preferences: {
        culturalPreference: { type: String, default: 'Rajasthani' },
        foodPreference: {
            type: String,
            enum: ['Veg', 'Non-Veg', 'Jain', 'Vegan', 'All'],
            default: 'Veg',
        },
        emailNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: true },
    },
    // Security & Attempt Tracking
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    refreshTokenHash: { type: String },
    lastLoginAt: { type: Date },
}, { timestamps: true });
// Pre-save password hashing and name sync
UserSchema.pre('save', async function (next) {
    if (this.name && !this.fullName) {
        this.fullName = this.name;
    }
    if (this.fullName && !this.name) {
        this.name = this.fullName;
    }
    if (!this.isModified('password'))
        return next();
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
    next();
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
UserSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};
UserSchema.methods.incLoginAttempts = async function () {
    // If a previous lock has expired, reset attempts
    if (this.lockUntil && this.lockUntil.getTime() < Date.now()) {
        this.failedLoginAttempts = 1;
        this.lockUntil = undefined;
    }
    else {
        this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
        // Lock after 5 consecutive failed attempts for 15 minutes
        if (this.failedLoginAttempts >= 5) {
            this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
    }
    await this.save();
};
UserSchema.methods.resetLockout = async function () {
    this.failedLoginAttempts = 0;
    this.lockUntil = undefined;
    this.lastLoginAt = new Date();
    await this.save();
};
exports.User = mongoose_1.default.model('User', UserSchema);
