"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestSchema = exports.createEventSchema = exports.verifyEmailSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
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
exports.validateRequest = validateRequest;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const passwordMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.';
exports.registerSchema = joi_1.default.object({
    fullName: joi_1.default.string().min(2).max(80),
    name: joi_1.default.string().min(2).max(80),
    email: joi_1.default.string().email({ tlds: { allow: false } }).required().messages({
        'string.empty': 'Please enter your email.',
        'string.email': 'Please enter a valid email address.',
        'any.required': 'Please enter your email.',
    }),
    password: joi_1.default.string().min(8).regex(passwordPattern).required().messages({
        'string.empty': 'Please enter your password.',
        'string.min': passwordMessage,
        'string.pattern.base': passwordMessage,
        'any.required': 'Please enter your password.',
    }),
    phone: joi_1.default.string().allow('', null),
    role: joi_1.default.string().valid('USER', 'ORGANIZER').default('USER').messages({
        'any.only': 'Invalid account role. Administrator accounts cannot be registered publicly.',
    }),
    city: joi_1.default.string().allow('', null),
    state: joi_1.default.string().allow('', null),
    // Organizer Fields
    organizationName: joi_1.default.string().allow('', null),
    organizationDescription: joi_1.default.string().allow('', null),
    businessCategory: joi_1.default.string().allow('', null),
    experience: joi_1.default.string().allow('', null),
    services: joi_1.default.array().items(joi_1.default.string()).allow(null),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email({ tlds: { allow: false } }).required().messages({
        'string.empty': 'Please enter your email.',
        'string.email': 'Please enter a valid email address.',
        'any.required': 'Please enter your email.',
    }),
    password: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Please enter your password.',
        'any.required': 'Please enter your password.',
    }),
    rememberMe: joi_1.default.boolean().default(false),
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email({ tlds: { allow: false } }).required().messages({
        'string.empty': 'Please enter your email.',
        'string.email': 'Please enter a valid email address.',
        'any.required': 'Please enter your email.',
    }),
});
exports.resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string().required().messages({
        'string.empty': 'Reset token is required.',
        'any.required': 'Reset token is required.',
    }),
    newPassword: joi_1.default.string().min(8).regex(passwordPattern).required().messages({
        'string.empty': 'Please enter your new password.',
        'string.min': passwordMessage,
        'string.pattern.base': passwordMessage,
        'any.required': 'Please enter your new password.',
    }),
});
exports.verifyEmailSchema = joi_1.default.object({
    token: joi_1.default.string().required().messages({
        'string.empty': 'Verification token is required.',
        'any.required': 'Verification token is required.',
    }),
});
exports.createEventSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(120).required(),
    type: joi_1.default.string().required(),
    culturalTradition: joi_1.default.string().allow('', null),
    description: joi_1.default.string().allow('', null),
    date: joi_1.default.string().required(),
    startTime: joi_1.default.string().allow('', null),
    endTime: joi_1.default.string().allow('', null),
    venue: joi_1.default.string().allow('', null),
    location: joi_1.default.object({
        address: joi_1.default.string().required(),
        city: joi_1.default.string().required(),
        state: joi_1.default.string().required(),
        pincode: joi_1.default.string().allow('', null),
        latitude: joi_1.default.number().default(26.9124),
        longitude: joi_1.default.number().default(75.7873),
    }).required(),
    guestCount: joi_1.default.number().min(1).required(),
    budget: joi_1.default.number().min(1000).required(),
    theme: joi_1.default.string().allow('', null),
    status: joi_1.default.string().valid('DRAFT', 'PLANNING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED').default('PLANNING'),
    bannerImage: joi_1.default.string().allow('', null),
});
exports.guestSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    email: joi_1.default.string().email({ tlds: { allow: false } }).allow('', null),
    phone: joi_1.default.string().allow('', null),
    relationship: joi_1.default.string().valid('Family', 'Friend', 'Colleague', 'VIP', 'Relative', 'Other').default('Relative'),
    group: joi_1.default.string().default('General'),
    rsvpStatus: joi_1.default.string().valid('PENDING', 'ACCEPTED', 'DECLINED', 'TENTATIVE').default('PENDING'),
    mealPreference: joi_1.default.string().valid('Veg', 'Non-Veg', 'Jain', 'Vegan').default('Veg'),
    plusGuests: joi_1.default.number().min(0).default(0),
    assignedTable: joi_1.default.string().allow('', null),
    assignedSeat: joi_1.default.string().allow('', null),
});
