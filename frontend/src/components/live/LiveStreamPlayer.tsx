import React, { useState, useEffect } from 'react';
import { Radio, Users, Bell, Send, Clock, Volume2, ShieldCheck, Sparkles, ExternalLink, Settings, Tv } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ILiveStream } from '@shared/types';
import { api } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { DiyaIcon } from '../layout/IndianMotifs';

interface LiveStreamPlayerProps {
  eventId: string;
  isOrganizer?: boolean;
  eventDetails?: {
    name?: string;
    type?: string;
    culturalTradition?: string;
    theme?: string;
  };
}

export const getRespectiveYouTubeVideo = (event?: { type?: string; name?: string; culturalTradition?: string; theme?: string }) => {
  const type = (event?.type || '').toLowerCase();
  const name = (event?.name || '').toLowerCase();
  const trad = (event?.culturalTradition || '').toLowerCase();

  if (type.includes('tech') || name.includes('tech') || name.includes('hackathon') || type.includes('hackathon')) {
    return {
      youtubeId: 'M7lc1UVf-VE',
      title: 'TechMeet Keynote & AI Hackathon Stream',
      watchUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      category: 'Tech Summit',
    };
  }
  if (type.includes('startup') || name.includes('startup') || name.includes('pitch') || type.includes('product') || name.includes('product')) {
    return {
      youtubeId: 'M7lc1UVf-VE',
      title: 'Startup Conclave & Product Keynote Live',
      watchUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      category: 'Startup & Innovation',
    };
  }
  if (type.includes('fest') || name.includes('fest') || type.includes('college') || name.includes('battle of bands')) {
    return {
      youtubeId: 'fJ9rUzIMcZQ',
      title: 'Youth Cultural Fest & Rock Concert',
      watchUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
      category: 'Concert & Fest',
    };
  }
  if (type.includes('festival') || name.includes('garba') || name.includes('dandiya') || name.includes('diwali') || name.includes('mela')) {
    return {
      youtubeId: '9bZkp7q19f0',
      title: 'Maha Navratri Garba & Live Folk Orchestra',
      watchUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      category: 'Festival & Garba',
    };
  }
  if (type.includes('wedding') || name.includes('wedding') || name.includes('vivaah') || name.includes('kalyanam')) {
    if (trad.includes('south') || trad.includes('tamil') || trad.includes('telugu') || trad.includes('kannada') || name.includes('kalyanam')) {
      return {
        youtubeId: 'L_LUpnjgPso',
        title: 'Grand South Indian Vedic Kalyanam',
        watchUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
        category: 'Vedic Kalyanam',
      };
    }
    return {
      youtubeId: '09R8_2nJtjg',
      title: 'Royal Rajasthani Wedding Celebration Live',
      watchUrl: 'https://www.youtube.com/watch?v=09R8_2nJtjg',
      category: 'Royal Wedding',
    };
  }
  if (type.includes('sangeet') || name.includes('sangeet') || name.includes('dhol')) {
    return {
      youtubeId: '9bZkp7q19f0',
      title: 'Punjabi Dhol & Royal Sangeet Night',
      watchUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      category: 'Sangeet Night',
    };
  }
  if (type.includes('corporate') || name.includes('corporate') || name.includes('gala')) {
    return {
      youtubeId: 'M7lc1UVf-VE',
      title: 'Corporate Leadership Gala & Awards',
      watchUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      category: 'Corporate Conclave',
    };
  }
  return {
    youtubeId: '09R8_2nJtjg',
    title: `${event?.name || 'Grand Celebration'} Live Stream`,
    watchUrl: 'https://www.youtube.com/watch?v=09R8_2nJtjg',
    category: 'Celebration',
  };
};

export const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({ eventId, isOrganizer = false, eventDetails }) => {
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

    socket.on('announcement:broadcast', (ann: any) => {
      setAnnouncements((prev) => [ann, ...prev]);
    });

    socket.on('stream:status_change', (data: any) => {
      setStream((prev) => (prev ? { ...prev, status: data.status, streamUrl: data.streamUrl } : null));
    });

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
      const payload = {
        sender: isOrganizer ? 'Event Host & Management' : 'Organizing Team',
        message: newAnnouncement.trim(),
      };

      const res = await api.post<{ success: boolean; announcement: any }>(
        `/events/${eventId}/live/announcement`,
        payload
      );

      if (res.success && res.announcement) {
        setAnnouncements((prev) => [res.announcement, ...prev]);
        setNewAnnouncement('');
      }
    } catch (err) {
      console.error('Failed to post announcement:', err);
    } finally {
      setIsPosting(false);
    }
  };

  const isLive = stream?.status === 'LIVE';

  // Determine respective YouTube video info
  const respectiveVideo = getRespectiveYouTubeVideo(eventDetails);

  let targetYoutubeId = respectiveVideo.youtubeId;
  const rawUrl = stream?.streamUrl || '';
  if (rawUrl && (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be'))) {
    const match = rawUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (match && match[1]) {
      targetYoutubeId = match[1];
    }
  } else if (/^[a-zA-Z0-9_-]{11}$/.test(rawUrl.trim())) {
    targetYoutubeId = rawUrl.trim();
  }

  const finalEmbedUrl = `https://www.youtube-nocookie.com/embed/${targetYoutubeId}?autoplay=1&mute=1&playsinline=1&enablejsapi=1&rel=0`;
  const finalWatchUrl = `https://www.youtube.com/watch?v=${targetYoutubeId}`;

  return (
    <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/30 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              {stream?.title || `${eventDetails?.name || 'Celebration'} - Live YouTube Broadcast`}
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Ultra HD 1080p live telecast stream linked for guests and remote relatives worldwide.
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
              {stream?.status || 'LIVE BROADCAST'}
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
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border-2 border-utsav-gold/50 shadow-2xl">
            <iframe
              src={finalEmbedUrl}
              title={stream?.title || 'Live Stream'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <a
              href={finalWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow flex items-center space-x-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>▶ Watch on YouTube (Direct Link)</span>
            </a>

            <button
              onClick={() => {
                confetti({
                  particleCount: 60,
                  spread: 70,
                  origin: { y: 0.7 },
                  colors: ['#C9A227', '#F4A340', '#7A1F2B'],
                });
              }}
              className="px-3.5 py-1.5 rounded-xl gold-gradient-btn text-xs font-bold shadow text-utsav-maroon-950 flex items-center space-x-1 cursor-pointer"
            >
              <span>🌸 Shower Blessings</span>
            </button>
          </div>
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

          {/* Organizer Broadcast Input */}
          {isOrganizer && (
            <form onSubmit={handlePostAnnouncement} className="pt-2 border-t border-utsav-gold/20">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder="Broadcast milestone update..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/30 text-xs text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold"
                />
                <button
                  type="submit"
                  disabled={isPosting || !newAnnouncement.trim()}
                  className="p-2 rounded-xl maroon-gradient-btn text-utsav-gold shadow-sm disabled:opacity-50 cursor-pointer"
                  title="Broadcast to All Viewers"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
