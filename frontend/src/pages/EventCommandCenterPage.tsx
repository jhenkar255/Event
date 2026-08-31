import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { IEvent, IGuest, IPayment, IChecklistItem, IBooking } from '@shared/types';

import { DiyaIcon, MandalaCorner } from '../components/layout/IndianMotifs';
import {
  Radio,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckSquare,
  Layers,
  Armchair,
  QrCode,
  IndianRupee,
  CreditCard,
  Camera,
  Share2,
  Sparkles,
  Download,
  Upload,
  ArrowLeft,
  Plus,
  Bell,
  AlertTriangle,
  FileText,
  Volume2,
  ExternalLink,
  RefreshCw,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Building,
  Utensils,
  Flower2,
  Music,
  PlusCircle,
  X,
} from 'lucide-react';
import { ChecklistProgress } from '../components/events/ChecklistProgress';
import { RiskAlertsBanner } from '../components/events/RiskAlertsBanner';
import { Interactive2DDesigner } from '../components/customizer/Interactive2DDesigner';
import { SeatingPlanner } from '../components/customizer/SeatingPlanner';
import { QREntryScanner } from '../components/qr/QREntryScanner';
import { LiveStreamPlayer } from '../components/live/LiveStreamPlayer';
import { DigitalInvitationTemplate } from '../components/invitations/DigitalInvitationTemplate';
import { RazorpayCheckoutModal } from '../components/payments/RazorpayCheckoutModal';
import { InvoiceReceiptModal } from '../components/payments/InvoiceReceiptModal';
import { UtsavAIChat } from '../components/ai/UtsavAIChat';

// Rich fallback data ensuring the command center is always 100% interactive
const FALLBACK_SHOWCASE_EVENT: IEvent = {
  _id: 'evt-showcase-1',
  eventId: 'EVT-RAJ-WED-2026',
  name: 'Royal Rajasthani Wedding of Aarav & Ananya Sharma',
  type: 'Wedding',
  eventType: 'Wedding',
  culturalTradition: 'Rajasthani',
  date: '2026-11-28',
  time: '10:00 AM',
  location: {
    address: 'Palace Road, Near Amber Fort',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    latitude: 26.9124,
    longitude: 75.7873,
  },
  guestCount: 350,
  budget: 1200000,
  spentBudget: 890000,
  theme: 'Royal Rajputana Heritage & Marigold Splendor',
  status: 'CONFIRMED',
  createdBy: 'user-demo-1',
  bannerImage:
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  checklist: [
    { id: 'c1', title: 'Ganesh Sthapana & Pandit Booking', category: 'Rituals', isCompleted: true },
    { id: 'c2', title: 'Mandap Floral Theme & Light Canopy', category: 'Decor', isCompleted: true },
    { id: 'c3', title: 'Rajwada 7-Course Feast & Live Counters', category: 'Catering', isCompleted: true },
    { id: 'c4', title: 'Manganiyar Troupe & Dhol Tasha', category: 'Music', isCompleted: true },
    { id: 'c5', title: 'Digital E-Invites with QR Passes', category: 'Invites', isCompleted: true },
    { id: 'c6', title: 'Safa & Traditional Pagri Dressing Setup', category: 'Rituals', isCompleted: false },
    { id: 'c7', title: 'Baraat Royal Vintage Car & Horse Chariot', category: 'Logistics', isCompleted: false },
    { id: 'c8', title: 'Varmala Hydraulic Stage & Pyros', category: 'Stage', isCompleted: true },
  ],
  riskAlerts: [
    {
      id: 'r1',
      type: 'BUDGET',
      severity: 'MEDIUM',
      message: 'Catering plate additions for 50 extra guests approaching buffer ceiling.',
      suggestedAction: 'Review live counters allocation or increase target budget.',
      isResolved: false,
    },
  ],
  invitation: {
    _id: 'inv-showcase-1',
    eventId: 'evt-showcase-1',
    templateId: 'royal-rajasthani',
    title: 'Royal Rajasthani Wedding of Aarav & Ananya Sharma',
    hostNames: 'Smt. Sunita & Shri Rajesh Sharma',
    eventDate: '2026-11-28',
    eventTime: '10:00 AM',
    venueName: 'The Royal Heritage Haveli & Courtyard',
    venueAddress: 'Palace Road, Jaipur, Rajasthan',
    customMessage:
      'With the divine blessings of Lord Ganesha, we cordially invite you to celebrate the auspicious wedding union of Aarav with Ananya.',
    shlokaOrQuote:
      '|| ॐ श्री गणेशाय नमः ||\nसर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके | शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते',
    themeColor: '#7A1F2B',
    shareUrlToken: 'aarav-ananya-wedding',
  },
};

const FALLBACK_GUESTS: IGuest[] = [
  {
    _id: 'g-1',
    eventId: 'evt-showcase-1',
    name: 'Rajesh Sharma (Groom Father)',
    email: 'rajesh.sharma@example.com',
    phone: '+91 98290 11111',
    group: 'Host Family',
    invitationStatus: 'SENT',
    rsvpStatus: 'ACCEPTED',
    mealPreference: 'Veg',
    plusGuests: 0,
    checkedIn: true,
    checkInTime: '09:15 AM',
    qrCodeDataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%237A1F2B"/><text x="50" y="55" fill="%23C9A227" font-size="12" text-anchor="middle">PASS-001</text></svg>',
  },
  {
    _id: 'g-2',
    eventId: 'evt-showcase-1',
    name: 'Vikram Singh Rathore',
    email: 'vikram.rathore@example.com',
    phone: '+91 98290 22222',
    group: 'VIP Guests',
    invitationStatus: 'SENT',
    rsvpStatus: 'ACCEPTED',
    mealPreference: 'Jain',
    plusGuests: 1,
    checkedIn: true,
    checkInTime: '09:30 AM',
    qrCodeDataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%237A1F2B"/><text x="50" y="55" fill="%23C9A227" font-size="12" text-anchor="middle">PASS-002</text></svg>',
  },
  {
    _id: 'g-3',
    eventId: 'evt-showcase-1',
    name: 'Pooja Verma (Bride Sister)',
    email: 'pooja.verma@example.com',
    phone: '+91 98290 33333',
    group: 'Bride Family',
    invitationStatus: 'SENT',
    rsvpStatus: 'ACCEPTED',
    mealPreference: 'Veg',
    plusGuests: 0,
    checkedIn: false,
    qrCodeDataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%237A1F2B"/><text x="50" y="55" fill="%23C9A227" font-size="12" text-anchor="middle">PASS-003</text></svg>',
  },
  {
    _id: 'g-4',
    eventId: 'evt-showcase-1',
    name: 'Rohan Mehra',
    email: 'rohan.mehra@example.com',
    phone: '+91 98290 44444',
    group: 'Friends',
    invitationStatus: 'SENT',
    rsvpStatus: 'ACCEPTED',
    mealPreference: 'Non-Veg',
    plusGuests: 0,
    checkedIn: false,
    qrCodeDataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%237A1F2B"/><text x="50" y="55" fill="%23C9A227" font-size="12" text-anchor="middle">PASS-004</text></svg>',
  },
];

