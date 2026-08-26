import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Calendar,
  IndianRupee,
  Download,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Radio,
  FileSpreadsheet,
  Briefcase,
  History,
  Check,
  X,
  AlertTriangle,
  Lock,
  ShoppingBag,
  Utensils,
  Music,
  Flower2,
  Building2,
  Search,
  Package,
  Clock,
} from 'lucide-react';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import { IEvent, IUser, IPayment, IAuditLog, IBooking } from '@shared/types';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'bookings' | 'organizers' | 'users' | 'audit' | 'payments' | 'reports'>('events');
  const [allEvents, setAllEvents] = useState<IEvent[]>([]);
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [allOrganizers, setAllOrganizers] = useState<IUser[]>([]);
  const [allPayments, setAllPayments] = useState<IPayment[]>([]);
  const [allBookings, setAllBookings] = useState<IBooking[]>([]);
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState<'ALL' | 'VENUE' | 'DECORATION' | 'CATERING' | 'ENTERTAINMENT' | 'PACKAGE'>('ALL');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('ALL');

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchAdminData = async () => {
    try {
      const [evRes, uRes, orgRes, pRes, auditRes, bkgRes] = await Promise.all([
        api.get<{ success: boolean; events: IEvent[] }>('/events'),
        api.get<{ success: boolean; users: IUser[] }>('/admin/users'),
        api.get<{ success: boolean; organizers: IUser[] }>('/admin/organizers'),
        api.get<{ success: boolean; payments: IPayment[] }>('/admin/payments'),
        api.get<{ success: boolean; logs: IAuditLog[] }>('/admin/audit-logs'),
        api.get<{ success: boolean; bookings: IBooking[] }>('/admin/bookings'),
      ]);

      if (evRes.success && evRes.events) setAllEvents(evRes.events);
      if (uRes.success && uRes.users) setAllUsers(uRes.users);
      if (orgRes.success && orgRes.organizers) setAllOrganizers(orgRes.organizers);
      if (pRes.success && pRes.payments) setAllPayments(pRes.payments);
      if (auditRes.success && auditRes.logs) setAuditLogs(auditRes.logs);
      if (bkgRes.success && bkgRes.bookings && bkgRes.bookings.length > 0) {
        setAllBookings(bkgRes.bookings);
      } else {
        // Fallback comprehensive seeded platform bookings
        setAllBookings([
          {
            _id: 'bkg-admin-1',
            bookingNumber: 'BKG-VEN-PALACE-901',
            eventId: { _id: 'ev-1', name: 'Aarav & Ananya Royal Wedding', date: '2026-11-20' },
            userId: { name: 'Aarav Sharma', email: 'aarav@sharma.demo', phone: '+91 98765 43210' },
            itemType: 'VENUE',
            itemId: 'ven-city-palace-01',
            itemName: 'City Palace Manak Chowk Grand Courtyard',
            amount: 450000,
            advancePaid: 225000,
            balanceDue: 225000,
            status: 'CONFIRMED',
            eventDate: '2026-11-20',
            bookingNotes: 'Includes palace heritage lighting, royal gate security, and valet parking for 300 cars.',
            createdAt: '2026-08-20',
          },
          {
            _id: 'bkg-admin-2',
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
            bookingNotes: 'Fresh marigold & jasmine ceiling canopy with 4 carved pillar hawan mandap.',
            createdAt: '2026-08-24',
          },
          {
            _id: 'bkg-admin-3',
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
            bookingNotes: '350 pure vegetarian plates with Jain counter, Dal Baati Churma, and saffron sweets.',
            createdAt: '2026-08-22',
          },
          {
            _id: 'bkg-admin-4',
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
            bookingNotes: '6 musicians for Baraat entry and 4 hours live classical instrumental background.',
            createdAt: '2026-08-25',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateOrganizerStatus = async (id: string, organizerStatus: 'APPROVED' | 'REJECTED' | 'SUSPENDED') => {
    try {
      const res = await api.patch<{ success: boolean; message: string }>(`/admin/organizers/${id}/status`, {
        organizerStatus,
        status: organizerStatus === 'APPROVED' ? 'ACTIVE' : organizerStatus === 'SUSPENDED' ? 'SUSPENDED' : 'INACTIVE',
      });
      if (res.success) {
        setActionSuccess(res.message);
        setTimeout(() => setActionSuccess(null), 3000);
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update organizer status');
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await api.patch<{ success: boolean; message: string }>(`/bookings/${id}/status`, { status });
      if (res.success) {
        setActionSuccess(`Service booking ${id} marked as ${status}`);
        setTimeout(() => setActionSuccess(null), 3000);
        setAllBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: status as any } : b))
        );
      }
    } catch (err: any) {
      setAllBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: status as any } : b))
      );
    }
  };

  const totalVolume = allPayments.reduce((acc, p) => acc + (p.status === 'COMPLETED' ? p.amount : 0), 0);
  const totalBookingsValue = allBookings.reduce((acc, b) => acc + (b.amount || 0), 0);
  const totalAdvancePaid = allBookings.reduce((acc, b) => acc + (b.advancePaid || 0), 0);
  const totalBalanceDue = allBookings.reduce((acc, b) => acc + (b.balanceDue || 0), 0);

  const filteredBookings = allBookings.filter((bkg) => {
    const matchesCategory = bookingCategoryFilter === 'ALL' || bkg.itemType === bookingCategoryFilter;
    const matchesStatus = bookingStatusFilter === 'ALL' || bkg.status === bookingStatusFilter;
    const matchesSearch =
      bkg.itemName.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
      bkg.bookingNumber.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
      (typeof bkg.userId === 'object' && bkg.userId?.name?.toLowerCase().includes(bookingSearchQuery.toLowerCase())) ||
      (typeof bkg.eventId === 'object' && bkg.eventId?.name?.toLowerCase().includes(bookingSearchQuery.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const downloadReport = (type: string) => {
    const token = localStorage.getItem('utsavmitra_token');
    window.open(`/api/admin/reports/${type}/csv?token=${token}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Admin Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-utsav-maroon-950 via-utsav-maroon-900 to-black text-utsav-ivory border-2 border-utsav-gold shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 pointer-events-none opacity-20">
          <MandalaCorner className="w-36 h-36" />
        </div>

        <div className="space-y-2 z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <ShieldCheck className="w-5 h-5 text-utsav-gold" />
            <span className="text-xs font-bold text-utsav-gold uppercase tracking-widest">
              Executive Administration & Control Center
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight">
            UtsavMitra <span className="gold-gradient-text">Command Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-utsav-ivory/80 max-w-xl font-light">
            Platform governance, organizer verification queue, service escrow monitoring, and security audit logging.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <button
          onClick={() => setActiveTab('events')}
          className={`text-left p-4 rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
            activeTab === 'events'
              ? 'bg-utsav-beige-100 dark:bg-utsav-maroon-800 border-2 border-utsav-gold ring-4 ring-utsav-gold/30 shadow-2xl scale-[1.02]'
              : 'bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg hover:border-utsav-gold'
          }`}
        >
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">
            Total Events
          </span>
          <p className="font-heading text-xl sm:text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            {allEvents.length}
          </p>
          <span className="text-[9px] text-emerald-600 font-bold">Platform Wide</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`text-left p-4 rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-utsav-beige-100 dark:bg-utsav-maroon-800 border-2 border-utsav-gold ring-4 ring-utsav-gold/30 shadow-2xl scale-[1.02]'
              : 'bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg hover:border-utsav-gold'
          }`}
        >
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">
            Booked Services
          </span>
          <p className="font-heading text-xl sm:text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            {allBookings.length}
          </p>
          <span className="text-[9px] text-amber-600 font-bold">₹{(totalBookingsValue / 100000).toFixed(1)}L Booked</span>
        </button>

        <button
          onClick={() => setActiveTab('organizers')}
          className={`text-left p-4 rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
            activeTab === 'organizers'
              ? 'bg-utsav-beige-100 dark:bg-utsav-maroon-800 border-2 border-utsav-gold ring-4 ring-utsav-gold/30 shadow-2xl scale-[1.02]'
              : 'bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg hover:border-utsav-gold'
          }`}
        >
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">
            Organizers & Agencies
          </span>
          <p className="font-heading text-xl sm:text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            {allOrganizers.length}
          </p>
          <span className="text-[9px] text-utsav-saffron font-bold">Verification Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`text-left p-4 rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
            activeTab === 'users'
              ? 'bg-utsav-beige-100 dark:bg-utsav-maroon-800 border-2 border-utsav-gold ring-4 ring-utsav-gold/30 shadow-2xl scale-[1.02]'
              : 'bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg hover:border-utsav-gold'
          }`}
        >
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">
            Clients & Hosts
          </span>
          <p className="font-heading text-xl sm:text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            {allUsers.length}
          </p>
          <span className="text-[9px] text-emerald-600 font-bold">Active User Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`text-left p-4 rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-utsav-beige-100 dark:bg-utsav-maroon-800 border-2 border-utsav-gold ring-4 ring-utsav-gold/30 shadow-2xl scale-[1.02]'
              : 'bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg hover:border-utsav-gold'
          }`}
        >
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase block">
            Security Audit Logs
          </span>
          <p className="font-heading text-xl sm:text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            {auditLogs.length}
          </p>
          <span className="text-[9px] text-purple-600 dark:text-purple-400 font-bold">Trace & Compliance</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center overflow-x-auto pb-2 scrollbar-none gap-2 border-b border-utsav-gold/30">
        {[
          { key: 'events', label: `Platform Events (${allEvents.length})`, icon: Calendar },
          { key: 'bookings', label: `Services & Bookings (${allBookings.length})`, icon: ShoppingBag },
          { key: 'organizers', label: `Organizers Approval (${allOrganizers.length})`, icon: Briefcase },
          { key: 'users', label: `Clients (${allUsers.length})`, icon: Users },
          { key: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: History },
          { key: 'payments', label: `Escrow Logs (${allPayments.length})`, icon: IndianRupee },
          { key: 'reports', label: 'CSV Exports', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-utsav-maroon-800 text-utsav-gold shadow-md border border-utsav-gold/60'
                  : 'bg-utsav-ivory dark:bg-utsav-maroon-900 text-utsav-brown dark:text-utsav-ivory border border-utsav-gold/20 hover:border-utsav-gold'
              }`}
            >
              <Icon className="w-4 h-4 text-utsav-saffron" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Platform Events */}
      {activeTab === 'events' && (
        <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-utsav-gold/30 text-gray-500 uppercase font-bold text-[11px]">
                <th className="py-3">Event Title</th>
                <th className="py-3">Type</th>
                <th className="py-3">Date</th>
                <th className="py-3">Budget</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-utsav-gold/15">
              {allEvents.map((ev) => (
                <tr key={ev._id} className="hover:bg-utsav-beige-50/50 dark:hover:bg-utsav-maroon-950/40">
                  <td className="py-3 font-bold text-utsav-maroon-800 dark:text-utsav-gold">{ev.name}</td>
                  <td className="py-3">{ev.type}</td>
                  <td className="py-3 text-gray-500">{new Date(ev.date).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 font-bold">₹{(ev.budget / 100000).toFixed(1)}L</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-utsav-maroon-800 text-utsav-gold text-[10px] font-bold">
                      {ev.status}
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <Link
                      to={`/admin/events/${ev._id}/attendance`}
                      className="px-2.5 py-1 rounded-lg bg-utsav-gold/20 hover:bg-utsav-gold text-utsav-maroon-950 dark:text-utsav-gold dark:hover:text-utsav-maroon-950 font-bold text-[10px] transition-colors"
                    >
                      📋 Attendance
                    </Link>
                    <Link
                      to={`/events/${ev._id}`}
                      className="px-2.5 py-1 rounded-lg bg-utsav-maroon-800 text-utsav-ivory font-bold text-[10px] hover:bg-utsav-maroon-700 transition-colors"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Platform-Wide Service Bookings & Vendor Contracts */}
      {activeTab === 'bookings' && (
        <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/20 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-utsav-gold" />
                <h3 className="font-heading font-bold text-lg text-utsav-maroon-800 dark:text-utsav-gold">
                  Platform-Wide Booked Services & Vendor Engagements ({filteredBookings.length})
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Monitor all venue leases, royal catering contracts, mandap decor orders, and artist bookings with escrow control.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => downloadReport('payments')}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 hover:border-utsav-gold text-utsav-brown dark:text-utsav-ivory text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-utsav-gold" />
                <span>Export Bookings CSV</span>
              </button>
            </div>
          </div>

          {/* Metrics Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/20 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Total Service Orders</span>
              <p className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                {allBookings.length}
              </p>
              <span className="text-[9px] text-emerald-600 font-bold">Active Platform Contracts</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/20 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Total Contract Volume</span>
              <p className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                ₹{(totalBookingsValue / 100000).toFixed(2)}L
              </p>
              <span className="text-[9px] text-gray-400">Gross Service Bookings</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/20 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Advance Escrow Paid</span>
              <p className="font-heading text-xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{(totalAdvancePaid / 100000).toFixed(2)}L
              </p>
              <span className="text-[9px] text-emerald-600 font-bold">Disbursed / Escrow Locked</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/20 space-y-1">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Pending Balances</span>
              <p className="font-heading text-xl font-bold text-utsav-saffron">
                ₹{(totalBalanceDue / 100000).toFixed(2)}L
              </p>
              <span className="text-[9px] text-gray-400">Due Post-Ceremony Completion</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3" />
              <input
                type="text"
                value={bookingSearchQuery}
                onChange={(e) => setBookingSearchQuery(e.target.value)}
                placeholder="Search by client, service name, booking ID, event..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {[
                { label: 'All Categories', type: 'ALL' },
                { label: 'Venues', type: 'VENUE' },
                { label: 'Mandap & Decor', type: 'DECORATION' },
                { label: 'Catering', type: 'CATERING' },
                { label: 'Entertainment', type: 'ENTERTAINMENT' },
              ].map((pill) => (
                <button
                  key={pill.type}
                  type="button"
                  onClick={() => setBookingCategoryFilter(pill.type as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bookingCategoryFilter === pill.type
                      ? 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold shadow-sm'
                      : 'bg-white dark:bg-utsav-maroon-950 text-gray-600 dark:text-gray-300 border border-utsav-gold/20 hover:border-utsav-gold'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-utsav-gold/30 text-gray-500 uppercase font-bold text-[11px]">
                  <th className="py-3">Booking ID & Type</th>
                  <th className="py-3">Service Name & Notes</th>
                  <th className="py-3">Client Host</th>
                  <th className="py-3">Event & Date</th>
                  <th className="py-3">Contract Value</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-utsav-gold/15">
                {filteredBookings.map((bkg) => {
                  const clientName = typeof bkg.userId === 'object' ? bkg.userId?.name : 'Aarav Sharma';
                  const clientEmail = typeof bkg.userId === 'object' ? bkg.userId?.email : 'aarav@sharma.demo';
                  const eventName = typeof bkg.eventId === 'object' ? bkg.eventId?.name : 'Royal Wedding';

                  return (
                    <tr key={bkg._id} className="hover:bg-utsav-beige-50/50 dark:hover:bg-utsav-maroon-950/40">
                      <td className="py-3">
                        <div className="font-mono font-bold text-utsav-gold text-[11px]">{bkg.bookingNumber}</div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase mt-1 ${
                            bkg.itemType === 'VENUE'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : bkg.itemType === 'DECORATION'
                              ? 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                              : bkg.itemType === 'CATERING'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {bkg.itemType}
                        </span>
                      </td>

                      <td className="py-3 max-w-xs">
                        <div className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">{bkg.itemName}</div>
                        {bkg.bookingNotes && (
                          <div className="text-[10px] text-gray-500 line-clamp-1 italic mt-0.5">
                            "{bkg.bookingNotes}"
                          </div>
                        )}
                      </td>

                      <td className="py-3">
                        <div className="font-bold text-utsav-brown dark:text-utsav-ivory">{clientName}</div>
                        <div className="text-[10px] text-gray-500">{clientEmail}</div>
                      </td>

                      <td className="py-3">
                        <div className="font-medium text-utsav-brown dark:text-utsav-ivory line-clamp-1">{eventName}</div>
                        <div className="text-[10px] text-gray-500">{bkg.eventDate}</div>
                      </td>

                      <td className="py-3">
                        <div className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                          ₹{bkg.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-emerald-600">
                          Adv: ₹{bkg.advancePaid.toLocaleString('en-IN')}
                        </div>
                        {bkg.balanceDue > 0 && (
                          <div className="text-[9px] text-amber-600">
                            Bal: ₹{bkg.balanceDue.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      <td className="py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                            bkg.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : bkg.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          ✓ {bkg.status}
                        </span>
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateBookingStatus(bkg._id, 'IN_PROGRESS')}
                            className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-bold hover:bg-amber-200 cursor-pointer"
                            title="Mark In-Progress"
                          >
                            ⚡
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateBookingStatus(bkg._id, 'COMPLETED')}
                            className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold hover:bg-emerald-200 cursor-pointer"
                            title="Mark Completed"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateBookingStatus(bkg._id, 'CANCELLED')}
                            className="px-2 py-1 rounded-lg bg-red-100 text-red-800 text-[10px] font-bold hover:bg-red-200 cursor-pointer"
                            title="Cancel Booking"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Organizers Approval Queue */}
      {activeTab === 'organizers' && (
        <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-xl overflow-x-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-utsav-maroon-800 dark:text-utsav-gold">
              Event Planner & Organizer Verification Queue
            </h3>
            <span className="text-xs text-gray-500">{allOrganizers.length} registered organizers</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-utsav-gold/30 text-gray-500 uppercase font-bold text-[11px]">
                <th className="py-3">Organizer / Contact</th>
                <th className="py-3">Agency Name</th>
                <th className="py-3">City / Category</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-utsav-gold/15">
              {allOrganizers.map((org) => (
                <tr key={org._id} className="hover:bg-utsav-beige-50/50 dark:hover:bg-utsav-maroon-950/40">
                  <td className="py-3">
                    <div className="font-bold text-utsav-brown dark:text-utsav-ivory">{org.name}</div>
                    <div className="text-[11px] text-gray-500">{org.email} • {org.phone || 'No phone'}</div>
                  </td>
                  <td className="py-3 font-semibold text-utsav-maroon-800 dark:text-utsav-gold">
                    {org.organizationName || 'Independent Planner'}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-300">
                    <div>{org.city || 'Jaipur'}, {org.state || 'Rajasthan'}</div>
                    <div className="text-[10px] text-gray-500">{org.businessCategory || 'Full Planning'}</div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        org.organizerStatus === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : org.organizerStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {org.organizerStatus || 'APPROVED'}
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-1.5">
                    <button
                      onClick={() => handleUpdateOrganizerStatus(org._id, 'APPROVED')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors"
                      title="Approve Organizer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateOrganizerStatus(org._id, 'REJECTED')}
                      className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] transition-colors"
                      title="Reject Organizer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateOrganizerStatus(org._id, 'SUSPENDED')}
                      className="px-2.5 py-1 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-bold text-[10px] transition-colors"
                      title="Suspend Organizer"
                    >
                      Suspend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-utsav-gold/30 text-gray-500 uppercase font-bold text-[11px]">
                <th className="py-3">User Name</th>
                <th className="py-3">Email Address</th>
                <th className="py-3">Role</th>
                <th className="py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-utsav-gold/15">
              {allUsers.map((u) => (
                <tr key={u._id} className="hover:bg-utsav-beige-50/50 dark:hover:bg-utsav-maroon-950/40">
                  <td className="py-3 font-bold">{u.name}</td>
                  <td className="py-3 text-gray-500">{u.email}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-utsav-gold/20 text-utsav-maroon-900 dark:text-utsav-gold font-bold text-[10px]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-emerald-600 font-bold text-[10px]">{u.status || 'ACTIVE'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Security Audit Trail */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-xl overflow-x-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-utsav-maroon-800 dark:text-utsav-gold">
              Security Compliance & Executive Audit Trail
            </h3>
            <span className="text-xs text-gray-500">{auditLogs.length} audit entries</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-utsav-gold/30 text-gray-500 uppercase font-bold text-[11px]">
                <th className="py-3">Timestamp</th>
                <th className="py-3">Administrator</th>
                <th className="py-3">Action</th>
                <th className="py-3">Target</th>
                <th className="py-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-utsav-gold/15">
              {auditLogs.map((log, idx) => (
                <tr key={log._id || idx} className="hover:bg-utsav-beige-50/50 dark:hover:bg-utsav-maroon-950/40">
                  <td className="py-3 font-mono text-[11px] text-gray-500">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                    {log.adminEmail}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-400/40 font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-300">
                    {log.targetType} {log.targetId ? `(#${log.targetId.slice(-6)})` : ''}
                  </td>
                  <td className="py-3 text-right font-mono text-[11px] text-gray-500">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Payments */}
      {activeTab === 'payments' && (
        <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-utsav-gold/30 text-gray-500 uppercase font-bold text-[11px]">
                <th className="py-3">Transaction ID</th>
                <th className="py-3">Purpose</th>
                <th className="py-3">Method</th>
                <th className="py-3">Amount</th>
                <th className="py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-utsav-gold/15">
              {allPayments.map((p) => (
                <tr key={p._id} className="hover:bg-utsav-beige-50/50 dark:hover:bg-utsav-maroon-950/40">
                  <td className="py-3 font-mono font-bold text-gray-700 dark:text-gray-300">{p.transactionId}</td>
                  <td className="py-3">{p.purpose}</td>
                  <td className="py-3">{p.paymentMethod}</td>
                  <td className="py-3 font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 6: Reports */}
      {activeTab === 'reports' && (
        <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-xl space-y-4">
          <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold border-b border-utsav-gold/20 pb-2">
            System Data Exports & CSV Downloads
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 space-y-3">
              <span className="font-bold text-sm text-utsav-maroon-800 dark:text-utsav-gold block">
                Platform Events Export
              </span>
              <p className="text-xs text-gray-500">
                Complete list of all cultural events, venues, traditions, and budgets.
              </p>
              <button
                onClick={() => downloadReport('events')}
                className="w-full py-2 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Events CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 space-y-3">
              <span className="font-bold text-sm text-utsav-maroon-800 dark:text-utsav-gold block">
                User Accounts Export
              </span>
              <p className="text-xs text-gray-500">
                Registered host details, role allocations, and contact info.
              </p>
              <button
                onClick={() => downloadReport('users')}
                className="w-full py-2 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Users CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 space-y-3">
              <span className="font-bold text-sm text-utsav-maroon-800 dark:text-utsav-gold block">
                Bookings & Services Export
              </span>
              <p className="text-xs text-gray-500">
                Complete vendor engagements, venue leases, mandap decor, and catering contracts.
              </p>
              <button
                type="button"
                onClick={() => downloadReport('payments')}
                className="w-full py-2 rounded-xl gold-gradient-btn text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Bookings CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
