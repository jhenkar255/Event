import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole, UserStatus, OrganizerStatus } from '../shared/types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  password: string;
  failedLoginAttempts: number;
  lockUntil?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  refreshTokenHash?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incLoginAttempts(): Promise<void>;
  resetLockout(): Promise<void>;
}

const UserSchema = new Schema<IUserDocument>(
  {
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
      enum: ['USER', 'ORGANIZER', 'ADMIN', 'EMPLOYEE'] as UserRole[],
      default: 'USER',
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'] as UserStatus[],
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
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] as OrganizerStatus[],
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
  },
  { timestamps: true }
);

// Pre-save password hashing and name sync
UserSchema.pre('save', async function (next) {
  if (this.name && !this.fullName) {
    this.fullName = this.name;
  }
  if (this.fullName && !this.name) {
    this.name = this.fullName;
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

UserSchema.methods.incLoginAttempts = async function (): Promise<void> {
  // If a previous lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil.getTime() < Date.now()) {
    this.failedLoginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
    // Lock after 5 consecutive failed attempts for 15 minutes
    if (this.failedLoginAttempts >= 5) {
      this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
  }
  await this.save();
};

UserSchema.methods.resetLockout = async function (): Promise<void> {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLoginAt = new Date();
  await this.save();
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
