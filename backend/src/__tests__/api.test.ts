import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { User } from '../models/User';
import { QRService } from '../services/qrService';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/utsavmitra';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
  // Ensure test users exist in database
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create({
      name: 'Aarav Sharma',
      email: 'user@utsavmitra.demo',
      password: 'Utsav@2026',
      role: 'USER',
    });
    await User.create({
      name: 'Jhenkar (Administrator)',
      email: 'jhenkar1234@gmail.com',
      password: 'Jhenkar@12345',
      role: 'ADMIN',
    });
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('UtsavMitra API Integration Test Suite', () => {
  let userToken: string;
  let adminToken: string;
  let createdEventId: string;
  let sampleGuestId: string;
  let signedQRToken: string;

  test('1. GET /api/health should return online status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.platform).toContain('UtsavMitra');
  });

  test('2. POST /api/auth/login should authenticate demo user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'user@utsavmitra.demo',
      password: 'Utsav@2026',
    });

    if (res.status !== 200) {
      console.error('Login error details:', res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    userToken = res.body.token;
  });

  test('3. POST /api/auth/login should authenticate admin user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'jhenkar1234@gmail.com',
      password: 'Jhenkar@12345',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('ADMIN');
    adminToken = res.body.token;
  });

  test('4. POST /api/events should create a new Indian celebration with auto-checklist', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'South Indian Wedding of Karthik & Deepa',
        type: 'Wedding',
        culturalTradition: 'South Indian',
        date: '2026-12-15',
        startTime: '08:30 AM',
        endTime: '09:00 PM',
        location: {
          address: 'Kanakapura Vedic Pavilion',
          city: 'Bangalore',
          state: 'Karnataka',
          latitude: 12.875,
          longitude: 77.545,
        },
        guestCount: 300,
        budget: 800000,
        theme: 'Temple Gold & Jasmine Fresh',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.event._id).toBeDefined();
    expect(res.body.event.checklist.length).toBeGreaterThan(0);
    createdEventId = res.body.event._id;
  });

  test('5. POST /api/ai/plan should generate cultural plan and budget breakdown', async () => {
    const res = await request(app)
      .post('/api/ai/plan')
      .send({
        eventType: 'Wedding',
        culturalTradition: 'South Indian',
        guestCount: 300,
        city: 'Bangalore',
        budget: 800000,
        foodPreference: 'Veg',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.plan.estimatedBudget.total).toBe(800000);
    expect(res.body.plan.foodRecommendations.highlightDishes.length).toBeGreaterThan(0);
    expect(res.body.plan.timeline.length).toBeGreaterThan(0);
  });

  test('6. POST /api/guests/event/:eventId should add a guest and generate signed QR', async () => {
    const res = await request(app)
      .post(`/api/guests/event/${createdEventId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Ramanathan Iyer',
        email: 'ramanathan@example.com',
        phone: '+91 98888 11111',
        relationship: 'Family',
        group: 'Bride Family',
        mealPreference: 'Veg',
        plusGuests: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.guest.qrToken).toBeDefined();
    sampleGuestId = res.body.guest._id;
    signedQRToken = res.body.guest.qrToken;
  });

  test('7. POST /api/qr/checkin should verify valid signed QR token and mark attendance', async () => {
    const res = await request(app)
      .post('/api/qr/checkin')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        token: signedQRToken,
        eventId: createdEventId,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.alreadyCheckedIn).toBe(false);
    expect(res.body.guest.checkInStatus).toBe(true);
  });

  test('8. POST /api/qr/checkin should detect and flag duplicate check-in', async () => {
    const res = await request(app)
      .post('/api/qr/checkin')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        token: signedQRToken,
        eventId: createdEventId,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.alreadyCheckedIn).toBe(true);
  });

  test('9. POST /api/payments/create-order and /verify should simulate Razorpay payment', async () => {
    const orderRes = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        eventId: createdEventId,
        serviceName: 'Grand Dakshin Banana Leaf Catering',
        amount: 250000,
        customerName: 'Karthik Sharma',
        customerEmail: 'karthik@example.com',
      });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.orderId).toBeDefined();

    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        razorpayOrderId: orderRes.body.orderId,
        razorpayPaymentId: 'pay_rzp_test_success_123',
        paymentRecordId: orderRes.body.paymentRecordId,
        method: 'DEMO_SIMULATION',
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.payment.status).toBe('SUCCESS');
  });

  test('10. GET /api/admin/dashboard should be protected by ADMIN role', async () => {
    // Attempt with regular user token
    const userRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);
    expect(userRes.status).toBe(403);

    // Attempt with admin token
    const adminRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.metrics.totalUsers).toBeGreaterThan(0);
  });
});
