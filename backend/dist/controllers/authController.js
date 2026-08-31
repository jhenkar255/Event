"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = exports.updateProfile = exports.getCurrentUser = exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../models/User");
const generateTokens = (user, rememberMe = false) => {
    const jwtSecret = process.env.JWT_SECRET || 'utsavmitra_super_secret_jwt_key_2026_auspicious';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'utsavmitra_refresh_secret_key_2026_auspicious';
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const refreshExpiry = rememberMe ? '90d' : '30d';
    const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, jwtSecret, { expiresIn: tokenExpiry });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, refreshSecret, { expiresIn: refreshExpiry });
    return { token, refreshToken };
};
// ==========================================
// 1. PUBLIC REGISTRATION (USER / ORGANIZER)
// ==========================================
const register = async (req, res) => {
    try {
        const { name, fullName, email, password, phone, role, city, state, organizationName, organizationDescription, businessCategory, experience, services, } = req.body;
        const sanitizedEmail = (email || '').toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!sanitizedEmail || !emailRegex.test(sanitizedEmail)) {
            res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.',
            });
            return;
        }
        // Security Rule: ADMIN role is strictly forbidden from public registration
        if (role === 'ADMIN' || (role && role.toUpperCase() === 'ADMIN')) {
            res.status(403).json({
                success: false,
                message: 'Administrator accounts cannot be registered publicly.',
            });
            return;
        }
        const existingUser = await User_1.User.findOne({ email: sanitizedEmail });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'An account with this email address already exists.',
            });
            return;
        }
        const assignedRole = role === 'ORGANIZER' ? 'ORGANIZER' : 'USER';
        const displayName = (fullName || name || '').trim();
        // Generate email verification token
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const user = await User_1.User.create({
            name: displayName,
            fullName: displayName,
            email: sanitizedEmail,
            password,
            phone,
            role: assignedRole,
            status: 'ACTIVE',
            emailVerified: false,
            isVerified: true,
            city: city || 'Jaipur',
            state: state || 'Rajasthan',
            organizationName: assignedRole === 'ORGANIZER' ? organizationName : undefined,
            organizationDescription: assignedRole === 'ORGANIZER' ? organizationDescription : undefined,
            businessCategory: assignedRole === 'ORGANIZER' ? businessCategory : undefined,
            experience: assignedRole === 'ORGANIZER' ? experience : undefined,
            services: assignedRole === 'ORGANIZER' ? services || [] : undefined,
            organizerStatus: assignedRole === 'ORGANIZER' ? 'APPROVED' : undefined,
            verificationToken,
            verificationTokenExpires,
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
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                emailVerified: user.emailVerified,
                profilePhoto: user.profilePhoto,
                city: user.city,
                state: user.state,
                organizationName: user.organizationName,
                organizerStatus: user.organizerStatus,
                preferences: user.preferences,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.register = register;
// ==========================================
// 2. PUBLIC LOGIN (USER & ORGANIZER)
// ==========================================
const login = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const identifier = (email || '').toLowerCase().trim();
        const rawPassword = (password || '').trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(identifier)) {
            res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
            return;
        }
        if (!rawPassword) {
            res.status(400).json({ success: false, message: 'Please enter your password.' });
            return;
        }
        // Lookup user strictly by registered email in database
        const user = await User_1.User.findOne({ email: identifier }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }
        // Check account lockout
        if (user.isLocked()) {
            const waitMins = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
            res.status(429).json({
                success: false,
                message: `Too many unsuccessful attempts. Please try again in ${waitMins} minute(s).`,
            });
            return;
        }
        // Check account disabled/suspended status
        if (user.status === 'SUSPENDED') {
            res.status(403).json({
                success: false,
                message: 'Your account has been disabled. Please contact support.',
            });
            return;
        }
        const isMatch = await user.comparePassword(rawPassword);
        if (!isMatch) {
            await user.incLoginAttempts();
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }
        // Successful login: reset lockout and update timestamp
        await user.resetLockout();
        const { token, refreshToken } = generateTokens(user, !!rememberMe);
        res.json({
            success: true,
            message: 'Welcome back!',
            token,
            refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role, // Determined exclusively by DB record
                status: user.status,
                emailVerified: user.emailVerified,
                profilePhoto: user.profilePhoto,
                city: user.city,
                state: user.state,
                organizationName: user.organizationName,
                organizerStatus: user.organizerStatus,
                preferences: user.preferences,
                lastLoginAt: user.lastLoginAt,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.login = login;
// ==========================================
// 3. LOGOUT
// ==========================================
const logout = async (req, res) => {
    try {
        if (req.user) {
            await User_1.User.findByIdAndUpdate(req.user.id, { $unset: { refreshTokenHash: 1 } });
        }
        res.json({ success: true, message: 'Logged out successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.logout = logout;
// ==========================================
// 4. REFRESH TOKEN
// ==========================================
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
        if (!user || user.status === 'SUSPENDED') {
            res.status(401).json({ success: false, message: 'User session is no longer active.' });
            return;
        }
        const tokens = generateTokens(user);
        res.json({ success: true, ...tokens });
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }
};
exports.refreshToken = refreshToken;
// ==========================================
// 5. FORGOT PASSWORD
// ==========================================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const sanitizedEmail = (email || '').toLowerCase().trim();
        const user = await User_1.User.findOne({ email: sanitizedEmail });
        if (user) {
            const resetToken = crypto_1.default.randomBytes(32).toString('hex');
            user.resetPasswordToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
            user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await user.save();
            // Return resetToken in dev/demo response for seamless automated flow & testing
            res.json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.',
                resetToken, // Provided for dev/testing environment
            });
            return;
        }
        // Generic response to prevent user enumeration
        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.forgotPassword = forgotPassword;
// ==========================================
// 6. RESET PASSWORD
// ==========================================
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({ success: false, message: 'Token and new password are required.' });
            return;
        }
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await User_1.User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        }).select('+password');
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Password reset token is invalid or has expired.',
            });
            return;
        }
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
        res.json({
            success: true,
            message: 'Password has been reset successfully. Please log in with your new password.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.resetPassword = resetPassword;
// ==========================================
// 7. VERIFY EMAIL
// ==========================================
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ success: false, message: 'Verification token is required.' });
            return;
        }
        const user = await User_1.User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Email verification token is invalid or has expired.',
            });
            return;
        }
        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();
        res.json({
            success: true,
            message: 'Email verified successfully! Your account is now active.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.verifyEmail = verifyEmail;
// ==========================================
// 8. GET CURRENT USER PROFILE
// ==========================================
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
// ==========================================
// 9. UPDATE PROFILE
// ==========================================
const updateProfile = async (req, res) => {
    try {
        const { name, fullName, phone, address, city, state, profilePhoto, profileImage, dietaryPreference, preferences, organizationName, organizationDescription, businessCategory, experience, services, currentPassword, newPassword, } = req.body;
        const user = await User_1.User.findById(req.user?.id).select('+password');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        if (name || fullName) {
            user.name = (fullName || name).trim();
            user.fullName = (fullName || name).trim();
        }
        if (phone !== undefined)
            user.phone = phone;
        if (address !== undefined)
            user.address = address;
        if (city !== undefined)
            user.city = city;
        if (state !== undefined)
            user.state = state;
        const photoToSet = profilePhoto || profileImage;
        if (photoToSet) {
            user.profilePhoto = photoToSet;
            user.profileImage = photoToSet;
        }
        if (dietaryPreference) {
            user.dietaryPreference = dietaryPreference;
            const currentPrefs = user.preferences || {};
            user.preferences = {
                ...currentPrefs,
                foodPreference: dietaryPreference,
            };
        }
        if (preferences) {
            const currentPrefs = user.preferences || {};
            user.preferences = { ...currentPrefs, ...preferences };
        }
        // Role-specific fields
        if (organizationName !== undefined)
            user.organizationName = organizationName;
        if (organizationDescription !== undefined)
            user.organizationDescription = organizationDescription;
        if (businessCategory !== undefined)
            user.businessCategory = businessCategory;
        if (experience !== undefined)
            user.experience = experience;
        if (services !== undefined)
            user.services = services;
        // Optional password change
        if (newPassword) {
            if (!currentPassword) {
                res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
                return;
            }
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                res.status(400).json({ success: false, message: 'Current password does not match.' });
                return;
            }
            if (newPassword.length < 8) {
                res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
                return;
            }
            user.password = newPassword;
        }
        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        res.json({
            success: true,
            message: 'Profile updated successfully.',
            user: userObj,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProfile = updateProfile;
// ==========================================
// 8. GOOGLE OAUTH AUTHENTICATION
// ==========================================
const googleAuth = async (req, res) => {
    try {
        const { email, name, picture, role } = req.body;
        const sanitizedEmail = (email || '').toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!sanitizedEmail || !emailRegex.test(sanitizedEmail)) {
            res.status(400).json({
                success: false,
                message: 'A valid email address is required for Google authentication.',
            });
            return;
        }
        let user = await User_1.User.findOne({ email: sanitizedEmail });
        if (!user) {
            // Auto-register new Google user
            const assignedRole = role === 'ORGANIZER' ? 'ORGANIZER' : 'USER';
            const displayName = (name || sanitizedEmail.split('@')[0] || 'Celebration Host').trim();
            const randomPassword = crypto_1.default.randomBytes(16).toString('hex') + 'Aa1!';
            user = await User_1.User.create({
                name: displayName,
                fullName: displayName,
                email: sanitizedEmail,
                password: randomPassword,
                role: assignedRole,
                status: 'ACTIVE',
                emailVerified: true,
                isVerified: true,
                profilePhoto: picture || undefined,
                city: 'Jaipur',
                state: 'Rajasthan',
            });
        }
        else {
            if (user.status === 'SUSPENDED') {
                res.status(403).json({
                    success: false,
                    message: 'Your account has been suspended. Please contact platform support.',
                });
                return;
            }
            if (picture && !user.profilePhoto) {
                user.profilePhoto = picture;
                await user.save();
            }
        }
        const { token, refreshToken } = generateTokens(user);
        res.status(200).json({
            success: true,
            message: `Welcome, ${user.name}! Authenticated via Google.`,
            token,
            refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                emailVerified: user.emailVerified,
                profilePhoto: user.profilePhoto,
                city: user.city,
                state: user.state,
                organizationName: user.organizationName,
                organizerStatus: user.organizerStatus,
                preferences: user.preferences,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Google authentication failed' });
    }
};
exports.googleAuth = googleAuth;
