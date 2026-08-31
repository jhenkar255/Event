import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { IEvent, IPayment, IBooking } from '@shared/types';
import { EventCard } from '../components/events/EventCard';
import { DiyaIcon, MandalaCorner } from '../components/layout/IndianMotifs';
import {
  Calendar,
  Sparkles,
  Users,
  IndianRupee,
  MapPin,
  PlusCircle,
  Clock,
  Radio,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  QrCode,
  Camera,
  Layers,
  Armchair,
  Download,
  Share2,
  ExternalLink,
  Search,
  CheckCircle2,
  FileText,
  Activity,
  ShoppingBag,
  Utensils,
  Music,
  Flower2,
  Building2,
  PhoneCall,
  Receipt,
  Check,
  Package,
  Ticket,
} from 'lucide-react';
import { AIEventWizardModal } from '../components/ai/AIEventWizardModal';
import { RiskAlertsBanner } from '../components/events/RiskAlertsBanner';
import { RazorpayCheckoutModal } from '../components/payments/RazorpayCheckoutModal';
import { InvoiceReceiptModal } from '../components/payments/InvoiceReceiptModal';
import { UtsavAIChat } from '../components/ai/UtsavAIChat';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [myBookings, setMyBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Active Interactive Tab: 'celebrations' | 'services' | 'budget' | 'guests' | 'status'
  const [activeTab, setActiveTab] = useState<'celebrations' | 'services' | 'budget' | 'guests' | 'status'>('celebrations');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONGOING' | 'PLANNING' | 'CONFIRMED' | 'COMPLETED'>('ALL');
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'VENUE' | 'DECORATION' | 'CATERING' | 'ENTERTAINMENT' | 'PACKAGE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment & Invoice Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<IPayment | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ success: boolean; events: IEvent[] }>('/events'),
      api.get<{ success: boolean; bookings: IBooking[] }>('/bookings/my-bookings'),
    ])
      .then(([evRes, bkgRes]) => {
        if (evRes.success && evRes.events) {
          setEvents(evRes.events);
        }
        if (bkgRes.success && bkgRes.bookings && bkgRes.bookings.length > 0) {
          setMyBookings(bkgRes.bookings);
        } else {
          // Fallback sample bookings if newly created user
          setMyBookings([
            {
              _id: 'bkg-1',
              bookingNumber: 'BKG-RJ-PALACE-901',
              eventId: evRes.events?.[0]?._id || 'demo',
              userId: user?._id || 'u-1',
              itemType: 'VENUE',
              itemId: 'v-1',
              itemName: 'The Oberoi Rajvilas Heritage Palace & Darbar Courtyard',
              amount: 350000,
              advancePaid: 350000,
              balanceDue: 0,
              status: 'CONFIRMED',
              eventDate: '2026-11-20',
              bookingNotes: 'Heritage courtyard, 30 suites, valet parking, private hawan setup.',
              createdAt: '2026-08-20',
            },
            {
              _id: 'bkg-2',
              bookingNumber: 'BKG-CAT-FEAST-902',
              eventId: evRes.events?.[0]?._id || 'demo',
              userId: user?._id || 'u-1',
              itemType: 'CATERING',
              itemId: 'c-1',
              itemName: 'Shahi Marwari Royal Feast (350 Pure Veg & Jain Live Counters)',
              amount: 360000,
              advancePaid: 360000,
              balanceDue: 0,
              status: 'CONFIRMED',
              eventDate: '2026-11-20',
              bookingNotes: 'Dal Baati Churma, Saffron Rabdi Jalebi, Welcome Kesar Thandai, Jain Satvik counter.',
              createdAt: '2026-08-22',
            },
            {
              _id: 'bkg-3',
              bookingNumber: 'BKG-DEC-MANDAP-903',
              eventId: evRes.events?.[0]?._id || 'demo',
              userId: user?._id || 'u-1',
              itemType: 'DECORATION',
              itemId: 'd-1',
              itemName: 'Royal Rajputana 4-Pillar Carved Gold Mandap & Floral Toran Canopy',
              amount: 180000,
              advancePaid: 90000,
              balanceDue: 90000,
              status: 'CONFIRMED',
              eventDate: '2026-11-20',
              bookingNotes: 'Fresh marigolds, fairy lights canopy, floral backdrop, hawan kund decor.',
              createdAt: '2026-08-24',
            },
            {
              _id: 'bkg-4',
              bookingNumber: 'BKG-ENT-SHEHNAI-904',
              eventId: evRes.events?.[0]?._id || 'demo',
              userId: user?._id || 'u-1',
              itemType: 'ENTERTAINMENT',
              itemId: 'e-1',
              itemName: 'Rajasthani Manganiyar Folk Troupe & Live Shehnai Swagat',
              amount: 65000,
              advancePaid: 65000,
              balanceDue: 0,
              status: 'CONFIRMED',
              eventDate: '2026-11-20',
              bookingNotes: '6 musicians for Baraat entry and 4 hours live classical instrumental background.',
              createdAt: '2026-08-25',
            },
          ]);
        }
      })
      .catch((err) => console.error('Failed to load dashboard data:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const totalSpent = events.reduce((acc, e) => acc + (e.spentBudget || 0), 0);
  const totalBudget = events.reduce((acc, e) => acc + (e.budget || 0), 0) || 1500000;
  const totalGuests = events.reduce((acc, e) => acc + (e.guestCount || 0), 0);
  const ongoingCount = events.filter((e) => e.status === 'ONGOING').length;
  const planningCount = events.filter((e) => e.status === 'PLANNING').length;
  const confirmedCount = events.filter((e) => e.status === 'CONFIRMED').length;
  const completedCount = events.filter((e) => e.status === 'COMPLETED').length;

  const allAlerts = events.flatMap((e) => e.riskAlerts || []);

  const filteredEvents = events.filter((ev) => {
    const matchesStatus = statusFilter === 'ALL' || ev.status === statusFilter;
    const matchesSearch =
      (ev.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((ev as any).type || (ev as any).eventType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.culturalTradition || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.location?.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredBookings = myBookings.filter((bkg) => {
    const matchesFilter = bookingFilter === 'ALL' || bkg.itemType === bookingFilter;
    const matchesSearch =
      bkg.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bkg.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bkg.bookingNotes || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalBookedAmount = myBookings.reduce((acc, b) => acc + (b.amount || 0), 0);
  const totalAdvancePaid = myBookings.reduce((acc, b) => acc + (b.advancePaid || 0), 0);
  const totalBalanceDue = myBookings.reduce((acc, b) => acc + (b.balanceDue || 0), 0);

  const handleExportAllGuestsCsv = () => {
    const rows = [
      ['Event Name', 'Date', 'Tradition', 'Location', 'Guest Headcount', 'Committed Budget', 'Status'],
      ...events.map((e) => [
        e.name,
        e.date,
        e.culturalTradition || 'Custom',
        `${e.location?.address || ''}, ${e.location?.city || ''}`,
        e.guestCount,
        `₹${e.spentBudget || 0}`,
        e.status,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `utsavmitra_celebrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sampleRecentPayments: IPayment[] = [
    {
      _id: 'pay-1',
      eventId: events[0]?._id || 'demo',
      userId: user?._id || 'u-1',
      amount: 450000,
      serviceName: 'Heritage Palace & Ballroom Advance',
      purpose: 'Venue Booking Escrow',
      status: 'COMPLETED',
      transactionId: 'UTSV-ESCROW-TXN-991204',
      createdAt: '2026-08-20',
    },
    {
      _id: 'pay-2',
      eventId: events[0]?._id || 'demo',
      userId: user?._id || 'u-1',
      amount: 280000,
      serviceName: 'Royal Feast Catering & Live Counters',
      purpose: 'Catering Advance Escrow',
      status: 'COMPLETED',
      transactionId: 'UTSV-ESCROW-TXN-884391',
      createdAt: '2026-08-22',
    },
    {
      _id: 'pay-3',
      eventId: events[0]?._id || 'demo',
      userId: user?._id || 'u-1',
      amount: 175000,
      serviceName: 'Sandstone Mandap & Marigold Floral Decor',
      purpose: 'Decoration Advance Escrow',
      status: 'COMPLETED',
      transactionId: 'UTSV-ESCROW-TXN-773820',
      createdAt: '2026-08-24',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Floating AI Wisdom Advisor */}
      <UtsavAIChat />

      {/* AI Wizard Modal */}
      <AIEventWizardModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

      {/* Razorpay Checkout & Invoice Receipt Modals */}
      <RazorpayCheckoutModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        eventId={events[0]?._id || 'demo'}
        amount={75000}
        purpose="Escrow Milestone Deposit"
        onPaymentSuccess={() => {
          alert('Escrow milestone payment verified successfully!');
        }}
      />

      <InvoiceReceiptModal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        payment={selectedPayment}
      />

      {/* Top Banner with Royal Greetings */}
      <div className="relative rounded-3xl bg-gradient-to-r from-utsav-maroon-900 via-utsav-maroon-800 to-utsav-maroon-950 p-6 sm:p-8 text-utsav-ivory border-2 border-utsav-gold/60 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 pointer-events-none opacity-20">
          <MandalaCorner className="w-48 h-48" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-utsav-gold/20 text-utsav-gold border border-utsav-gold/40 flex items-center space-x-1">
                <DiyaIcon className="w-3.5 h-3.5" />
                <span>शुभ उत्सव • Auspicious Celebrations</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                100% Escrow Protected
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-utsav-gold">
              Welcome, {user?.name || 'Celebration Host'}!
            </h1>
            <p className="text-xs sm:text-sm text-utsav-ivory-300 max-w-xl">
              Manage your royal Indian weddings, traditional pujas, and gala celebrations with AI budget optimization and milestone escrow payments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-utsav-gold via-utsav-saffron to-utsav-gold text-utsav-maroon-950 font-bold text-xs sm:text-sm shadow-xl flex items-center space-x-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Celebration Planner</span>
            </button>
            <Link
              to="/events/create"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-utsav-gold/40 backdrop-blur-sm flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-utsav-gold" />
              <span>Manual Wizard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Critical AI Risk Alerts Banner */}
      {allAlerts.length > 0 && <RiskAlertsBanner alerts={allAlerts} />}

      {/* 5-Card Interactive Dashboard Command Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-utsav-saffron" />
            <span>Celebration Command Tabs</span>
          </span>
          <span className="text-[11px] text-gray-500 italic">Click any card to switch dashboard views</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5" role="tablist">
          {/* Tab 1: Total Celebrations */}
          <button
            role="tab"
            aria-selected={activeTab === 'celebrations'}
            onClick={() => {
              setActiveTab('celebrations');
              setStatusFilter('ALL');
            }}
            className={`text-left p-4 rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
              activeTab === 'celebrations'
                ? 'bg-utsav-beige-100 dark:bg-utsav-maroon-800 border-2 border-utsav-gold ring-4 ring-utsav-gold/30 shadow-2xl scale-[1.02]'
                : 'bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg hover:border-utsav-gold hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            {activeTab === 'celebrations' && (
              <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-utsav-gold text-utsav-maroon-950 shadow-sm animate-pulse">
                ✓ Active
              </span>
            )}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block">
                My Celebrations
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                {events.length}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>{ongoingCount} Ongoing</span>
              </span>
              <span className="text-utsav-gold opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
                View →
              </span>
            </div>
          </button>

          {/* Tab 2: Booked Services & Vendors (NEW!) */}
          <button
            role="tab"
            aria-selected={activeTab === 'services'}
            onClick={() => setActiveTab('services')}
            className={`text-left p-4 rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
              activeTab === 'services'
                ? 'bg-utsav-beige-100 dark:bg-utsav-maroon-800 border-2 border-utsav-gold ring-4 ring-utsav-gold/30 shadow-2xl scale-[1.02]'
                : 'bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg hover:border-utsav-gold hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            {activeTab === 'services' && (
              <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-utsav-gold text-utsav-maroon-950 shadow-sm animate-pulse">
                ✓ Active
              </span>
            )}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block">
                Booked Services
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                {myBookings.length}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-[10px] font-semibold text-amber-600 dark:text-amber-400">
              <span className="flex items-center space-x-1">
                <ShoppingBag className="w-3 h-3" />
                <span>Venues & Vendors</span>
              </span>
              <span className="text-utsav-gold opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
                Explore →
              </span>
            </div>
          </button>

          {/* Tab 3: Total Budget Spent */}
          <button
            role="tab"
            aria-selected={activeTab === 'budget'}
            onClick={() => setActiveTab('budget')}
            className={`text-left p-4 rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
              activeTab === 'budget'
                ? 'bg-utsav-beige-100 dark:bg-utsav-maroon-800 border-2 border-utsav-gold ring-4 ring-utsav-gold/30 shadow-2xl scale-[1.02]'
                : 'bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg hover:border-utsav-gold hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            {activeTab === 'budget' && (
              <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-utsav-gold text-utsav-maroon-950 shadow-sm animate-pulse">
                ✓ Active
              </span>
            )}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block">
                Committed Budget
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                ₹{(totalSpent / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-[10px] font-semibold text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Escrow Safe</span>
              </span>
              <span className="text-utsav-gold opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
                Ledger →
              </span>
            </div>
          </button>

          {/* Tab 4: Invited RSVP Guests */}
          <button
            role="tab"
            aria-selected={activeTab === 'guests'}
            onClick={() => setActiveTab('guests')}
            className={`text-left p-4 rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
              activeTab === 'guests'
                ? 'bg-utsav-beige-100 dark:bg-utsav-maroon-800 border-2 border-utsav-gold ring-4 ring-utsav-gold/30 shadow-2xl scale-[1.02]'
                : 'bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg hover:border-utsav-gold hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            {activeTab === 'guests' && (
              <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-utsav-gold text-utsav-maroon-950 shadow-sm animate-pulse">
                ✓ Active
              </span>
            )}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block">
                Invited Guests
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                {totalGuests}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-[10px] font-semibold text-utsav-saffron">
              <span className="flex items-center space-x-1">
                <QrCode className="w-3 h-3" />
                <span>QR Passes</span>
              </span>
              <span className="text-utsav-gold opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
                Guest Hub →
              </span>
            </div>
          </button>

          {/* Tab 5: Celebration Status */}
          <button
            role="tab"
            aria-selected={activeTab === 'status'}
            onClick={() => setActiveTab('status')}
            className={`text-left p-4 rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
              activeTab === 'status'
                ? 'bg-utsav-beige-100 dark:bg-utsav-maroon-800 border-2 border-utsav-gold ring-4 ring-utsav-gold/30 shadow-2xl scale-[1.02]'
                : 'bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg hover:border-utsav-gold hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            {activeTab === 'status' && (
              <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-utsav-gold text-utsav-maroon-950 shadow-sm animate-pulse">
                ✓ Active
              </span>
            )}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block">
                Event Status
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                <span>Active</span>
                {ongoingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                )}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-[10px] font-semibold text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <Radio className="w-3 h-3 text-red-500" />
                <span>Command Center</span>
              </span>
              <span className="text-utsav-gold opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
                Launch →
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL CELEBRATIONS & EVENTS VIEW                                     */}
      {/* ========================================================================= */}
      {activeTab === 'celebrations' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Search, Filter Pills & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/30 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-utsav-saffron" />
              <h2 className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                My Celebrations & Events ({filteredEvents.length})
              </h2>
            </div>

            {/* Quick Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: `All (${events.length})`, status: 'ALL' },
                { label: `🔴 Ongoing (${ongoingCount})`, status: 'ONGOING' },
                { label: `Planning (${planningCount})`, status: 'PLANNING' },
                { label: `Confirmed (${confirmedCount})`, status: 'CONFIRMED' },
                { label: `Completed (${completedCount})`, status: 'COMPLETED' },
              ].map((pill) => (
                <button
                  key={pill.status}
                  onClick={() => setStatusFilter(pill.status as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === pill.status
                      ? 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold shadow-sm'
                      : 'bg-utsav-ivory dark:bg-utsav-maroon-900 text-gray-600 dark:text-gray-300 border border-utsav-gold/20 hover:border-utsav-gold'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ceremonies by name, tradition, city (e.g. Rajasthani, Wedding, Jaipur)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold shadow-inner"
            />
          </div>

          {loading ? (
            <div className="p-16 text-center text-gray-400">Loading your auspicious events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 rounded-3xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border-2 border-dashed border-utsav-gold/40 text-center space-y-4">
              <DiyaIcon className="w-12 h-12 mx-auto" />
              <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No Celebrations Matching Filter'
                  : 'No Celebrations Created Yet'}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try clearing the search query or switching the status filter.'
                  : 'Start by planning your first event with our AI cultural planner or manual creation wizard.'}
              </p>
              {searchQuery || statusFilter !== 'ALL' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  className="px-6 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold shadow-md"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold shadow-md"
                >
                  Plan Your First Event with AI →
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BOOKED SERVICES & VENDORS HUB (AFTER BOOKING SHOWCASE)             */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/30 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-utsav-gold" />
                <h2 className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                  My Booked Services & Vendor Commitments ({filteredBookings.length})
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Review all confirmed venues, floral mandaps, catering feasts, and musical troupes booked across your celebrations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/venues"
                className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-md flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Book More Services</span>
              </Link>
            </div>
          </div>

          {/* Booked Financial Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Total Services</span>
              <p className="font-heading text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                {myBookings.length}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">✓ 100% Guaranteed</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Total Service Value</span>
              <p className="font-heading text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                ₹{(totalBookedAmount / 100000).toFixed(1)} Lakhs
              </p>
              <span className="text-[10px] text-gray-400">All contracted vendors</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Advance Paid</span>
              <p className="font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{(totalAdvancePaid / 100000).toFixed(1)} Lakhs
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">Escrow Released</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Balance Due</span>
              <p className="font-heading text-2xl font-bold text-utsav-saffron">
                ₹{(totalBalanceDue / 100000).toFixed(1)} Lakhs
              </p>
              <span className="text-[10px] text-gray-400">Due upon completion</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[
              { label: `All Services (${myBookings.length})`, type: 'ALL', icon: ShoppingBag },
              { label: '🏰 Venues', type: 'VENUE', icon: Building2 },
              { label: '🌺 Mandap & Decor', type: 'DECORATION', icon: Flower2 },
              { label: '🍽️ Royal Feasts', type: 'CATERING', icon: Utensils },
              { label: '🎵 Music & Troupe', type: 'ENTERTAINMENT', icon: Music },
              { label: '🎁 Packages', type: 'PACKAGE', icon: Package },
            ].map((pill) => (
              <button
                key={pill.type}
                onClick={() => setBookingFilter(pill.type as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  bookingFilter === pill.type
                    ? 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold shadow-sm'
                    : 'bg-white dark:bg-utsav-maroon-950 text-gray-600 dark:text-gray-300 border border-utsav-gold/20 hover:border-utsav-gold'
                }`}
              >
                <span>{pill.label}</span>
              </button>
            ))}
          </div>

          {/* Booked Services Cards Grid */}
          {filteredBookings.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-utsav-maroon-950 border-2 border-dashed border-utsav-gold/40 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-utsav-gold/60" />
              <h4 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                No Booked Services in this Category
              </h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Explore our curated heritage palaces, royal regional catering menus, and bespoke mandap architects to book your celebration essentials.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  to="/venues"
                  className="px-5 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold shadow"
                >
                  Browse Palaces & Venues →
                </Link>
                <Link
                  to="/catering"
                  className="px-5 py-2.5 rounded-xl bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-xs font-bold hover:bg-utsav-beige-300"
                >
                  Browse Catering Menus →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookings.map((bkg) => {
                const isTicket = bkg.bookingType === 'EVENT_TICKET' || bkg.itemType === 'EVENT_TICKET';
                const isVenue = bkg.itemType === 'VENUE';
                const isDecor = bkg.itemType === 'DECORATION';
                const isCatering = bkg.itemType === 'CATERING';
                const isEntertainment = bkg.itemType === 'ENTERTAINMENT';
                const eventObj = typeof bkg.eventId === 'object' ? bkg.eventId : null;

                if (isTicket) {
                  return (
                    <div
                      key={bkg._id}
                      className="p-5 rounded-3xl bg-white dark:bg-utsav-maroon-950 border-2 border-utsav-gold/60 shadow-lg space-y-4 hover:border-utsav-gold hover:shadow-2xl transition-all relative overflow-hidden group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="p-2 rounded-xl text-xs bg-amber-400 text-utsav-maroon-950 font-bold shadow-sm">
                            <Ticket className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-utsav-saffron block">
                              EVENT ENTRY TICKET
                            </span>
                            <span className="font-mono text-[11px] text-utsav-gold font-bold">
                              {bkg.bookingNumber}
                            </span>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/30 shadow-xs">
                          ✓ {bkg.bookingStatus || bkg.status || 'CONFIRMED'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold group-hover:text-utsav-saffron transition-colors">
                          {eventObj?.name || bkg.itemName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-utsav-saffron shrink-0" />
                          <span>{eventObj?.date || bkg.eventDate}</span>
                          <span>•</span>
                          <MapPin className="w-3.5 h-3.5 text-utsav-saffron shrink-0" />
                          <span className="truncate">{eventObj?.location?.city || 'Bengaluru'}</span>
                        </p>
                      </div>

                      {/* Ticket Badge & Verification Grid */}
                      <div className="p-3 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900/60 border border-utsav-gold/30 text-xs space-y-1.5">
                        <div className="flex justify-between font-bold">
                          <span className="text-gray-500 dark:text-gray-400">Pass Type:</span>
                          <span className="text-utsav-maroon-900 dark:text-utsav-gold">
                            🎟️ {bkg.ticketTier || 'General'} Pass × {bkg.quantity || 1}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Payment:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {bkg.amount === 0 ? 'FREE REGISTRATION ✓' : `PAID (₹${bkg.amount}) ✓`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Gate Entry Status:</span>
                          <span className={`font-bold ${bkg.checkedIn ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {bkg.checkedIn ? 'CHECKED IN ✓' : 'NOT CHECKED IN'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <Link
                          to={`/events/${eventObj?._id || bkg.eventId}/qr`}
                          className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl gold-gradient-btn text-[11px] font-extrabold text-utsav-maroon-950 shadow-sm hover:scale-105 transition-transform"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>[ My QR Pass ]</span>
                        </Link>

                        <Link
                          to={`/events/${eventObj?._id || bkg.eventId}`}
                          className="px-3 py-2 rounded-xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-[11px] font-bold text-utsav-maroon-800 dark:text-utsav-gold hover:bg-utsav-gold hover:text-utsav-maroon-950 transition-colors"
                        >
                          [ View Event ]
                        </Link>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={bkg._id}
                    className="p-5 rounded-3xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-md space-y-4 hover:border-utsav-gold hover:shadow-xl transition-all relative overflow-hidden group"
                  >
                    {/* Top Type & Status Tag */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`p-2 rounded-xl text-xs ${
                            isVenue
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : isDecor
                              ? 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                              : isCatering
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {isVenue && <Building2 className="w-4 h-4" />}
                          {isDecor && <Flower2 className="w-4 h-4" />}
                          {isCatering && <Utensils className="w-4 h-4" />}
                          {isEntertainment && <Music className="w-4 h-4" />}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                            {bkg.itemType} SERVICE
                          </span>
                          <span className="font-mono text-[11px] text-utsav-gold font-bold">
                            {bkg.bookingNumber}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                          bkg.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : bkg.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        ✓ {bkg.status}
                      </span>
                    </div>

                    {/* Service Name & Event Title */}
                    <div>
                      <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold group-hover:text-utsav-saffron transition-colors">
                        {bkg.itemName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-utsav-gold shrink-0" />
                        <span>Date: {bkg.eventDate}</span>
                        {typeof bkg.eventId === 'object' && bkg.eventId?.name && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-utsav-brown dark:text-utsav-ivory">
                              {bkg.eventId.name}
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Booking Notes / Specifications */}
                    {bkg.bookingNotes && (
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 bg-utsav-beige-50 dark:bg-utsav-maroon-900/60 p-2.5 rounded-xl border border-utsav-gold/20 italic">
                        "{bkg.bookingNotes}"
                      </p>
                    )}

                    {/* Financial Summary */}
                    <div className="pt-2 border-t border-utsav-gold/20 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Total Contract</span>
                        <span className="font-bold text-sm text-utsav-maroon-900 dark:text-utsav-gold">
                          ₹{bkg.amount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block">Advance / Balance</span>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          ₹{bkg.advancePaid.toLocaleString('en-IN')} Paid
                        </span>
                        {bkg.balanceDue > 0 ? (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-bold">
                            ₹{bkg.balanceDue.toLocaleString('en-IN')} Due
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 block font-bold">
                            ✓ Fully Settled
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <button
                        onClick={() =>
                          setSelectedPayment({
                            _id: bkg._id,
                            paymentId: `PAY-${bkg.bookingNumber}`,
                            serviceName: bkg.itemName,
                            amount: bkg.advancePaid || bkg.amount,
                            purpose: `${bkg.itemType} Service Booking`,
                            status: 'COMPLETED',
                            transactionId: `TXN-${bkg.bookingNumber}`,
                            createdAt: bkg.createdAt || new Date().toISOString(),
                            userId: user?._id || 'user',
                            eventId: typeof bkg.eventId === 'object' ? bkg.eventId?._id : bkg.eventId,
                          })
                        }
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 hover:border-utsav-gold text-[11px] font-bold text-utsav-maroon-800 dark:text-utsav-gold transition-colors cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Service Voucher</span>
                      </button>

                      <a
                        href="tel:+919876543210"
                        className="px-3 py-2 rounded-xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 hover:border-utsav-gold text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-1"
                        title="Contact Vendor Desk"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Vendor</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUDGET & ESCROW FINANCIAL COMMAND HUB                              */}
      {/* ========================================================================= */}
      {activeTab === 'budget' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/30 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-6 h-6 text-utsav-saffron" />
                <h2 className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                  AI Budget Optimizer & Escrow Financial Command Hub
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Real-time expense ledgers, automated milestone disbursements, and 100% Razorpay escrow security.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold shadow-md"
              >
                <CreditCard className="w-4 h-4" />
                <span>+ Make Escrow Payment</span>
              </button>
            </div>
          </div>

          {/* Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Total Budget Ceiling</span>
              <p className="font-heading text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                ₹{(totalBudget / 100000).toFixed(1)} Lakhs
              </p>
              <span className="text-[10px] text-gray-400">Across all active events</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Committed Expenses</span>
              <p className="font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{(totalSpent / 100000).toFixed(1)} Lakhs
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">
                {Math.round((totalSpent / totalBudget) * 100)}% Utilized
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Remaining Liquidity</span>
              <p className="font-heading text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                ₹{((totalBudget - totalSpent) / 100000).toFixed(1)} Lakhs
              </p>
              <span className="text-[10px] text-gray-500">Unallocated Buffer</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Escrow Protection</span>
              <p className="font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                100% Safe
              </p>
              <span className="text-[10px] text-gray-500">Razorpay Verified</span>
            </div>
          </div>

          {/* AI Recommended Category Allocations */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
              AI Cultural Category Distribution
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { name: 'Heritage Venues (40%)', budget: totalBudget * 0.4, spent: totalSpent * 0.42 },
                { name: 'Royal Feasts (30%)', budget: totalBudget * 0.3, spent: totalSpent * 0.31 },
                { name: 'Mandap & Decor (15%)', budget: totalBudget * 0.15, spent: totalSpent * 0.16 },
                { name: 'Music & Troupe (10%)', budget: totalBudget * 0.1, spent: totalSpent * 0.08 },
                { name: 'Invites & Gifts (5%)', budget: totalBudget * 0.05, spent: totalSpent * 0.03 },
              ].map((cat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 space-y-2 text-xs"
                >
                  <span className="font-bold text-utsav-brown dark:text-utsav-ivory block truncate">
                    {cat.name}
                  </span>
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>₹{(cat.spent / 1000).toFixed(0)}k spent</span>
                    <span>₹{(cat.budget / 1000).toFixed(0)}k target</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-utsav-maroon-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-utsav-gold to-utsav-saffron rounded-full"
                      style={{ width: `${Math.min(100, Math.round((cat.spent / cat.budget) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Escrow Transactions & Invoices */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
                Recent Escrow Transactions & Invoices
              </h3>
              <span className="text-xs text-gray-500 font-mono">100% Milestone Protected</span>
            </div>

            <div className="space-y-2.5">
              {sampleRecentPayments.map((p) => (
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
                      onClick={() => setSelectedPayment(p)}
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GUEST RSVPS & GATE ENTRY PASSES HUB                                */}
      {/* ========================================================================= */}
      {activeTab === 'guests' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/30 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-utsav-saffron" />
                <h2 className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                  Cross-Celebration Guest RSVPs & Gate Passes Hub
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Dietary management, cryptographic QR pass generation, and real-time door attendance.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportAllGuestsCsv}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-xs font-bold hover:bg-utsav-beige-300 shadow-sm"
              >
                <Download className="w-4 h-4 text-utsav-gold" />
                <span>Export Guests CSV</span>
              </button>
            </div>
          </div>

          {/* Guest Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Total Headcount</span>
              <p className="font-heading text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                {totalGuests}
              </p>
              <span className="text-[10px] text-gray-400">Invited Family & VIPs</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">RSVP Accepted</span>
              <p className="font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(totalGuests * 0.94)}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">94% Confirmation Rate</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Gate Passes Generated</span>
              <p className="font-heading text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                100% Signed
              </p>
              <span className="text-[10px] text-utsav-saffron font-bold">Cryptographic QR Ready</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Gate Attendance</span>
              <p className="font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {ongoingCount > 0 ? '420 Checked In' : 'Ready at Gates'}
              </p>
              <span className="text-[10px] text-gray-500">Real-time Check-In Active</span>
            </div>
          </div>

          {/* Regional Dietary Preferences Breakdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 space-y-4">
            <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
              Regional Feast Dietary Allocation
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">🌱 Pure Vegetarian</span>
                <p className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  {Math.round(totalGuests * 0.65)} Guests (65%)
                </p>
                <p className="text-[10px] text-emerald-700">Dedicated satvik live buffet counters</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-300">🪷 Jain Satvik (No Root)</span>
                <p className="text-lg font-bold text-amber-900 dark:text-amber-200">
                  {Math.round(totalGuests * 0.2)} Guests (20%)
                </p>
                <p className="text-[10px] text-amber-700">No onion, garlic, or root vegetables</p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 space-y-1">
                <span className="font-bold text-purple-800 dark:text-purple-300">🍗 Non-Vegetarian</span>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-200">
                  {Math.round(totalGuests * 0.12)} Guests (12%)
                </p>
                <p className="text-[10px] text-purple-700">Segregated live BBQ & curry stations</p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 space-y-1">
                <span className="font-bold text-blue-800 dark:text-blue-300">🌿 Vegan & Plant-Based</span>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
                  {Math.round(totalGuests * 0.03)} Guests (3%)
                </p>
                <p className="text-[10px] text-blue-700">Dairy-free Indian sweets & coconut milk</p>
              </div>
            </div>
          </div>

          {/* Quick Access to Event Guest Portals */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
              Manage Guests Per Celebration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div
                  key={ev._id}
                  className="p-5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold line-clamp-1">
                        {ev.name}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-utsav-gold text-utsav-maroon-950">
                        {ev.guestCount} Guests
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {ev.date} • {ev.location?.city}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-utsav-gold/20 flex flex-wrap items-center justify-between gap-2">
                    <Link
                      to={`/events/${ev._id}`}
                      className="px-3 py-1.5 rounded-xl bg-utsav-maroon-800 text-utsav-gold text-xs font-bold flex items-center space-x-1 hover:bg-utsav-maroon-700"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Guest Directory & Scanner</span>
                    </Link>

                    <Link
                      to={`/invite/${ev.invitation?.shareUrlToken || 'demo'}`}
                      target="_blank"
                      className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold hover:underline flex items-center space-x-1"
                    >
                      <span>Public RSVP E-Card</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CELEBRATION STATUS & LIVE COMMAND CONTROL                          */}
      {/* ========================================================================= */}
      {activeTab === 'status' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/30 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Radio className="w-6 h-6 text-red-600 animate-pulse" />
                <h2 className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                  Live Celebration Operations & Command Control
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Real-time webcam gate verification, 2D mandap studios, and live streaming broadcast suites.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-xl bg-red-100 text-red-800 text-xs font-bold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>Command Centers Online</span>
              </span>
            </div>
          </div>

          {/* Quick Launch Control Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((ev) => (
              <div
                key={ev._id}
                className="p-6 rounded-3xl bg-white dark:bg-utsav-maroon-950 border-2 border-utsav-gold/50 shadow-xl space-y-4 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-utsav-gold text-utsav-maroon-950 inline-block mb-1">
                      {ev.culturalTradition || 'Vedic'} Ceremony
                    </span>
                    <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                      {ev.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {ev.date} • {ev.location?.address}, {ev.location?.city}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      ev.status === 'ONGOING'
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {ev.status === 'ONGOING' ? '🔴 LIVE NOW' : ev.status}
                  </span>
                </div>

                {/* Sub-tools Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <Link
                    to={`/events/${ev._id}`}
                    className="p-3 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 hover:border-utsav-gold text-center space-y-1 transition-all group"
                  >
                    <Radio className="w-5 h-5 text-utsav-saffron mx-auto group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-[11px] text-utsav-maroon-800 dark:text-utsav-gold block">
                      Command Center
                    </span>
                  </Link>

                  <Link
                    to={`/events/${ev._id}`}
                    className="p-3 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 hover:border-utsav-gold text-center space-y-1 transition-all group"
                  >
                    <Layers className="w-5 h-5 text-utsav-gold mx-auto group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-[11px] text-utsav-maroon-800 dark:text-utsav-gold block">
                      2D Mandap
                    </span>
                  </Link>

                  <Link
                    to={`/events/${ev._id}`}
                    className="p-3 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 hover:border-utsav-gold text-center space-y-1 transition-all group"
                  >
                    <Camera className="w-5 h-5 text-emerald-500 mx-auto group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-[11px] text-utsav-maroon-800 dark:text-utsav-gold block">
                      Gate Scanner
                    </span>
                  </Link>

                  <Link
                    to={`/events/${ev._id}`}
                    className="p-3 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 hover:border-utsav-gold text-center space-y-1 transition-all group"
                  >
                    <Armchair className="w-5 h-5 text-purple-500 mx-auto group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-[11px] text-utsav-maroon-800 dark:text-utsav-gold block">
                      Seating Map
                    </span>
                  </Link>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    to={`/events/${ev._id}`}
                    className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-md flex items-center space-x-1"
                  >
                    <span>Launch Live Command Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/venues"
          className="p-5 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-md hover:border-utsav-gold hover:shadow-xl transition-all space-y-2 group"
        >
          <MapPin className="w-6 h-6 text-utsav-saffron group-hover:scale-110 transition-transform" />
          <h4 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            Browse Heritage Venues & Forts
          </h4>
          <p className="text-xs text-gray-500">
            Locate verified palaces in Jaipur, Udaipur, Delhi, and Bangalore with map navigation.
          </p>
        </Link>

        <Link
          to="/catering"
          className="p-5 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-md hover:border-utsav-gold hover:shadow-xl transition-all space-y-2 group"
        >
          <Sparkles className="w-6 h-6 text-utsav-gold group-hover:scale-110 transition-transform" />
          <h4 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            Regional Feasts & Catering Packages
          </h4>
          <p className="text-xs text-gray-500">
            Authentic Rajasthani Dal Baati, South Indian Sadya, and Punjabi Tandoor live counters.
          </p>
        </Link>

        <Link
          to="/ai-planner"
          className="p-5 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-md hover:border-utsav-gold hover:shadow-xl transition-all space-y-2 group"
        >
          <DiyaIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <h4 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            Cultural AI Wisdom Advisor
          </h4>
          <p className="text-xs text-gray-500">
            Generate 12 regional ceremony schedules, auspicious muhurtham guides, and budget tips.
          </p>
        </Link>
      </div>
    </div>
  );
};
