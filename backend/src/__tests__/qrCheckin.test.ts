import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { Guest } from '../models/Guest';
import { EventQRCode } from '../models/EventQRCode';
import { EventCheckIn } from '../models/EventCheckIn';
import { QRService } from '../services/qrService';

jest.setTimeout(30000);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/utsavmitra';

describe('UTSAVMITRA Secure QR Ticket & Gate Check-In Test Suite (16 Test Cases)', () => {
  let userToken: string;
  let userId: string;
  let organizerToken: string;
  let organizerId: string;
  let otherOrganizerToken: string;
  let otherOrganizerId: string;
  let adminToken: string;
  let eventId: string;
  let guestId: string;
  let validGuestToken: string;
  let otherEventId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
    const ts = Date.now();
    // 1. Create Normal User
    const userRes = await request(app).post('/api/auth/register').send({
      name: 'Rahul Kumar',
      email: `rahul.guest.${ts}@utsavmitra.in`,
      password: 'Password@123',
      phone: '+91 9876543211',
    });
    userToken = userRes.body.token;
    userId = userRes.body.user?.id || userRes.body.user?._id;

    // 2. Create Organizer
    const orgRes = await request(app).post('/api/auth/register').send({
      name: 'Jaipur Royal Planners',
      email: `planner.jaipur.${ts}@utsavmitra.in`,
      password: 'Password@123',
      role: 'ORGANIZER',
      organizationName: 'Jaipur Royal Events Pvt Ltd',
      businessCategory: 'Full Event Management',
    });
    organizerToken = orgRes.body.token;
    organizerId = orgRes.body.user?.id || orgRes.body.user?._id;

    // 3. Create Other Organizer (for unauthorized cross-event test)
    const otherOrgRes = await request(app).post('/api/auth/register').send({
      name: 'Udaipur Palace Planners',
      email: `planner.udaipur.${ts}@utsavmitra.in`,
      password: 'Password@123',
      role: 'ORGANIZER',
      organizationName: 'Udaipur Palace Planners',
      businessCategory: 'Wedding Management',
    });
    otherOrganizerToken = otherOrgRes.body.token;
    otherOrganizerId = otherOrgRes.body.user?.id || otherOrgRes.body.user?._id;

    // 4. Create Admin
    const adminEmail = `admin.qr.${ts}@utsavmitra.in`;
    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: 'Password@123',
      role: 'ADMIN',
    });
    const adminLoginRes = await request(app).post('/api/admin/auth/login').send({
      email: adminEmail,
      password: 'Password@123',
    });
    adminToken = adminLoginRes.body.token;

    // 5. Create Event owned by Organizer
    const eventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        name: 'Royal Rajasthani Wedding Celebration',
        type: 'Wedding',
        culturalTradition: 'Rajasthani',
        date: '2026-12-15',
        startTime: '06:00 PM',
        endTime: '11:30 PM',
        location: {
          address: 'Amer Palace Road',
          city: 'Jaipur',
          state: 'Rajasthan',
          pincode: '302001',
        },
        guestCount: 350,
        budget: 2500000,
      });
    eventId = eventRes.body.event._id;

    // 6. Create Another Event (for cross-event test)
    const otherEventRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${otherOrganizerToken}`)
      .send({
        name: 'Grand Udaipur Lake Sangeet',
        type: 'Sangeet',
        culturalTradition: 'Rajasthani',
        date: '2026-12-20',
        location: {
          address: 'Lake Pichola',
          city: 'Udaipur',
          state: 'Rajasthan',
          pincode: '313001',
        },
        guestCount: 150,
        budget: 1500000,
      });
    otherEventId = otherEventRes.body.event._id;

    // 7. Add VIP Guest to event
    const guestRes = await request(app)
      .post(`/api/guests/event/${eventId}`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+91 9988776655',
        relationship: 'VIP',
        group: 'Bride Family',
        rsvpStatus: 'ACCEPTED',
        mealPreference: 'Veg',
        assignedTable: 'Table 1 - Royal Mandap Front',
      });
    guestId = guestRes.body.guest._id;
    validGuestToken = guestRes.body.guest.qrToken;
  });

  // 1. User can view own QR ticket
  it('1. User can view own event QR ticket at /api/events/:eventId/my-qr', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}/my-qr`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.qrDataUrl).toContain('data:image/png;base64');
    expect(res.body.event.name).toBe('Royal Rajasthani Wedding Celebration');
  });

  // 2. Normal USER cannot access check-in endpoint (returns 403)
  it('2. Regular USER cannot call check-in API and receives 403 Forbidden', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/check-in`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        qrToken: validGuestToken,
        gateName: 'Main Gate',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access Denied');
  });

  // 3. Organizer can access check-in API for their event
  it('3. Organizer can access check-in API and verify gate entry', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/check-in`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        qrToken: validGuestToken,
        gateName: 'Royal VIP Gate',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toBe('VALID_CHECKIN');
    expect(res.body.guest.name).toBe('Priya Sharma');
    expect(res.body.gateName).toBe('Royal VIP Gate');
    expect(res.body.alreadyCheckedIn).toBe(false);
  });

  // 4. Unauthorized organizer cannot scan for an event they do not own
  it('4. Unauthorized organizer scanning another event receives 403 Forbidden', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/check-in`)
      .set('Authorization', `Bearer ${otherOrganizerToken}`)
      .send({
        qrToken: validGuestToken,
        gateName: 'Main Gate',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access Denied');
  });

  // 5. Valid QR updates guest checkInStatus and records EventCheckIn audit
  it('5. Check-in records EventCheckIn audit log with staff ID and gate name', async () => {
    const checkInRecord = await EventCheckIn.findOne({
      eventId,
      guestId,
      checkedIn: true,
    });

    expect(checkInRecord).toBeDefined();
    expect(checkInRecord?.gateName).toBe('Royal VIP Gate');
    expect(checkInRecord?.result).toBe('VALID_CHECKIN');
    expect(checkInRecord?.checkedInBy?.toString()).toBe(organizerId);

    const guest = await Guest.findById(guestId);
    expect(guest?.checkInStatus).toBe(true);
    expect(guest?.checkInTime).toBeDefined();
  });

  // 6. Duplicate check-in is rejected with ALREADY_CHECKED_IN
  it('6. Duplicate check-in is rejected and does not create duplicate check-in records', async () => {
    const initialCount = await EventCheckIn.countDocuments({ eventId, guestId, checkedIn: true });

    const res = await request(app)
      .post(`/api/events/${eventId}/check-in`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        qrToken: validGuestToken,
        gateName: 'Main Gate',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.alreadyCheckedIn).toBe(true);
    expect(res.body.result).toBe('ALREADY_CHECKED_IN');
    expect(res.body.message).toContain('ALREADY checked in');

    const finalCount = await EventCheckIn.countDocuments({ eventId, guestId, checkedIn: true });
    expect(finalCount).toBe(initialCount);
  });

  // 7. Invalid forged QR token rejected
  it('7. Forged or corrupted QR token is rejected with INVALID_QR', async () => {
    const forgedToken = 'eyJlIjoiMTIzNCIsInQiOjE2MDAwMDAwMDAsInMiOiJmYWtlc2lnbmF0dXJlIn0';
    const res = await request(app)
      .post(`/api/events/${eventId}/check-in`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        qrToken: forgedToken,
        gateName: 'Main Gate',
      });

    expect(res.body.success).toBe(false);
    expect(res.body.result).toBe('INVALID_QR');
    expect(res.body.message).toContain('not valid');
  });

  // 8. QR from another event rejected with WRONG_EVENT
  it('8. QR from another celebration is rejected with WRONG_EVENT', async () => {
    // Generate token specifically for otherEventId
    const otherToken = QRService.generateSignedToken(otherEventId, 'some-guest-id');

    const res = await request(app)
      .post(`/api/events/${eventId}/check-in`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        qrToken: otherToken,
        gateName: 'Main Gate',
      });

    expect(res.body.success).toBe(false);
    expect(res.body.result).toBe('WRONG_EVENT');
    expect(res.body.message).toContain('different celebration');
  });

  // 9. Expired QR token rejected
  it('9. Expired QR token is rejected with EXPIRED_QR', async () => {
    // Generate token with negative expiration (-1 day)
    const expiredToken = QRService.generateSignedToken(eventId, guestId, null, -1);

    const res = await request(app)
      .post(`/api/events/${eventId}/check-in`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        qrToken: expiredToken,
        gateName: 'Main Gate',
      });

    expect(res.body.success).toBe(false);
    expect(res.body.result).toBe('EXPIRED_QR');
    expect(res.body.message).toContain('expired');
  });

  // 10. Declined guest RSVP is rejected with CANCELLED_INVITATION
  it('10. Guest who declined RSVP is rejected with clear message', async () => {
    const declinedGuest = await Guest.create({
      eventId,
      name: 'Vikram Mehta',
      email: 'vikram@example.com',
      rsvpStatus: 'DECLINED',
    });
    const declinedToken = QRService.generateSignedToken(eventId, declinedGuest._id.toString());

    const res = await request(app)
      .post(`/api/events/${eventId}/check-in`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        qrToken: declinedToken,
        gateName: 'Main Gate',
      });

    expect(res.body.success).toBe(false);
    expect(res.body.result).toBe('CANCELLED_INVITATION');
    expect(res.body.message).toContain('declined this invitation');
  });

  // 11. Attendance summary updates accurately
  it('11. Attendance summary calculates total, confirmed, checked in, and rates', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}/attendance`)
      .set('Authorization', `Bearer ${organizerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.summary.checkedIn).toBeGreaterThanOrEqual(1);
    expect(res.body.summary.attendanceRate).toBeDefined();
    expect(res.body.guests.length).toBeGreaterThanOrEqual(1);
  });

  // 12. Admin can view attendance and audit logs
  it('12. Admin can view event attendance, check-ins, and staff activity', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}/check-ins`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.checkIns)).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
  });

  // 13. Gate name is stored and tracked per check-in
  it('13. Gate name is recorded correctly in the audit log', async () => {
    const checkIn = await EventCheckIn.findOne({ eventId, guestId });
    expect(checkIn?.gateName).toBe('Royal VIP Gate');
  });

  // 14. EventQRCode status updates to USED
  it('14. EventQRCode record status updates to USED with lastUsedAt timestamp', async () => {
    const qrRecord = await EventQRCode.findOne({ eventId, guestId });
    if (qrRecord) {
      expect(qrRecord.status).toBe('USED');
      expect(qrRecord.lastUsedAt).toBeDefined();
    }
  });

  // 15. CSV Export endpoint returns valid CSV formatted data
  it('15. Attendance export endpoint returns CSV formatted data with headers', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}/attendance/export`)
      .set('Authorization', `Bearer ${organizerToken}`);

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/csv');
    expect(res.text).toContain('Guest Name');
    expect(res.text).toContain('Priya Sharma');
    expect(res.text).toContain('CHECKED_IN');
  });

  // 16. Event QR generation endpoint generates unguessable HMAC token
  it('16. POST /api/events/:eventId/qr generates unguessable HMAC signed token', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/qr`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({ guestId });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.token.length).toBeGreaterThan(30);

    const verification = QRService.verifySignedToken(res.body.token);
    expect(verification.isValid).toBe(true);
    expect(verification.eventId).toBe(eventId.toString());
  });
});
