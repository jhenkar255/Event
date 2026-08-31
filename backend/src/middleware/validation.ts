import { Request, Response, NextFunction } from 'express';
import Joi, { Schema } from 'joi';

export const validateRequest = (schema: Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: false,
      allowUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      res.status(400).json({
        success: false,
        message: errorMessages[0] || 'Validation Error',
        errors: errorMessages,
      });
      return;
    }

    if (value) {
      Object.assign(req[property], value);
    }
    next();
  };
};

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const passwordMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.';

export const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(80),
  name: Joi.string().min(2).max(80),
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Please enter your email.',
    'string.email': 'Please enter a valid email address.',
    'any.required': 'Please enter your email.',
  }),
  password: Joi.string().min(8).regex(passwordPattern).required().messages({
    'string.empty': 'Please enter your password.',
    'string.min': passwordMessage,
    'string.pattern.base': passwordMessage,
    'any.required': 'Please enter your password.',
  }),
  phone: Joi.string().allow('', null),
  role: Joi.string().valid('USER', 'ORGANIZER').default('USER').messages({
    'any.only': 'Invalid account role. Administrator accounts cannot be registered publicly.',
  }),
  city: Joi.string().allow('', null),
  state: Joi.string().allow('', null),
  // Organizer Fields
  organizationName: Joi.string().allow('', null),
  organizationDescription: Joi.string().allow('', null),
  businessCategory: Joi.string().allow('', null),
  experience: Joi.string().allow('', null),
  services: Joi.array().items(Joi.string()).allow(null),
});

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Please enter your email.',
    'string.email': 'Please enter a valid email address.',
    'any.required': 'Please enter your email.',
  }),
  password: Joi.string().min(1).required().messages({
    'string.empty': 'Please enter your password.',
    'any.required': 'Please enter your password.',
  }),
  rememberMe: Joi.boolean().default(false),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Please enter your email.',
    'string.email': 'Please enter a valid email address.',
    'any.required': 'Please enter your email.',
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Reset token is required.',
    'any.required': 'Reset token is required.',
  }),
  newPassword: Joi.string().min(8).regex(passwordPattern).required().messages({
    'string.empty': 'Please enter your new password.',
    'string.min': passwordMessage,
    'string.pattern.base': passwordMessage,
    'any.required': 'Please enter your new password.',
  }),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Verification token is required.',
    'any.required': 'Verification token is required.',
  }),
});

export const createEventSchema = Joi.object({
  name: Joi.string().min(3).max(120).required(),
  type: Joi.string().required(),
  culturalTradition: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  date: Joi.string().required(),
  startTime: Joi.string().allow('', null),
  endTime: Joi.string().allow('', null),
  venue: Joi.string().allow('', null),
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().allow('', null),
    latitude: Joi.number().default(26.9124),
    longitude: Joi.number().default(75.7873),
  }).required(),
  guestCount: Joi.number().min(1).required(),
  budget: Joi.number().min(1000).required(),
  theme: Joi.string().allow('', null),
  status: Joi.string().valid('DRAFT', 'PLANNING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED').default('PLANNING'),
  bannerImage: Joi.string().allow('', null),
});

export const guestSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email({ tlds: { allow: false } }).allow('', null),
  phone: Joi.string().allow('', null),
  relationship: Joi.string().valid('Family', 'Friend', 'Colleague', 'VIP', 'Relative', 'Other').default('Relative'),
  group: Joi.string().default('General'),
  rsvpStatus: Joi.string().valid('PENDING', 'ACCEPTED', 'DECLINED', 'TENTATIVE').default('PENDING'),
  mealPreference: Joi.string().valid('Veg', 'Non-Veg', 'Jain', 'Vegan').default('Veg'),
  plusGuests: Joi.number().min(0).default(0),
  assignedTable: Joi.string().allow('', null),
  assignedSeat: Joi.string().allow('', null),
});
