import React, { useState, useEffect } from 'react';
import { Radio, Users, Bell, Send, Clock, Volume2, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { ILiveStream } from '@shared/types';
import { api } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { DiyaIcon } from '../layout/IndianMotifs';

interface LiveStreamPlayerProps {
  eventId: string;
  isOrganizer?: boolean;
}

export const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({ eventId, isOrganizer = false }) => {
  const [stream, setStream] = useState<ILiveStream | null>(null);
  const [announcements, setAnnouncements] = useState<Array<{ id: string; message: string; timestamp: string; sender: string }>>([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [viewers, setViewers] = useState(42);
  const [isPosting, setIsPosting] = useState(false);

  const { socket, joinEventRoom } = useSocket();

  useEffect(() => {
    if (eventId) {
      joinEventRoom(eventId);

      api
        .get<{ success: boolean; stream: ILiveStream }>(`/events/${eventId}/live`)
        .then((res) => {
          if (res.success && res.stream) {
            setStream(res.stream);
            if (res.stream.announcements) setAnnouncements(res.stream.announcements);
            if (res.stream.viewerCount) setViewers(res.stream.viewerCount);
          }
        })
        .catch(() => {});
    }
  }, [eventId]);

  useEffect(() => {
    if (!socket) return;

    // Listen for live broadcast announcements
    socket.on('announcement:broadcast', (ann: any) => {
      setAnnouncements((prev) => [ann, ...prev]);
    });

    // Listen for live stream status change
    socket.on('stream:status_change', (data: any) => {
      setStream((prev) => (prev ? { ...prev, status: data.status, streamUrl: data.streamUrl } : null));
    });

    // Track viewer count
    socket.on('stream:viewers_count', (data: any) => {
      if (data.count) setViewers(data.count);
    });

    return () => {
      socket.off('announcement:broadcast');
      socket.off('stream:status_change');
      socket.off('stream:viewers_count');
    };
  }, [socket]);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    setIsPosting(true);
    try {
      const res = await api.post(`/events/${eventId}/live/announcements`, {
        message: newAnnouncement,
        sender: isOrganizer ? 'Organizer Team' : 'Command Center',
      });

      if (res.success) {
        setNewAnnouncement('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to broadcast announcement.');
    } finally {
      setIsPosting(false);
    }
  };

  const isLive = stream?.status === 'LIVE';

  return (
    <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-utsav-gold/20 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-utsav-saffron" />
            <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              {stream?.title || 'Live Celebration Broadcast'}
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Streaming live in 1080p HD for family, relatives, and well-wishers worldwide.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isLive ? (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs tracking-wider animate-pulse uppercase shadow">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>🔴 LIVE NOW</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-utsav-brown dark:text-utsav-gold text-xs font-bold uppercase border border-utsav-gold/40">
              {stream?.status || 'SCHEDULED'}
            </span>
          )}

          <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">
            <Users className="w-3.5 h-3.5 text-utsav-saffron" />
            <span>{viewers} Viewers</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Stream Video Player */}
        <div className="lg:col-span-2 space-y-3">
          {(() => {
            let youtubeId = 'L_LUpnjgPso';
            const rawUrl = stream?.streamUrl || '';
            if (rawUrl) {
              const match = rawUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
              if (match && match[1]) {
                youtubeId = match[1];
              } else if (/^[a-zA-Z0-9_-]{11}$/.test(rawUrl.trim())) {
                youtubeId = rawUrl.trim();
              }
            }

            const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&enablejsapi=1&rel=0`;
            const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

            return (
              <>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border-2 border-utsav-gold/50 shadow-2xl">
                  <iframe
                    key={youtubeId}
                    src={embedUrl}
                    title="Live Celebration Stream"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="text-[11px] text-gray-500 flex items-center space-x-1">
                    <Volume2 className="w-3.5 h-3.5 text-utsav-gold" />
                    <span>Click player to unmute audio if muted by browser policy.</span>
                  </span>

                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
                  >
                    <span>Watch directly on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </>
            );
          })()}
        </div>

        {/* Live Announcements Ticker & Dispatcher */}
        <div className="p-4 rounded-2xl bg-utsav-beige-50 dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-inner flex flex-col justify-between space-y-4 max-h-[400px]">
          <div>
            <div className="flex items-center space-x-2 border-b border-utsav-gold/20 pb-2 mb-3">
              <Bell className="w-4 h-4 text-utsav-gold" />
              <h4 className="font-heading text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
                Live Broadcast Announcements
              </h4>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-52 pr-1">
              {announcements.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-6">
                  No live announcements posted yet.
                </p>
              ) : (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/30 text-xs shadow-sm space-y-1 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                      <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">{ann.sender}</span>
                      <span>{ann.timestamp}</span>
                    </div>
                    <p className="text-utsav-brown dark:text-utsav-ivory font-medium">{ann.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Organizer Announcement Post Box */}
          {isOrganizer && (
            <form onSubmit={handlePostAnnouncement} className="pt-2 border-t border-utsav-gold/20 space-y-2">
              <input
                type="text"
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                placeholder="Broadcast live update (e.g. Baraat arrived)..."
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold"
              />
              <button
                type="submit"
                disabled={isPosting || !newAnnouncement.trim()}
                className="w-full py-2 rounded-xl maroon-gradient-btn text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPosting ? 'Broadcasting...' : 'Broadcast to All Viewers'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
