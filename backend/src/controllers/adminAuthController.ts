import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';

const generateAdminTokens = (admin: any) => {
  const jwtSecret = process.env.JWT_SECRET || 'utsavmitra_super_secret_jwt_key_2026_auspicious';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'utsavmitra_refresh_secret_key_2026_auspicious';

  const token = jwt.sign(
    { id: admin._id, email: admin.email, role: 'ADMIN', name: admin.name },
    jwtSecret,
    { expiresIn: '7d' }
  );

  const refreshToken = jwt.sign(
    { id: admin._id },
    refreshSecret,
    { expiresIn: '30d' }
  );

  return { token, refreshToken };
};

// ==========================================
// 1. DEDICATED ADMIN LOGIN
// ==========================================
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
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

    // Find admin user in database strictly by registered email
    const admin = await User.findOne({ email: identifier, role: 'ADMIN' }).select('+password');

    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check account lockout
    if (admin.isLocked()) {
      const waitMins = Math.ceil((admin.lockUntil!.getTime() - Date.now()) / (60 * 1000));
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
    await AuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'ADMIN_LOGIN',
      targetType: 'AUTH',
      targetId: admin._id.toString(),
      details: {
        message: 'Administrator signed into Admin Control Center',
        loginTime: new Date().toISOString(),
      },
      ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1',
      userAgent: (req.headers['user-agent'] as string) || 'Admin Portal Web App',
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. ADMIN LOGOUT
// ==========================================
export const adminLogout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await AuditLog.create({
        adminId: req.user.id,
        adminEmail: req.user.email,
        action: 'ADMIN_LOGOUT',
        targetType: 'AUTH',
        targetId: req.user.id,
        details: { message: 'Administrator signed out' },
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1',
        userAgent: (req.headers['user-agent'] as string) || 'Admin Portal Web App',
        timestamp: new Date(),
      });
    }

    res.json({ success: true, message: 'Administrator logged out successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. ADMIN REFRESH TOKEN
// ==========================================
export const adminRefreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401).json({ success: false, message: 'Refresh token is required.' });
      return;
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'utsavmitra_refresh_secret_key_2026_auspicious';
    const decoded = jwt.verify(refreshToken, refreshSecret) as { id: string };

    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== 'ADMIN' || admin.status === 'SUSPENDED') {
      res.status(401).json({ success: false, message: 'Admin session is invalid or expired.' });
      return;
    }

    const tokens = generateAdminTokens(admin);
    res.json({ success: true, ...tokens });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired admin refresh token.' });
  }
};

// ==========================================
// 4. ADMIN FORGOT PASSWORD
// ==========================================
export const adminForgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const sanitizedEmail = (email || '').toLowerCase().trim();

    const admin = await User.findOne({ email: sanitizedEmail, role: 'ADMIN' });

    if (admin) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. ADMIN RESET PASSWORD
// ==========================================
export const adminResetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ success: false, message: 'Token and new password are required.' });
      return;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const admin = await User.findOne({
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

    await AuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'ADMIN_PASSWORD_RESET',
      targetType: 'AUTH',
      targetId: admin._id.toString(),
      details: { message: 'Administrator password reset completed successfully' },
      ipAddress: req.ip || '127.0.0.1',
      userAgent: (req.headers['user-agent'] as string) || 'Admin Portal Web App',
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: 'Administrator password updated successfully. Please log into the Admin Control Center.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. GET CURRENT ADMIN PROFILE
// ==========================================
export const adminGetMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admin = await User.findById(req.user?.id);
    if (!admin || admin.role !== 'ADMIN') {
      res.status(404).json({ success: false, message: 'Administrator account not found.' });
      return;
    }
    res.json({ success: true, user: admin });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
