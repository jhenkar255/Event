import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../../shared/types';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    status?: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'utsavmitra_super_secret_jwt_key_2026_auspicious';
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: UserRole; name: string };

    const user = await User.findById(decoded.id).select('-password');
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
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, message: 'Session expired. Please log in again.', code: 'TOKEN_EXPIRED' });
      return;
    }
    res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
};

export const authenticateUser = authenticateToken;

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return next();
    }

    const secret = process.env.JWT_SECRET || 'utsavmitra_super_secret_jwt_key_2026_auspicious';
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: UserRole; name: string };
    const user = await User.findById(decoded.id).select('-password');
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
  } catch {
    next();
  }
};

export const requireUser = (req: AuthRequest, res: Response, next: NextFunction): void => {
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

export const requireOrganizer = (req: AuthRequest, res: Response, next: NextFunction): void => {
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

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
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

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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

export const requireEventStaff = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      const { Event } = await import('../models/Event');
      const event = await Event.findById(eventId);
      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }

      // Check if organizer created the event or is assigned
      const isOwner =
        event.createdBy?.toString() === req.user.id ||
        (event as any).userId?.toString() === req.user.id ||
        (event as any).organizerId?.toString() === req.user.id ||
        (event as any).assignedStaff?.includes(req.user.id);

      if (!isOwner) {
        res.status(403).json({
          success: false,
          message: 'Access Denied: You are not authorized to manage gate check-ins for this celebration.',
        });
        return;
      }
    } catch (e: any) {
      res.status(500).json({ success: false, message: 'Authorization check failed.' });
      return;
    }
  }

  next();
};

