"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.updateProfile = exports.getCurrentUser = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const generateTokens = (user) => {
    const jwtSecret = process.env.JWT_SECRET || 'utsavmitra_super_secret_jwt_key_2026_auspicious';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'utsavmitra_refresh_secret_key_2026_auspicious';
    const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, jwtSecret, { expiresIn: '7d' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, refreshSecret, { expiresIn: '30d' });
    return { token, refreshToken };
};
const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, city, state } = req.body;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
            return;
        }
        const user = await User_1.User.create({
            name,
            email: email.toLowerCase().trim(),
            password,
            phone,
            role: role || 'USER',
            city: city || 'Jaipur',
            state: state || 'Rajasthan',
        });
        const { token, refreshToken } = generateTokens(user);
        res.status(201).json({
            success: true,
            message: 'Account created successfully! Welcome to UtsavMitra.',
            token,
            refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profilePhoto: user.profilePhoto,
                city: user.city,
                state: user.state,
                preferences: user.preferences,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email address or password.' });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid email address or password.' });
            return;
        }
        const { token, refreshToken } = generateTokens(user);
        res.json({
            success: true,
            message: 'Welcome back to UtsavMitra!',
            token,
            refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profilePhoto: user.profilePhoto,
                city: user.city,
                state: user.state,
                preferences: user.preferences,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.login = login;
const getCurrentUser = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        res.json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCurrentUser = getCurrentUser;
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, city, state, profilePhoto, preferences } = req.body;
        const user = await User_1.User.findByIdAndUpdate(req.user?.id, { name, phone, address, city, state, profilePhoto, preferences }, { new: true });
        res.json({ success: true, message: 'Profile updated successfully.', user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProfile = updateProfile;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ success: false, message: 'Refresh token is required.' });
            return;
        }
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'utsavmitra_refresh_secret_key_2026_auspicious';
        const decoded = jsonwebtoken_1.default.verify(refreshToken, refreshSecret);
        const user = await User_1.User.findById(decoded.id);
        if (!user) {
            res.status(401).json({ success: false, message: 'User no longer exists.' });
            return;
        }
        const tokens = generateTokens(user);
        res.json({ success: true, ...tokens });
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }
};
exports.refreshToken = refreshToken;
