import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Radio,
  Users,
  Play,
  Share2,
  Sparkles,
  ArrowLeft,
  Volume2,
  Eye,
  Camera,
  Calendar,
  Clock,
  MapPin,
  Send,
  Heart,
  Flame,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  Video,
  Compass,
  ArrowRight,
  Tv,
} from 'lucide-react';
import { DiyaIcon, MandalaCorner } from '../components/layout/IndianMotifs';
import confetti from 'canvas-confetti';

interface LiveEventItem {
  id: string;
  title: string;
  tradition: string;
  type: string;
  location: string;
  city: string;
  hostName: string;
  viewers: number;
  youtubeId: string;
  status: 'LIVE' | 'UPCOMING' | 'REPLAY';
  scheduleTime: string;
  description: string;
  cameras?: Array<{ name: string; youtubeId: string }>;
}

const LIVE_EVENTS_CATALOG: LiveEventItem[] = [
  {
    id: 'live-1',
    title: 'Royal Rajasthani Palace Wedding & Saat Phere – Aarav & Ananya',
    tradition: 'Rajasthani',
    type: 'Royal Vivaah',
    location: 'Amber Heritage Palace & Courtyard',
    city: 'Jaipur, Rajasthan',
    hostName: 'Sharma & Rathore Royal Family',
    viewers: 284,
    youtubeId: '09R8_2nJtjg',
    status: 'LIVE',
    scheduleTime: 'Active Now (Muhurtham: 10:30 AM)',
    description: 'Live broadcast of the sacred Saat Phere, Vedic Agni Kund rituals, and royal Swagat in 1080p Ultra HD.',
    cameras: [
      { name: 'Mandap Live Feed (Cam 1)', youtubeId: '09R8_2nJtjg' },
      { name: 'Baraat & Swagat (Cam 2)', youtubeId: 'L_LUpnjgPso' },
      { name: 'Varmala Stage (Cam 3)', youtubeId: '2Vv-BfVoq4g' },
    ],
  },
  {
    id: 'live-tech',
    title: 'TechMeet & AI Innovation Conclave 2026 – Keynote & Live Hackathon',
    tradition: 'Custom',
    type: 'Tech Meet & Hackathon',
    location: 'Electronic City Innovation Center',
    city: 'Bangalore, Karnataka',
    hostName: 'UtsavMitra Tech Developer Community',
    viewers: 412,
    youtubeId: 'M7lc1UVf-VE',
    status: 'LIVE',
    scheduleTime: 'Active Now (Keynote & Demos)',
    description: 'Live developer hackathon demo streams, AI keynote talks, and founder networking sessions.',
    cameras: [
      { name: 'Main Keynote Hall', youtubeId: 'M7lc1UVf-VE' },
      { name: 'Hackathon Demo Stage', youtubeId: '09R8_2nJtjg' },
    ],
  },
  {
    id: 'live-2',
    title: 'Grand South Indian Vedic Kalyanam – Karthik & Deepa',
    tradition: 'South Indian',
    type: 'Vedic Kalyanam',
    location: 'Dakshin Vedic Heritage Pavilion',
    city: 'Bangalore, Karnataka',
    hostName: 'Iyer & Sundaram Family',
    viewers: 196,
    youtubeId: 'L_LUpnjgPso',
    status: 'LIVE',
    scheduleTime: 'Active Now (Kanyadaanam Rites)',
    description: 'Auspicious Nadaswaram, Mangalya Dharanam, and holy Vedic mantras chanted by senior temple scholars.',
    cameras: [
      { name: 'Main Temple Stage', youtubeId: 'L_LUpnjgPso' },
      { name: 'Traditional Nadhaswaram Crew', youtubeId: '09R8_2nJtjg' },
    ],
  },
  {
    id: 'live-3',
    title: 'Punjabi Dhol Night & Grand Royal Sangeet – Simran & Jaspreet',
    tradition: 'North Indian',
    type: 'Sangeet & Dhol Night',
    location: 'Regal Saffron Lawns & Glass Ballroom',
    city: 'Delhi NCR',
    hostName: 'Grewal & Dhillon Family',
    viewers: 142,
    youtubeId: '9bZkp7q19f0',
    status: 'LIVE',
    scheduleTime: 'Active Now (Sangeet Performances)',
    description: 'High-energy live Bhangra troupe, celebrity DJ, and royal family performances streaming live.',
  },
  {
    id: 'live-4',
    title: 'Vedic Griha Pravesh & Maha Ganapati Yagna Ceremony',
    tradition: 'Gujarati',
    type: 'Griha Pravesh & Pooja',
    location: 'Vaikuntha Villa, Heritage Enclave',
    city: 'Ahmedabad, Gujarat',
    hostName: 'Patel Parivar',
    viewers: 89,
    youtubeId: 'kJQP7kiw5Fk',
    status: 'LIVE',
    scheduleTime: 'Active Now (Purnahuti Muhurtham)',
    description: 'Sacred Havan, Vastu Shanti mantras, and family blessings broadcast for relatives abroad.',
  },
  {
    id: 'live-5',
    title: 'Ganga Maha Aarti & Dev Deepavali Vedic Chants',
    tradition: 'Vedic Heritage',
    type: 'Cultural Aarti',
    location: 'Dashashwamedh Ghat',
    city: 'Varanasi, Uttar Pradesh',
    hostName: 'Ganga Seva Nidhi',
    viewers: 620,
    youtubeId: 'fJ9rUzIMcZQ',
    status: 'LIVE',
    scheduleTime: 'Active Now (Sunset Aarti)',
    description: 'Mesmerizing evening Maha Aarti with 108 brass lamps and sacred conch blowing.',
  },
];

