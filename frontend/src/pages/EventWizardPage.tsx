import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { IVenue, IDecoration, ICateringPackage, IEntertainment } from '@shared/types';
import { INDIAN_EVENT_TYPES, INDIAN_TRADITIONS, INDIAN_CITIES } from '@shared/constants';
import {
  Calendar,
  Sparkles,
  MapPin,
  Utensils,
  Flower2,
  Music,
  IndianRupee,
  Mail,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Users,
  Clock,
  ShieldCheck,
  Building,
  Star,
  Check,
  Eye,
  X,
  Flame,
  ChefHat,
  HeartHandshake,
} from 'lucide-react';
import { DiyaIcon, MandalaCorner } from '../components/layout/IndianMotifs';
import confetti from 'canvas-confetti';

// ==================== CURATED FALLBACK DATASETS ====================
const FALLBACK_VENUES: IVenue[] = [
  {
    _id: 'v-1',
    name: 'The Royal Heritage Haveli & Courtyard',
    description: 'Majestic 18th century Rajasthani heritage palace with carved stone arches, royal courtyard, and air-conditioned banquet suites.',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Palace Road, Near Amber Fort',
    latitude: 26.9124,
    longitude: 75.7873,
    capacity: { min: 100, max: 800 },
    pricePerDay: 450000,
    rating: 4.9,
    reviewCount: 48,
    vendorName: 'Royal Rajasthan Heritage Hospitality',
    photos: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    ],
    features: {
      indoor: true,
      outdoor: true,
      ac: true,
      parking: true,
      cateringAvailable: true,
      roomsAvailable: 25,
      alcoholAllowed: true,
      powerBackup: true,
    },
    isAvailable: true,
  },
  {
    _id: 'v-2',
    name: 'Grand Dakshin Vedic Temple Pavilion',
    description: 'Serene Vedic architectural pavilion surrounded by manicured lawns, lotus ponds, and temple-style pillar mandapams.',
    city: 'Bangalore',
    state: 'Karnataka',
    address: 'Kanakapura Heritage Valley',
    latitude: 12.9716,
    longitude: 77.5946,
    capacity: { min: 150, max: 1000 },
    pricePerDay: 380000,
    rating: 4.9,
    reviewCount: 36,
    vendorName: 'Vedic Pavilions Bangalore',
    photos: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    ],
    features: {
      indoor: true,
      outdoor: true,
      ac: true,
      parking: true,
      cateringAvailable: true,
      roomsAvailable: 18,
      alcoholAllowed: false,
      powerBackup: true,
    },
    isAvailable: true,
  },
  {
    _id: 'v-3',
    name: 'Saffron Courtyard & Regal Lawns',
    description: 'Expansive farm estate with royal glasshouse ballroom, lush green lawns, fountain pathways, and high-capacity parking.',
    city: 'Delhi',
    state: 'Delhi NCR',
    address: 'Chhatarpur Farms, Mehrauli',
    latitude: 28.6139,
    longitude: 77.209,
    capacity: { min: 200, max: 1200 },
    pricePerDay: 550000,
    rating: 4.8,
    reviewCount: 52,
    vendorName: 'Saffron Banquet Estates',
    photos: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    ],
    features: {
      indoor: true,
      outdoor: true,
      ac: true,
      parking: true,
      cateringAvailable: true,
      roomsAvailable: 30,
      alcoholAllowed: true,
      powerBackup: true,
    },
    isAvailable: true,
  },
  {
    _id: 'v-4',
    name: 'Lakeside Maharana Heritage Palace',
    description: 'Iconic waterfront royal palace with panoramic lake views, marble terraces, royal boat arrival jetty, and luxury guest suites.',
    city: 'Udaipur',
    state: 'Rajasthan',
    address: 'Lake Pichola Promenade',
    latitude: 24.5854,
    longitude: 73.7125,
    capacity: { min: 100, max: 600 },
    pricePerDay: 650000,
    rating: 5.0,
    reviewCount: 65,
    vendorName: 'Mewar Royal Estates',
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    ],
    features: {
      indoor: true,
      outdoor: true,
      ac: true,
      parking: true,
      cateringAvailable: true,
      roomsAvailable: 40,
      alcoholAllowed: true,
      powerBackup: true,
    },
    isAvailable: true,
  },
];

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
        'Dal Baati Churma (3 types of Churma: Besan, Gulab, Wheat)',
        'Royal Gatte ki Sabzi',
        'Traditional Ker Sangri',
        'Shahi Paneer Mewari',
        'Rajasthani Kadhi with Pakodi',
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
      desserts: ['Classic Mishti Doi in Clay Matka', 'Nolen Gurer Rosogolla', 'Kacha Golla & Sandesh Platter'],
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
      starters: ['Crispy Sabudana Vada', 'Kuttu & Singhaada Tikki', 'Roasted Makhana & Dryfruit Chaat'],
      mainCourse: [
        'Shahi Paneer in Cashew & Melon Seed Gravy',
        'Moong Dal Khichdi with Pure Ghee',
        'Lauki Kofta in Golden Gravy',
        'Satvik Kaddu Halwa & Subzi',
      ],
      breadsAndRice: ['Rajgira & Kuttu Puri', 'Wheat Ghee Phulka', 'Samak & Basmati Rice'],
      desserts: ['Badam Halwa (Pure Desi Ghee)', 'Kesar Mawa Kheer', 'Mathura Peda'],
      liveCounters: ['Live Desi Ghee Kheer Counter', 'Fresh Seasonal Fruit & Coconut Bar'],
    },
    isAvailable: true,
  },
];

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

