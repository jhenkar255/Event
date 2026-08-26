import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { Booking } from '../models/Booking';

jest.setTimeout(30000);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/utsavmitra';

describe('UTSAVMITRA Booked Services & Vendor Contracts Test Suite', () => {
  let userToken: string;
  let userId: string;
  let organizerToken: string;
  let organizerId: string;
  let adminToken: string;
  let eventId: string;
  let bookingId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
    const ts = Date.now();

    // 1. Create Normal User
    const userEmail = `priya.host.${ts}@utsavmitra.in`;
    const userRes = await request(app).post('/api/auth/register').send({
      fullName: 'Priya Sharma',
      email: userEmail,
      password: 'Password@123',
      phone: '+91 98765 43299',
    });
    userId = userRes.body.user?._id || userRes.body.user?.id;

    const userLoginRes = await request(app).post('/api/auth/login').send({
      email: userEmail,
      password: 'Password@123',
    });
    userToken = userLoginRes.body.token;

    // 2. Create Organizer
    const orgEmail = `vedic.mandap.${ts}@utsavmitra.in`;
    const orgRes = await request(app).post('/api/auth/register').send({
      fullName: 'Vedic Mandap Crafters',
      email: orgEmail,
      password: 'Password@123',
      role: 'ORGANIZER',
      organizationName: 'Vedic Mandap Crafters LLP',
      businessCategory: 'Decoration & Stage Craft',
    });
    organizerId = orgRes.body.user?._id || orgRes.body.user?.id;

    const orgLoginRes = await request(app).post('/api/auth/login').send({
      email: orgEmail,
      password: 'Password@123',
    });
    organizerToken = orgLoginRes.body.token;

    // 3. Create Admin
    const adminUser = await User.create({
      name: 'System Executive',
      email: `admin.bookings.${ts}@utsavmitra.in`,
      password: 'Password@123',
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    const adminLoginRes = await request(app).post('/api/admin/auth/login').send({
      email: `admin.bookings.${ts}@utsavmitra.in`,
      password: 'Password@123',
    });
    adminToken = adminLoginRes.body.token;

    // 4. Create Event managed by organizer
    const evRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        name: 'Priya & Vikram Sangeet Gala',
        type: 'Sangeet',
        culturalTradition: 'HINDU_NORTH',
        date: new Date(Date.now() + 86400000 * 30).toISOString(),
        guestCount: 250,
        budget: 800000,
        location: {
          address: 'Jai Mahal Palace Grounds, Jacob Road, Civil Lines',
          city: 'Jaipur',
          state: 'Rajasthan',
        },
      });
    eventId = evRes.body.event?._id || evRes.body.event?.id;

    // 5. Create a test booking
    const booking = await Booking.create({
      bookingNumber: `BKG-DEC-${ts.toString().slice(-4)}`,
      eventId: new mongoose.Types.ObjectId(eventId),
      userId: new mongoose.Types.ObjectId(userId),
      itemType: 'DECORATION',
      itemId: 'decor-royal-mandap-01',
      itemName: 'Royal Saffron & Marigold Mandap Arch',
      amount: 150000,
      advancePaid: 75000,
      balanceDue: 75000,
      status: 'CONFIRMED',
      eventDate: '2026-11-25',
      bookingNotes: 'Fresh hand-woven marigolds, 4 gold pillars, ambient LED floodlights.',
    });
    bookingId = booking._id.toString();
  });

  afterAll(async () => {
    await Booking.deleteMany({ eventId: new mongoose.Types.ObjectId(eventId) });
    await Event.findByIdAndDelete(eventId);
    await mongoose.disconnect();
  });

  test('1. User can fetch their booked services via GET /api/bookings/my-bookings', async () => {
    const res = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(res.body.bookings.length).toBeGreaterThanOrEqual(1);
    const found = res.body.bookings.find((b: any) => b._id === bookingId || b.bookingNumber.includes('BKG-DEC'));
    expect(found).toBeDefined();
    expect(found.itemName).toBe('Royal Saffron & Marigold Mandap Arch');
    expect(found.amount).toBe(150000);
  });

  test('2. Organizer can fetch their client bookings via GET /api/bookings/organizer', async () => {
    const res = await request(app)
      .get('/api/bookings/organizer')
      .set('Authorization', `Bearer ${organizerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(res.body.bookings.length).toBeGreaterThanOrEqual(1);
  });

  test('3. Admin can fetch platform-wide bookings via GET /api/admin/bookings', async () => {
    const res = await request(app)
      .get('/api/admin/bookings')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(res.body.bookings.length).toBeGreaterThanOrEqual(1);
  });

  test('4. Non-admin accessing GET /api/admin/bookings receives 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/bookings')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('5. Organizer can update booking status via PATCH /api/bookings/:id/status', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = await Booking.findById(bookingId);
    expect(updated?.status).toBe('IN_PROGRESS');
  });

  test('6. Unauthenticated request to /api/bookings/my-bookings receives 401 Unauthorized', async () => {
    const res = await request(app).get('/api/bookings/my-bookings');
    expect(res.status).toBe(401);
  });
});
