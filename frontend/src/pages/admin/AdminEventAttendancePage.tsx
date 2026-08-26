import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import {
  Users,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  Search,
  Filter,
  Shield,
  ArrowLeft,
  DoorOpen,
  UserCheck,
  Calendar,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminEventAttendancePage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, isAdmin, isOrganizer } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN' | 'PENDING' | 'DECLINED'>('ALL');
  const [isExporting, setIsExporting] = useState(false);

  const loadData = async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const [eventRes, attRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/attendance`),
      ]);

      if (eventRes.success) setEvent(eventRes.event);
      if (attRes.success) {
        setSummary(attRes.summary);
        setGuests(attRes.guests || []);
        setCheckIns(attRes.checkIns || []);
      }
    } catch (err: any) {
      console.error('Could not load attendance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const handleExportCSV = async () => {
    if (!eventId) return;
    setIsExporting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/events/${eventId}/attendance/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to export CSV');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Attendance_${(event?.name || 'event').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert('Could not export attendance CSV: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered Guests Logic
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone?.includes(searchQuery) ||
      g.group?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.assignedTable?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'CHECKED_IN') return g.checkInStatus === true;
    if (activeFilter === 'NOT_CHECKED_IN') return !g.checkInStatus && g.rsvpStatus !== 'DECLINED';
    if (activeFilter === 'PENDING') return g.rsvpStatus === 'PENDING' || g.rsvpStatus === 'TENTATIVE';
    if (activeFilter === 'DECLINED') return g.rsvpStatus === 'DECLINED';

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-utsav-gold/30">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 text-utsav-brown dark:text-utsav-ivory hover:border-utsav-gold"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-utsav-maroon-800 text-utsav-gold">
                ADMIN AUDIT
              </span>
              <span className="text-xs text-gray-500">{event?.culturalTradition} Tradition</span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-utsav-maroon-900 dark:text-utsav-gold">
              {event?.name || 'Event Attendance & Gate Audit Log'}
            </h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 text-utsav-gold hover:border-utsav-gold"
            title="Refresh Attendance"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold text-utsav-brown-950 shadow hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold border border-utsav-gold/40 shadow hover:scale-105 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Total Guest Capacity</span>
          <p className="font-heading text-2xl font-bold text-utsav-maroon-900 dark:text-utsav-gold">
            {summary?.totalGuests || guests.length || 0}
          </p>
          <span className="text-[11px] text-gray-400">Registered on guest list</span>
        </div>

        <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Confirmed RSVPs</span>
          <p className="font-heading text-2xl font-bold text-blue-600 dark:text-blue-400">
            {summary?.confirmedGuests || 0}
          </p>
          <span className="text-[11px] text-blue-500 font-medium">Accepted invitations</span>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 shadow space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
            Gate Verified
          </span>
          <p className="font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary?.checkedIn || 0}
          </p>
          <span className="text-[11px] text-emerald-600 font-bold">{summary?.attendanceRate || 0}% Entry Rate</span>
        </div>

        <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Remaining Arrivals</span>
          <p className="font-heading text-2xl font-bold text-utsav-saffron">
            {summary?.notCheckedIn || 0}
          </p>
          <span className="text-[11px] text-gray-400">Awaiting gate entry</span>
        </div>

        <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Declined / Tentative</span>
          <p className="font-heading text-2xl font-bold text-red-500">
            {(summary?.declined || 0) + (summary?.pending || 0)}
          </p>
          <span className="text-[11px] text-red-400 font-medium">Declined or no response</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guest by name, phone, table..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold"
            />
          </div>

          {/* Filter Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'ALL', label: `All (${guests.length})` },
              { key: 'CHECKED_IN', label: `Checked In (${summary?.checkedIn || 0})` },
              { key: 'NOT_CHECKED_IN', label: `Remaining (${summary?.notCheckedIn || 0})` },
              { key: 'PENDING', label: `Pending (${summary?.pending || 0})` },
              { key: 'DECLINED', label: `Declined (${summary?.declined || 0})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === f.key
                    ? 'maroon-gradient-btn text-utsav-gold shadow'
                    : 'bg-white dark:bg-utsav-maroon-950 text-gray-600 dark:text-gray-300 border border-utsav-gold/20 hover:border-utsav-gold'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Attendance Audit Table */}
        <div className="overflow-x-auto rounded-2xl border border-utsav-gold/20">
          <table className="w-full text-left text-xs">
            <thead className="bg-utsav-beige-100 dark:bg-utsav-maroon-950/80 text-utsav-maroon-900 dark:text-utsav-gold font-bold uppercase tracking-wider border-b border-utsav-gold/20">
              <tr>
                <th className="p-3.5">Guest & Relationship</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">RSVP Status</th>
                <th className="p-3.5">Gate Status</th>
                <th className="p-3.5">Check-In Time</th>
                <th className="p-3.5">Assigned Seating</th>
                <th className="p-3.5">Feast / Meal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-utsav-gold/10">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No guest records matching current filter.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((g) => (
                  <tr
                    key={g._id}
                    className="hover:bg-utsav-beige-50 dark:hover:bg-utsav-maroon-950/50 transition-colors"
                  >
                    <td className="p-3.5">
                      <p className="font-heading font-bold text-sm text-utsav-maroon-950 dark:text-utsav-ivory">
                        {g.name}
                      </p>
                      <span className="text-[10px] text-gray-500">
                        {g.relationship || 'Guest'} • {g.group || 'General'}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-600 dark:text-gray-300">
                      <p>{g.phone || 'No phone'}</p>
                      <p className="text-[11px] text-gray-400">{g.email || '—'}</p>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          g.rsvpStatus === 'ACCEPTED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                            : g.rsvpStatus === 'DECLINED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}
                      >
                        {g.rsvpStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {g.checkInStatus ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>CHECKED IN</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 dark:bg-utsav-maroon-950 dark:text-gray-400">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>AWAITING GATE</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-gray-600 dark:text-gray-300">
                      {g.checkInTime || '—'}
                    </td>
                    <td className="p-3.5 font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                      {g.assignedTable || 'Open Table'}
                    </td>
                    <td className="p-3.5 text-utsav-saffron font-semibold">
                      {g.mealPreference || 'Veg'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