const SHLOKA_PRESETS = [
  { label: 'Ganesh Shloka', text: '|| ॐ श्री गणेशाय नमः ||' },
  { label: 'Mahamangalam', text: 'सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके | शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते' },
  { label: 'South Indian Muhurtham', text: 'मंगलम् भगवान् विष्णुः मङ्गलम् गरुडध्वजः | मङ्गलम् पुण्डरीकाक्षः मङ्गलाय तनो हरिः' },
  { label: 'Rajasthani Blessing', text: 'खम्मा घणी सा | पधारो म्हारे देस | शुभ लाभ' },
  { label: 'Vedic Griha Pravesh', text: 'ॐ वास्तोष्पते प्रतिजानीह्यस्मान् त्स्वावेशो अनमीवो भवा नः' },
];

export const EventWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const wizardContainerRef = useRef<HTMLDivElement>(null);

  const prefill = (location.state as any)?.prefillData;

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    if (wizardContainerRef.current) {
      wizardContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  // Form State
  const [name, setName] = useState(prefill?.name || 'Auspicious Royal Celebration');
  const [eventType, setEventType] = useState(prefill?.eventType || 'Wedding');
  const [culturalTradition, setCulturalTradition] = useState(prefill?.culturalTradition || 'Rajasthani');
  const [date, setDate] = useState(
    prefill?.date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [time, setTime] = useState(prefill?.time || '10:00 AM');
  const [city, setCity] = useState(prefill?.city || 'Jaipur');
  const [address, setAddress] = useState(prefill?.address || 'Palace Road, Jaipur');
  const [guestCount, setGuestCount] = useState(prefill?.guestCount || 300);
  const [budget, setBudget] = useState(prefill?.budget || 1000000);

  // Marketplace selection state
  const [venues, setVenues] = useState<IVenue[]>(FALLBACK_VENUES);
  const [selectedVenueId, setSelectedVenueId] = useState<string>(FALLBACK_VENUES[0]._id);

  const [decorations, setDecorations] = useState<IDecoration[]>(FALLBACK_DECORATIONS);
  const [selectedDecorId, setSelectedDecorId] = useState<string>(FALLBACK_DECORATIONS[0]._id);

  const [caterings, setCaterings] = useState<ICateringPackage[]>(FALLBACK_CATERINGS);
  const [selectedCateringId, setSelectedCateringId] = useState<string>(FALLBACK_CATERINGS[0]._id);
  const [cateringDietFilter, setCateringDietFilter] = useState<string>('ALL');
  const [viewingMenuCat, setViewingMenuCat] = useState<ICateringPackage | null>(null);
  const [jainGuestCount, setJainGuestCount] = useState<number>(0);
  const [cateringNotes, setCateringNotes] = useState<string>('');

  const [entertainments, setEntertainments] = useState<IEntertainment[]>(FALLBACK_ENTERTAINMENTS);
  const [selectedEntertainmentId, setSelectedEntertainmentId] = useState<string>(FALLBACK_ENTERTAINMENTS[0]._id);

  // Digital invite details
  const [hostNames, setHostNames] = useState('Sharma & Verma Family');
  const [customMessage, setCustomMessage] = useState(
    'We cordially invite you to bless the auspicious union with your gracious presence and heartfelt wishes.'
  );
  const [shlokaOrQuote, setShlokaOrQuote] = useState('|| ॐ श्री गणेशाय नमः ||');

  useEffect(() => {
    // Fetch marketplace catalog with resilient fallbacks
    api
      .get<{ success: boolean; venues: IVenue[] }>('/venues')
      .then((res) => {
        if (res.success && res.venues && res.venues.length > 0) {
          setVenues(res.venues);
          setSelectedVenueId(res.venues[0]._id);
        }
      })
      .catch((err) => console.log('Using default curated venues catalog:', err));

    api
      .get<{ success: boolean; decorations: IDecoration[] }>('/marketplace/decorations')
      .then((res: any) => {
        const list = res.decorations || res.decor || [];
        if (res.success && list.length > 0) {
          setDecorations(list);
          setSelectedDecorId(list[0]._id);
        }
      })
      .catch((err) => console.log('Using default curated decor catalog:', err));

    api
      .get<{ success: boolean; catering: ICateringPackage[] }>('/marketplace/catering')
      .then((res: any) => {
        const list = res.catering || res.packages || res.caterings || [];
        if (res.success && list.length > 0) {
          setCaterings(list);
          setSelectedCateringId(list[0]._id);
        }
      })
      .catch((err) => console.log('Using default curated catering catalog:', err));

    api
      .get<{ success: boolean; entertainment: IEntertainment[] }>('/marketplace/entertainment')
      .then((res: any) => {
        const list = res.entertainment || res.items || res.entertainments || [];
        if (res.success && list.length > 0) {
          setEntertainments(list);
          setSelectedEntertainmentId(list[0]._id);
        }
      })
      .catch((err) => console.log('Using default curated entertainment catalog:', err));
  }, []);

  const steps = [
    { num: 1, title: 'Basics & Tradition', icon: Calendar },
    { num: 2, title: 'Heritage Venue', icon: Building },
    { num: 3, title: 'Catering & Feast', icon: Utensils },
    { num: 4, title: 'Mandap & Decor', icon: Flower2 },
    { num: 5, title: 'Music & Photo', icon: Music },
    { num: 6, title: 'Digital E-Card', icon: Mail },
    { num: 7, title: 'Review & Create', icon: Sparkles },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmitEvent = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        type: eventType,
        eventType,
        culturalTradition,
        date,
        startTime: time,
        location: {
          address,
          city,
          state: city === 'Bangalore' ? 'Karnataka' : city === 'Mumbai' || city === 'Pune' ? 'Maharashtra' : 'Rajasthan',
          pincode: '302001',
        },
        guestCount: Number(guestCount),
        budget: Number(budget),
        venueId: selectedVenueId || undefined,
        decorationId: selectedDecorId || undefined,
        cateringId: selectedCateringId || undefined,
        entertainmentId: selectedEntertainmentId || undefined,
        cateringNotes: `${cateringNotes ? cateringNotes + ' | ' : ''}Jain Plates: ${jainGuestCount}`,
        invitation: {
          hostNames,
          title: name,
          customMessage,
          shlokaOrQuote,
        },
      };

      const res = await api.post<{ success: boolean; event: any }>('/events', payload);
      if (res.success && res.event) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#C9A227', '#F4A340', '#7A1F2B', '#10B981'],
        });

        // Redirect directly to the newly created Event Command Center!
        navigate(`/events/${res.event._id}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create celebration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVenue = venues.find((v) => v._id === selectedVenueId) || venues[0];
  const selectedDecor = decorations.find((d) => d._id === selectedDecorId) || decorations[0];
  const selectedCatering = caterings.find((c) => c._id === selectedCateringId) || caterings[0];
  const selectedEntertainment =
    entertainments.find((e) => e._id === selectedEntertainmentId) || entertainments[0];

  const venueCost = selectedVenue?.pricePerDay || 0;
  const decorCost = selectedDecor?.price || 0;
  const cateringCost = (selectedCatering?.pricePerPlate || 0) * guestCount;
  const entertainmentCost = selectedEntertainment?.price || 0;
  const totalEstimatedCost = venueCost + decorCost + cateringCost + entertainmentCost;
  const budgetDiff = budget - totalEstimatedCost;

  // Filter caterings
  const filteredCaterings = caterings.filter((cat) => {
    if (cateringDietFilter === 'ALL') return true;
    if (cateringDietFilter === 'VEG') return cat.category !== 'Non-Veg';
    if (cateringDietFilter === 'JAIN') return cat.category === 'Jain' || cat.category === 'Veg';
    if (cateringDietFilter === 'THALI')
      return cat.category === 'South Indian' || cat.category === 'Gujarati Thali' || cat.category === 'Royal Rajasthani';
    return true;
  });

  return (
    <div ref={wizardContainerRef} className="max-w-5xl mx-auto px-4 py-8 space-y-8 scroll-mt-28">
      {/* Modal for detailed menu view */}
      {viewingMenuCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-utsav-ivory dark:bg-utsav-maroon-950 w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-utsav-gold/60 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-utsav-maroon-900 to-utsav-maroon-800 text-utsav-ivory border-b border-utsav-gold/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-utsav-maroon-950 border border-utsav-gold">
                  <Utensils className="w-6 h-6 text-utsav-gold" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-utsav-gold">
                    {viewingMenuCat.name}
                  </h3>
                  <p className="text-xs text-utsav-ivory/80">
                    ₹{viewingMenuCat.pricePerPlate}/plate • {viewingMenuCat.cuisineType || viewingMenuCat.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingMenuCat(null)}
                className="p-1.5 rounded-lg text-utsav-ivory/70 hover:text-utsav-gold hover:bg-utsav-maroon-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-utsav-brown dark:text-utsav-ivory">
              {viewingMenuCat.menuItems?.welcomeDrinks && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-utsav-saffron uppercase tracking-wider flex items-center space-x-1.5">
                    <span>🍹 Welcome Drinks & Sharbat</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingMenuCat.menuItems.welcomeDrinks.map((item, idx) => (
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

              {viewingMenuCat.menuItems?.starters && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-utsav-saffron uppercase tracking-wider flex items-center space-x-1.5">
                    <span>🍢 Traditional Starters & Appetizers</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingMenuCat.menuItems.starters.map((item, idx) => (
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

              {viewingMenuCat.menuItems?.mainCourse && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-utsav-saffron uppercase tracking-wider flex items-center space-x-1.5">
                    <span>🍛 Royal Main Course Curries & Delicacies</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingMenuCat.menuItems.mainCourse.map((item, idx) => (
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

              {viewingMenuCat.menuItems?.breadsAndRice && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-utsav-saffron uppercase tracking-wider flex items-center space-x-1.5">
                    <span>🍚 Breads, Artisanal Rotis & Fragrant Rice</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingMenuCat.menuItems.breadsAndRice.map((item, idx) => (
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

              {viewingMenuCat.menuItems?.desserts && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-utsav-saffron uppercase tracking-wider flex items-center space-x-1.5">
                    <span>🍨 Auspicious Desserts & Mithai</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingMenuCat.menuItems.desserts.map((item, idx) => (
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

              {viewingMenuCat.menuItems?.liveCounters && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-utsav-saffron-50 dark:bg-utsav-maroon-900/60 border border-utsav-saffron/40">
                  <h4 className="font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider flex items-center space-x-1.5">
                    <Flame className="w-4 h-4 text-utsav-saffron" />
                    <span>Live Chef & Food Stations Included</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {viewingMenuCat.menuItems.liveCounters.map((item, idx) => (
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
              <span className="text-xs text-gray-500 font-semibold">
                Serving {guestCount} Guests = ₹{((viewingMenuCat.pricePerPlate * guestCount) / 100000).toFixed(2)} Lakhs
              </span>
              <button
                onClick={() => {
                  setSelectedCateringId(viewingMenuCat._id);
                  setViewingMenuCat(null);
                }}
                className="px-5 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-md flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Select This Feast Package</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Header */}
      <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold">
            <DiyaIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Celebration Planner Wizard
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configure your event parameters, traditional venues, regional feasts, and signed QR passes.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
            Step {currentStep} of {steps.length}:
          </span>
          <span className="text-xs font-semibold text-utsav-saffron">{steps[currentStep - 1].title}</span>
        </div>
      </div>

      {/* Steps Indicator Strip */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none gap-2">
        {steps.map((st) => {
          const Icon = st.icon;
          const isDone = st.num < currentStep;
          const isCurrent = st.num === currentStep;

          return (
            <button
              key={st.num}
              onClick={() => setCurrentStep(st.num)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isCurrent
                  ? 'bg-utsav-maroon-800 text-utsav-gold border-utsav-gold shadow-md'
                  : isDone
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-500/40'
                  : 'bg-white dark:bg-utsav-maroon-950 text-gray-400 border-utsav-gold/20'
              }`}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-black/10">
                {isDone ? '✓' : st.num}
              </span>
              <span>{st.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step Contents */}
      <div className="p-6 sm:p-8 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl space-y-6">
        {/* Step 1: Basics & Tradition */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold border-b border-utsav-gold/20 pb-2 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-utsav-saffron" />
              <span>Event Details & Cultural Tradition</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  Celebration Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Rajasthani Wedding of Aarav & Ananya"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  Celebration Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                >
                  {INDIAN_EVENT_TYPES.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.icon} {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  Cultural Tradition (12 Regional Styles)
                </label>
                <select
                  value={culturalTradition}
                  onChange={(e) => setCulturalTradition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                >
                  {INDIAN_TRADITIONS.map((trad) => (
                    <option key={trad.id} value={trad.name}>
                      {trad.name} Tradition
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  Auspicious Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  Muhurtham Time
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  Expected Guest Headcount
                </label>
                <input
                  type="number"
                  min={10}
                  max={5000}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  Total Budget Allocation (INR ₹)
                </label>
                <input
                  type="number"
                  step={50000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  City & Destination
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  Location / Address Note
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Palace Road, Jaipur"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Heritage Venue */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-utsav-gold/20 pb-2">
              <h2 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold flex items-center space-x-2">
                <Building className="w-5 h-5 text-utsav-saffron" />
                <span>Select Auspicious Heritage Venue</span>
              </h2>
              <span className="text-xs text-gray-500 font-semibold">Showing {venues.length} Verified Venues</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
              {venues.map((venue) => {
                const isSelected = venue._id === selectedVenueId;
                return (
                  <div
                    key={venue._id}
                    onClick={() => setSelectedVenueId(venue._id)}
                    className={`p-5 rounded-3xl cursor-pointer border-2 transition-all space-y-3 relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-utsav-saffron-50 dark:bg-utsav-maroon-800 border-utsav-saffron shadow-xl scale-[1.01] ring-2 ring-utsav-gold/40'
                        : 'bg-white dark:bg-utsav-maroon-950 border-utsav-gold/30 hover:border-utsav-gold shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full bg-utsav-maroon-800 text-utsav-gold text-[10px] font-bold uppercase border border-utsav-gold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Selected Venue</span>
                      </span>
                    )}

                    <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-utsav-gold/30">
                      <img
                        src={
                          venue.photos?.[0] ||
                          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-utsav-gold">
                        ★ {venue.rating || 4.9} Verified Heritage
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        {venue.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-utsav-saffron shrink-0" />
                        <span>
                          {venue.address}, {venue.city}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {venue.features?.indoor && (
                        <span className="px-2 py-0.5 rounded bg-utsav-beige-100 dark:bg-utsav-maroon-900 text-utsav-brown dark:text-utsav-ivory border border-utsav-gold/20">
                          AC Banquet
                        </span>
                      )}
                      {venue.features?.outdoor && (
                        <span className="px-2 py-0.5 rounded bg-utsav-beige-100 dark:bg-utsav-maroon-900 text-utsav-brown dark:text-utsav-ivory border border-utsav-gold/20">
                          Palace Lawns
                        </span>
                      )}
                      {venue.features?.parking && (
                        <span className="px-2 py-0.5 rounded bg-utsav-beige-100 dark:bg-utsav-maroon-900 text-utsav-brown dark:text-utsav-ivory border border-utsav-gold/20">
                          Valet Parking
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-utsav-gold/20 font-bold">
                      <span className="text-sm text-utsav-maroon-900 dark:text-utsav-saffron font-heading">
                        ₹{(venue.pricePerDay / 100000).toFixed(1)} Lakhs / day
                      </span>
                      <span className="text-gray-500">Max {venue.capacity?.max || 600} Pax</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Catering & Feast (COMPLETE & FULLY FUNCTIONAL) */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-utsav-gold/20 pb-3">
              <div>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold flex items-center space-x-2">
                  <Utensils className="w-5 h-5 text-utsav-saffron" />
                  <span>Select Regional Gastronomy & Feast Package</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Curated authentic menus with live food counters, pure desi ghee preparations, and traditional ceremonial spreads.
                </p>
              </div>

              {/* Dietary Filter Pills */}
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
                    onClick={() => setCateringDietFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      cateringDietFilter === f.id
                        ? 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold shadow-sm'
                        : 'bg-utsav-beige-100 dark:bg-utsav-maroon-950 text-gray-600 dark:text-gray-300 hover:border-utsav-gold/60 border border-transparent'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Caterings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCaterings.map((cat) => {
                const isSelected = cat._id === selectedCateringId;
                const estimatedTotal = cat.pricePerPlate * guestCount;

                return (
                  <div
                    key={cat._id}
                    className={`rounded-3xl border-2 transition-all p-5 flex flex-col justify-between space-y-4 relative ${
                      isSelected
                        ? 'bg-utsav-saffron-50 dark:bg-utsav-maroon-800 border-utsav-saffron shadow-xl ring-2 ring-utsav-gold/40'
                        : 'bg-white dark:bg-utsav-maroon-950 border-utsav-gold/30 hover:border-utsav-gold shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full bg-utsav-maroon-800 text-utsav-gold text-[10px] font-bold uppercase border border-utsav-gold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Selected Feast</span>
                      </span>
                    )}

                    <div className="space-y-3">
                      {/* Image & Badges */}
                      <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-utsav-gold/30">
                        <img
                          src={
                            cat.photos?.[0] ||
                            'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex items-center space-x-1">
                          <span className="px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-emerald-400 font-bold text-[10px] uppercase">
                            {cat.cuisineType || cat.category}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400">
                          ★ {cat.rating || 5.0} (Desi Ghee)
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold line-clamp-1">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-utsav-brown-600 dark:text-utsav-ivory/70 line-clamp-2 mt-1">
                          {cat.description}
                        </p>
                      </div>

                      {/* Menu Highlights preview */}
                      <div className="p-3 rounded-2xl bg-utsav-beige-100/80 dark:bg-utsav-maroon-900/60 border border-utsav-gold/20 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-utsav-maroon-900 dark:text-utsav-gold font-bold">
                          <span className="flex items-center space-x-1">
                            <ChefHat className="w-3.5 h-3.5 text-utsav-saffron" />
                            <span>Featured Specialities:</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingMenuCat(cat);
                            }}
                            className="text-utsav-saffron hover:underline flex items-center space-x-0.5 text-[10px]"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Full Menu</span>
                          </button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 truncate">
                          {cat.menuItems?.mainCourse?.slice(0, 3).join(', ') || 'Authentic Regional Spread'}
                        </p>
                        {cat.menuItems?.liveCounters && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-300 font-semibold truncate">
                            🔥 Live: {cat.menuItems.liveCounters.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price and Select Action */}
                    <div className="pt-3 border-t border-utsav-gold/20 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-heading text-base font-bold text-utsav-maroon-900 dark:text-utsav-saffron">
                            ₹{cat.pricePerPlate}
                          </span>
                          <span className="text-[10px] text-gray-500"> / plate</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 block">For {guestCount} Guests</span>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            ₹{(estimatedTotal / 100000).toFixed(2)} Lakhs
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCateringId(cat._id)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'maroon-gradient-btn text-utsav-gold'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Feast Selected</span>
                          </>
                        ) : (
                          <>
                            <Utensils className="w-3.5 h-3.5" />
                            <span>Select This Feast</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Dietary & Special Requirements Box */}
            <div className="p-5 rounded-3xl bg-utsav-beige-100 dark:bg-utsav-maroon-950 border border-utsav-gold/30 space-y-3 text-xs">
              <h4 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold flex items-center space-x-2">
                <HeartHandshake className="w-4 h-4 text-utsav-saffron" />
                <span>Special Dietary Customizations & Satvik Headcount</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                    Number of Dedicated Jain / Satvik Plates (No Onion/Garlic)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={guestCount}
                    value={jainGuestCount}
                    onChange={(e) => setJainGuestCount(Number(e.target.value))}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                    Special Food Counter / Regional Sweet Requests
                  </label>
                  <input
                    type="text"
                    value={cateringNotes}
                    onChange={(e) => setCateringNotes(e.target.value)}
                    placeholder="e.g. Live Kulhad Chai bar for evening, extra Rabri Ghevar"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Mandap & Decor */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-utsav-gold/20 pb-2">
              <h2 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold flex items-center space-x-2">
                <Flower2 className="w-5 h-5 text-utsav-saffron" />
                <span>Select Mandap & Floral Decor Package</span>
              </h2>
              <span className="text-xs text-gray-500 font-semibold">{decorations.length} Decor Themes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
              {decorations.map((dec) => {
                const isSelected = dec._id === selectedDecorId;
                return (
                  <div
                    key={dec._id}
                    onClick={() => setSelectedDecorId(dec._id)}
                    className={`p-5 rounded-3xl cursor-pointer border-2 transition-all space-y-3 relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-utsav-saffron-50 dark:bg-utsav-maroon-800 border-utsav-saffron shadow-xl scale-[1.01] ring-2 ring-utsav-gold/40'
                        : 'bg-white dark:bg-utsav-maroon-950 border-utsav-gold/30 hover:border-utsav-gold shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full bg-utsav-maroon-800 text-utsav-gold text-[10px] font-bold uppercase border border-utsav-gold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Selected Decor</span>
                      </span>
                    )}

                    <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-utsav-gold/30">
                      <img
                        src={
                          dec.photos?.[0] ||
                          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={dec.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-utsav-gold text-[10px] font-bold uppercase">
                        {dec.style || dec.category}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        {dec.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{dec.description}</p>
                    </div>

                    <div className="pt-3 border-t border-utsav-gold/20 flex items-center justify-between text-xs font-bold">
                      <span className="text-base text-utsav-maroon-900 dark:text-utsav-saffron font-heading">
                        ₹{(dec.price / 100000).toFixed(1)} Lakhs
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-400">Includes Setup & Lighting</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Music & Photo */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-utsav-gold/20 pb-2">
              <h2 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold flex items-center space-x-2">
                <Music className="w-5 h-5 text-utsav-saffron" />
                <span>Select Traditional Music, Troupe & Photography</span>
              </h2>
              <span className="text-xs text-gray-500 font-semibold">{entertainments.length} Artists Available</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {entertainments.map((ent) => {
                const isSelected = ent._id === selectedEntertainmentId;
                return (
                  <div
                    key={ent._id}
                    onClick={() => setSelectedEntertainmentId(ent._id)}
                    className={`p-5 rounded-3xl cursor-pointer border-2 transition-all space-y-3 relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-utsav-saffron-50 dark:bg-utsav-maroon-800 border-utsav-saffron shadow-xl scale-[1.01] ring-2 ring-utsav-gold/40'
                        : 'bg-white dark:bg-utsav-maroon-950 border-utsav-gold/30 hover:border-utsav-gold shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-utsav-maroon-800 text-utsav-gold text-[10px] font-bold uppercase border border-utsav-gold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Selected</span>
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">🎺</span>
                        <div className="flex items-center space-x-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{ent.rating || 4.9}</span>
                        </div>
                      </div>

                      <h4 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        {ent.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{ent.description}</p>
                    </div>

                    <div className="pt-3 border-t border-utsav-gold/20 flex items-center justify-between text-xs font-bold">
                      <span className="text-sm font-heading text-utsav-maroon-900 dark:text-utsav-saffron">
                        ₹{(ent.price / 1000).toFixed(0)}k / day
                      </span>
                      <span className="text-gray-500">{ent.vendorName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: Digital E-Card */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold border-b border-utsav-gold/20 pb-2 flex items-center space-x-2">
              <Mail className="w-5 h-5 text-utsav-saffron" />
              <span>Configure Digital Indian E-Invitation</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                    Host Family Names *
                  </label>
                  <input
                    type="text"
                    value={hostNames}
                    onChange={(e) => setHostNames(e.target.value)}
                    placeholder="e.g. Smt. & Shri Rajesh Sharma"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                    Sanskrit Shloka or Auspicious Blessing
                  </label>
                  <input
                    type="text"
                    value={shlokaOrQuote}
                    onChange={(e) => setShlokaOrQuote(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none font-serif italic text-utsav-gold"
                  />

                  {/* Preset Shloka Chips */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {SHLOKA_PRESETS.map((sh, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setShlokaOrQuote(sh.text)}
                        className="px-2 py-0.5 rounded-md bg-utsav-beige-100 dark:bg-utsav-maroon-900 text-[10px] text-utsav-brown dark:text-utsav-ivory border border-utsav-gold/20 hover:border-utsav-gold transition-colors"
                      >
                        {sh.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                    Custom Welcome & Blessing Message
                  </label>
                  <textarea
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-utsav-maroon-900 via-utsav-maroon-950 to-utsav-maroon-900 text-utsav-ivory border-2 border-utsav-gold/60 shadow-2xl relative flex flex-col justify-between text-center space-y-4">
                <MandalaCorner className="top-2 left-2 w-10 h-10 text-utsav-gold/40" />
                <MandalaCorner className="top-2 right-2 w-10 h-10 text-utsav-gold/40 rotate-90" />

                <div className="space-y-2 pt-2">
                  <DiyaIcon className="w-8 h-8 text-utsav-gold mx-auto" />
                  <p className="font-serif italic text-xs text-utsav-gold tracking-wide px-4">
                    {shlokaOrQuote}
                  </p>
                  <h3 className="font-heading text-lg font-bold text-utsav-gold">
                    {name}
                  </h3>
                  <p className="text-xs text-utsav-saffron font-semibold">
                    Hosted by {hostNames}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-utsav-gold/30 text-xs space-y-1">
                  <p className="font-bold text-utsav-ivory">
                    📅 {date} at {time}
                  </p>
                  <p className="text-[11px] text-utsav-ivory/80">
                    📍 {selectedVenue?.name || address}, {city}
                  </p>
                </div>

                <p className="text-[11px] text-utsav-ivory/70 italic px-2">
                  "{customMessage}"
                </p>

                <div className="pt-2 border-t border-utsav-gold/20 flex items-center justify-between text-[10px] text-utsav-gold/80">
                  <span>✨ UtsavMitra QR Gate Pass Enabled</span>
                  <span>Instant RSVP & Directions</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Review & Finalize */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold border-b border-utsav-gold/20 pb-2 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-utsav-saffron" />
              <span>Review Auspicious Celebration Summary</span>
            </h2>

            {/* Celebration Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 rounded-3xl bg-utsav-beige-100 dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs">
              <div className="space-y-2.5">
                <h4 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold border-b border-utsav-gold/20 pb-1">
                  Event Parameters
                </h4>
                <p>
                  <strong className="text-gray-500">Celebration:</strong> {name}
                </p>
                <p>
                  <strong className="text-gray-500">Tradition:</strong> {culturalTradition} ({eventType})
                </p>
                <p>
                  <strong className="text-gray-500">Auspicious Date:</strong> {date} at {time}
                </p>
                <p>
                  <strong className="text-gray-500">Destination:</strong> {city} ({address})
                </p>
                <p>
                  <strong className="text-gray-500">Guest Count:</strong> {guestCount} Guests
                </p>
                {jainGuestCount > 0 && (
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                    🌿 Jain / Satvik Dietary Plates: {jainGuestCount} Guests
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <h4 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold border-b border-utsav-gold/20 pb-1">
                  Selected Celebration Suite
                </h4>
                <p>
                  <strong className="text-gray-500">Venue:</strong> {selectedVenue?.name} (₹{(venueCost / 100000).toFixed(1)}L)
                </p>
                <p>
                  <strong className="text-gray-500">Regional Feast:</strong> {selectedCatering?.name} (₹{(cateringCost / 100000).toFixed(2)}L)
                </p>
                <p>
                  <strong className="text-gray-500">Mandap Theme:</strong> {selectedDecor?.name} (₹{(decorCost / 100000).toFixed(1)}L)
                </p>
                <p>
                  <strong className="text-gray-500">Music Troupe:</strong> {selectedEntertainment?.name} (₹{(entertainmentCost / 1000).toFixed(0)}k)
                </p>
              </div>
            </div>

            {/* Budget Meter Summary */}
            <div className="p-5 rounded-3xl bg-white dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-gray-500 block">Total Estimated Expenditure:</span>
                  <span className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                    ₹{(totalEstimatedCost / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Allocated Target Budget:</span>
                  <span className="font-heading text-lg font-bold text-utsav-brown dark:text-utsav-ivory">
                    ₹{(budget / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Budget Balance:</span>
                  <span
                    className={`font-heading text-lg font-bold ${
                      budgetDiff >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {budgetDiff >= 0 ? `+₹${(budgetDiff / 100000).toFixed(2)}L Surplus` : `-₹${(Math.abs(budgetDiff) / 100000).toFixed(2)}L Over`}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-utsav-maroon-950 overflow-hidden border border-utsav-gold/30">
                <div
                  className={`h-full rounded-full ${
                    totalEstimatedCost > budget ? 'bg-red-500' : 'bg-gradient-to-r from-utsav-gold to-utsav-saffron'
                  }`}
                  style={{ width: `${Math.min(100, (totalEstimatedCost / budget) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 flex items-center space-x-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>
                Upon initialization, your 2D Mandap Blueprint Designer, Seating Allocator, Smart Cultural Checklist, Signed Gate Pass tokens, and Live Command Center will be ready instantly.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Bottom Controls */}
        <div className="pt-6 border-t border-utsav-gold/30 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-xs font-bold text-utsav-brown dark:text-utsav-ivory hover:bg-utsav-beige-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl gold-gradient-btn text-xs sm:text-sm font-bold shadow-md"
            >
              <span>Continue to {steps[currentStep].title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitEvent}
              className="flex items-center space-x-2 px-8 py-3 rounded-2xl maroon-gradient-btn text-xs sm:text-sm font-bold shadow-xl disabled:opacity-50 text-utsav-gold"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Auspicious Celebration...' : 'Initialize Event Command Center'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
