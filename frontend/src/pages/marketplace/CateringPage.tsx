import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { ICateringPackage } from '@shared/types';
import { Utensils, Star, CheckCircle2, Sparkles, Plus, Eye, X, Flame, ChefHat, ArrowLeft } from 'lucide-react';
import { RazorpayCheckoutModal } from '../../components/payments/RazorpayCheckoutModal';

const FALLBACK_CATERINGS: ICateringPackage[] = [
  {
    _id: 'cat-1',
    name: 'Royal Rajasthani Rajwada Feast',
    category: 'Royal Rajasthani',
    cuisineType: 'Pure Desi Ghee Rajwada',
    description:
      'Authentic royal culinary journey through the royal kitchens of Mewar & Marwar, prepared with pure desi ghee, clay tandoors, and royal hospitality.',
    pricePerPlate: 1250,
    minimumGuests: 80,
    rating: 5.0,
    vendorName: 'Rajwada Royal Hospitality & Rasoi',
    photos: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    ],
    menuItems: {
      welcomeDrinks: ['Kesar Badam Milk (Hot/Cold)', 'Jodhpuri Jaljeera Boondi', 'Shahi Gulab Sharbat'],
      starters: ['Pyaaz Kachori with Chutneys', 'Paneer Tikka Angara', 'Rajasthani Mirchi Vada', 'Dahi Gujiya'],
      mainCourse: [
        'Dal Baati Churma (3 varieties)',
        'Royal Gatte ki Sabzi',
        'Traditional Ker Sangri',
        'Shahi Paneer Mewari',
        'Rajasthani Kadhi',
      ],
      breadsAndRice: ['Missi Roti', 'Bajra Roti with White Butter', 'Ghee Phulka', 'Jodhpuri Kabuli Biryani'],
      desserts: ['Hot Ghevar with Malai Rabri', 'Mawa Kachori', 'Moong Dal Halwa', 'Kesar Matka Kulfi'],
      liveCounters: ['Live Jalebi & Rabri Kadai', 'Bikaneri Chaat & Pani Puri Bar', 'Kulhad Masala Chai Station'],
    },
    isAvailable: true,
  },
  {
    _id: 'cat-2',
    name: 'Grand Dakshin Banana Leaf Sadya',
    category: 'South Indian',
    cuisineType: 'Traditional Plantain Leaf',
    description:
      'Pure authentic Vedic & temple ceremonial feast served on fresh banana leaves with over 24 traditional preparations made with freshly pressed coconut and aromatic spices.',
    pricePerPlate: 950,
    minimumGuests: 75,
    rating: 4.9,
    vendorName: 'Dakshin Grand Traditional Caterers',
    photos: [
      'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    ],
    menuItems: {
      welcomeDrinks: ['Fresh Elaneer (Tender Coconut)', 'Traditional Panakam', 'Neer Mor (Spiced Buttermilk)'],
      starters: ['Crispy Medu Vada', 'Sarkara Varatti & Banana Chips', 'Jackfruit Fritters', 'Parippu Vada'],
      mainCourse: [
        'Grand Avial with Coconut Gravy',
        'Olan with Ash Gourd & Coconut Milk',
        'Bisi Bele Bath with Boondi',
        'Kalyana Sambar & Mysore Rasam',
        'Beans & Carrot Poriyal',
      ],
      breadsAndRice: ['Kerala Red Matta Rice', 'Steamed Ponni Rice', 'Curd Rice with Pomegranate', 'Crispy Appalam'],
      desserts: ['Elaneer Payasam (Tender Coconut)', 'Mysore Pak', 'Palada Pradhaman', 'Parippu Payasam with Jaggery'],
      liveCounters: ['Live Filter Kaapi (Coffee) Station', 'Live Crispy Ghee Roast Dosa & Appam Bar', 'Hot Vada Fry Counter'],
    },
    isAvailable: true,
  },
  {
    _id: 'cat-3',
    name: 'Punjabi Shahi Dawat & Tandoor Banquet',
    category: 'North Indian',
    cuisineType: 'North Indian & Live Tandoor',
    description:
      'Rich, celebratory North Indian feast featuring slow-simmered 24-hour gravies, live charcoal tandoor skewers, artisanal Amritsari kulchas, and lavish desserts.',
    pricePerPlate: 1100,
    minimumGuests: 100,
    rating: 4.9,
    vendorName: 'Sher-e-Punjab Royal Dawat',
    photos: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    ],
    menuItems: {
      welcomeDrinks: ['Pista Kesar Lassi in Earthen Pots', 'Aam Panna', 'Fresh Watermelon Mint Spritzer'],
      starters: ['Paneer Malai Tikka', 'Tandoori Soya Chaap', 'Amritsari Paneer Pakora', 'Hara Bhara Kebab'],
      mainCourse: [
        'Dal Makhani (Slow-cooked 24 Hours in Butter)',
        'Paneer Butter Masala',
        'Amritsari Pindi Chole',
        'Subz Dum Biryani with Burani Garlic Raita',
      ],
      breadsAndRice: ['Butter Garlic Naan', 'Stuffed Amritsari Kulcha', 'Laccha Paratha', 'Jeera Basmati Rice'],
      desserts: ['Gulab Jamun with Pista Rabri', 'Angoori Rasmalai', 'Desi Ghee Gajar Ka Halwa', 'Kulfi Falooda'],
      liveCounters: ['Live Clay Tandoor & Naan Station', 'Delhi 6 Chaat Papdi & Tikki Bar', 'Live Tawa Ice Cream Rolls'],
    },
    isAvailable: true,
  },
  {
    _id: 'cat-4',
    name: 'Gujarati Royal Rasoi & Mahathali',
    category: 'Gujarati Thali',
    cuisineType: 'Authentic Kathiyawadi & Surati',
    description:
      'A harmonious balance of sweet, spicy, and tangy flavors with traditional Gujarati hospitality. Prepared with organic spices and heirloom family recipes.',
    pricePerPlate: 900,
    minimumGuests: 80,
    rating: 4.8,
    vendorName: 'Surat Royal Rasoi & Thali',
    photos: [
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    ],
    menuItems: {
      welcomeDrinks: ['Kokum Sharbat', 'Kesar Masala Chaas', 'Mango Panna with Mint'],
      starters: ['Nylon Khaman Dhokla', 'Khandvi with Mustard Tadka', 'Methi Na Gota', 'Lilva Kachori'],
      mainCourse: [
        'Surati Undhiyu with Puri',
        'Gujarati Khatti-Meethi Dal',
        'Sev Tameta Nu Shaak',
        'Bhindi Sambhariya',
      ],
      breadsAndRice: ['Puri with Ghee', 'Phulka Rotli', 'Gujarati Vaghareli Khichdi with Kadhi'],
      desserts: ['Kesar Pista Shrikhand', 'Basundi with Charoli', 'Mohan Thal', 'Doodhpak'],
      liveCounters: ['Live Fafda & Hot Jalebi Station', 'Dahi Vada & Ragda Pattice Bar'],
    },
    isAvailable: true,
  },
  {
    _id: 'cat-5',
    name: 'Bengali Zamindari Royal Bhoj',
    category: 'Bengali Feast',
    cuisineType: 'Traditional Bengali Royal',
    description:
      'A majestic spread steeped in aristocratic Bengali heritage, featuring aromatic Gobindobhog rice, rich chhana curries, and iconic Kolkata artisanal sweets.',
    pricePerPlate: 1150,
    minimumGuests: 70,
    rating: 4.9,
    vendorName: 'Kolkata Zamindari Caterers',
    photos: [
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    ],
    menuItems: {
      welcomeDrinks: ['Gondhoraj Lebu Ghol', 'Aam Pora Shorbot'],
      starters: ['Mochar Chop (Banana Blossom Cutlets)', 'Postor Bora', 'Beguni', 'Paneer Singara'],
      mainCourse: [
        'Chhanar Dalna',
        'Dhokar Dalna with Lentil Cakes',
        'Potoler Dorma',
        'Basanti Pulao with Kaju & Kishmish',
      ],
      breadsAndRice: ['Fluffy Luchi with Chholar Dal', 'Gobindobhog Rice', 'Radhaballabhi'],
      desserts: ['Classic Mishti Doi in Clay Matka', 'Nolen Gurer Rosogolla', 'Kacha Golla Platter'],
      liveCounters: ['Live Sandesh & Warm Rosogolla Station', 'Kolkata Kathi Roll Counter'],
    },
    isAvailable: true,
  },
  {
    _id: 'cat-6',
    name: 'Pure Satvik Temple Prasadam Bhoj',
    category: 'Jain',
    cuisineType: '100% Satvik & Jain Friendly',
    description:
      'Pure Ayurvedic & Satvik cooking without onion, garlic, or root vegetables. Prepared exclusively in pure A2 cow ghee with divine sacred chanting.',
    pricePerPlate: 850,
    minimumGuests: 50,
    rating: 5.0,
    vendorName: 'Vedic Satvik Rasoi Trust',
    photos: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    ],
    menuItems: {
      welcomeDrinks: ['Panchamrit & Tulsi Jal', 'Badam Kesar Thandai', 'Fresh Coconut Water'],
      starters: ['Crispy Sabudana Vada', 'Kuttu & Singhaada Tikki', 'Roasted Makhana Chaat'],
      mainCourse: [
        'Shahi Paneer in Cashew & Melon Seed Gravy',
        'Moong Dal Khichdi with Pure Ghee',
        'Lauki Kofta in Golden Gravy',
        'Satvik Kaddu Halwa',
      ],
      breadsAndRice: ['Rajgira & Kuttu Puri', 'Wheat Ghee Phulka', 'Samak & Basmati Rice'],
      desserts: ['Badam Halwa (Pure Desi Ghee)', 'Kesar Mawa Kheer', 'Mathura Peda'],
      liveCounters: ['Live Desi Ghee Kheer Counter', 'Fresh Seasonal Fruit & Coconut Bar'],
    },
    isAvailable: true,
  },
];

