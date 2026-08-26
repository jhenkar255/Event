"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestSchema = exports.createEventSchema = exports.loginSchema = exports.registerSchema = exports.validateRequest = void 0;
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
                message: 'Validation Error',
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
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(80).required(),
    email: joi_1.default.string().email({ tlds: { allow: false } }).required(),
    password: joi_1.default.string().min(6).max(100).required(),
    phone: joi_1.default.string().allow('', null),
    role: joi_1.default.string().valid('USER', 'ORGANIZER', 'EMPLOYEE', 'ADMIN').default('USER'),
    city: joi_1.default.string().allow('', null),
    state: joi_1.default.string().allow('', null),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email({ tlds: { allow: false } }).required(),
    password: joi_1.default.string().min(1).required(),
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
