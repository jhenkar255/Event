"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetMe = exports.adminResetPassword = exports.adminForgotPassword = exports.adminRefreshToken = exports.adminLogout = exports.adminLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../models/User");
const AuditLog_1 = require("../models/AuditLog");
const generateAdminTokens = (admin) => {
    const jwtSecret = process.env.JWT_SECRET || 'utsavmitra_super_secret_jwt_key_2026_auspicious';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'utsavmitra_refresh_secret_key_2026_auspicious';
    const token = jsonwebtoken_1.default.sign({ id: admin._id, email: admin.email, role: 'ADMIN', name: admin.name }, jwtSecret, { expiresIn: '7d' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: admin._id }, refreshSecret, { expiresIn: '30d' });
    return { token, refreshToken };
};
// ==========================================
// 1. DEDICATED ADMIN LOGIN
// ==========================================
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const identifier = (email || '').toLowerCase().trim();
        const rawPassword = (password || '').trim();
        if (!identifier) {
            res.status(400).json({ success: false, message: 'Please enter your email.' });
            return;
        }
        if (!rawPassword) {
            res.status(400).json({ success: false, message: 'Please enter your password.' });
            return;
        }
        // Find admin user in database
        const admin = await User_1.User.findOne({
            $or: [
                { email: identifier },
                ...(identifier === 'admin' ? [{ role: 'ADMIN' }, { email: 'jhenkar1234@gmail.com' }] : []),
            ],
        }).select('+password');
        if (!admin) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }
        // Check account lockout
        if (admin.isLocked()) {
            const waitMins = Math.ceil((admin.lockUntil.getTime() - Date.now()) / (60 * 1000));
            res.status(429).json({
                success: false,
                message: `Too many unsuccessful attempts. Please try again in ${waitMins} minute(s).`,
            });
            return;
        }
        // Check account disabled
        if (admin.status === 'SUSPENDED') {
            res.status(403).json({
                success: false,
                message: 'Your account has been disabled. Please contact support.',
            });
            return;
        }
        // Security Rule: User MUST have database role === 'ADMIN'
        if (admin.role !== 'ADMIN') {
            await admin.incLoginAttempts();
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }
        const isMatch = await admin.comparePassword(rawPassword);
        if (!isMatch) {
            await admin.incLoginAttempts();
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }
        // Reset lockout counter on successful authentication
        await admin.resetLockout();
        const { token, refreshToken } = generateAdminTokens(admin);
        // Record Administrator Login in Audit Log
        await AuditLog_1.AuditLog.create({
            adminId: admin._id,
            adminEmail: admin.email,
            action: 'ADMIN_LOGIN',
            targetType: 'AUTH',
            targetId: admin._id.toString(),
            details: {
                message: 'Administrator signed into Admin Control Center',
                loginTime: new Date().toISOString(),
            },
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'Admin Portal Web App',
            timestamp: new Date(),
        });
        res.json({
            success: true,
            message: 'Admin authentication successful. Welcome to Admin Control Center.',
            token,
            refreshToken,
            user: {
                _id: admin._id,
                name: admin.name,
                fullName: admin.fullName,
                email: admin.email,
                phone: admin.phone,
                role: admin.role,
                status: admin.status,
                profilePhoto: admin.profilePhoto,
                city: admin.city,
                state: admin.state,
                lastLoginAt: admin.lastLoginAt,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.adminLogin = adminLogin;
// ==========================================
// 2. ADMIN LOGOUT
// ==========================================
const adminLogout = async (req, res) => {
    try {
        if (req.user) {
            await AuditLog_1.AuditLog.create({
                adminId: req.user.id,
                adminEmail: req.user.email,
                action: 'ADMIN_LOGOUT',
                targetType: 'AUTH',
                targetId: req.user.id,
                details: { message: 'Administrator signed out' },
                ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
                userAgent: req.headers['user-agent'] || 'Admin Portal Web App',
                timestamp: new Date(),
            });
        }
        res.json({ success: true, message: 'Administrator logged out successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.adminLogout = adminLogout;
// ==========================================
// 3. ADMIN REFRESH TOKEN
// ==========================================
const adminRefreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ success: false, message: 'Refresh token is required.' });
            return;
        }
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'utsavmitra_refresh_secret_key_2026_auspicious';
        const decoded = jsonwebtoken_1.default.verify(refreshToken, refreshSecret);
        const admin = await User_1.User.findById(decoded.id);
        if (!admin || admin.role !== 'ADMIN' || admin.status === 'SUSPENDED') {
            res.status(401).json({ success: false, message: 'Admin session is invalid or expired.' });
            return;
        }
        const tokens = generateAdminTokens(admin);
        res.json({ success: true, ...tokens });
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid or expired admin refresh token.' });
    }
};
exports.adminRefreshToken = adminRefreshToken;
// ==========================================
// 4. ADMIN FORGOT PASSWORD
// ==========================================
const adminForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const sanitizedEmail = (email || '').toLowerCase().trim();
        const admin = await User_1.User.findOne({ email: sanitizedEmail, role: 'ADMIN' });
        if (admin) {
            const resetToken = crypto_1.default.randomBytes(32).toString('hex');
            admin.resetPasswordToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
            admin.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
            await admin.save();
            res.json({
                success: true,
                message: 'If an authorized administrator account exists, a recovery link has been generated.',
                resetToken, // Provided in development for automated verification
            });
            return;
        }
        res.json({
            success: true,
            message: 'If an authorized administrator account exists, a recovery link has been generated.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.adminForgotPassword = adminForgotPassword;
// ==========================================
// 5. ADMIN RESET PASSWORD
// ==========================================
const adminResetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({ success: false, message: 'Token and new password are required.' });
            return;
        }
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const admin = await User_1.User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
            role: 'ADMIN',
        }).select('+password');
        if (!admin) {
            res.status(400).json({
                success: false,
                message: 'Admin recovery token is invalid or has expired.',
            });
            return;
        }
        admin.password = newPassword;
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        admin.failedLoginAttempts = 0;
        admin.lockUntil = undefined;
        await admin.save();
        await AuditLog_1.AuditLog.create({
            adminId: admin._id,
            adminEmail: admin.email,
            action: 'ADMIN_PASSWORD_RESET',
            targetType: 'AUTH',
            targetId: admin._id.toString(),
            details: { message: 'Administrator password reset completed successfully' },
            ipAddress: req.ip || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'Admin Portal Web App',
            timestamp: new Date(),
        });
        res.json({
            success: true,
            message: 'Administrator password updated successfully. Please log into the Admin Control Center.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.adminResetPassword = adminResetPassword;
// ==========================================
// 6. GET CURRENT ADMIN PROFILE
// ==========================================
const adminGetMe = async (req, res) => {
    try {
        const admin = await User_1.User.findById(req.user?.id);
        if (!admin || admin.role !== 'ADMIN') {
            res.status(404).json({ success: false, message: 'Administrator account not found.' });
            return;
        }
        res.json({ success: true, user: admin });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.adminGetMe = adminGetMe;
