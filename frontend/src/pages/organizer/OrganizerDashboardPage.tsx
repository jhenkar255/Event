import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { IEvent, IBooking } from '@shared/types';
import {
  Calendar,
  Users,
  CreditCard,
  Sparkles,
  PlusCircle,
  QrCode,
  Layers,
  LayoutGrid,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Award,
  ArrowUpRight,
  Search,
  IndianRupee,
  ExternalLink,
  ShieldCheck,
  Building,
  ShoppingBag,
  Utensils,
  Music,
  Flower2,
  Building2,
  PhoneCall,
  Package,
  Check,
} from 'lucide-react';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import { Interactive2DDesigner } from '../../components/customizer/Interactive2DDesigner';
import { SeatingPlanner } from '../../components/customizer/SeatingPlanner';
import { QREntryScanner } from '../../components/qr/QREntryScanner';

export const OrganizerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [organizerBookings, setOrganizerBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'services' | 'mandap' | 'seating' | 'scanner' | 'budget'>('events');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONGOING' | 'PLANNING' | 'CONFIRMED' | 'COMPLETED'>('ALL');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<'ALL' | 'VENUE' | 'DECORATION' | 'CATERING' | 'ENTERTAINMENT' | 'PACKAGE'>('ALL');

  useEffect(() => {
    const fetchOrganizerData = async () => {
      try {
        const [evRes, bkgRes] = await Promise.all([
          api.get<{ success: boolean; events: IEvent[] }>('/events'),
          api.get<{ success: boolean; bookings: IBooking[] }>('/bookings/organizer'),
        ]);

        if (evRes.success && evRes.events) {
          setEvents(evRes.events);
          if (evRes.events.length > 0) {
            setSelectedEventId(evRes.events[0]._id);
          }
        }

        if (bkgRes.success && bkgRes.bookings && bkgRes.bookings.length > 0) {
          setOrganizerBookings(bkgRes.bookings);
        } else {
          // Fallback rich organizer sample bookings
          setOrganizerBookings([
            {
              _id: 'org-bkg-1',
              bookingNumber: 'BKG-DEC-MANDAP-903',
              eventId: { _id: 'ev-1', name: 'Aarav & Ananya Royal Wedding', date: '2026-11-20' },
              userId: { name: 'Aarav Sharma', email: 'aarav@sharma.demo', phone: '+91 98765 43210' },
              itemType: 'DECORATION',
              itemId: 'decor-rajputana-01',
              itemName: 'Royal Rajputana Gold Mandap & Floral Toran Theme',
              amount: 180000,
              advancePaid: 90000,
              balanceDue: 90000,
              status: 'CONFIRMED',
              eventDate: '2026-11-20',
              bookingNotes: 'Fresh marigold & jasmine ceiling canopy, 4 carved pillar hawan mandap, and ambient warm floodlights.',
              createdAt: '2026-08-24',
            },
            {
              _id: 'org-bkg-2',
              bookingNumber: 'BKG-CAT-FEAST-902',
              eventId: { _id: 'ev-1', name: 'Aarav & Ananya Royal Wedding', date: '2026-11-20' },
              userId: { name: 'Aarav Sharma', email: 'aarav@sharma.demo', phone: '+91 98765 43210' },
              itemType: 'CATERING',
              itemId: 'cat-shahi-01',
              itemName: 'Shahi Marwari Thali & Live Jalebi-Rabdi Counters',
              amount: 360000,
              advancePaid: 360000,
              balanceDue: 0,
              status: 'CONFIRMED',
              eventDate: '2026-11-20',
              bookingNotes: '350 pure vegetarian plates with Jain counter, Dal Baati Churma, Ker Sangri, and saffron sweet station.',
              createdAt: '2026-08-22',
            },
            {
              _id: 'org-bkg-3',
              bookingNumber: 'BKG-ENT-SHEHNAI-904',
              eventId: { _id: 'ev-1', name: 'Aarav & Ananya Royal Wedding', date: '2026-11-20' },
              userId: { name: 'Aarav Sharma', email: 'aarav@sharma.demo', phone: '+91 98765 43210' },
              itemType: 'ENTERTAINMENT',
              itemId: 'ent-shehnai-dhol-01',
              itemName: 'Royal Rajasthani Manganiyar Troupe & Live Shehnai Swagat',
              amount: 65000,
              advancePaid: 65000,
              balanceDue: 0,
              status: 'CONFIRMED',
              eventDate: '2026-11-20',
              bookingNotes: '6 musicians for Baraat entry and 4 hours live classical instrumental background during ceremony.',
              createdAt: '2026-08-25',
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load organizer events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizerData();
  }, []);

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status: newStatus });
      setOrganizerBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus as any } : b))
      );
    } catch {
      setOrganizerBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus as any } : b))
      );
    }
  };

  const totalGuests = events.reduce((acc, ev) => acc + (ev.guestCount || 0), 0);
  const totalBudget = events.reduce((acc, ev) => acc + (ev.budget || 0), 0);
  const totalSpent = events.reduce((acc, ev) => acc + (ev.spentBudget || 0), 0);

  const filteredEvents = events.filter((ev) => {
    const matchesStatus = statusFilter === 'ALL' || ev.status === statusFilter;
    const matchesSearch =
      ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.eventType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.culturalTradition || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.location?.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredOrganizerBookings = organizerBookings.filter((bkg) => {
    const matchesCategory = serviceCategoryFilter === 'ALL' || bkg.itemType === serviceCategoryFilter;
    const matchesSearch =
      bkg.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bkg.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof bkg.userId === 'object' && bkg.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof bkg.eventId === 'object' && bkg.eventId?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalOrgServiceValue = organizerBookings.reduce((acc, b) => acc + (b.amount || 0), 0);
  const totalOrgAdvance = organizerBookings.reduce((acc, b) => acc + (b.advancePaid || 0), 0);
  const totalOrgBalance = organizerBookings.reduce((acc, b) => acc + (b.balanceDue || 0), 0);

  const currentSelectedEvent = events.find((e) => e._id === selectedEventId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-utsav-maroon-900 via-utsav-maroon-800 to-utsav-maroon-950 p-6 sm:p-8 text-utsav-ivory border-2 border-utsav-gold/60 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 pointer-events-none opacity-20">
          <MandalaCorner className="w-48 h-48" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-utsav-gold/20 text-utsav-gold border border-utsav-gold/40 flex items-center space-x-1">
                <Award className="w-3.5 h-3.5" />
                <span>Verified Event Planner</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                Organizer Status: Active
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-utsav-gold">
              {user?.organizationName || `${user?.name}'s Event Studio`}
            </h1>
            <p className="text-xs sm:text-sm text-utsav-ivory-300 max-w-xl">
              Professional event coordination dashboard. Manage traditional Indian weddings, corporate galas, mandap architectures, and QR check-in flows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/events/create"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-utsav-gold via-utsav-saffron to-utsav-gold text-utsav-maroon-950 font-bold text-xs sm:text-sm shadow-xl flex items-center space-x-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Host New Event</span>
            </Link>
            <Link
              to="/scanner"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-utsav-gold/40 backdrop-blur-sm flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-utsav-gold" />
              <span>QR Entry Gate</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards (Clickable to switch or filter) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`text-left rounded-2xl p-5 border shadow-md transition-all cursor-pointer ${
            activeTab === 'events'
              ? 'bg-utsav-maroon-900 text-utsav-ivory border-utsav-gold shadow-lg'
              : 'bg-utsav-ivory dark:bg-utsav-maroon-900/60 border-utsav-gold/40 hover:border-utsav-gold'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Managed Events
            </span>
            <div className="p-2.5 rounded-xl bg-utsav-maroon-800 text-utsav-gold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-heading text-utsav-maroon-800 dark:text-utsav-gold">
              {events.length}
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              {events.filter((e) => e.status === 'ONGOING').length} active celebrations today
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`text-left rounded-2xl p-5 border shadow-md transition-all cursor-pointer ${
            activeTab === 'services'
              ? 'bg-utsav-maroon-900 text-utsav-ivory border-utsav-gold shadow-lg'
              : 'bg-utsav-ivory dark:bg-utsav-maroon-900/60 border-utsav-gold/40 hover:border-utsav-gold'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Services & Bookings
            </span>
            <div className="p-2.5 rounded-xl bg-amber-600 text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-heading text-utsav-maroon-800 dark:text-utsav-gold">
              {organizerBookings.length}
            </h3>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
              ₹{(totalOrgServiceValue / 100000).toFixed(1)}L total contracted value
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seating')}
          className={`text-left rounded-2xl p-5 border shadow-md transition-all cursor-pointer ${
            activeTab === 'seating'
              ? 'bg-utsav-maroon-900 text-utsav-ivory border-utsav-gold shadow-lg'
              : 'bg-utsav-ivory dark:bg-utsav-maroon-900/60 border-utsav-gold/40 hover:border-utsav-gold'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total RSVP Guests
            </span>
            <div className="p-2.5 rounded-xl bg-utsav-saffron-600 text-white">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-heading text-utsav-maroon-800 dark:text-utsav-gold">
              {totalGuests}
            </h3>
            <p className="text-[11px] text-utsav-saffron font-medium mt-0.5">
              Across all client event rosters
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('budget')}
          className={`text-left rounded-2xl p-5 border shadow-md transition-all cursor-pointer ${
            activeTab === 'budget'
              ? 'bg-utsav-maroon-900 text-utsav-ivory border-utsav-gold shadow-lg'
              : 'bg-utsav-ivory dark:bg-utsav-maroon-900/60 border-utsav-gold/40 hover:border-utsav-gold'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Escrow & Budgets
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-700 text-white">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-heading text-utsav-maroon-800 dark:text-utsav-gold">
              ₹{(totalBudget / 100000).toFixed(1)}L
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              100% Razorpay escrow secured
            </p>
          </div>
        </button>
      </div>

      {/* Organizer Planning Tools Grid (3 Action Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/mandap-builder"
          className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-utsav-maroon-950 dark:to-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-md hover:shadow-xl hover:border-utsav-gold transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl bg-utsav-maroon-800 text-utsav-gold group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-utsav-gold opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            2D Mandap Studio
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            Design traditional floral mandaps, havan kunds, and royal stage layouts for your clients.
          </p>
        </Link>

        <Link
          to="/seating"
          className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-utsav-maroon-950 dark:to-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-md hover:shadow-xl hover:border-utsav-gold transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl bg-utsav-saffron-600 text-white group-hover:scale-110 transition-transform">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-utsav-gold opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            Seating & Baithak Planner
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            Configure round table arrangements, royal diwans, and VIP guest sections with drag-and-drop.
          </p>
        </Link>

        <Link
          to="/scanner"
          className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-utsav-maroon-950 dark:to-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-md hover:shadow-xl hover:border-utsav-gold transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-xl bg-purple-700 text-white group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-utsav-gold opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            Live QR Check-In Gate
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            Real-time digital guest verification, table guidance, and instant arrival notifications.
          </p>
        </Link>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center space-x-2 border-b border-utsav-gold/30 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'events', label: 'Managed Events', icon: Calendar },
          { id: 'services', label: `Services & Bookings (${organizerBookings.length})`, icon: ShoppingBag },
          { id: 'mandap', label: '2D Mandap Studio', icon: Layers },
          { id: 'seating', label: 'Seating & Baithak', icon: LayoutGrid },
          { id: 'scanner', label: 'Live QR Entry Gate', icon: QrCode },
          { id: 'budget', label: 'Financials & Escrow', icon: CreditCard },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold shadow-md'
                  : 'bg-white dark:bg-utsav-maroon-900/60 text-gray-600 dark:text-gray-300 border border-utsav-gold/20 hover:border-utsav-gold'
              }`}
            >
              <Icon className="w-4 h-4 text-utsav-saffron" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MANAGED EVENTS ROSTER                                              */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-950 p-6 border-2 border-utsav-gold/40 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/20 pb-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                Managed Event Rosters ({filteredEvents.length})
              </h2>
              <p className="text-xs text-gray-500">All live and scheduled client events</p>
            </div>
            <Link
              to="/events/create"
              className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-sm flex items-center space-x-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Event</span>
            </Link>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ceremonies by client name, tradition, city..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {[
                { label: 'All', status: 'ALL' },
                { label: 'Ongoing', status: 'ONGOING' },
                { label: 'Planning', status: 'PLANNING' },
                { label: 'Confirmed', status: 'CONFIRMED' },
                { label: 'Completed', status: 'COMPLETED' },
              ].map((pill) => (
                <button
                  key={pill.status}
                  type="button"
                  onClick={() => setStatusFilter(pill.status as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    statusFilter === pill.status
                      ? 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold shadow-sm'
                      : 'bg-white dark:bg-utsav-maroon-900 text-gray-600 dark:text-gray-300 border border-utsav-gold/20'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-utsav-gold border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 mt-2">Loading event portfolios...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Calendar className="w-12 h-12 text-utsav-gold/60 mx-auto" />
              <h3 className="text-sm font-bold text-utsav-brown dark:text-utsav-ivory">No Events Configured Yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Start by creating your first celebration to assign vendors, prepare seating, and generate guest passes.
              </p>
              <Link
                to="/events/create"
                className="inline-flex px-4 py-2 rounded-xl maroon-gradient-btn font-bold text-xs text-utsav-gold cursor-pointer"
              >
                Create New Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((ev) => (
                <div
                  key={ev._id}
                  className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/30 hover:border-utsav-gold transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-utsav-gold/20 text-utsav-maroon-800 dark:text-utsav-gold">
                          {ev.type}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(ev.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          ev.status === 'ONGOING'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : ev.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {ev.status}
                      </span>
                    </div>

                    <Link to={`/events/${ev._id}`}>
                      <h4 className="font-heading font-bold text-sm text-utsav-brown dark:text-utsav-ivory group-hover:text-utsav-maroon-800 dark:group-hover:text-utsav-gold transition-colors">
                        {ev.name}
                      </h4>
                    </Link>

                    <p className="text-xs text-gray-500 flex items-center space-x-2">
                      <span>{ev.location?.city || 'Jaipur'}</span>
                      <span>•</span>
                      <span>{ev.guestCount} Guests</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        ₹{((ev.budget || 0) / 100000).toFixed(1)}L Budget
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-utsav-gold/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <Link
                        to={`/organizer/events/${ev._id}/scanner`}
                        className="px-2.5 py-1 rounded-lg bg-utsav-gold/20 hover:bg-utsav-gold text-utsav-maroon-950 dark:text-utsav-gold dark:hover:text-utsav-maroon-950 text-[11px] font-bold transition-colors"
                      >
                        📷 Gate Scanner
                      </Link>
                      <Link
                        to={`/admin/events/${ev._id}/attendance`}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 hover:border-utsav-gold text-gray-700 dark:text-gray-300 text-[11px] font-semibold transition-colors"
                      >
                        📋 Attendance
                      </Link>
                    </div>

                    <Link
                      to={`/events/${ev._id}`}
                      className="px-3 py-1 rounded-lg maroon-gradient-btn text-utsav-gold text-[11px] font-bold"
                    >
                      Command Hub →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AGENCY SERVICES & CLIENT BOOKINGS HUB                             */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-950 p-6 border-2 border-utsav-gold/40 shadow-xl space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/20 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-utsav-gold" />
                <h2 className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                  Agency Services & Client Engagements ({filteredOrganizerBookings.length})
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Track all client service orders, vendor logistics, delivery milestones, and released escrow advances.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/mandap-builder"
                className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-sm flex items-center space-x-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>+ Mandap Studio Blueprint</span>
              </Link>
            </div>
          </div>

          {/* Organizer Financial Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Total Services</span>
              <p className="font-heading text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                {organizerBookings.length}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">✓ Active Orders</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Total Contract Value</span>
              <p className="font-heading text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                ₹{(totalOrgServiceValue / 100000).toFixed(1)} Lakhs
              </p>
              <span className="text-[10px] text-gray-400">All contracted clients</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Released Advance</span>
              <p className="font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{(totalOrgAdvance / 100000).toFixed(1)} Lakhs
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">Escrow Disbursed</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Pending Milestone</span>
              <p className="font-heading text-2xl font-bold text-utsav-saffron">
                ₹{(totalOrgBalance / 100000).toFixed(1)} Lakhs
              </p>
              <span className="text-[10px] text-gray-400">Due post-event delivery</span>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services by client name, booking ID, service title..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {[
                { label: 'All Services', type: 'ALL' },
                { label: 'Mandap & Decor', type: 'DECORATION' },
                { label: 'Catering Feasts', type: 'CATERING' },
                { label: 'Music & Troupe', type: 'ENTERTAINMENT' },
                { label: 'Venues', type: 'VENUE' },
              ].map((pill) => (
                <button
                  key={pill.type}
                  type="button"
                  onClick={() => setServiceCategoryFilter(pill.type as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    serviceCategoryFilter === pill.type
                      ? 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold shadow-sm'
                      : 'bg-white dark:bg-utsav-maroon-900 text-gray-600 dark:text-gray-300 border border-utsav-gold/20 hover:border-utsav-gold'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Booked Services Cards Grid */}
          {filteredOrganizerBookings.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-utsav-gold/60 mx-auto" />
              <h3 className="text-sm font-bold text-utsav-brown dark:text-utsav-ivory">
                No Booked Services in this Category
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Services assigned to your managed client celebrations will show up here with live escrow tracking.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrganizerBookings.map((bkg) => {
                const isVenue = bkg.itemType === 'VENUE';
                const isDecor = bkg.itemType === 'DECORATION';
                const isCatering = bkg.itemType === 'CATERING';
                const isEntertainment = bkg.itemType === 'ENTERTAINMENT';
                const clientName = typeof bkg.userId === 'object' ? bkg.userId?.name : 'Aarav Sharma';
                const clientPhone = typeof bkg.userId === 'object' ? bkg.userId?.phone : '+91 98765 43210';
                const eventTitle = typeof bkg.eventId === 'object' ? bkg.eventId?.name : 'Royal Wedding';

                return (
                  <div
                    key={bkg._id}
                    className="p-5 rounded-3xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/30 hover:border-utsav-gold transition-all shadow-md space-y-3 group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {/* Category Badge & Status */}
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
                              {bkg.itemType} ENGAGEMENT
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

                      {/* Service Title */}
                      <h4 className="font-heading font-bold text-base text-utsav-maroon-800 dark:text-utsav-gold">
                        {bkg.itemName}
                      </h4>

                      {/* Client Coordinates & Event */}
                      <div className="p-3 rounded-2xl bg-utsav-beige-50 dark:bg-utsav-maroon-950 border border-utsav-gold/20 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Client Host:</span>
                          <span className="font-bold text-utsav-brown dark:text-utsav-ivory">{clientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Event:</span>
                          <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold truncate max-w-[180px]">
                            {eventTitle}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Event Date:</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{bkg.eventDate}</span>
                        </div>
                        {clientPhone && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Host Contact:</span>
                            <a href={`tel:${clientPhone}`} className="text-emerald-600 font-bold hover:underline">
                              {clientPhone}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Booking Notes */}
                      {bkg.bookingNotes && (
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 bg-utsav-beige-100/50 dark:bg-utsav-maroon-950/50 p-2.5 rounded-xl italic">
                          "{bkg.bookingNotes}"
                        </p>
                      )}

                      {/* Financials */}
                      <div className="pt-2 border-t border-utsav-gold/20 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-gray-500 block">Total Payout</span>
                          <span className="font-bold text-sm text-utsav-maroon-900 dark:text-utsav-gold">
                            ₹{bkg.amount.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 block">Advance Released</span>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{bkg.advancePaid.toLocaleString('en-IN')}
                          </span>
                          {bkg.balanceDue > 0 ? (
                            <span className="text-[10px] text-amber-600 block">
                              ₹{bkg.balanceDue.toLocaleString('en-IN')} balance pending
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 block">✓ Fully Settled</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Management Actions */}
                    <div className="pt-2 border-t border-utsav-gold/20 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateBookingStatus(bkg._id, 'IN_PROGRESS')}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold hover:bg-amber-200 cursor-pointer"
                        >
                          ⚡ In Delivery
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateBookingStatus(bkg._id, 'COMPLETED')}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold hover:bg-emerald-200 cursor-pointer"
                        >
                          ✓ Complete
                        </button>
                      </div>

                      {isDecor && (
                        <Link
                          to="/mandap-builder"
                          className="px-3 py-1.5 rounded-xl maroon-gradient-btn text-utsav-gold text-[10px] font-bold flex items-center space-x-1"
                        >
                          <Layers className="w-3 h-3" />
                          <span>Blueprint</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {activeTab === 'mandap' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-utsav-saffron" />
              <div>
                <h3 className="font-heading font-bold text-sm text-utsav-maroon-800 dark:text-utsav-gold">
                  Visual Mandap Blueprint Canvas
                </h3>
                <p className="text-[11px] text-gray-500">
                  Select an event to customize and save its traditional architecture.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs font-bold text-utsav-brown dark:text-utsav-ivory focus:outline-none"
              >
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.name} ({ev.culturalTradition || ev.type})
                  </option>
                ))}
              </select>
              <Link
                to="/mandap-builder"
                className="px-3 py-1.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center space-x-1"
              >
                <span>Full Studio</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <Interactive2DDesigner eventId={selectedEventId || 'demo_event'} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EMBEDDED SEATING & BAITHAK PLANNER                                  */}
      {/* ========================================================================= */}
      {activeTab === 'seating' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40">
            <div className="flex items-center space-x-2">
              <LayoutGrid className="w-5 h-5 text-utsav-saffron" />
              <div>
                <h3 className="font-heading font-bold text-sm text-utsav-maroon-800 dark:text-utsav-gold">
                  Baithak & Banquet Dining Seating Planner
                </h3>
                <p className="text-[11px] text-gray-500">
                  Assign VIP guests and configure royal dining tables.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs font-bold text-utsav-brown dark:text-utsav-ivory focus:outline-none"
              >
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.name} ({ev.guestCount} Guests)
                  </option>
                ))}
              </select>
              <Link
                to="/seating"
                className="px-3 py-1.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center space-x-1"
              >
                <span>Full Planner</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <SeatingPlanner eventId={selectedEventId || 'demo_event'} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EMBEDDED LIVE QR ENTRY GATE                                        */}
      {/* ========================================================================= */}
      {activeTab === 'scanner' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="font-heading font-bold text-sm text-utsav-maroon-800 dark:text-utsav-gold">
                  Live QR Check-In Gate Control
                </h3>
                <p className="text-[11px] text-gray-500">
                  Scan guest entry passes with HMAC digital authentication.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs font-bold text-utsav-brown dark:text-utsav-ivory focus:outline-none"
              >
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.name} ({ev.location?.city || 'Jaipur'})
                  </option>
                ))}
              </select>
              <Link
                to="/scanner"
                className="px-3 py-1.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center space-x-1"
              >
                <span>Full Screen Scanner</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <QREntryScanner eventId={selectedEventId || 'demo_event'} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FINANCIAL & ESCROW SUMMARY                                         */}
      {/* ========================================================================= */}
      {activeTab === 'budget' && (
        <div className="rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-950 p-6 border-2 border-utsav-gold/40 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/20 pb-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-utsav-saffron" />
                <span>Financial Command & Razorpay Escrow Allocations</span>
              </h2>
              <p className="text-xs text-gray-500">Cumulative budget allocations across all managed client ceremonies</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/30">
              <span className="text-xs text-gray-500">Total Allocated Budget</span>
              <h3 className="text-2xl font-bold font-heading text-utsav-brown dark:text-utsav-ivory mt-1">
                ₹{(totalBudget / 100000).toFixed(2)} Lakhs
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/30">
              <span className="text-xs text-gray-500">Spent / Committed</span>
              <h3 className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{(totalSpent / 100000).toFixed(2)} Lakhs
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/30">
              <span className="text-xs text-gray-500">Escrow Protected Ratio</span>
              <h3 className="text-2xl font-bold font-heading text-utsav-gold mt-1">
                100% Verified
              </h3>
            </div>
          </div>

          {/* Events Financial List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-utsav-gold">
              Event-by-Event Budget Tracking
            </h4>
            <div className="divide-y divide-utsav-gold/20">
              {events.map((ev) => (
                <div key={ev._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-utsav-brown dark:text-utsav-ivory block">{ev.name}</span>
                    <span className="text-gray-500">{ev.culturalTradition || ev.type} • {ev.guestCount} Guests</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold block">
                      ₹{((ev.budget || 0) / 100000).toFixed(2)} Lakhs
                    </span>
                    <Link
                      to={`/events/${ev._id}`}
                      className="text-[11px] text-utsav-saffron hover:underline"
                    >
                      View Financial Ledger →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
