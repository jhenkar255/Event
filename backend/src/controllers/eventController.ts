import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Event } from '../models/Event';
import { Guest } from '../models/Guest';
import { Payment } from '../models/Payment';
import { LiveStream } from '../models/LiveStream';
import { EventSchedule } from '../models/EventSchedule';
import { EventDesign } from '../models/EventDesign';
import { SeatingLayout } from '../models/SeatingLayout';
import { Invitation } from '../models/Invitation';
import { Booking } from '../models/Booking';
import { AuthRequest } from '../middleware/auth';
import { DEFAULT_CHECKLIST_TEMPLATES } from '../shared/constants';
import { EventType } from '../shared/types';
import { SocketService } from '../services/socketService';

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: any = {};

    // Regular users see only their own events if requested, otherwise public discovery events
    if (req.query.userId) {
      filter.createdBy = req.query.userId;
    } else if (req.query.myEvents === 'true' && req.user?.id) {
      filter.createdBy = req.user.id;
    }

    if (req.query.type && req.query.type !== 'All') {
      filter.type = req.query.type;
    }
    if (req.query.category && req.query.category !== 'All') {
      filter.$or = [
        { category: req.query.category },
        { subcategory: req.query.category },
        { type: req.query.category },
      ];
    }
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }
    if (req.query.city && req.query.city !== 'All') {
      filter['location.city'] = new RegExp(req.query.city as string, 'i');
    }
    if (req.query.format && req.query.format !== 'All') {
      filter.eventFormat = req.query.format;
    }
    if (req.query.priceType === 'FREE') {
      filter.$or = [{ isFree: true }, { price: 0 }, { ticketPrice: 0 }];
    } else if (req.query.priceType === 'PAID') {
      filter.$or = [{ price: { $gt: 0 } }, { ticketPrice: { $gt: 0 } }];
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { institutionName: searchRegex },
        { organizerName: searchRegex },
        { 'location.city': searchRegex },
        { 'location.address': searchRegex },
        { category: searchRegex },
        { subcategory: searchRegex },
      ];
    }

    let events = await Event.find(filter).populate('venue').sort({ isFeatured: -1, date: 1, createdAt: -1 });

    // If database has 0 events and no restrictive user filter, return rich multi-category showcase events
    if (events.length === 0 && !req.query.myEvents) {
      const showcaseEvents = await Event.find().populate('venue').limit(20).sort({ date: 1, createdAt: -1 });
      if (showcaseEvents.length > 0) {
        events = showcaseEvents;
      } else {
        // Multi-domain showcase starter events spanning Education, Sports, Wedding, Corporate, Cultural, Religious, etc.
        events = [
          {
            _id: new mongoose.Types.ObjectId('65d000000000000000000001'),
            eventId: 'EVT-BIT-TECHFEST-2026',
            name: 'National College Tech Fest & AI Hackathon 2026',
            category: 'Education & College',
            subcategory: 'Technical Fest',
            type: 'Tech Meet & Hackathon',
            institutionName: 'Bangalore Institute of Technology',
            department: 'Information Science & Engineering',
            academicYear: '2026-2027',
            culturalTradition: 'Custom',
            date: '2026-09-18',
            startTime: '09:00 AM',
            endTime: '06:00 PM',
            location: {
              address: 'BIT Main Auditorium & Innovation Lab, VV Puram',
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560004',
              latitude: 12.9499,
              longitude: 77.5753,
            },
            guestCount: 500,
            capacity: 600,
            availableSeats: 120,
            price: 0,
            ticketPrice: 0,
            isFree: true,
            isFeatured: true,
            eventFormat: 'IN_PERSON',
            certificateProvided: true,
            status: 'CONFIRMED',
            theme: 'NextGen AI & Cloud Infrastructure',
            description: 'Grand inter-college technical fest with 24-hr Hackathon, Paper Presentation, Coding Battles, Robotics arena, and Project Expo with cash prizes worth ₹2 Lakhs.',
            organizerName: 'BIT Department of ISE',
            speakers: [
              { name: 'Dr. Ramesh Kumar', designation: 'Head of AI Research', organization: 'Google India', topic: 'Generative AI & Agentic Architectures' },
              { name: 'Priya Sharma', designation: 'VP of Engineering', organization: 'Infosys', topic: 'Building Scalable Cloud Native Systems' }
            ],
            bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
          },
          {
            _id: new mongoose.Types.ObjectId('65d000000000000000000002'),
            eventId: 'EVT-CULTURAL-MYSURU-2026',
            name: 'Mysuru Cultural Night & Heritage Music Festival 2026',
            category: 'Cultural & Entertainment',
            subcategory: 'Cultural Festival',
            type: 'Cultural Fest',
            culturalTradition: 'South Indian',
            date: '2026-09-25',
            startTime: '05:30 PM',
            endTime: '11:00 PM',
            location: {
              address: 'Mysore Palace Open Air Amphitheatre',
              city: 'Mysuru',
              state: 'Karnataka',
              pincode: '570001',
              latitude: 12.3051,
              longitude: 76.6551,
            },
            guestCount: 1500,
            capacity: 2000,
            availableSeats: 350,
            price: 500,
            ticketPrice: 500,
            isFree: false,
            isFeatured: true,
            eventFormat: 'IN_PERSON',
            status: 'CONFIRMED',
            theme: 'Carnatic Classical, Folk Fusion & Shehnai Gala',
            description: 'Mesmerizing evening of South Indian classical symphony, Yakshagana dance drama, and contemporary fusion band performances against the illuminated royal palace.',
            organizerName: 'Mysuru Heritage Arts Foundation',
            bannerImage: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
          },
          {
            _id: new mongoose.Types.ObjectId('65d000000000000000000003'),
            eventId: 'EVT-CRICKET-CUP-2026',
            name: 'Karnataka Inter-College Cricket Cup Championship',
            category: 'Sports',
            subcategory: 'Cricket Tournament',
            type: 'College Event',
            institutionName: 'Karnataka University Sports Association',
            date: '2026-10-02',
            startTime: '08:00 AM',
            endTime: '06:00 PM',
            location: {
              address: 'Chinnaswamy Stadium B-Ground',
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560001',
              latitude: 12.9788,
              longitude: 77.5996,
            },
            guestCount: 800,
            capacity: 1000,
            availableSeats: 200,
            price: 300,
            ticketPrice: 300,
            isFree: false,
            isFeatured: true,
            eventFormat: 'IN_PERSON',
            status: 'CONFIRMED',
            theme: 'T20 Knockout Tournament & Trophy Gala',
            description: '32 top collegiate teams battling for the prestigious Karnataka Championship Shield. Live commentary, food court, and celebrity cricketer felicitation.',
            organizerName: 'Bengaluru Sports Council',
            bannerImage: 'https://images.unsplash.com/photo-1531415074868-036b1c5f53ec?auto=format&fit=crop&w=1200&q=80',
          },
          {
            _id: new mongoose.Types.ObjectId('65d000000000000000000004'),
            eventId: 'EVT-VIRTUAL-HACK-2026',
            name: 'Global AI & Web3 Virtual Hackathon 2026',
            category: 'Online & Hybrid',
            subcategory: 'Virtual Hackathon',
            type: 'Tech Meet & Hackathon',
            date: '2026-10-12',
            startTime: '10:00 AM',
            endTime: '10:00 PM',
            location: {
              address: 'Virtual Live Stream & Discord Metaverse Arena',
              city: 'Online',
              state: 'Global',
              pincode: '000000',
              latitude: 12.9716,
              longitude: 77.5946,
            },
            guestCount: 2500,
            capacity: 5000,
            availableSeats: 1400,
            price: 0,
            ticketPrice: 0,
            isFree: true,
            isFeatured: true,
            eventFormat: 'ONLINE',
            isLive: true,
            streamUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
            meetingPlatform: 'Google Meet & YouTube Live',
            certificateProvided: true,
            status: 'ONGOING',
            theme: 'Agentic AI & Decentralized Compute',
            description: '48-hour global online hackathon with mentors from Google, Microsoft, and DeepMind. ₹5 Lakh bounty pool and direct VC incubation.',
            organizerName: 'UtsavMitra Developer Guild',
            bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
          },
          {
            _id: new mongoose.Types.ObjectId('65d000000000000000000005'),
            eventId: 'EVT-ROYAL-JAIPUR-2026',
            name: 'Royal Rajasthani Palace Wedding & Vivaah – Aarav & Ananya',
            category: 'Wedding & Family',
            subcategory: 'Wedding',
            type: 'Wedding',
            culturalTradition: 'Rajasthani',
            date: '2026-11-18',
            startTime: '10:00 AM',
            endTime: '11:00 PM',
            location: {
              address: 'Amber Heritage Palace & Royal Courtyard',
              city: 'Jaipur',
              state: 'Rajasthan',
              pincode: '302001',
              latitude: 26.9855,
              longitude: 75.8513,
            },
            guestCount: 450,
            capacity: 500,
            availableSeats: 50,
            price: 0,
            ticketPrice: 0,
            isFree: true,
            isFeatured: false,
            eventFormat: 'IN_PERSON',
            status: 'CONFIRMED',
            theme: 'Royal Rajputana Heritage & Saat Phere',
            description: 'Grand palace wedding featuring royal elephant swagat, Shehnai troupe, authentic Dal Baati banquet, and fireworks over Maota Lake.',
            organizerName: 'Royal Rajputana Events',
            bannerImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
          },
          {
            _id: new mongoose.Types.ObjectId('65d000000000000000000006'),
            eventId: 'EVT-CORP-LEADERSHIP-2026',
            name: 'India Corporate Leadership Summit & Business Expo',
            category: 'Corporate & Business',
            subcategory: 'Leadership Summit',
            type: 'Corporate Event',
            date: '2026-11-28',
            startTime: '09:00 AM',
            endTime: '06:00 PM',
            location: {
              address: 'Jio World Convention Centre, Bandra Kurla Complex',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400051',
              latitude: 19.0664,
              longitude: 72.8687,
            },
            guestCount: 650,
            capacity: 800,
            availableSeats: 150,
            price: 1500,
            ticketPrice: 1500,
            isFree: false,
            isFeatured: false,
            eventFormat: 'HYBRID',
            streamUrl: 'https://www.youtube.com/watch?v=09R8_2nJtjg',
            certificateProvided: true,
            status: 'CONFIRMED',
            theme: 'Future of Indian Enterprise & ESG Innovation',
            description: 'Premier executive gathering of CXOs, unicorn founders, and policymakers. Keynote fireside chats, networking luncheon, and corporate excellence awards.',
            organizerName: 'Bombay Chamber of Commerce',
            bannerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
          },
          {
            _id: new mongoose.Types.ObjectId('65d000000000000000000007'),
            eventId: 'EVT-GARBA-MAHOTSAV-2026',
            name: 'Maha Navratri Garba & Dandiya Raas Mahotsav',
            category: 'Religious & Traditional',
            subcategory: 'Navratri Celebration',
            type: 'Festival',
            culturalTradition: 'Gujarati',
            date: '2026-10-10',
            startTime: '07:00 PM',
            endTime: '02:00 AM',
            location: {
              address: 'GMDC Royal Lawns & Open Amphitheatre',
              city: 'Ahmedabad',
              state: 'Gujarat',
              pincode: '380052',
              latitude: 23.0365,
              longitude: 72.5448,
            },
            guestCount: 3000,
            capacity: 3500,
            availableSeats: 500,
            price: 250,
            ticketPrice: 250,
            isFree: false,
            isFeatured: false,
            eventFormat: 'IN_PERSON',
            status: 'CONFIRMED',
            theme: 'Chaniya Choli & 100-Piece Live Folk Orchestra',
            description: 'Gujarat’s premier Navratri celebration featuring 9 nights of non-stop Garba, Dhol, Aarti, and traditional culinary stalls.',
            organizerName: 'Gujarat Cultural Parishad',
            bannerImage: 'https://images.unsplash.com/photo-1603228254119-e6aefd84be25?auto=format&fit=crop&w=1200&q=80',
          },
          {
            _id: new mongoose.Types.ObjectId('65d000000000000000000008'),
            eventId: 'EVT-HEALTH-CAMP-2026',
            name: 'Community Blood Donation & Free Health Screening Camp',
            category: 'Community & Social',
            subcategory: 'Blood Donation Camp',
            type: 'Religious Event',
            date: '2026-10-20',
            startTime: '08:30 AM',
            endTime: '04:30 PM',
            location: {
              address: 'KMC Hospital Campus & Community Hall',
              city: 'Mangaluru',
              state: 'Karnataka',
              pincode: '575001',
              latitude: 12.8703,
              longitude: 74.8436,
            },
            guestCount: 400,
            capacity: 500,
            availableSeats: 100,
            price: 0,
            ticketPrice: 0,
            isFree: true,
            isFeatured: false,
            eventFormat: 'IN_PERSON',
            certificateProvided: true,
            status: 'CONFIRMED',
            theme: 'Service to Humanity & Voluntary Blood Donation',
            description: 'Joint initiative with Red Cross Society providing free cardiac screening, diabetes tests, and blood donation certificates with refreshment kits.',
            organizerName: 'Mangaluru Rotary & Red Cross Society',
            bannerImage: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80',
          },
          {
            _id: new mongoose.Types.ObjectId('65d000000000000000000009'),
            eventId: 'EVT-GOVT-YOUTH-2026',
            name: 'Karnataka State Youth Innovation & Governance Assembly',
            category: 'Government & Public',
            subcategory: 'Government Program',
            type: 'Corporate Event',
            date: '2026-11-05',
            startTime: '09:30 AM',
            endTime: '05:00 PM',
            location: {
              address: 'Vidhana Soudha Banquet Hall',
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560001',
              latitude: 12.9797,
              longitude: 77.5907,
            },
            guestCount: 700,
            capacity: 800,
            availableSeats: 100,
            price: 0,
            ticketPrice: 0,
            isFree: true,
            isFeatured: false,
            eventFormat: 'HYBRID',
            streamUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
            certificateProvided: true,
            status: 'CONFIRMED',
            theme: 'Youth Civic Leadership & Digital Karnataka',
            description: 'Official state summit for young leaders, innovators, and university delegates with minister keynotes and policy presentation rounds.',
            organizerName: 'Department of Youth Empowerment & Sports',
            bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
          },
          {
            _id: new mongoose.Types.ObjectId('65d000000000000000000010'),
            eventId: 'EVT-SCHOOL-ANNUAL-2026',
            name: 'St. Paul High School Golden Jubilee Annual Day & Cultural Gala',
            category: 'Education & College',
            subcategory: 'School Annual Day',
            type: 'College Event',
            institutionName: 'St. Paul Heritage Academy',
            date: '2026-12-19',
            startTime: '04:00 PM',
            endTime: '09:00 PM',
            location: {
              address: 'School Grand Quadrangle & Stadium Ground',
              city: 'Hubballi',
              state: 'Karnataka',
              pincode: '580020',
              latitude: 15.3647,
              longitude: 75.1240,
            },
            guestCount: 2000,
            capacity: 2200,
            availableSeats: 200,
            price: 0,
            ticketPrice: 0,
            isFree: true,
            isFeatured: false,
            eventFormat: 'IN_PERSON',
            status: 'PLANNING',
            theme: '50 Years of Academic Excellence & Cultural Glory',
            description: 'Celebration of 50 years of educational excellence with student theatrical acts, martial arts display, choir performance, and academic awards ceremony.',
            organizerName: 'St. Paul Education Trust',
            bannerImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
          }
        ] as any[];
      }
    }

    res.json({ success: true, count: events.length, events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const eventData = {
      ...req.body,
      type: req.body.type || req.body.eventType || 'Wedding',
      venue: req.body.venue || req.body.venueId || undefined,
      createdBy: req.user?.id,
    };

    // Auto-generate checklist items based on event type if not provided
    if (!eventData.checklist || eventData.checklist.length === 0) {
      const template = DEFAULT_CHECKLIST_TEMPLATES[eventData.type as EventType] || DEFAULT_CHECKLIST_TEMPLATES.Other;
      eventData.checklist = template.map((item, index) => ({
        id: `chk-${Date.now()}-${index}`,
        title: item.title,
        category: item.category,
        isCompleted: false,
      }));
    }

    const event = await Event.create(eventData);

    // Initialize accompanying records: LiveStream, Schedule, Design, Seating, Invitation
    await LiveStream.create({
      eventId: event._id,
      title: `${event.name} - Live Celebration Broadcast`,
      description: `Watch the auspicious moments of ${event.name} live in high-definition.`,
      status: 'NOT_STARTED',
    });

    await EventSchedule.create({
      eventId: event._id,
      activities: [
        { id: 'act-1', time: '10:00 AM', title: 'Traditional Guest Welcome & Tilak', description: 'Rose water reception & welcome drinks' },
        { id: 'act-2', time: '11:30 AM', title: 'Main Ceremonial Rituals / Activities', description: 'Auspicious rites with family' },
        { id: 'act-3', time: '01:30 PM', title: 'Royal Feast & Banquet Buffet', description: 'Multi-cuisine banquet' },
        { id: 'act-4', time: '04:00 PM', title: 'Celebration, Music & Photo Sessions', description: 'Family photographs and musical troupe' },
      ],
    });

    await EventDesign.create({
      eventId: event._id,
      elements: [
        { id: 'el-1', type: 'mandap', x: 450, y: 100, width: 300, height: 200, rotation: 0, color: '#C9A227', label: 'Grand Mandap' },
        { id: 'el-2', type: 'stage', x: 450, y: 350, width: 300, height: 120, rotation: 0, color: '#7A1F2B', label: 'Main Stage' },
        { id: 'el-3', type: 'entrance', x: 500, y: 650, width: 200, height: 80, rotation: 0, color: '#F4A340', label: 'Royal Arch Entrance' },
        { id: 'el-4', type: 'rangoli', x: 550, y: 550, width: 100, height: 100, rotation: 0, color: '#FFB800', label: 'Marigold Rangoli' },
      ],
      themeName: event.theme || 'Royal Cultural Elegance',
    });

    await SeatingLayout.create({
      eventId: event._id,
      layoutType: 'Round Tables',
      tables: [
        { id: 'tbl-1', name: 'Table 1 - VIP Royal', shape: 'round', x: 200, y: 250, capacity: 8, assignedGuests: [] },
        { id: 'tbl-2', name: 'Table 2 - Bride Family', shape: 'round', x: 200, y: 400, capacity: 8, assignedGuests: [] },
        { id: 'tbl-3', name: 'Table 3 - Groom Family', shape: 'round', x: 900, y: 250, capacity: 8, assignedGuests: [] },
        { id: 'tbl-4', name: 'Table 4 - Friends & Colleagues', shape: 'round', x: 900, y: 400, capacity: 8, assignedGuests: [] },
      ],
      totalSeats: 32,
      assignedSeats: 0,
    });

    const inviteData = req.body.invitation || {};
    await Invitation.create({
      eventId: event._id,
      templateId: 'royal-rajasthani',
      title: inviteData.title || event.name,
      hostNames: inviteData.hostNames || 'The Family Cordially Invites You',
      eventDate: event.date,
      eventTime: event.startTime || '10:00 AM',
      venueName: event.location.address,
      venueAddress: `${event.location.city}, ${event.location.state}`,
      customMessage: inviteData.customMessage || 'We request the honour of your auspicious presence and blessings as we celebrate this joyous milestone.',
      shlokaOrQuote: inviteData.shlokaOrQuote || 'सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके | शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते',
      themeColor: '#7A1F2B',
    });

    // Auto-create service bookings if services were selected in wizard
    const userId = req.user?.id;
    if (userId) {
      const eventDateStr = event.date || new Date().toISOString().split('T')[0];

      if (req.body.venueId || req.body.venue) {
        await Booking.create({
          eventId: event._id,
          userId,
          itemType: 'VENUE',
          itemId: String(req.body.venueId || req.body.venue),
          itemName: `${event.location.address || 'Heritage Celebration Pavilion'}`,
          amount: 450000,
          advancePaid: 100000,
          balanceDue: 350000,
          status: 'CONFIRMED',
          eventDate: eventDateStr,
          bookingNotes: `Venue reservation for ${event.name}`,
        }).catch(() => {});
      }

      if (req.body.cateringId) {
        await Booking.create({
          eventId: event._id,
          userId,
          itemType: 'CATERING',
          itemId: String(req.body.cateringId),
          itemName: 'Royal Traditional Feast & Live Counters',
          amount: Math.round((event.guestCount || 200) * 1200),
          advancePaid: 50000,
          balanceDue: Math.round((event.guestCount || 200) * 1200) - 50000,
          status: 'CONFIRMED',
          eventDate: eventDateStr,
          bookingNotes: req.body.cateringNotes || 'Catering buffet with live counters',
        }).catch(() => {});
      }

      if (req.body.decorationId) {
        await Booking.create({
          eventId: event._id,
          userId,
          itemType: 'DECORATION',
          itemId: String(req.body.decorationId),
          itemName: 'Mandap, Floral Arch & Ambient Lighting Setup',
          amount: 180000,
          advancePaid: 50000,
          balanceDue: 130000,
          status: 'CONFIRMED',
          eventDate: eventDateStr,
          bookingNotes: 'Heritage floral and mandap theme setup',
        }).catch(() => {});
      }

      if (req.body.entertainmentId) {
        await Booking.create({
          eventId: event._id,
          userId,
          itemType: 'ENTERTAINMENT',
          itemId: String(req.body.entertainmentId),
          itemName: 'Traditional Musical Troupe, Shehnai & Photography Crew',
          amount: 120000,
          advancePaid: 30000,
          balanceDue: 90000,
          status: 'CONFIRMED',
          eventDate: eventDateStr,
          bookingNotes: 'Classical artists and photographic coverage',
        }).catch(() => {});
      }
    }

    res.status(201).json({
      success: true,
      message: 'Event created and planning modules initialized successfully!',
      event,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let event: any = null;

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      event = await Event.findById(id).populate('venue').populate('createdBy', 'name email phone');
    }

    if (!event && id) {
      event = await Event.findOne({ eventId: id }).populate('venue').populate('createdBy', 'name email phone');
    }

    // Fallback: If id is 'demo' or event wasn't found, find the latest seeded / created event
    if (!event) {
      event = await Event.findOne().sort({ createdAt: -1 }).populate('venue').populate('createdBy', 'name email phone');
    }

    if (!event) {
      res.status(404).json({ success: false, message: 'Celebration event not found in database.' });
      return;
    }

    // Populate invitation if available
    const invitation = await Invitation.findOne({ eventId: event._id });
    const eventObj = event.toObject ? event.toObject() : { ...event };
    if (invitation) {
      eventObj.invitation = invitation;
    }

    // Compute live event stats
    const totalGuests = await Guest.countDocuments({ eventId: event._id });
    const acceptedRSVP = await Guest.countDocuments({ eventId: event._id, rsvpStatus: 'ACCEPTED' });
    const checkedInGuests = await Guest.countDocuments({ eventId: event._id, checkInStatus: true });
    const payments = await Payment.find({ eventId: event._id, status: 'SUCCESS' });
    const totalSpent = payments.reduce((acc, p) => acc + (p.totalAmount || p.amount || 0), 0);

    // Compute dynamic risk alerts
    const alerts: any[] = [];
    if (totalSpent > event.budget) {
      alerts.push({
        id: 'alert-budget',
        type: 'BUDGET',
        severity: 'HIGH',
        message: `Budget exceeded by ₹${(totalSpent - event.budget).toLocaleString('en-IN')}`,
        suggestedAction: 'Review optional entertainment and floral decor items.',
      });
    }
    if (acceptedRSVP > event.guestCount) {
      alerts.push({
        id: 'alert-capacity',
        type: 'CATERING',
        severity: 'MEDIUM',
        message: `Accepted RSVPs (${acceptedRSVP}) exceed target guest count (${event.guestCount}).`,
        suggestedAction: 'Increase catering plate count to avoid shortage.',
      });
    }

    res.json({
      success: true,
      event: eventObj,
      stats: {
        totalGuests,
        acceptedRSVP,
        checkedInGuests,
        totalSpent,
        remainingBudget: Math.max(0, event.budget - totalSpent),
        checklistCompleted: event.checklist?.filter((c: any) => c.isCompleted).length || 0,
        checklistTotal: event.checklist?.length || 0,
      },
      dynamicRiskAlerts: alerts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    // Check authorization
    if (req.user?.role === 'USER' && event.createdBy.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'Unauthorized to modify this event.' });
      return;
    }

    const previousStatus = event.status;
    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });

    // Emit live event status change via WebSockets if status changed
    if (req.body.status && req.body.status !== previousStatus) {
      SocketService.emitToEvent(id, 'event:status_change', {
        status: req.body.status,
        message: `Event status transitioned to ${req.body.status}`,
      });
    }

    res.json({ success: true, message: 'Event updated successfully.', event: updatedEvent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    if (req.user?.role === 'USER' && event.createdBy.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this event.' });
      return;
    }

    await Event.findByIdAndDelete(id);
    await Guest.deleteMany({ eventId: id });
    await LiveStream.deleteOne({ eventId: id });
    await EventSchedule.deleteOne({ eventId: id });
    await EventDesign.deleteOne({ eventId: id });
    await SeatingLayout.deleteOne({ eventId: id });
    await Invitation.deleteOne({ eventId: id });

    res.json({ success: true, message: 'Event and all related records deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateChecklist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { checklist } = req.body;
    const event = await Event.findByIdAndUpdate(id, { checklist }, { new: true });
    res.json({ success: true, checklist: event?.checklist });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