export const CateringPage: React.FC = () => {
  const navigate = useNavigate();
  const [caterings, setCaterings] = useState<ICateringPackage[]>(FALLBACK_CATERINGS);
  const [loading, setLoading] = useState(false);
  const [selectedCatering, setSelectedCatering] = useState<ICateringPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [viewingMenu, setViewingMenu] = useState<ICateringPackage | null>(null);

  useEffect(() => {
    api
      .get<{ success: boolean; catering: ICateringPackage[] }>('/marketplace/catering')
      .then((res: any) => {
        const list = res.catering || res.packages || res.caterings || [];
        if (res.success && list.length > 0) {
          setCaterings(list);
        }
      })
      .catch((err) => console.log('Using curated catering fallback:', err));
  }, []);

  const filteredCaterings = caterings.filter((cat) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'VEG') return cat.category !== 'Non-Veg';
    if (filterCategory === 'JAIN') return cat.category === 'Jain' || cat.category === 'Veg';
    if (filterCategory === 'THALI')
      return cat.category === 'South Indian' || cat.category === 'Gujarati Thali' || cat.category === 'Royal Rajasthani';
    return true;
  });

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
          UtsavMitra Royal Gastronomy
        </span>
      </div>

      {/* Razorpay Escrow Modal */}
      <RazorpayCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={(selectedCatering?.pricePerPlate || 1200) * 100 * 100}
        purpose={`Royal Catering Escrow Booking: ${selectedCatering?.name}`}
      />

      {/* Menu Detail Modal */}
      {viewingMenu && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-utsav-ivory dark:bg-utsav-maroon-950 w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-utsav-gold/60 overflow-hidden flex flex-col max-h-[90vh] relative z-[10000]">
            <div className="p-6 bg-gradient-to-r from-utsav-maroon-900 to-utsav-maroon-800 text-utsav-ivory border-b border-utsav-gold/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-utsav-maroon-950 border border-utsav-gold">
                  <Utensils className="w-6 h-6 text-utsav-gold" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-utsav-gold">
                    {viewingMenu.name}
                  </h3>
                  <p className="text-xs text-utsav-ivory/80">
                    ₹{viewingMenu.pricePerPlate}/plate • {viewingMenu.cuisineType || viewingMenu.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingMenu(null)}
                className="p-1.5 rounded-lg text-utsav-ivory/70 hover:text-utsav-gold hover:bg-utsav-maroon-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-utsav-brown dark:text-utsav-ivory">
              {viewingMenu.menuItems?.welcomeDrinks && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-utsav-saffron uppercase tracking-wider">
                    🍹 Welcome Drinks & Sharbat
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingMenu.menuItems.welcomeDrinks.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingMenu.menuItems?.starters && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-utsav-saffron uppercase tracking-wider">
                    🍢 Traditional Starters & Appetizers
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingMenu.menuItems.starters.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingMenu.menuItems?.mainCourse && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-utsav-saffron uppercase tracking-wider">
                    🍛 Royal Main Course Curries & Delicacies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingMenu.menuItems.mainCourse.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingMenu.menuItems?.breadsAndRice && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-utsav-saffron uppercase tracking-wider">
                    🍚 Breads, Artisanal Rotis & Fragrant Rice
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingMenu.menuItems.breadsAndRice.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingMenu.menuItems?.desserts && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-utsav-saffron uppercase tracking-wider">
                    🍨 Auspicious Desserts & Mithai
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingMenu.menuItems.desserts.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingMenu.menuItems?.liveCounters && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-utsav-saffron-50 dark:bg-utsav-maroon-900/60 border border-utsav-saffron/40">
                  <h4 className="font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider flex items-center space-x-1.5">
                    <Flame className="w-4 h-4 text-utsav-saffron" />
                    <span>Live Chef & Food Stations Included</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {viewingMenu.menuItems.liveCounters.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-utsav-maroon-950 text-utsav-maroon-900 dark:text-utsav-gold border border-utsav-gold/30 font-bold"
                      >
                        ✨ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-utsav-beige-100 dark:bg-utsav-maroon-900 border-t border-utsav-gold/30 flex items-center justify-between">
              <button
                onClick={() => setViewingMenu(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:underline"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedCatering(viewingMenu);
                  setViewingMenu(null);
                  setIsModalOpen(true);
                }}
                className="px-5 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-md"
              >
                Book This Feast Escrow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/30 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Utensils className="w-7 h-7 text-utsav-saffron" />
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Regional Gastronomy & Feasts
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Authentic Rajasthani Rajwada, South Indian Banana Leaf Sadya, Gujarati Mahathali, and Punjabi Tandoor banquets.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL', label: 'All Feasts' },
            { id: 'VEG', label: 'Pure Veg (शाकाहारी)' },
            { id: 'JAIN', label: 'Jain / Satvik' },
            { id: 'THALI', label: 'Regional Thali' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterCategory(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterCategory === f.id
                  ? 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold shadow-sm'
                  : 'bg-utsav-beige-100 dark:bg-utsav-maroon-900 text-gray-600 dark:text-gray-300 hover:border-utsav-gold/60 border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCaterings.map((cat) => (
          <div
            key={cat._id}
            className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-4 hover:border-utsav-gold transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-utsav-gold/30">
                <img
                  src={
                    cat.photos?.[0] ||
                    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-emerald-400 font-bold text-[10px] uppercase">
                  {cat.cuisineType || cat.category}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400">
                  ★ {cat.rating || 5.0} (Desi Ghee)
                </div>
              </div>

              <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                {cat.description}
              </p>

              {/* Sample items */}
              {cat.menuItems?.mainCourse && (
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-utsav-saffron block mb-1">
                    Featured Delicacies:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cat.menuItems.mainCourse.slice(0, 3).map((it, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-utsav-beige-100 dark:bg-utsav-maroon-950 text-[10px] text-utsav-brown dark:text-utsav-ivory border border-utsav-gold/20"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-utsav-gold/20 flex items-center justify-between gap-2">
              <div>
                <span className="font-heading text-base font-bold text-utsav-maroon-900 dark:text-utsav-saffron">
                  ₹{cat.pricePerPlate}
                </span>
                <span className="text-xs text-gray-500"> / plate</span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setViewingMenu(cat)}
                  className="p-2 rounded-xl bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-utsav-brown dark:text-utsav-ivory hover:bg-utsav-beige-300 text-xs font-bold"
                  title="View Menu"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedCatering(cat);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold shadow-md"
                >
                  Book Catering
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