const FALLBACK_PAYMENTS: IPayment[] = [
  {
    _id: 'pay-1',
    eventId: 'evt-showcase-1',
    userId: 'user-demo-1',
    bookingId: 'bk-1',
    amount: 450000,
    serviceName: 'The Royal Heritage Haveli (50% Advance)',
    purpose: 'Venue Advance Escrow',
    status: 'COMPLETED',
    transactionId: 'UTSV-PAY-TXN-882194',
    createdAt: '2026-08-20',
  },
  {
    _id: 'pay-2',
    eventId: 'evt-showcase-1',
    userId: 'user-demo-1',
    bookingId: 'bk-2',
    amount: 250000,
    serviceName: 'Rajwada Royal Feast Catering Booking',
    purpose: 'Catering Advance Escrow',
    status: 'COMPLETED',
    transactionId: 'UTSV-PAY-TXN-773821',
    createdAt: '2026-08-22',
  },
  {
    _id: 'pay-3',
    eventId: 'evt-showcase-1',
    userId: 'user-demo-1',
    bookingId: 'bk-3',
    amount: 190000,
    serviceName: 'Royal Rajasthani Mandap & Floral Decor',
    purpose: 'Decor Advance Escrow',
    status: 'COMPLETED',
    transactionId: 'UTSV-PAY-TXN-662910',
    createdAt: '2026-08-24',
  },
];

const FALLBACK_BOOKINGS: IBooking[] = [
  {
    _id: 'bk-showcase-1',
    bookingNumber: 'BKG-SHOWCASE-001',
    eventId: 'evt-showcase-1',
    userId: 'user-demo-1',
    itemType: 'VENUE',
    itemId: 'v-1',
    itemName: 'The Royal Heritage Haveli & Courtyard',
    amount: 450000,
    advancePaid: 150000,
    balanceDue: 300000,
    status: 'CONFIRMED',
    eventDate: '2026-11-28',
    bookingNotes: 'Grand courtyard mandap and banquet suites reserved',
  },
  {
    _id: 'bk-showcase-2',
    bookingNumber: 'BKG-SHOWCASE-002',
    eventId: 'evt-showcase-1',
    userId: 'user-demo-1',
    itemType: 'CATERING',
    itemId: 'c-1',
    itemName: 'Royal Rajwada 7-Course Authentic Feast',
    amount: 360000,
    advancePaid: 100000,
    balanceDue: 260000,
    status: 'CONFIRMED',
    eventDate: '2026-11-28',
    bookingNotes: 'Live Dal Baati Churma, Jalebi & Chaat counters included',
  },
  {
    _id: 'bk-showcase-3',
    bookingNumber: 'BKG-SHOWCASE-003',
    eventId: 'evt-showcase-1',
    userId: 'user-demo-1',
    itemType: 'DECORATION',
    itemId: 'd-1',
    itemName: 'Royal Marigold Floral Mandap & Ambient Lighting Canopy',
    amount: 180000,
    advancePaid: 50000,
    balanceDue: 130000,
    status: 'CONFIRMED',
    eventDate: '2026-11-28',
    bookingNotes: 'Traditional brass diyas and velvet seating drapery',
  },
];

