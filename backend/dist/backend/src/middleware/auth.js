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
exports.requireEventStaff = exports.authorizeRoles = exports.requireAdmin = exports.requireOrganizer = exports.requireUser = exports.optionalAuth = exports.authenticateUser = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        if (!token) {
            res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
            return;
        }
        const secret = process.env.JWT_SECRET || 'utsavmitra_super_secret_jwt_key_2026_auspicious';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await User_1.User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({ success: false, message: 'User account no longer exists.' });
            return;
        }
        if (user.status === 'SUSPENDED') {
            res.status(403).json({
                success: false,
                message: 'Your account has been disabled. Please contact support.',
            });
            return;
        }
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
            status: user.status,
        };
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ success: false, message: 'Session expired. Please log in again.', code: 'TOKEN_EXPIRED' });
            return;
        }
        res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    }
};
exports.authenticateToken = authenticateToken;
exports.authenticateUser = exports.authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        if (!token) {
            return next();
        }
        const secret = process.env.JWT_SECRET || 'utsavmitra_super_secret_jwt_key_2026_auspicious';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await User_1.User.findById(decoded.id).select('-password');
        if (user && user.status !== 'SUSPENDED') {
            req.user = {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                name: user.name,
                status: user.status,
            };
        }
        next();
    }
    catch {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireUser = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
    }
    if (req.user.role !== 'USER' && req.user.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: "You don't have permission to access this page." });
        return;
    }
    next();
};
exports.requireUser = requireUser;
const requireOrganizer = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
    }
    if (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: "You don't have permission to access this page." });
        return;
    }
    next();
};
exports.requireOrganizer = requireOrganizer;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
    }
    if (req.user.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: "You don't have permission to access this page." });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required for this operation.' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: "You don't have permission to access this page.",
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const requireEventStaff = async (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
    }
    // Normal USER cannot scan or check in
    if (req.user.role === 'USER') {
        res.status(403).json({
            success: false,
            message: 'Access Denied: Standard users cannot perform gate check-ins or scan QR tickets.',
        });
        return;
    }
    // If ORGANIZER, verify they manage or own this event (if eventId is in params or body)
    const eventId = req.params.eventId || req.body.eventId;
    if (req.user.role === 'ORGANIZER' && eventId) {
        try {
            const { Event } = await Promise.resolve().then(() => __importStar(require('../models/Event')));
            const event = await Event.findById(eventId);
            if (!event) {
                res.status(404).json({ success: false, message: 'Event not found.' });
                return;
            }
            // Check if organizer created the event or is assigned
            const isOwner = event.createdBy?.toString() === req.user.id ||
                event.userId?.toString() === req.user.id ||
                event.organizerId?.toString() === req.user.id ||
                event.assignedStaff?.includes(req.user.id);
            if (!isOwner) {
                res.status(403).json({
                    success: false,
                    message: 'Access Denied: You are not authorized to manage gate check-ins for this celebration.',
                });
                return;
            }
        }
        catch (e) {
            res.status(500).json({ success: false, message: 'Authorization check failed.' });
            return;
        }
    }
    next();
};
exports.requireEventStaff = requireEventStaff;
