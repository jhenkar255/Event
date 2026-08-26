import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, CheckCircle2, AlertTriangle, RefreshCw, KeyRound, UserCheck, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';
import { DiyaIcon } from '../layout/IndianMotifs';
import confetti from 'canvas-confetti';

interface QREntryScannerProps {
  eventId: string;
  onCheckInComplete?: (guest: any) => void;
}

export const QREntryScanner: React.FC<QREntryScannerProps> = ({ eventId, onCheckInComplete }) => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [manualToken, setManualToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Play auspicious entry chime via Web Audio API
  const playBeep = (isSuccess: boolean) => {
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
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  const processToken = async (token: string) => {
    if (isProcessing || !token.trim()) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await api.post('/qr/checkin', {
        token: token.trim(),
        eventId,
      });

      setScanResult(res);

      if (res.success) {
        if (res.alreadyCheckedIn) {
          playBeep(false);
        } else {
          playBeep(true);
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#C9A227', '#F4A340', '#7A1F2B'],
          });
        }
        if (onCheckInComplete && res.guest) {
          onCheckInComplete(res.guest);
        }
      } else {
        playBeep(false);
        setErrorMessage(res.message || 'Invalid QR code.');
      }
    } catch (err: any) {
      playBeep(false);
      setErrorMessage(err.message || 'Verification failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    const scannerId = 'utsav-qr-scanner-element';

    try {
      scanner = new Html5QrcodeScanner(
        scannerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          processToken(decodedText);
        },
        (error) => {
          // scanning frame loop
        }
      );
    } catch (err) {
      console.warn('Could not initialize camera scanner:', err);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [eventId]);

  return (
    <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-utsav-gold/20 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Event Entry Gate QR Scanner
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Point guest digital invitation pass at camera for instant signed verification.
            </p>
          </div>
        </div>

        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Cryptographically Secured</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Live Camera Scanner Box */}
        <div className="space-y-3">
          <div
            id="utsav-qr-scanner-element"
            className="w-full rounded-2xl overflow-hidden border-2 border-utsav-gold/50 shadow-inner bg-black/5 min-h-[300px]"
          />

          {/* Manual Entry & 1-Click Test Simulation */}
          <div className="space-y-2 pt-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                processToken(manualToken);
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Or enter signed pass token..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold"
              />
              <button
                type="submit"
                disabled={isProcessing || !manualToken.trim()}
                className="px-4 py-2.5 rounded-xl maroon-gradient-btn text-xs font-bold shrink-0 disabled:opacity-50 text-utsav-gold cursor-pointer"
              >
                Verify Token
              </button>
            </form>

            {/* Quick Test Demo Guest Passes */}
            <div className="pt-1">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                ⚡ Instant Demo Passes (Click to Test Gate Entry):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => processToken('GUEST-PRIYA-VIP-2026-TOKEN')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-utsav-gold/15 hover:bg-utsav-gold text-utsav-maroon-950 dark:text-utsav-gold dark:hover:text-utsav-maroon-950 border border-utsav-gold/40 transition-colors cursor-pointer"
                >
                  🎟️ Priya Sharma (VIP)
                </button>
                <button
                  type="button"
                  onClick={() => processToken('GUEST-RAJESH-2026-TOKEN')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-utsav-gold/15 hover:bg-utsav-gold text-utsav-maroon-950 dark:text-utsav-gold dark:hover:text-utsav-maroon-950 border border-utsav-gold/40 transition-colors cursor-pointer"
                >
                  🎟️ Rajesh Patel (Family)
                </button>
                <button
                  type="button"
                  onClick={() => processToken('GUEST-ANANYA-2026-TOKEN')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-utsav-gold/15 hover:bg-utsav-gold text-utsav-maroon-950 dark:text-utsav-gold dark:hover:text-utsav-maroon-950 border border-utsav-gold/40 transition-colors cursor-pointer"
                >
                  🎟️ Ananya Singh (Friend)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Feedback Banner */}
        <div className="flex flex-col justify-center space-y-4">
          {isProcessing ? (
            <div className="p-8 rounded-3xl bg-utsav-beige-100 dark:bg-utsav-maroon-950 border border-utsav-gold/30 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-utsav-gold animate-spin mx-auto" />
              <p className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                Verifying Cryptographic Digital Pass...
              </p>
            </div>
          ) : scanResult ? (
            <div
              className={`p-6 rounded-3xl border-2 space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
                scanResult.alreadyCheckedIn
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-100'
                  : scanResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-100'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                {scanResult.alreadyCheckedIn ? (
                  <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                ) : scanResult.success ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-heading text-sm sm:text-base font-bold">
                    {scanResult.alreadyCheckedIn
                      ? 'Duplicate Check-in Alert'
                      : scanResult.success
                      ? 'Gate Entry Approved'
                      : 'Access Denied'}
                  </h4>
                  <p className="text-xs opacity-90">{scanResult.message}</p>
                </div>
              </div>

              {/* Guest Card Details */}
              {scanResult.guest && (
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-utsav-maroon-900/80 border border-current/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Guest Name</span>
                    <span className="font-bold text-sm">{scanResult.guest.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Relationship & Group</span>
                    <span className="font-semibold">
                      {scanResult.guest.relationship} • {scanResult.guest.group}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Dietary Preference</span>
                    <span className="font-bold text-utsav-saffron">{scanResult.guest.mealPreference}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Assigned Seating Table</span>
                    <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                      {scanResult.guest.assignedTable || 'Open Seating'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-current/10">
                    <span className="text-gray-500 dark:text-gray-400">Check-in Timestamp</span>
                    <span className="font-mono text-[11px] font-bold">
                      {scanResult.checkInTime || 'Just Now'}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setScanResult(null)}
                className="w-full py-2 rounded-xl bg-black/10 dark:bg-white/10 text-xs font-bold hover:bg-black/20"
              >
                Scan Next Guest →
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-utsav-beige-100/60 dark:bg-utsav-maroon-950/60 border border-utsav-gold/30 text-center space-y-3">
              <UserCheck className="w-10 h-10 text-utsav-gold mx-auto" />
              <h4 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                Scanner Ready for Arrival
              </h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Gate entry scans prevent duplicate pass usage and update the Live Command Center attendance instantly.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