const RELATED_YOUTUBE_VIDEOS = [
  {
    id: 'rel-1',
    title: 'Grand Indian Royal Wedding Film & Celebrations (4K)',
    channel: 'Heritage Cinematic Films',
    youtubeId: 'L_LUpnjgPso',
    tag: 'Wedding Film',
  },
  {
    id: 'rel-2',
    title: 'Tech Summit & Developer Keynote Live Stream',
    channel: 'Google Developers & Tech Hub',
    youtubeId: 'M7lc1UVf-VE',
    tag: 'Tech Keynote',
  },
  {
    id: 'rel-3',
    title: 'Surprise Grand Wedding Celebration Live',
    channel: 'Maroon 5 Celebrations',
    youtubeId: '09R8_2nJtjg',
    tag: 'Celebration',
  },
  {
    id: 'rel-4',
    title: 'High Energy Bollywood Sangeet & Dance Festival',
    channel: 'Dance & Beats India',
    youtubeId: '9bZkp7q19f0',
    tag: 'Sangeet Night',
  },
];

export const LiveEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<LiveEventItem>(LIVE_EVENTS_CATALOG[0]);
  const [currentYoutubeId, setCurrentYoutubeId] = useState<string>(LIVE_EVENTS_CATALOG[0].youtubeId);
  const [activeCamIndex, setActiveCamIndex] = useState(0);

  // Custom Stream URL input
  const [customUrl, setCustomUrl] = useState('');
  const [isAddingStream, setIsAddingStream] = useState(false);

  // Real-time viewer chat & blessing stream
  const [blessings, setBlessings] = useState<Array<{ id: string; name: string; text: string; time: string }>>([
    { id: 'b1', name: 'Ramesh & Savitri Uncle (London)', text: 'May Lord Ganesha shower infinite blessings on both of you! ✨', time: 'Just now' },
    { id: 'b2', name: 'Dr. Meenakshi Sundaram (USA)', text: 'Magnificent mandap and divine chanting. Heartiest congratulations! 🪔', time: '1m ago' },
    { id: 'b3', name: 'Alok Verma (Mumbai)', text: 'The Baraat entrance looked truly royal! Wishing lifelong happiness! 💐', time: '2m ago' },
  ]);
  const [newBlessingText, setNewBlessingText] = useState('');
  const [viewerName, setViewerName] = useState('');

  const handleSelectEvent = (eventItem: LiveEventItem) => {
    setSelectedEvent(eventItem);
    setCurrentYoutubeId(eventItem.youtubeId);
    setActiveCamIndex(0);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSelectCamera = (cam: { name: string; youtubeId: string }, idx: number) => {
    setActiveCamIndex(idx);
    setCurrentYoutubeId(cam.youtubeId);
  };

  const extractYoutubeId = (urlOrId: string): string => {
    const trimmed = urlOrId.trim();
    const matchWatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (matchWatch && matchWatch[1]) {
      return matchWatch[1];
    }
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    return '09R8_2nJtjg';
  };

  const handleApplyCustomStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const parsedId = extractYoutubeId(customUrl);
    setCurrentYoutubeId(parsedId);
    setSelectedEvent((prev) => ({
      ...prev,
      title: 'My Custom Live Celebration Broadcast',
      youtubeId: parsedId,
      status: 'LIVE',
      description: 'Broadcasting custom celebration live stream via YouTube feed.',
    }));
    setIsAddingStream(false);
    setCustomUrl('');

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#C9A227', '#F4A340', '#7A1F2B'],
    });
  };

  const handleSendBlessing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlessingText.trim()) return;

    const newEntry = {
      id: `bless-${Date.now()}`,
      name: viewerName.trim() || 'Well-wisher & Relative',
      text: newBlessingText.trim(),
      time: 'Just now',
    };

    setBlessings((prev) => [newEntry, ...prev]);
    setNewBlessingText('');

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#C9A227', '#10B981', '#F4A340'],
    });
  };

  const handleShowerPetals = () => {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.4 },
      colors: ['#FFB800', '#F4A340', '#7A1F2B', '#E11D48'],
    });
  };

  const currentYoutubeWatchUrl = `https://www.youtube.com/watch?v=${currentYoutubeId}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'))}
          className="flex items-center space-x-2 text-xs font-bold text-utsav-maroon-900 dark:text-utsav-gold hover:underline cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-2">
          <Link
            to="/events"
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-utsav-gold/20 text-utsav-maroon-900 dark:text-utsav-gold font-bold text-xs border border-utsav-gold/40 hover:bg-utsav-gold/30 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore All Events →</span>
          </Link>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-bold text-[11px] tracking-wider animate-pulse shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>🔴 6 LIVE BROADCASTS ACTIVE</span>
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-utsav-maroon-950 via-utsav-maroon-900 to-black text-utsav-ivory border-2 border-utsav-gold/60 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 pointer-events-none opacity-25">
          <MandalaCorner className="w-36 h-36" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DiyaIcon className="w-6 h-6" />
              <span className="text-[11px] uppercase font-bold tracking-widest text-utsav-gold">
                UtsavMitra Live Telecast Network
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight gold-gradient-text">
              Live Cultural Celebrations & YouTube Broadcasts
            </h1>
            <p className="text-xs sm:text-sm text-utsav-ivory/80 max-w-2xl leading-relaxed">
              Watch auspicious Indian weddings, sacred Vedic rituals, TechMeets, and royal sangeet nights live in 1080p HD. Connect with families worldwide and shower virtual blessings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={currentYoutubeWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg flex items-center space-x-1.5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>▶ Watch on YouTube</span>
            </a>

            <button
              onClick={() => setIsAddingStream(true)}
              className="px-4 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold text-utsav-maroon-950 shadow-lg flex items-center space-x-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Broadcast My YouTube Live</span>
            </button>

            <Link
              to="/events"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-utsav-gold border border-utsav-gold/50 text-xs font-bold shadow-md flex items-center space-x-1.5"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Events</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal to input Custom YouTube Live Stream */}
      {isAddingStream && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-utsav-ivory dark:bg-utsav-maroon-950 w-full max-w-lg rounded-3xl shadow-2xl border-2 border-utsav-gold/60 overflow-hidden relative z-[10000]">
            <div className="p-5 bg-gradient-to-r from-utsav-maroon-900 to-utsav-maroon-800 text-utsav-ivory border-b border-utsav-gold/40 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                <h3 className="font-heading text-base font-bold text-utsav-gold">
                  Broadcast YouTube Live Stream
                </h3>
              </div>
              <button
                onClick={() => setIsAddingStream(false)}
                className="p-1 text-utsav-ivory/70 hover:text-utsav-gold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyCustomStream} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-utsav-maroon-800 dark:text-utsav-gold mb-1">
                  YouTube Live Stream URL or Video ID
                </label>
                <input
                  type="text"
                  required
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or Video ID (e.g. 09R8_2nJtjg)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Paste any public or unlisted YouTube live stream URL or video link.
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900/80 border border-utsav-gold/30 text-[11px] text-gray-600 dark:text-gray-300 space-y-1">
                <p className="font-bold text-utsav-saffron">Supported formats:</p>
                <p>• https://youtube.com/watch?v=09R8_2nJtjg</p>
                <p>• https://youtu.be/09R8_2nJtjg</p>
                <p>• Direct YouTube Video ID (e.g. 09R8_2nJtjg)</p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingStream(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 dark:text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl maroon-gradient-btn text-utsav-gold font-bold shadow-md flex items-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Live Theatre Stream</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Live Theatre Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Player Container */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/50 shadow-2xl space-y-4">
            {/* Player Frame */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border-2 border-utsav-gold/60 shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${currentYoutubeId}?autoplay=1&mute=1&playsinline=1&enablejsapi=1&rel=0`}
                title={selectedEvent.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Multi-Camera Angle Selector (if available) */}
            {selectedEvent.cameras && selectedEvent.cameras.length > 1 && (
              <div className="p-3 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold flex items-center space-x-1.5">
                  <Camera className="w-4 h-4 text-utsav-saffron" />
                  <span>Switch Live Camera Angle:</span>
                </span>

                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedEvent.cameras.map((cam, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectCamera(cam, idx)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        activeCamIndex === idx
                          ? 'maroon-gradient-btn text-utsav-gold shadow-md border border-utsav-gold'
                          : 'bg-utsav-beige-100 dark:bg-utsav-maroon-900 text-gray-600 dark:text-gray-300 hover:border-utsav-gold/40 border border-transparent'
                      }`}
                    >
                      {cam.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stream Details & Actions */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] tracking-wider animate-pulse uppercase">
                    🔴 LIVE STREAM
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-utsav-gold/20 text-utsav-maroon-900 dark:text-utsav-gold text-[10px] font-bold border border-utsav-gold/40">
                    {selectedEvent.type}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-utsav-saffron" />
                    <span>{selectedEvent.viewers} Watching Worldwide</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={currentYoutubeWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in YouTube</span>
                  </a>

                  <button
                    onClick={handleShowerPetals}
                    className="px-3.5 py-1.5 rounded-xl gold-gradient-btn text-xs font-bold shadow-md flex items-center space-x-1.5 text-utsav-maroon-950 cursor-pointer"
                  >
                    <span>🌸 Shower Petals</span>
                  </button>
                </div>
              </div>

              <h2 className="font-heading text-lg sm:text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                {selectedEvent.title}
              </h2>

              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {selectedEvent.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-utsav-gold/20">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-utsav-saffron shrink-0" />
                  <span>{selectedEvent.location}, {selectedEvent.city}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4 text-utsav-gold shrink-0" />
                  <span>{selectedEvent.scheduleTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Virtual Blessings & Chat Stream */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl flex flex-col justify-between h-[520px]">
            <div>
              <div className="flex items-center justify-between border-b border-utsav-gold/20 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                    Live Virtual Blessings & Chat
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  • Real-time Feed
                </span>
              </div>

              {/* Blessings List */}
              <div className="space-y-2.5 overflow-y-auto max-h-[320px] pr-1 scrollbar-thin">
                {blessings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 text-xs shadow-sm space-y-1 animate-in fade-in duration-200"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        {b.name}
                      </span>
                      <span className="text-gray-400">{b.time}</span>
                    </div>
                    <p className="text-utsav-brown dark:text-utsav-ivory leading-relaxed">
                      {b.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Send Blessing Form */}
            <form onSubmit={handleSendBlessing} className="pt-3 border-t border-utsav-gold/20 space-y-2">
              <input
                type="text"
                value={viewerName}
                onChange={(e) => setViewerName(e.target.value)}
                placeholder="Your Name / Family (e.g. Verma Family)"
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 text-xs text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  required
                  value={newBlessingText}
                  onChange={(e) => setNewBlessingText(e.target.value)}
                  placeholder="Send auspicious blessing or message..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 text-xs text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl maroon-gradient-btn text-utsav-gold shadow-md cursor-pointer shrink-0"
                  title="Send Blessing"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Related YouTube Celebration & Tech Videos */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-3">
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-utsav-saffron" />
            <h3 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Related Celebration & Tech Videos on YouTube
            </h3>
          </div>
          <span className="text-xs text-gray-500">Direct YouTube links</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RELATED_YOUTUBE_VIDEOS.map((vid) => (
            <div
              key={vid.id}
              className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-md space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden group">
                  <img
                    src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-utsav-gold text-[9px] font-bold">
                    {vid.tag}
                  </div>
                </div>

                <h4 className="font-heading text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold line-clamp-2">
                  {vid.title}
                </h4>
                <p className="text-[11px] text-gray-500">{vid.channel}</p>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-utsav-gold/20">
                <button
                  onClick={() => {
                    setCurrentYoutubeId(vid.youtubeId);
                    setSelectedEvent((prev) => ({
                      ...prev,
                      title: vid.title,
                      youtubeId: vid.youtubeId,
                      description: `Playing ${vid.title} from YouTube stream.`,
                    }));
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="flex-1 py-1.5 rounded-xl gold-gradient-btn text-utsav-maroon-950 font-bold text-[11px] shadow flex items-center justify-center space-x-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play Here</span>
                </button>

                <a
                  href={`https://www.youtube.com/watch?v=${vid.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow flex items-center justify-center"
                  title="Open in YouTube"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Celebrations Channel Directory */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-3">
          <div>
            <h3 className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold flex items-center space-x-2">
              <Radio className="w-5 h-5 text-red-500" />
              <span>More Live Indian Celebration & Conclave Feeds</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click any celebration card below to switch the live HD theatre stream.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LIVE_EVENTS_CATALOG.map((ev) => {
            const isCurrent = selectedEvent.id === ev.id;
            return (
              <div
                key={ev.id}
                className={`rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-utsav-gold ring-4 ring-utsav-gold/30'
                    : 'border-utsav-gold/40 hover:border-utsav-gold'
                }`}
              >
                {/* YouTube Preview Thumbnail */}
                <div
                  onClick={() => handleSelectEvent(ev)}
                  className="relative aspect-video w-full bg-black overflow-hidden group cursor-pointer"
                >
                  <img
                    src={`https://img.youtube.com/vi/${ev.youtubeId}/hqdefault.jpg`}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] tracking-wider animate-pulse uppercase">
                      🔴 LIVE
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-utsav-gold text-[10px] font-bold">
                      {ev.type}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-bold backdrop-blur-md">
                    <Users className="w-3 h-3 text-utsav-saffron" />
                    <span>{ev.viewers} live</span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-12 h-12 rounded-full gold-gradient-btn flex items-center justify-center text-utsav-maroon-950 shadow-xl">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4
                      onClick={() => handleSelectEvent(ev)}
                      className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold line-clamp-2 cursor-pointer hover:underline"
                    >
                      {ev.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-utsav-saffron shrink-0" />
                      <span className="truncate">{ev.location}, {ev.city}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-utsav-gold/20 flex items-center justify-between text-xs gap-2">
                    <span className="text-[11px] text-utsav-saffron font-semibold truncate">
                      {ev.scheduleTime}
                    </span>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSelectEvent(ev)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
                          isCurrent
                            ? 'gold-gradient-btn text-utsav-maroon-950'
                            : 'maroon-gradient-btn text-utsav-gold'
                        }`}
                      >
                        {isCurrent ? '▶ Watching' : 'Play →'}
                      </button>

                      <a
                        href={`https://www.youtube.com/watch?v=${ev.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors"
                        title="Open on YouTube"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explore All Events CTA Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-utsav-maroon-900 via-utsav-maroon-800 to-utsav-maroon-950 text-utsav-ivory border-2 border-utsav-gold/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-utsav-gold text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Discover & Book Events</span>
          </div>
          <h3 className="font-heading text-xl sm:text-3xl font-bold gold-gradient-text">
            Explore All TechMeets, Hackathons & Cultural Celebrations
          </h3>
          <p className="text-xs sm:text-sm text-utsav-ivory/80 max-w-xl">
            Browse our full directory of royal weddings, developer summits, startup conclaves, and auspicious pujas across India.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/events"
            className="px-6 py-3 rounded-2xl gold-gradient-btn text-xs sm:text-sm font-bold text-utsav-maroon-950 shadow-xl flex items-center space-x-2"
          >
            <span>Explore All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/venues"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-utsav-gold border border-utsav-gold/50 text-xs sm:text-sm font-bold shadow-md"
          >
            <span>Royal Venues</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
