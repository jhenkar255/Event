"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        if (!token) {
            res.status(401).json({ success: false, message: 'Authentication token is missing. Please log in.' });
            return;
        }
        const secret = process.env.JWT_SECRET || 'utsavmitra_super_secret_jwt_key_2026_auspicious';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await User_1.User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
            return;
        }
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
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
        if (user) {
            req.user = {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                name: user.name,
            };
        }
        next();
    }
    catch (err) {
        // If token invalid in optionalAuth, proceed as unauthenticated
        next();
    }
};
exports.optionalAuth = optionalAuth;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required for this operation.' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Forbidden. You do not have permissions (${roles.join(', ')}) to access this resource.`,
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
