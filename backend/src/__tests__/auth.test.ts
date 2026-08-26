import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/utsavmitra';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }

  // Ensure fresh test users for authentication tests
  await User.deleteMany({ email: /.*@testauth\.utsav/ });

  // Ensure base Admin user exists
  const admin = await User.findOne({ email: 'jhenkar1234@gmail.com' });
  if (!admin) {
    await User.create({
      name: 'Platform Administrator',
      fullName: 'Platform Administrator',
      email: 'jhenkar1234@gmail.com',
      password: 'Jhenkar@12345',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    });
  }
});

afterAll(async () => {
  await User.deleteMany({ email: /.*@testauth\.utsav/ });
  await mongoose.connection.close();
});

describe('UTSAVMITRA RBAC & Authentication Architecture Test Suite (20 Test Cases)', () => {
  let userToken: string;
  let organizerToken: string;
  let adminToken: string;
  let resetTokenForUser: string;

  const testUserEmail = `client_${Date.now()}@testauth.utsav`;
  const testOrganizerEmail = `organizer_${Date.now()}@testauth.utsav`;
  const lockoutUserEmail = `lockout_${Date.now()}@testauth.utsav`;

  // 1. User registration success (USER role)
  test('1. User registration succeeds with USER role', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Aarav Sharma',
      email: testUserEmail,
      password: 'Password@123',
      phone: '+91 98765 11111',
      role: 'USER',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('USER');
    userToken = res.body.token;
  });

  // 2. Organizer registration success (ORGANIZER role)
  test('2. Organizer registration succeeds with ORGANIZER role and business details', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Rohan Mehra',
      email: testOrganizerEmail,
      password: 'Password@123',
      phone: '+91 98765 22222',
      role: 'ORGANIZER',
      organizationName: 'Shubh Vivah Planners',
      businessCategory: 'Full Planning',
      experience: '5-10 Years',
      city: 'Jaipur',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('ORGANIZER');
    expect(res.body.user.organizationName).toBe('Shubh Vivah Planners');
    organizerToken = res.body.token;
  });

  // 3. Registration fails with duplicate email
  test('3. Registration fails with duplicate email address', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Duplicate Aarav',
      email: testUserEmail,
      password: 'Password@123',
      role: 'USER',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  // 4. Registration fails when role is ADMIN
  test('4. Registration rejects public attempts to assign ADMIN role', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Fake Admin',
      email: `fakeadmin_${Date.now()}@testauth.utsav`,
      password: 'Password@123',
      role: 'ADMIN',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 5. Registration fails with weak password (<8 chars or missing complexity)
  test('5. Registration fails with weak password (<8 chars or missing uppercase/number)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Weak Password User',
      email: `weak_${Date.now()}@testauth.utsav`,
      password: 'simple',
      role: 'USER',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Password must be at least 8 characters');
  });

  // 6. Login success for USER
  test('6. Login succeeds for USER and returns valid JWT and role USER', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUserEmail,
      password: 'Password@123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('USER');
  });

  // 7. Login success for ORGANIZER
  test('7. Login succeeds for ORGANIZER and returns valid JWT and role ORGANIZER', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testOrganizerEmail,
      password: 'Password@123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('ORGANIZER');
  });

  // 8. Login fails with incorrect password
  test('8. Login fails with incorrect password and returns generic error', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUserEmail,
      password: 'WrongPassword@123',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });

  // 9. Login fails with non-existent email
  test('9. Login fails with non-existent email and returns generic error', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@testauth.utsav',
      password: 'Password@123',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });

  // 10. Account locked after 5 consecutive failed login attempts
  test('10. Account locks after 5 consecutive failed login attempts', async () => {
    // Create dedicated lockout test account
    await request(app).post('/api/auth/register').send({
      fullName: 'Lockout Test User',
      email: lockoutUserEmail,
      password: 'Password@123',
      role: 'USER',
    });

    // Fire 5 wrong password attempts
    for (let i = 0; i < 4; i++) {
      await request(app).post('/api/auth/login').send({
        email: lockoutUserEmail,
        password: 'BadPassword@999',
      });
    }

    // 5th attempt locks the account
    const fifthRes = await request(app).post('/api/auth/login').send({
      email: lockoutUserEmail,
      password: 'BadPassword@999',
    });

    expect(fifthRes.status).toBe(401);

    const userDoc = await User.findOne({ email: lockoutUserEmail });
    expect(userDoc?.isLocked()).toBe(true);
    expect(userDoc?.failedLoginAttempts).toBeGreaterThanOrEqual(5);
  });

  // 11. Locked account rejects valid credentials until lockout duration expires
  test('11. Locked account rejects even valid credentials with HTTP 429', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: lockoutUserEmail,
      password: 'Password@123', // Correct password
    });

    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Too many unsuccessful attempts');
  });

  // 12. Admin login success at /api/admin/auth/login
  test('12. Admin login succeeds at /api/admin/auth/login with admin credentials', async () => {
    const res = await request(app).post('/api/admin/auth/login').send({
      email: 'jhenkar1234@gmail.com',
      password: 'Jhenkar@12345',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('ADMIN');
    adminToken = res.body.token;

    // Verify audit log entry was created
    const log = await AuditLog.findOne({ action: 'ADMIN_LOGIN', adminEmail: 'jhenkar1234@gmail.com' });
    expect(log).toBeDefined();
  });

  // 13. Admin login fails with non-admin credentials at /api/admin/auth/login
  test('13. Admin login fails at /api/admin/auth/login when user is not ADMIN', async () => {
    const res = await request(app).post('/api/admin/auth/login').send({
      email: testUserEmail,
      password: 'Password@123',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });

  // 14. Non-admin accessing admin endpoint returns 403 Forbidden
  test('14. Non-admin accessing protected /api/admin/dashboard returns 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("You don't have permission to access this page.");
  });

  // 15. Non-admin accessing audit logs returns 403 Forbidden
  test('15. Non-admin accessing /api/admin/audit-logs returns 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${organizerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 16. Unauthenticated request to protected route returns 401 Unauthorized
  test('16. Unauthenticated request to /api/auth/me returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 17. Forgot password sends reset token for valid email
  test('17. Forgot password generates reset token for valid registered email', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: testUserEmail,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.resetToken).toBeDefined();
    resetTokenForUser = res.body.resetToken;
  });

  // 18. Forgot password returns generic message for non-existent email (no enumeration)
  test('18. Forgot password returns generic response for non-existent email', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'nobody_exists@testauth.utsav',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('If an account with that email exists');
    expect(res.body.resetToken).toBeUndefined();
  });

  // 19. Reset password succeeds with valid token and strong password
  test('19. Reset password succeeds with valid token and new password', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: resetTokenForUser,
      newPassword: 'BrandNewPassword@2026',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Password has been reset successfully');

    // Verify login with new password
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testUserEmail,
      password: 'BrandNewPassword@2026',
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });

  // 20. Reset password fails with invalid or expired token
  test('20. Reset password fails with invalid or expired token', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'invalid_fake_token_12345',
      newPassword: 'BrandNewPassword@2026',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('invalid or has expired');
  });
});
