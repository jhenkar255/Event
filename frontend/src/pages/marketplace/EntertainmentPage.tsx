import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { IEntertainment } from '@shared/types';
import { Music, Star, CheckCircle2, Sparkles, Plus, ArrowLeft } from 'lucide-react';
import { RazorpayCheckoutModal } from '../../components/payments/RazorpayCheckoutModal';

const FALLBACK_ENTERTAINMENTS: IEntertainment[] = [
  {
    _id: 'ent-1',
    name: 'Royal Manganiyar & Langa Folk Musical Troupe',
    category: 'Classical Music',
    description:
      'UNESCO-recognized desert heritage maestros playing Kamaicha, Khartal, Dholak, and soul-stirring Rajasthani royal melodies.',
    price: 75000,
    rating: 5.0,
    reviewsCount: 42,
    vendorName: 'Jodhpur Folk Heritage Ensemble',
    photos: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    ],
    isAvailable: true,
  },
  {
    _id: 'ent-2',
    name: 'Vedic Nadaswaram & Thavil Orchestral Troupe',
    category: 'Classical Music',
    description:
      'Sacred Muhurtham melody ensemble performing classical Carnatic ragas, auspicious Mangala Vadyam, and temple blessings.',
    price: 45000,
    rating: 4.9,
    reviewsCount: 38,
    vendorName: 'Tanjore Divine Melody Guild',
    photos: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    ],
    isAvailable: true,
  },
  {
    _id: 'ent-3',
    name: 'Live Punjabi Dhol Tasha & Bhangra Pathak',
    category: 'Dhol',
    description:
      'High-voltage live Dhol troupe with 8 percussionists and professional Bhangra choreographers for baraat and sangeet celebrations.',
    price: 50000,
    rating: 4.9,
    reviewsCount: 56,
    vendorName: 'Amritsar Beats & Dhol',
    photos: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    ],
    isAvailable: true,
  },
  {
    _id: 'ent-4',
    name: 'Bollywood & Sufi Fusion Live Band',
    category: 'Live Band',
    description:
      '6-piece acoustic and electric live band performing modern Bollywood blockbusters, timeless Sufi qawwalis, and unplugged melodies.',
    price: 95000,
    rating: 4.8,
    reviewsCount: 29,
    vendorName: 'Sufi Sangeet Collective',
    photos: [
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    ],
    isAvailable: true,
  },
  {
    _id: 'ent-5',
    name: 'Royal Cinematic Wedding Film & Drone Crew',
    category: 'Photography',
    description:
      'Master cinematographers with 4K multi-camera rig, licensed drone pilot, same-day teaser edit, and traditional album curation.',
    price: 120000,
    rating: 5.0,
    reviewsCount: 64,
    vendorName: 'Utsav Cinematic Memories',
    photos: [
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
    ],
    isAvailable: true,
  },
];

export const EntertainmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [entertainments, setEntertainments] = useState<IEntertainment[]>(FALLBACK_ENTERTAINMENTS);
  const [loading, setLoading] = useState(false);
  const [selectedEnt, setSelectedEnt] = useState<IEntertainment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    api
      .get<{ success: boolean; entertainment: IEntertainment[] }>('/marketplace/entertainment')
      .then((res: any) => {
        const list = res.entertainment || res.items || res.entertainments || [];
        if (res.success && list.length > 0) {
          setEntertainments(list);
        }
      })
      .catch((err) => console.log('Using curated entertainment fallback:', err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'))}
          className="flex items-center space-x-2 text-xs font-bold text-utsav-maroon-900 dark:text-utsav-gold hover:underline cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Services Directory</span>
        </button>

        <span className="text-[11px] font-semibold text-gray-500">
          UtsavMitra Cultural & Folk Artists
        </span>
      </div>

      <RazorpayCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={selectedEnt?.price || 60000}
        purpose={`Entertainment & Artist Booking: ${selectedEnt?.name}`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/30 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Music className="w-6 h-6 text-utsav-saffron" />
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Live Shehnai, Dhol & Sangeet Artists
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Classical Vedic shehnai masters, vibrant Punjabi dhol tasha, celebrity sangeet choreographers, and cinematographers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {entertainments.map((ent) => (
          <div
            key={ent._id}
            className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-4 hover:border-utsav-gold transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-utsav-gold/30">
                <img
                  src={
                    ent.photos?.[0] ||
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={ent.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-utsav-gold font-bold text-[10px] uppercase">
                  {ent.category}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400 flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{ent.rating} ({ent.reviewsCount || 24})</span>
                </div>
              </div>

              <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                {ent.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {ent.description}
              </p>
            </div>

            <div className="pt-3 border-t border-utsav-gold/20 flex items-center justify-between">
              <span className="font-heading text-base font-bold text-utsav-maroon-900 dark:text-utsav-saffron">
                ₹{(ent.price / 1000).toFixed(0)}k <span className="text-xs font-normal text-gray-500">/ day</span>
              </span>
              <button
                onClick={() => {
                  setSelectedEnt(ent);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold shadow-md"
              >
                Book Artist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