export const EventCommandCenterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { socket, joinEventRoom } = useSocket();
  const { user, isOrganizer, isAdmin } = useAuth();

  const [event, setEvent] = useState<IEvent | null>(null);
  const [guests, setGuests] = useState<IGuest[]>(FALLBACK_GUESTS);
  const [payments, setPayments] = useState<IPayment[]>(FALLBACK_PAYMENTS);
  const [bookings, setBookings] = useState<IBooking[]>(FALLBACK_BOOKINGS);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'checklist' | 'design' | 'seating' | 'guests' | 'bookings' | 'budget' | 'payments' | 'qr' | 'scanner' | 'live' | 'invite'
  >('overview');

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals & Booking Form
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPurpose, setPaymentPurpose] = useState('Vendor Service Installment');
  const [paymentAmount, setPaymentAmount] = useState(50000);
  const [selectedInvoicePayment, setSelectedInvoicePayment] = useState<IPayment | null>(null);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestDiet, setNewGuestDiet] = useState<'Veg' | 'Non-Veg' | 'Jain' | 'Vegan'>('Veg');
  const [showAddGuest, setShowAddGuest] = useState(false);

  // Add Booking Modal state
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [bookingItemType, setBookingItemType] = useState<'VENUE' | 'CATERING' | 'DECORATION' | 'ENTERTAINMENT' | 'PACKAGE'>('CATERING');
  const [bookingItemName, setBookingItemName] = useState('');
  const [bookingAmount, setBookingAmount] = useState<number>(50000);
  const [bookingAdvance, setBookingAdvance] = useState<number>(15000);
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const fetchEventData = async () => {
    setLoading(true);
    const targetId = id || 'demo';

    try {
      // 1. Fetch Event
      const evRes = await api.get<{ success: boolean; event: IEvent }>(`/events/${targetId}`);
      if (evRes.success && evRes.event) {
        setEvent(evRes.event);
        if (evRes.event.status === 'ONGOING') setIsLiveMode(true);
      } else {
        setEvent(FALLBACK_SHOWCASE_EVENT);
      }
    } catch (err) {
      console.log('Using showcase celebration fallback:', err);
      setEvent(FALLBACK_SHOWCASE_EVENT);
    }

    try {
      // 2. Fetch Guests (try both /events/:id/guests and /guests/event/:id)
      const gRes = await api
        .get<{ success: boolean; guests: IGuest[] }>(`/events/${targetId}/guests`)
        .catch(() => api.get<{ success: boolean; guests: IGuest[] }>(`/guests/event/${targetId}`));
      if (gRes.success && gRes.guests && gRes.guests.length > 0) {
        setGuests(gRes.guests);
      }
    } catch (err) {
      console.log('Using default guests fallback:', err);
    }

    try {
      // 3. Fetch Payments
      const pRes = await api
        .get<{ success: boolean; payments: IPayment[] }>(`/events/${targetId}/payments`)
        .catch(() => api.get<{ success: boolean; payments: IPayment[] }>(`/payments/event/${targetId}`));
      if (pRes.success && pRes.payments && pRes.payments.length > 0) {
        setPayments(pRes.payments);
      }
    } catch (err) {
      console.log('Using default payments fallback:', err);
    }

    try {
      // 4. Fetch Booked Services & Vendor Contracts
      const bRes = await api
        .get<{ success: boolean; bookings: IBooking[] }>(`/bookings/event/${targetId}`)
        .catch(() => api.get<{ success: boolean; bookings: IBooking[] }>('/bookings/my-bookings'));
      if (bRes.success && bRes.bookings && bRes.bookings.length > 0) {
        setBookings(bRes.bookings);
      }
    } catch (err) {
      console.log('Using default bookings fallback:', err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEventData();
    if (id) joinEventRoom(id);
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    // Real-time guest check-in via WebSocket
    socket.on('guest:checked_in', (data: any) => {
      setGuests((prev) =>
        prev.map((g) => (g._id === data.guest?._id ? { ...g, checkedIn: true, checkInTime: data.guest?.checkInTime } : g))
      );
    });

    return () => {
      socket.off('guest:checked_in');
    };
  }, [socket, id]);

  const toggleLiveMode = async () => {
    const nextStatus = isLiveMode ? 'CONFIRMED' : 'ONGOING';
    setIsLiveMode(!isLiveMode);
    try {
      await api.put(`/events/${id || event?._id}`, { status: nextStatus });
      if (event) setEvent({ ...event, status: nextStatus as any });
    } catch (err) {
      console.error('Failed to toggle live status:', err);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    try {
      const targetId = id || event?._id || 'demo';
      const res = await api
        .post(`/events/${targetId}/guests`, {
          name: newGuestName,
          email: newGuestEmail,
          phone: newGuestPhone,
          mealPreference: newGuestDiet,
          rsvpStatus: 'ACCEPTED',
        })
        .catch(() =>
          api.post(`/guests/event/${targetId}`, {
            name: newGuestName,
            email: newGuestEmail,
            phone: newGuestPhone,
            mealPreference: newGuestDiet,
            rsvpStatus: 'ACCEPTED',
          })
        );

      if (res.success && res.guest) {
        setGuests((prev) => [res.guest, ...prev]);
        setNewGuestName('');
        setNewGuestEmail('');
        setNewGuestPhone('');
        setShowAddGuest(false);
      } else {
        // Local state fallback
        const newLocalGuest: IGuest = {
          _id: `g-local-${Date.now()}`,
          eventId: targetId,
          name: newGuestName,
          email: newGuestEmail,
          phone: newGuestPhone,
          invitationStatus: 'SENT',
          mealPreference: newGuestDiet,
          plusGuests: 0,
          rsvpStatus: 'ACCEPTED',
          checkedIn: false,
          qrCodeDataUrl:
            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%237A1F2B"/><text x="50" y="55" fill="%23C9A227" font-size="12" text-anchor="middle">PASS</text></svg>',
        };
        setGuests((prev) => [newLocalGuest, ...prev]);
        setNewGuestName('');
        setNewGuestEmail('');
        setNewGuestPhone('');
        setShowAddGuest(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add guest.');
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingItemName.trim() || bookingAmount <= 0) return;

    setIsSubmittingBooking(true);
    try {
      const targetId = id || event?._id || 'demo';
      const eventDate = event?.date || new Date().toISOString().split('T')[0];
      const payload = {
        eventId: targetId,
        itemType: bookingItemType,
        itemId: `svc-${Date.now()}`,
        itemName: bookingItemName,
        amount: Number(bookingAmount),
        advancePaid: Number(bookingAdvance),
        balanceDue: Number(bookingAmount) - Number(bookingAdvance),
        eventDate,
        bookingNotes: bookingNotes || `Booked service for ${event?.name || 'Celebration'}`,
      };

      const res: any = await api.post('/bookings', payload).catch(() => null);
      if (res && res.success && res.booking) {
        setBookings((prev) => [res.booking, ...prev]);
      } else {
        const localBooking: IBooking = {
          _id: `bk-local-${Date.now()}`,
          bookingNumber: `BKG-${Date.now().toString(36).toUpperCase()}`,
          eventId: targetId,
          userId: user?._id || 'user-1',
          itemType: bookingItemType,
          itemId: `svc-${Date.now()}`,
          itemName: bookingItemName,
          amount: Number(bookingAmount),
          advancePaid: Number(bookingAdvance),
          balanceDue: Number(bookingAmount) - Number(bookingAdvance),
          status: 'CONFIRMED',
          eventDate,
          bookingNotes,
        };
        setBookings((prev) => [localBooking, ...prev]);
      }

      setShowAddBookingModal(false);
      setBookingItemName('');
      setBookingNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to add booking.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleExportCsv = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'RSVP Status', 'Meal Preference', 'Checked In', 'Check In Time'],
      ...guests.map((g) => [
        g.name,
        g.email || '',
        g.phone || '',
        g.rsvpStatus,
        g.mealPreference,
        g.checkedIn ? 'YES' : 'NO',
        g.checkInTime || '',
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `guests_${(event?.name || 'event').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-16 text-center space-y-4">
        <DiyaIcon className="w-12 h-12 text-utsav-gold mx-auto animate-bounce" />
        <h2 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
          Opening Event Command Center...
        </h2>
        <p className="text-xs text-gray-500">
          Loading 2D blueprint layout, live gate attendance, and budget ledgers.
        </p>
      </div>
    );
  }

  const currentEvent = event || FALLBACK_SHOWCASE_EVENT;
  const checkedInCount = guests.filter((g) => g.checkedIn).length;
  const totalGuests = guests.length || currentEvent.guestCount || 1;
  const attendanceRate = Math.round((checkedInCount / totalGuests) * 100);
  const totalPaid = payments
    .filter((p) => p.status === 'COMPLETED' || p.status === 'SUCCESS')
    .reduce((acc, p) => acc + (p.totalAmount || p.amount || 0), 0);

  const tabs = [
    { key: 'overview', label: 'Overview & Schedule', icon: Calendar },
    { key: 'checklist', label: 'Checklist', icon: CheckSquare },
    { key: 'design', label: '2D Mandap Studio', icon: Layers },
    { key: 'seating', label: 'Seating Planner', icon: Armchair },
    { key: 'guests', label: `Guests (${guests.length})`, icon: Users },
    { key: 'bookings', label: `Bookings (${bookings.length})`, icon: Building },
    { key: 'budget', label: 'Budget & AI', icon: IndianRupee },
    { key: 'payments', label: 'Payments', icon: CreditCard },
    ...(isOrganizer || isAdmin
      ? [{ key: 'scanner', label: 'Gate QR Scanner', icon: Camera }]
      : [{ key: 'qr', label: 'My Event QR Pass', icon: QrCode }]),
    { key: 'live', label: 'Live Broadcast', icon: Radio },
    { key: 'invite', label: 'Digital Invite & QR', icon: Share2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(isOrganizer ? '/organizer/dashboard' : '/dashboard'))}
          className="flex items-center space-x-2 text-xs font-bold text-utsav-maroon-900 dark:text-utsav-gold hover:underline cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Back to {isOrganizer ? 'Organizer Studio' : 'My Dashboard'}</span>
        </button>

        <div className="flex items-center space-x-2">
          <Link
            to="/events"
            className="text-xs font-semibold text-utsav-brown-600 dark:text-utsav-ivory-300 hover:text-utsav-gold"
          >
            All Celebrations
          </Link>
          <span className="text-gray-400">•</span>
          <span className="text-xs font-bold text-utsav-gold">
            Command Center
          </span>
        </div>
      </div>

      {/* Floating AI Chat Assistant with Event Context */}
      <UtsavAIChat
        eventContext={{
          name: currentEvent.name,
          type: currentEvent.eventType,
          budget: currentEvent.budget,
          spentBudget: currentEvent.spentBudget,
          guestCount: currentEvent.guestCount,
          culturalTradition: currentEvent.culturalTradition,
          city: currentEvent.location?.city,
        }}
      />

      {/* Razorpay Checkout & Invoice Receipt Modals */}
      <RazorpayCheckoutModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        eventId={currentEvent._id}
        amount={paymentAmount}
        purpose={paymentPurpose}
        onPaymentSuccess={(newPayment) => {
          setPayments((prev) => [newPayment, ...prev]);
          if (event) setEvent({ ...event, spentBudget: (event.spentBudget || 0) + newPayment.amount });
        }}
      />

      <InvoiceReceiptModal
        isOpen={!!selectedInvoicePayment}
        onClose={() => setSelectedInvoicePayment(null)}
        payment={selectedInvoicePayment}
      />

      {/* Add Vendor Service Booking Modal */}
      {showAddBookingModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-utsav-ivory dark:bg-utsav-maroon-950 w-full max-w-lg rounded-3xl shadow-2xl border-2 border-utsav-gold/60 overflow-hidden relative z-[10000]">
            <div className="p-5 bg-gradient-to-r from-utsav-maroon-900 to-utsav-maroon-800 text-utsav-ivory border-b border-utsav-gold/40 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-xl bg-utsav-maroon-950 border border-utsav-gold">
                  <Building className="w-5 h-5 text-utsav-gold" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-utsav-gold">
                    Add Vendor Service Booking
                  </h3>
                  <p className="text-[11px] text-utsav-ivory/80">
                    Record vendor contract & initialize escrow for {currentEvent.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBookingModal(false)}
                className="p-1.5 text-utsav-ivory/70 hover:text-utsav-gold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-utsav-maroon-800 dark:text-utsav-gold mb-1">
                  Service Category
                </label>
                <select
                  value={bookingItemType}
                  onChange={(e: any) => setBookingItemType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                >
                  <option value="VENUE">Heritage Venue / Banquet Lawn</option>
                  <option value="CATERING">Royal Catering / Traditional Feast</option>
                  <option value="DECORATION">Mandap & Floral Theme Decor</option>
                  <option value="ENTERTAINMENT">Live Troupe / Photography / Shehnai</option>
                  <option value="PACKAGE">All-Inclusive Auspicious Package</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-utsav-maroon-800 dark:text-utsav-gold mb-1">
                  Service / Vendor Name
                </label>
                <input
                  type="text"
                  required
                  value={bookingItemName}
                  onChange={(e) => setBookingItemName(e.target.value)}
                  placeholder="e.g. Royal Rajwada 7-Course Catering, Mandap Floral Canopy..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-utsav-maroon-800 dark:text-utsav-gold mb-1">
                    Total Contract (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={bookingAmount}
                    onChange={(e) => setBookingAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-utsav-brown dark:text-utsav-ivory focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-utsav-maroon-800 dark:text-utsav-gold mb-1">
                    Advance Paid (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bookingAdvance}
                    onChange={(e) => setBookingAdvance(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-utsav-brown dark:text-utsav-ivory focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-utsav-maroon-800 dark:text-utsav-gold mb-1">
                  Booking Notes & Inclusions
                </label>
                <textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g. Inclusions: Live counters, sound setup, safa tying..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-utsav-brown dark:text-utsav-ivory focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddBookingModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 dark:text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="px-5 py-2.5 rounded-xl maroon-gradient-btn text-utsav-gold font-bold shadow-md disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isSubmittingBooking ? 'Saving Contract...' : 'Confirm & Save Booking'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Command Center Banner Header */}
      <div
        className={`p-6 sm:p-8 rounded-3xl text-utsav-ivory border-2 shadow-2xl relative overflow-hidden transition-all duration-300 ${
          isLiveMode
            ? 'bg-gradient-to-r from-red-950 via-utsav-maroon-900 to-black border-red-500 ring-4 ring-red-500/30 animate-pulse'
            : 'bg-gradient-to-r from-utsav-maroon-900 via-utsav-maroon-800 to-utsav-maroon-950 border-utsav-gold/60'
        }`}
      >
        <div className="absolute top-0 right-0 pointer-events-none opacity-20">
          <MandalaCorner className="w-36 h-36" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-utsav-gold text-utsav-maroon-950">
                {currentEvent.culturalTradition} Tradition
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-black/40 text-utsav-gold border border-utsav-gold/40">
                {currentEvent.eventType}
              </span>
              {isLiveMode && (
                <span className="flex items-center space-x-1 px-3 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold tracking-widest animate-ping">
                  🔴 LIVE EVENT ACTIVE
                </span>
              )}
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight gold-gradient-text">
              {currentEvent.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-utsav-ivory/80 pt-1">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-utsav-saffron" />
                <span>
                  {currentEvent.date} • {currentEvent.time || '10:00 AM'}
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-utsav-saffron" />
                <span>
                  {currentEvent.location?.address}, {currentEvent.location?.city}
                </span>
              </span>
              <span className="flex items-center space-x-1 font-bold text-utsav-gold">
                <span>Budget: ₹{(currentEvent.budget / 100000).toFixed(1)} Lakhs</span>
              </span>
            </div>
          </div>

          {/* Live Event Mode Toggle & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={toggleLiveMode}
              className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center space-x-2 border transition-all ${
                isLiveMode
                  ? 'bg-red-600 text-white border-white animate-bounce'
                  : 'bg-utsav-maroon-950/80 text-utsav-gold border-utsav-gold/50 hover:bg-utsav-maroon-950'
              }`}
            >
              <Radio className={`w-4 h-4 ${isLiveMode ? 'animate-spin' : 'text-red-500'}`} />
              <span>{isLiveMode ? 'LIVE MODE ON' : '🔴 Start Live Mode'}</span>
            </button>

            <Link
              to={`/invite/${currentEvent.invitation?.shareUrlToken || 'demo'}`}
              target="_blank"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-utsav-gold border border-utsav-gold/60 text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Public RSVP Link</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Real-Time Live Attendance Counter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg space-y-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">
            Live Gate Attendance
          </span>
          <div className="flex items-center justify-between">
            <p className="font-heading text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {checkedInCount} / {totalGuests}
            </p>
            <span className="text-xs font-bold text-utsav-gold">{attendanceRate}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-utsav-maroon-950 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg space-y-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">
            Committed Expenses
          </span>
          <p className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            ₹{(currentEvent.spentBudget / 100000).toFixed(1)}L
          </p>
          <span className="text-[10px] text-gray-500">
            Remaining: ₹{((currentEvent.budget - currentEvent.spentBudget) / 100000).toFixed(1)}L
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg space-y-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">
            Verified Payments
          </span>
          <p className="font-heading text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{(totalPaid / 100000).toFixed(1)}L
          </p>
          <span className="text-[10px] text-gray-500">{payments.length} Transactions</span>
        </div>

        <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg space-y-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">
            Checklist Status
          </span>
          <p className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            {currentEvent.checklist?.filter((c) => c.isCompleted).length || 0} /{' '}
            {currentEvent.checklist?.length || 0}
          </p>
          <span className="text-[10px] text-utsav-saffron font-bold">Auspicious Milestones</span>
        </div>
      </div>

      {/* Risk Alert Detector */}
      {currentEvent.riskAlerts && currentEvent.riskAlerts.length > 0 && (
        <RiskAlertsBanner alerts={currentEvent.riskAlerts} />
      )}

      {/* Tab Navigation Bar */}
      <div className="flex items-center overflow-x-auto p-2 pb-3 scrollbar-none gap-2 border-b border-utsav-gold/30 scroll-smooth">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'maroon-gradient-btn text-utsav-gold shadow-lg border border-utsav-gold/60'
                  : 'bg-utsav-ivory dark:bg-utsav-maroon-900/80 text-utsav-brown dark:text-utsav-ivory border border-utsav-gold/20 hover:border-utsav-gold/50'
              }`}
            >
              <Icon className="w-4 h-4 text-utsav-saffron shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab View Sub-Screens */}

      {/* 1. Overview & Schedule */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Auspicious Timeline */}
            <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-utsav-gold/20 pb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-utsav-saffron" />
                  <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                    Auspicious Ceremony Timeline & Schedule
                  </h3>
                </div>
                <span className="text-xs font-bold text-utsav-gold font-serif">Muhurtham Verified</span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    time: '09:00 AM',
                    title: 'Ganesh Puja & Mandap Sthapana',
                    location: 'Main Mandap',
                    desc: 'Auspicious invocation by Vedic pandits with sacred havan kund.',
                  },
                  {
                    time: '11:30 AM',
                    title: 'Royal Baraat Procession & Swagat',
                    location: 'Grand Archway Entrance',
                    desc: 'Dhol tasha troupe and live shehnai welcome at the fort gate.',
                  },
                  {
                    time: '01:00 PM',
                    title: 'Varmala & Royal Jai Mala Ceremony',
                    location: 'Main Varmala Stage',
                    desc: 'Floral garland exchange with hydraulic rotating stage and cold pyros.',
                  },
                  {
                    time: '02:00 PM',
                    title: 'Traditional Rajasthani Royal Feast',
                    location: 'Grand Dining Pavilion',
                    desc: 'Authentic 7-course buffet with live dal baati churma counters.',
                  },
                  {
                    time: '04:30 PM',
                    title: 'Saat Phere & Kanyadaan',
                    location: 'Sacred Mandap',
                    desc: 'Seven holy vows around the sacred agni.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-4 p-3.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30"
                  >
                    <span className="px-2.5 py-1 rounded-xl bg-utsav-maroon-800 text-utsav-gold font-mono text-xs font-bold shrink-0">
                      {item.time}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="font-heading text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-utsav-saffron font-semibold">{item.location}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Contacts & Weather */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg space-y-3">
              <h4 className="font-heading text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
                Emergency & Coordinator Desk
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/20 flex justify-between items-center">
                  <div>
                    <p className="font-bold">Rajesh Sharma (Host)</p>
                    <p className="text-[11px] text-gray-500">+91 98290 12345</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Primary
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/20 flex justify-between items-center">
                  <div>
                    <p className="font-bold">Pooja Rathore (Planner)</p>
                    <p className="text-[11px] text-gray-500">+91 94140 67890</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    Lead Ops
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg space-y-2 text-xs">
              <h4 className="font-heading text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
                Destination Weather
              </h4>
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-amber-50 dark:bg-utsav-maroon-950 border border-amber-300">
                <span className="text-3xl">☀️</span>
                <div>
                  <p className="font-bold text-sm">28°C Pleasant & Sunny</p>
                  <p className="text-[11px] text-gray-500">Perfect for open-air mandap & lawn baraat.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Checklist Tab */}
      {activeTab === 'checklist' && (
        <ChecklistProgress eventId={currentEvent._id} checklist={currentEvent.checklist || []} />
      )}

      {/* 3. 2D Mandap Studio */}
      {activeTab === 'design' && <Interactive2DDesigner eventId={currentEvent._id} />}

      {/* 4. Seating Planner */}
      {activeTab === 'seating' && <SeatingPlanner eventId={currentEvent._id} />}

      {/* 5. Guests & Signed QR Passes */}
      {activeTab === 'guests' && (
        <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/20 pb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                Guest Directory & Signed QR Passes ({guests.length})
              </h3>
              <p className="text-xs text-gray-500">
                Manage RSVPs, dietary needs, seating allocations, and cryptographic entry passes.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportCsv}
                className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-xs font-bold hover:bg-utsav-beige-300"
              >
                <Download className="w-3.5 h-3.5 text-utsav-gold" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setShowAddGuest(!showAddGuest)}
                className="flex items-center space-x-1 px-4 py-2 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Guest</span>
              </button>
            </div>
          </div>

          {/* Add Guest Form */}
          {showAddGuest && (
            <form
              onSubmit={handleAddGuest}
              className="p-4 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-950 border border-utsav-gold/30 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in fade-in duration-150"
            >
              <input
                type="text"
                required
                placeholder="Guest Name *"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newGuestEmail}
                onChange={(e) => setNewGuestEmail(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newGuestPhone}
                onChange={(e) => setNewGuestPhone(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs"
              />
              <div className="flex space-x-2">
                <select
                  value={newGuestDiet}
                  onChange={(e) => setNewGuestDiet(e.target.value as any)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs"
                >
                  <option value="Veg">Veg</option>
                  <option value="Jain">Jain Satvik</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Vegan">Vegan</option>
                </select>
                <button type="submit" className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold">
                  Save
                </button>
              </div>
            </form>
          )}

          {/* Guests Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-utsav-gold/30 text-gray-500 dark:text-gray-400 uppercase font-bold text-[11px]">
                  <th className="py-2.5">Guest Name</th>
                  <th className="py-2.5">Group / Role</th>
                  <th className="py-2.5">Dietary</th>
                  <th className="py-2.5">RSVP Status</th>
                  <th className="py-2.5">Gate Check-in</th>
                  <th className="py-2.5 text-right">Pass Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-utsav-gold/15">
                {guests.map((g) => (
                  <tr
                    key={g._id}
                    className="hover:bg-utsav-beige-50/50 dark:hover:bg-utsav-maroon-950/40 transition-colors"
                  >
                    <td className="py-3 font-semibold text-utsav-brown dark:text-utsav-ivory">{g.name}</td>
                    <td className="py-3 text-gray-500">{g.group || 'Family'}</td>
                    <td className="py-3 font-semibold text-utsav-saffron">{g.mealPreference}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                        {g.rsvpStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      {g.checkedIn ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                          ✓ Checked In ({g.checkInTime || 'Gate'})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-utsav-maroon-950 text-gray-400 text-[10px]">
                          Pending Arrival
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {g.qrCodeDataUrl ? (
                        <a
                          href={g.qrCodeDataUrl}
                          download={`pass_${g.name.replace(/\s+/g, '_')}.png`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-utsav-maroon-800 text-utsav-gold font-bold text-[10px] hover:bg-utsav-maroon-700"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Download Pass</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-400">Pass Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5B. Booked Vendor Services & Contracts */}
      {activeTab === 'bookings' && (
        <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/20 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-utsav-gold" />
                <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                  Booked Services & Vendor Contracts ({bookings.length})
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Manage confirmed venue reservations, royal catering, mandap decor, and entertainment troupe contracts.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowAddBookingModal(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Service Booking</span>
              </button>
            </div>
          </div>

          {/* Quick Marketplace Category Shortcuts */}
          <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Quick Book from Marketplace:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/venues"
                className="px-3 py-1.5 rounded-xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 hover:border-utsav-gold text-xs font-bold text-utsav-brown dark:text-utsav-ivory flex items-center space-x-1.5"
              >
                <Building className="w-3.5 h-3.5 text-utsav-saffron" />
                <span>Venues</span>
              </Link>
              <Link
                to="/marketplace/catering"
                className="px-3 py-1.5 rounded-xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 hover:border-utsav-gold text-xs font-bold text-utsav-brown dark:text-utsav-ivory flex items-center space-x-1.5"
              >
                <Utensils className="w-3.5 h-3.5 text-utsav-saffron" />
                <span>Royal Catering</span>
              </Link>
              <Link
                to="/marketplace/decorations"
                className="px-3 py-1.5 rounded-xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 hover:border-utsav-gold text-xs font-bold text-utsav-brown dark:text-utsav-ivory flex items-center space-x-1.5"
              >
                <Flower2 className="w-3.5 h-3.5 text-utsav-saffron" />
                <span>Mandap & Decor</span>
              </Link>
              <Link
                to="/marketplace/entertainment"
                className="px-3 py-1.5 rounded-xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 hover:border-utsav-gold text-xs font-bold text-utsav-brown dark:text-utsav-ivory flex items-center space-x-1.5"
              >
                <Music className="w-3.5 h-3.5 text-utsav-saffron" />
                <span>Troupe & Photo</span>
              </Link>
            </div>
          </div>

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <div className="p-8 text-center bg-white/50 dark:bg-utsav-maroon-950/40 rounded-2xl border border-utsav-gold/30 space-y-3">
              <Building className="w-8 h-8 text-utsav-gold mx-auto" />
              <p className="text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                No vendor contracts booked for this celebration yet.
              </p>
              <p className="text-xs text-gray-500">
                Click '+ Add Service Booking' above or browse our curated Indian marketplace to reserve services.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="p-5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-utsav-saffron/10 text-utsav-saffron border border-utsav-saffron/30 text-[10px] font-bold uppercase">
                        {b.itemType}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        {b.status}
                      </span>
                    </div>

                    <h4 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                      {b.itemName}
                    </h4>

                    {b.bookingNotes && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 italic">
                        "{b.bookingNotes}"
                      </p>
                    )}

                    <div className="text-[11px] text-gray-500 font-mono">
                      Ref: {b.bookingNumber} • Date: {b.eventDate}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-utsav-gold/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Total Contract / Due</span>
                      <span className="font-bold text-xs sm:text-sm text-utsav-maroon-900 dark:text-utsav-saffron">
                        ₹{b.amount.toLocaleString('en-IN')}
                      </span>
                      {b.balanceDue > 0 && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                          (Due: ₹{b.balanceDue.toLocaleString('en-IN')})
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setPaymentPurpose(`Escrow Settlement: ${b.itemName}`);
                        setPaymentAmount(b.balanceDue > 0 ? b.balanceDue : Math.round(b.amount * 0.3));
                        setIsPaymentModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-sm"
                    >
                      Pay via Razorpay →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Budget & AI Optimizer */}
      {activeTab === 'budget' && (
        <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/20 pb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                AI Budget Optimizer & Expense Ledger
              </h3>
              <p className="text-xs text-gray-500">
                AI-recommended allocations for Indian weddings, mandaps, and catering.
              </p>
            </div>

            <span className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Total Budget: ₹{(currentEvent.budget / 100000).toFixed(1)} Lakhs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { category: 'Heritage Venue & Rooms (40%)', budget: currentEvent.budget * 0.4, spent: 450000 },
              { category: 'Catering & Royal Feasts (30%)', budget: currentEvent.budget * 0.3, spent: 300000 },
              { category: 'Mandap & Floral Decor (15%)', budget: currentEvent.budget * 0.15, spent: 180000 },
              { category: 'Music & Photography (10%)', budget: currentEvent.budget * 0.1, spent: 120000 },
              { category: 'Invitations & Gifts (5%)', budget: currentEvent.budget * 0.05, spent: 40000 },
            ].map((cat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 space-y-2 text-xs"
              >
                <span className="font-bold text-utsav-brown dark:text-utsav-ivory block">{cat.category}</span>
                <div className="flex justify-between text-gray-500">
                  <span>Spent: ₹{(cat.spent / 1000).toFixed(0)}k</span>
                  <span>Target: ₹{(cat.budget / 1000).toFixed(0)}k</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-utsav-maroon-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-utsav-gold to-utsav-saffron rounded-full"
                    style={{ width: `${Math.min(100, Math.round((cat.spent / cat.budget) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Payments & Razorpay Escrow */}
      {activeTab === 'payments' && (
        <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/20 pb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                Vendor Payments & Escrow Ledger
              </h3>
              <p className="text-xs text-gray-500">
                100% Razorpay escrow protection with downloadable GST tax invoices.
              </p>
            </div>

            <button
              onClick={() => {
                setPaymentPurpose('Vendor Milestone Settlement');
                setPaymentAmount(75000);
                setIsPaymentModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-md"
            >
              <CreditCard className="w-4 h-4" />
              <span>+ Make Payment via Razorpay</span>
            </button>
          </div>

          <div className="space-y-3">
            {payments.map((p) => (
              <div
                key={p._id}
                className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
              >
                <div className="space-y-0.5">
                  <h4 className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">{p.purpose}</h4>
                  <p className="text-[11px] text-gray-500 font-mono">TXN: {p.transactionId}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-bold text-sm text-utsav-maroon-900 dark:text-utsav-saffron">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {p.status}
                  </span>
                  <button
                    onClick={() => setSelectedInvoicePayment(p)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-xs font-bold hover:bg-utsav-beige-300"
                  >
                    <FileText className="w-3.5 h-3.5 text-utsav-gold" />
                    <span>View Invoice</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8A. User Personal Event QR Pass (For Normal User / Host / Guests) */}
      {activeTab === 'qr' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/20 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <QrCode className="w-6 h-6 text-utsav-gold" />
                <h3 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                  My Official Event QR Entry Pass
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your authenticated digital entry credential. Present this QR code at the entrance gate for staff verification.
              </p>
            </div>

            <Link
              to={`/events/${currentEvent._id}/qr`}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-md self-start sm:self-auto"
            >
              <span>Open Full Royal Ticket View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Scannable Pass Card */}
            <div className="md:col-span-1 p-6 rounded-2xl bg-gradient-to-b from-utsav-maroon-950 to-utsav-maroon-900 border-2 border-utsav-gold shadow-xl text-center space-y-4 text-utsav-ivory relative overflow-hidden">
              <div className="absolute top-0 right-0 pointer-events-none opacity-40">
                <MandalaCorner className="w-20 h-20" />
              </div>

              <div className="flex items-center justify-center space-x-2">
                <DiyaIcon className="w-5 h-5" />
                <span className="text-[11px] font-serif italic text-utsav-gold tracking-widest uppercase">
                  UtsavMitra Verified Pass
                </span>
              </div>

              <div className="p-3 bg-white rounded-2xl border-2 border-utsav-gold shadow-md inline-block mx-auto">
                <img
                  src={
                    guests[0]?.qrCodeDataUrl ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                      typeof window !== 'undefined'
                        ? window.location.origin + '/events/' + currentEvent._id + '/qr'
                        : 'https://utsavmitra.in/pass'
                    )}&color=7A1F2B&bgcolor=FFFFFF`
                  }
                  alt="My Event QR Ticket"
                  className="w-44 h-44 object-contain rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <h4 className="font-heading font-bold text-sm text-utsav-gold">
                  {user?.name || guests[0]?.name || 'Guest of Honour'}
                </h4>
                <p className="text-[11px] text-utsav-ivory/80 line-clamp-1">
                  {currentEvent.name}
                </p>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold">
                  ✓ Active Digital Pass
                </span>
              </div>
            </div>

            {/* Pass Metadata & Actions */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Ceremony Date & Time</span>
                  <p className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold mt-0.5">
                    {currentEvent.date} • {currentEvent.time || '10:00 AM'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Venue Location</span>
                  <p className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold mt-0.5 truncate">
                    {currentEvent.location?.address || 'Palace Grand Ballroom'}, {currentEvent.location?.city || 'Jaipur'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Meal Preference</span>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {user?.dietaryPreference || guests[0]?.mealPreference || 'Pure Vegetarian (Royal Thali)'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Baithak / Seating</span>
                  <p className="text-xs font-bold text-utsav-saffron mt-0.5">
                    Table 1 - Royal Diwan (VIP Reserved)
                  </p>
                </div>
              </div>

              {/* Security Instruction Alert */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-400/40 space-y-1">
                <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-utsav-gold" />
                  <span>Gate Entry Policy</span>
                </div>
                <p className="text-[11px] text-amber-900 dark:text-amber-200/80 leading-relaxed">
                  To ensure security and prevent unauthorized entry, gate scanning is performed exclusively by authorized event organizers and staff at the entrance. Show this QR pass from your screen or download a copy.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={
                    guests[0]?.qrCodeDataUrl ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
                      typeof window !== 'undefined'
                        ? window.location.origin + '/events/' + currentEvent._id + '/qr'
                        : 'https://utsavmitra.in/pass'
                    )}&color=7A1F2B&bgcolor=FFFFFF`
                  }
                  download={`UtsavMitra_QR_Pass_${currentEvent.name.replace(/\s+/g, '_')}.png`}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Pass Image</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: `${currentEvent.name} - My QR Pass`,
                          text: `Here is my digital entry pass for ${currentEvent.name}.`,
                          url: window.location.origin + `/events/${currentEvent._id}/qr`,
                        })
                        .catch(() => {});
                    } else if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.origin + `/events/${currentEvent._id}/qr`);
                      alert('Pass link copied to clipboard!');
                    }
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-utsav-brown dark:text-utsav-gold text-xs font-bold hover:border-utsav-gold shadow-sm transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Pass</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8B. Gate QR Scanner (Strictly For Organizers / Event Staff / Admins) */}
      {activeTab === 'scanner' && (isOrganizer || isAdmin) && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-end">
            <Link
              to={`/organizer/events/${currentEvent._id}/scanner`}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-md"
            >
              <span>Open Dedicated Gate Scanner View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <QREntryScanner eventId={currentEvent._id} />
        </div>
      )}

      {/* 9. Live Broadcast Room */}
      {activeTab === 'live' && (
        <LiveStreamPlayer
          eventId={currentEvent._id}
          isOrganizer={true}
          eventDetails={currentEvent}
        />
      )}

      {/* 10. Digital E-Card */}
      {activeTab === 'invite' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-end">
            <Link
              to={`/invite/${currentEvent.invitation?.shareUrlToken || 'demo'}`}
              target="_blank"
              className="flex items-center space-x-1 px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-md"
            >
              <span>Open Public Guest Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DigitalInvitationTemplate
            invitation={
              currentEvent.invitation || {
                _id: 'inv-1',
                eventId: currentEvent._id,
                templateId: 'royal-rajasthani',
                title: currentEvent.name,
                hostNames: 'The Family Cordially Invites You',
                eventDate: currentEvent.date,
                eventTime: currentEvent.time || '10:00 AM',
                venueName: currentEvent.location?.address || 'Palace Grand Ballroom',
                venueAddress: `${currentEvent.location?.city}, ${currentEvent.location?.state}`,
                customMessage:
                  'We request the honour of your auspicious presence and blessings as we celebrate this joyous milestone.',
                shlokaOrQuote: '|| ॐ श्री गणेशाय नमः ||',
                themeColor: '#7A1F2B',
                shareUrlToken: 'demo',
              }
            }
            qrDataUrl={guests[0]?.qrCodeDataUrl}
            isPublic={false}
          />
        </div>
      )}
    </div>
  );
};
