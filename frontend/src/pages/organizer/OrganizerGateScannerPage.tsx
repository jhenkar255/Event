import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../api/client';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  ArrowLeft,
  Users,
  DoorOpen,
  Sparkles,
  Volume2,
  VolumeX,
  Lock,
  Calendar,
  Layers,
} from 'lucide-react';

const GATE_OPTIONS = [
  'Main Gate',
  'VIP Gate',
  'Family & Relatives Gate',
  'Staff & Vendor Gate',
  'North Gate (Garden)',
  'South Gate (Grand Hall)',
];

export const OrganizerGateScannerPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, isOrganizer, isAdmin } = useAuth();
  const { socket, joinEventRoom, leaveEventRoom } = useSocket();
  const navigate = useNavigate();

  // State
  const [event, setEvent] = useState<any>(null);
  const [selectedGate, setSelectedGate] = useState('Main Gate');
  const [manualToken, setManualToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoResumeSeconds, setAutoResumeSeconds] = useState<number | null>(null);

  // Attendance Metrics State
  const [attendance, setAttendance] = useState({
    totalGuests: 0,
    confirmedGuests: 0,
    checkedIn: 0,
    notCheckedIn: 0,
    declined: 0,
    pending: 0,
    attendanceRate: 0,
  });
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);

  // Sound Chime Effect
  const playBeep = (isSuccess: boolean) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880.0, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch {
      // Audio autoplay may be restricted
    }
  };

  // Fetch Event & Attendance Initial Data
  useEffect(() => {
    if (!eventId) return;

    const loadData = async () => {
      try {
        const [eventRes, attRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/events/${eventId}/attendance`),
        ]);

        if (eventRes.success) setEvent(eventRes.event);
        if (attRes.success) {
          setAttendance(attRes.summary);
          setRecentCheckIns(attRes.checkIns || []);
        }
      } catch (err: any) {
        console.error('Failed to load event scanner data:', err);
      }
    };

    loadData();

    if (socket) {
      joinEventRoom(eventId);

      socket.on('guest:checked_in', (data: any) => {
        setAttendance((prev) => ({
          ...prev,
          checkedIn: data.totalCheckedIn,
          notCheckedIn: Math.max(0, (data.totalGuests || prev.totalGuests) - data.totalCheckedIn),
          attendanceRate: Math.round((data.totalCheckedIn / (data.totalGuests || prev.totalGuests || 1)) * 100),
        }));

        setRecentCheckIns((prev) => [
          {
            guestId: data.guest,
            checkedInAt: new Date(),
            gateName: data.gateName,
            result: 'VALID_CHECKIN',
          },
          ...prev.slice(0, 9),
        ]);
      });
    }

    return () => {
      if (socket) {
        leaveEventRoom(eventId);
        socket.off('guest:checked_in');
      }
    };
  }, [eventId, socket]);

  // Process Token Check-In Handler
  const handleProcessToken = async (rawToken: string) => {
    if (isProcessing || !rawToken.trim() || !eventId) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setAutoResumeSeconds(null);

    try {
      const res = await api.post(`/events/${eventId}/check-in`, {
        qrToken: rawToken.trim(),
        gateName: selectedGate,
      });

      setScanResult(res);

      if (res.success) {
        if (res.alreadyCheckedIn) {
          playBeep(false);
        } else {
          playBeep(true);
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#C9A227', '#F4A340', '#7A1F2B'],
          });

          // Trigger 4-second auto-resume timer for high-throughput scanning
          setAutoResumeSeconds(4);
        }
      } else {
        playBeep(false);
        setErrorMessage(res.message || 'Pass is not valid for this celebration.');
      }
    } catch (err: any) {
      playBeep(false);
      setErrorMessage(err.message || 'Check-in validation failed.');
    } finally {
      setIsProcessing(false);
      setManualToken('');
    }
  };

  // Auto-resume countdown
  useEffect(() => {
    if (autoResumeSeconds === null) return;
    if (autoResumeSeconds <= 0) {
      setScanResult(null);
      setAutoResumeSeconds(null);
      return;
    }

    const timer = setTimeout(() => {
      setAutoResumeSeconds((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoResumeSeconds]);

  // Camera QR Scanner Initializer
  useEffect(() => {
    if (!eventId || (!isOrganizer && !isAdmin)) return;

    let scanner: Html5QrcodeScanner | null = null;
    const scannerId = 'utsav-gate-camera-feed';

    try {
      scanner = new Html5QrcodeScanner(
        scannerId,
        {
          fps: 12,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          handleProcessToken(decodedText);
        },
        () => {
          // scanner loop
        }
      );
    } catch (err) {
      console.warn('Camera scanner initialization notice:', err);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [eventId, selectedGate, isOrganizer, isAdmin]);

  // Role Gate: Regular USER cannot access gate scanner
  if (!isOrganizer && !isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-8 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-red-500/40 shadow-2xl space-y-4">
          <Lock className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="font-heading text-xl font-bold text-red-600 dark:text-red-400">
            Gate Scanner Restricted
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            The Gate QR Scanner is exclusively accessible to certified Event Organizers and authorized gate staff.
          </p>
          <div className="pt-2 flex justify-center space-x-3">
            <Link
              to={`/events/${eventId}/qr`}
              className="px-5 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold text-utsav-brown-950"
            >
              View My QR Ticket
            </Link>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation & Gate Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-utsav-gold/30">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 text-utsav-brown dark:text-utsav-ivory hover:border-utsav-gold"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-utsav-maroon-900 dark:text-utsav-gold flex items-center space-x-2">
              <Camera className="w-6 h-6 text-utsav-gold" />
              <span>Event Gate QR Scanner</span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {event?.name || 'Celebration'} • High-speed Gate Entry & Cryptographic Verification
            </p>
          </div>
        </div>

        {/* Gate Selector & Audio Toggle */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-sm">
            <DoorOpen className="w-4 h-4 text-utsav-gold shrink-0" />
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="bg-transparent text-xs font-bold text-utsav-maroon-900 dark:text-utsav-gold focus:outline-none cursor-pointer"
            >
              {GATE_OPTIONS.map((gate) => (
                <option key={gate} value={gate} className="bg-utsav-ivory dark:bg-utsav-maroon-950 text-utsav-brown dark:text-utsav-ivory">
                  Gate: {gate}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-2xl border transition-colors ${
              soundEnabled
                ? 'bg-utsav-gold/20 text-utsav-maroon-900 dark:text-utsav-gold border-utsav-gold'
                : 'bg-gray-100 dark:bg-utsav-maroon-900 text-gray-400 border-transparent'
            }`}
            title={soundEnabled ? 'Audio Chime Enabled' : 'Audio Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Real-Time Live Attendance Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase">TOTAL GUESTS</span>
          <p className="font-heading text-xl font-bold text-utsav-maroon-900 dark:text-utsav-gold">
            {attendance.totalGuests || event?.guestCount || 0}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase">CONFIRMED</span>
          <p className="font-heading text-xl font-bold text-blue-600 dark:text-blue-400">
            {attendance.confirmedGuests}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 shadow space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
            CHECKED IN
          </span>
          <p className="font-heading text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {attendance.checkedIn}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase">REMAINING</span>
          <p className="font-heading text-xl font-bold text-utsav-saffron">
            {attendance.notCheckedIn}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase">DECLINED</span>
          <p className="font-heading text-xl font-bold text-red-500">{attendance.declined}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase">ENTRY RATE</span>
          <p className="font-heading text-xl font-bold text-utsav-gold">
            {attendance.attendanceRate}%
          </p>
        </div>
      </div>

      {/* Main Scanner Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Camera Feed & Manual Input (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/50 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-utsav-gold" />
                <span>Live Camera View ({selectedGate})</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                Active Scanner
              </span>
            </div>

            {/* Html5-QRCode Target Canvas */}
            <div
              id="utsav-gate-camera-feed"
              className="w-full rounded-2xl overflow-hidden border-2 border-utsav-gold/40 shadow-inner bg-black/10 min-h-[300px]"
            />

            {/* Manual Token Entry Fallback */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessToken(manualToken);
              }}
              className="flex items-center space-x-2 pt-2"
            >
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Or paste pass token string..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold"
              />
              <button
                type="submit"
                disabled={isProcessing || !manualToken.trim()}
                className="px-5 py-2.5 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? 'Verifying...' : 'Verify Pass'}
              </button>
            </form>

            {/* 1-Click Instant Demo Passes */}
            <div className="pt-2 border-t border-utsav-gold/20">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                ⚡ Instant Demo Passes (Click to Test Gate Entry):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleProcessToken('GUEST-PRIYA-VIP-2026-TOKEN')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-utsav-gold/15 hover:bg-utsav-gold text-utsav-maroon-950 dark:text-utsav-gold dark:hover:text-utsav-maroon-950 border border-utsav-gold/40 transition-colors cursor-pointer"
                >
                  🎟️ Priya Sharma (VIP)
                </button>
                <button
                  type="button"
                  onClick={() => handleProcessToken('GUEST-RAJESH-2026-TOKEN')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-utsav-gold/15 hover:bg-utsav-gold text-utsav-maroon-950 dark:text-utsav-gold dark:hover:text-utsav-maroon-950 border border-utsav-gold/40 transition-colors cursor-pointer"
                >
                  🎟️ Rajesh Patel (Family)
                </button>
                <button
                  type="button"
                  onClick={() => handleProcessToken('GUEST-ANANYA-2026-TOKEN')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-utsav-gold/15 hover:bg-utsav-gold text-utsav-maroon-950 dark:text-utsav-gold dark:hover:text-utsav-maroon-950 border border-utsav-gold/40 transition-colors cursor-pointer"
                >
                  🎟️ Ananya Singh (Friend)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Verification Feedback & Live Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Result Card */}
          {isProcessing ? (
            <div className="p-8 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl text-center space-y-3">
              <RefreshCw className="w-10 h-10 text-utsav-gold animate-spin mx-auto" />
              <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                Authenticating Digital Signature...
              </h3>
              <p className="text-xs text-gray-500">Checking duplicate prevention and event registry</p>
            </div>
          ) : scanResult ? (
            <div
              className={`p-6 rounded-3xl border-2 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
                scanResult.alreadyCheckedIn
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-100'
                  : scanResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100'
                  : 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-100'
              }`}
            >
              {/* Header Status */}
              <div className="flex items-center justify-between border-b border-current/20 pb-3">
                <div className="flex items-center space-x-3">
                  {scanResult.alreadyCheckedIn ? (
                    <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                  ) : scanResult.success ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-heading text-lg font-bold">
                      {scanResult.alreadyCheckedIn
                        ? 'ALREADY CHECKED IN'
                        : scanResult.success
                        ? 'ENTRY APPROVED'
                        : 'ACCESS DENIED'}
                    </h3>
                    <p className="text-xs opacity-90">{scanResult.message}</p>
                  </div>
                </div>

                {autoResumeSeconds !== null && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-black/10 dark:bg-white/10">
                    Next in {autoResumeSeconds}s
                  </span>
                )}
              </div>

              {/* Guest Card Details */}
              {scanResult.guest && (
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-utsav-maroon-900/80 border border-current/20 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Guest Name</span>
                    <span className="font-heading font-bold text-sm">{scanResult.guest.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Group / Type</span>
                    <span className="font-semibold">
                      {scanResult.guest.relationship || 'Guest'} • {scanResult.guest.group || 'General'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Assigned Table</span>
                    <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                      {scanResult.guest.assignedTable || 'Royal Open Seating'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Feast Preference</span>
                    <span className="font-semibold text-utsav-saffron">{scanResult.guest.mealPreference || 'Veg'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-current/10">
                    <span className="text-gray-500 dark:text-gray-400">Check-in Gate & Time</span>
                    <span className="font-mono text-[11px] font-bold">
                      {scanResult.gateName || selectedGate} • {scanResult.checkInTime || 'Just Now'}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setScanResult(null);
                  setAutoResumeSeconds(null);
                }}
                className="w-full py-2.5 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 text-xs font-bold transition-colors cursor-pointer"
              >
                Scan Next Ticket Now →
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-dashed border-utsav-gold/40 text-center space-y-3">
              <UserCheck className="w-12 h-12 text-utsav-gold mx-auto" />
              <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                Scanner Ready for Arrival
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Point guest QR code at camera. Cryptographic signatures prevent duplicate entry passes.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-500 text-red-800 dark:text-red-300 font-bold text-xs">
              {errorMessage}
            </div>
          )}

          {/* Recent Check-Ins Live Stream */}
          <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow space-y-3">
            <h4 className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider flex items-center justify-between">
              <span>Recent Gate Check-Ins</span>
              <span className="text-[10px] text-gray-400">{recentCheckIns.length} recorded</span>
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {recentCheckIns.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No guests checked in yet</p>
              ) : (
                recentCheckIns.map((ci, idx) => (
                  <div
                    key={ci._id || idx}
                    className="p-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-utsav-maroon-900 dark:text-utsav-ivory">
                        {ci.guestId?.name || 'Guest'}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {ci.gateName || 'Main Gate'} • {ci.guestId?.assignedTable || 'Open Table'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {ci.checkedInAt ? new Date(ci.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
