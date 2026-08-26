import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { IDecoration } from '@shared/types';
import { Flower2, Star, CheckCircle2, Sparkles, Plus } from 'lucide-react';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import { RazorpayCheckoutModal } from '../../components/payments/RazorpayCheckoutModal';

const FALLBACK_DECORATIONS: IDecoration[] = [
  {
    _id: 'dec-1',
    name: 'Royal Rajasthani Haveli Mandap Theme',
    category: 'Mandap',
    style: 'Royal Rajasthani',
    vendorName: 'Jaipur Heritage Mandap Guild',
    description:
      'Intricate carved jharokha backdrops, authentic marigold chandeliers, brass urlis with floating diyas, and crimson velvet draping.',
    price: 250000,
    photos: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 5.0,
    isAvailable: true,
  },
  {
    _id: 'dec-2',
    name: 'Vedic Jasmine & Banana Stem Mandap',
    category: 'Mandap',
    style: 'South Indian Vedic',
    vendorName: 'Madurai Malli Vedic Decorators',
    description:
      'Fragrant Madurai Malli (Jasmine) ceiling cascades, fresh green banana stem pillars, traditional Kuthuvilakku brass lamps, and lotus pond stage.',
    price: 180000,
    photos: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.9,
    isAvailable: true,
  },
  {
    _id: 'dec-3',
    name: 'Vrindavan Lotus & Fairy Light Canopy',
    category: 'Stage',
    style: 'Modern Cultural',
    vendorName: 'Vrindavan Floral Creations',
    description:
      'Giant gold-leaf lotus petals, amber warm lighting, 10,000 fresh marigold chains, and a grand 40-foot royal arch entrance walkway.',
    price: 220000,
    photos: [
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.8,
    isAvailable: true,
  },
  {
    _id: 'dec-4',
    name: 'Punjabi Phulkari & Kaleidoscope Sangeet Stage',
    category: 'Stage',
    style: 'Punjabi Festive',
    vendorName: 'Amritsar Festive Decors',
    description:
      'Vibrant hand-woven Phulkari tapestries, kaleidoscope floral ring installations, fairy light tunnel, and traditional dholak lounge seating.',
    price: 160000,
    photos: [
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.9,
    isAvailable: true,
  },
];

export const DecorationsPage: React.FC = () => {
  const [decorations, setDecorations] = useState<IDecoration[]>(FALLBACK_DECORATIONS);
  const [loading, setLoading] = useState(false);
  const [selectedDecor, setSelectedDecor] = useState<IDecoration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    api
      .get<{ success: boolean; decorations: IDecoration[] }>('/marketplace/decorations')
      .then((res: any) => {
        const list = res.decorations || res.decor || [];
        if (res.success && list.length > 0) {
          setDecorations(list);
        }
      })
      .catch((err) => console.log('Using curated decor fallback:', err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <RazorpayCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={selectedDecor?.price || 150000}
        purpose={`Mandap & Decor Booking: ${selectedDecor?.name}`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/30 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Flower2 className="w-6 h-6 text-utsav-saffron" />
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Royal Mandaps & Floral Decor Themes
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Authentic Marigold garlands, brass diyas, crystal chandeliers, and velvet drapery.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {decorations.map((dec) => (
          <div
            key={dec._id}
            className="rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl overflow-hidden hover:border-utsav-gold transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative h-56 w-full">
              <img
                src={
                  dec.photos?.[0] ||
                  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
                }
                alt={dec.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-utsav-gold text-[10px] font-bold uppercase">
                {dec.style || dec.category}
              </span>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                  {dec.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  {dec.description}
                </p>
              </div>

              <div className="pt-3 border-t border-utsav-gold/20 flex items-center justify-between">
                <span className="font-heading text-lg font-bold text-utsav-maroon-900 dark:text-utsav-saffron">
                  ₹{(dec.price / 100000).toFixed(1)} Lakhs
                </span>
                <button
                  onClick={() => {
                    setSelectedDecor(dec);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold shadow-md"
                >
                  Book Decor
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
