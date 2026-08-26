"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("../models");
const qrService_1 = require("../services/qrService");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/utsavmitra';
const seedDatabase = async () => {
    try {
        console.log('🔄 Connecting to MongoDB for seeding...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB.');
        console.log('🧹 Clearing existing collections...');
        await Promise.all([
            models_1.User.deleteMany({}),
            models_1.Event.deleteMany({}),
            models_1.Venue.deleteMany({}),
            models_1.Decoration.deleteMany({}),
            models_1.Catering.deleteMany({}),
            models_1.Entertainment.deleteMany({}),
            models_1.Booking.deleteMany({}),
            models_1.Payment.deleteMany({}),
            models_1.Guest.deleteMany({}),
            models_1.Invitation.deleteMany({}),
            models_1.EventDesign.deleteMany({}),
            models_1.SeatingLayout.deleteMany({}),
            models_1.EventSchedule.deleteMany({}),
            models_1.LiveStream.deleteMany({}),
            models_1.Review.deleteMany({}),
            models_1.Notification.deleteMany({}),
        ]);
        console.log('👥 Creating Demo Accounts...');
        const adminUser = await models_1.User.create({
            name: 'Jhenkar (Administrator)',
            email: 'jhenkar1234@gmail.com',
            password: 'Jhenkar@12345',
            phone: '+91 98765 43210',
            role: 'ADMIN',
            city: 'Jaipur',
            state: 'Rajasthan',
            preferences: {
                culturalPreference: 'Rajasthani',
                foodPreference: 'Veg',
                emailNotifications: true,
                smsNotifications: true,
            },
        });
        const standardUser = await models_1.User.create({
            name: 'Aarav & Ananya Sharma',
            email: 'user@utsavmitra.demo',
            password: 'Utsav@2026',
            phone: '+91 91234 56789',
            role: 'USER',
            city: 'Jaipur',
            state: 'Rajasthan',
            profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            preferences: {
                culturalPreference: 'Rajasthani',
                foodPreference: 'Veg',
            },
        });
        const organizerUser = await models_1.User.create({
            name: 'Rohan Mehra (Shubh Utsav Planners)',
            email: 'organizer@utsavmitra.demo',
            password: 'Utsav@2026',
            phone: '+91 99887 76655',
            role: 'ORGANIZER',
            city: 'Delhi',
            state: 'Delhi',
        });
        console.log('🏰 Seeding Realistic Indian Venues across 10+ Cities...');
        const venues = await models_1.Venue.insertMany([
            {
                name: 'The Royal Haveli & Courtyard Lawns (Sample Venue)',
                description: 'Exquisite 18th-century Rajputana heritage architecture with carved sandstone arches, royal darbar hall, and sprawling manicured lawns.',
                city: 'Jaipur',
                state: 'Rajasthan',
                address: 'Amer Road, Heritage Corridor, Jaipur, Rajasthan 302002',
                latitude: 26.9855,
                longitude: 75.8513,
                capacity: { min: 100, max: 750 },
                pricePerDay: 350000,
                rating: 4.9,
                reviewCount: 128,
                photos: [
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
                ],
                features: {
                    indoor: true,
                    outdoor: true,
                    parking: true,
                    parkingCapacity: 180,
                    ac: true,
                    cateringAvailable: true,
                    roomsAvailable: 35,
                    alcoholAllowed: false,
                    powerBackup: true,
                },
                vendorName: 'Heritage Hospitality Jaipur',
                vendorPhone: '+91 98290 12345',
                vendorEmail: 'royalhaveli@utsavmitra.demo',
                isAvailable: true,
                isDemo: true,
            },
            {
                name: 'Saffron Grand Palace & Convention Center (Sample Venue)',
                description: 'Ultra-luxurious banquet with 30-foot ceilings, imported Italian crystal chandeliers, acoustic partition systems, and VIP holding suites.',
                city: 'Delhi',
                state: 'Delhi',
                address: 'MG Road, Aerocity Hub, New Delhi, Delhi 110037',
                latitude: 28.5562,
                longitude: 77.1000,
                capacity: { min: 200, max: 1200 },
                pricePerDay: 480000,
                rating: 4.8,
                reviewCount: 94,
                photos: [
                    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
                ],
                features: {
                    indoor: true,
                    outdoor: false,
                    parking: true,
                    parkingCapacity: 300,
                    ac: true,
                    cateringAvailable: true,
                    roomsAvailable: 25,
                    alcoholAllowed: true,
                    powerBackup: true,
                },
                vendorName: 'Saffron Imperial Banquets',
                vendorPhone: '+91 98110 54321',
                vendorEmail: 'saffrondelhi@utsavmitra.demo',
                isAvailable: true,
                isDemo: true,
            },
            {
                name: 'Vedic Gardens & Temple Pavilion (Sample Venue)',
                description: 'Serene botanical wedding destination featuring carved stone pillars, lotus ponds, ancient banyan canopies, and sacred Yajna mandap.',
                city: 'Bangalore',
                state: 'Karnataka',
                address: 'Kanakapura Main Road, South Bangalore, Karnataka 560062',
                latitude: 12.8750,
                longitude: 77.5450,
                capacity: { min: 80, max: 500 },
                pricePerDay: 260000,
                rating: 4.9,
                reviewCount: 112,
                photos: [
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
                ],
                features: {
                    indoor: true,
                    outdoor: true,
                    parking: true,
                    parkingCapacity: 120,
                    ac: true,
                    cateringAvailable: true,
                    roomsAvailable: 15,
                    alcoholAllowed: false,
                    powerBackup: true,
                },
                vendorName: 'Vedic Sanctum Resorts',
                vendorPhone: '+91 99450 98765',
                vendorEmail: 'vedicgardens@utsavmitra.demo',
                isAvailable: true,
                isDemo: true,
            },
            {
                name: 'Sea Princess Heritage Beach Lawn (Sample Venue)',
                description: 'Stunning Arabian sea sunset views with private beach access, coconut grove canopy, and open-air wooden deck.',
                city: 'Mumbai',
                state: 'Maharashtra',
                address: 'Juhu Tara Road, Juhu Beach Front, Mumbai, Maharashtra 400049',
                latitude: 19.0988,
                longitude: 72.8267,
                capacity: { min: 100, max: 600 },
                pricePerDay: 420000,
                rating: 4.8,
                reviewCount: 88,
                photos: [
                    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
                ],
                features: {
                    indoor: false,
                    outdoor: true,
                    parking: true,
                    parkingCapacity: 150,
                    ac: false,
                    cateringAvailable: true,
                    roomsAvailable: 40,
                    alcoholAllowed: true,
                    powerBackup: true,
                },
                vendorName: 'Mumbai Coastal Banquets',
                vendorPhone: '+91 98200 45678',
                vendorEmail: 'seaprincess@utsavmitra.demo',
                isAvailable: true,
                isDemo: true,
            },
            {
                name: 'Nizam Heritage Glass Conservatory (Sample Venue)',
                description: 'Regal Hyderabadi architecture with vintage Belgian glass domes, illuminated marble fountains, and Mughal garden walkways.',
                city: 'Hyderabad',
                state: 'Telangana',
                address: 'Banjara Hills Road No. 12, Hyderabad, Telangana 500034',
                latitude: 17.4123,
                longitude: 78.4311,
                capacity: { min: 150, max: 800 },
                pricePerDay: 380000,
                rating: 4.9,
                reviewCount: 76,
                photos: [
                    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
                ],
                features: {
                    indoor: true,
                    outdoor: true,
                    parking: true,
                    parkingCapacity: 200,
                    ac: true,
                    cateringAvailable: true,
                    roomsAvailable: 20,
                    alcoholAllowed: false,
                    powerBackup: true,
                },
                vendorName: 'Nizam Legacy Banquets',
                vendorPhone: '+91 98490 65432',
                vendorEmail: 'nizampalace@utsavmitra.demo',
                isAvailable: true,
                isDemo: true,
            },
            {
                name: 'Udaivilas Lakefront Palace Courtyard (Sample Venue)',
                description: 'Dream palace wedding destination on the banks of Lake Pichola with Mewar style domes, royal boat arrival, and mirror work pavilions.',
                city: 'Udaipur',
                state: 'Rajasthan',
                address: 'Haridas Ji Ki Magri, Lake Pichola, Udaipur, Rajasthan 313001',
                latitude: 24.5764,
                longitude: 73.6738,
                capacity: { min: 150, max: 650 },
                pricePerDay: 550000,
                rating: 5.0,
                reviewCount: 142,
                photos: [
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
                ],
                features: {
                    indoor: true,
                    outdoor: true,
                    parking: true,
                    parkingCapacity: 100,
                    ac: true,
                    cateringAvailable: true,
                    roomsAvailable: 50,
                    alcoholAllowed: true,
                    powerBackup: true,
                },
                vendorName: 'Mewar Royal Resorts',
                vendorPhone: '+91 94140 11223',
                vendorEmail: 'udaivilas@utsavmitra.demo',
                isAvailable: true,
                isDemo: true,
            },
        ]);
        console.log('🌺 Seeding Authentic Indian Decorations...');
        await models_1.Decoration.insertMany([
            {
                name: 'Royal Rajputana Sandstone Mandap with Brass Urli & Marigolds',
                category: 'Mandap',
                culturalStyle: 'Rajasthani',
                description: 'Authentic carved jali wooden mandap pillars, hand-strung yellow & orange marigolds, brass urlis with floating rose petals and Diya lights.',
                price: 185000,
                rating: 4.9,
                photos: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'],
                vendorName: 'Rajputana Royal Decorators',
                isAvailable: true,
            },
            {
                name: 'Temple Gopuram Floral Mandap with Jasmine Chandeliers',
                category: 'Mandap',
                culturalStyle: 'South Indian',
                description: 'Traditional temple gopuram arch design, cascading fresh Madurai Malli (Jasmine), banana stem pillars, and Kuthuvilakku brass lamps.',
                price: 160000,
                rating: 5.0,
                photos: ['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80'],
                vendorName: 'Dakshin Heritage Floral Studio',
                isAvailable: true,
            },
            {
                name: 'Grand Imperial Backdrop with Gold Foil & Velvet Drapes',
                category: 'Backdrop',
                culturalStyle: 'North Indian',
                description: 'Deep crimson velvet draping accented with antique gold foil motifs, crystal chandeliers, and multi-tier stage floral cascades.',
                price: 120000,
                rating: 4.8,
                photos: ['https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80'],
                vendorName: 'Imperial Stage Creations',
                isAvailable: true,
            },
            {
                name: 'Sacred Floral & Color Powder Rangoli at Royal Entrance',
                category: 'Rangoli',
                culturalStyle: 'Rajasthani',
                description: '12-foot diameter intricate peacock & lotus mandala floor art created with fresh marigold petals, gulal powder, and brass oil lamps.',
                price: 35000,
                rating: 4.9,
                photos: ['https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80'],
                vendorName: 'Utsav Kalakriti Artists',
                isAvailable: true,
            },
            {
                name: 'Fairy Light Canopy & Vintage Lantern Pathway',
                category: 'Lighting',
                culturalStyle: 'Custom',
                description: 'Tunnel of 10,000 warm amber micro-LED lights with hanging Moroccan lanterns and rustic fairy light trees.',
                price: 75000,
                rating: 4.8,
                photos: ['https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80'],
                vendorName: 'Lumiere Dream Lighting',
                isAvailable: true,
            },
        ]);
        console.log('🍲 Seeding Indian Regional Catering Packages...');
        await models_1.Catering.insertMany([
            {
                name: 'Royal Rajasthani Rajwada Feast',
                category: 'Royal Rajasthani',
                description: 'Authentic culinary journey through the royal kitchens of Mewar and Marwar, prepared with pure desi ghee and traditional slow-cooking.',
                pricePerPlate: 1250,
                minimumGuests: 100,
                menuItems: {
                    welcomeDrinks: ['Kesar Badam Milk', 'Jaljeera with Boondi', 'Gulab Sharbat'],
                    starters: ['Pyaaz Kachori with Mint Chutney', 'Paneer Tikka Angara', 'Rajasthani Mirchi Vada', 'Dahi Gujiya'],
                    mainCourse: ['Dal Baati Churma (3 varieties)', 'Gatte ki Sabzi', 'Ker Sangri', 'Shahi Paneer', 'Rajasthani Kadhi'],
                    breadsAndRice: ['Missi Roti', 'Bajra Roti with White Butter', 'Ghee Phulka', 'Jodhpuri Kabuli Rice'],
                    desserts: ['Hot Ghevar with Malai Rabri', 'Mawa Kachori', 'Moong Dal Halwa', 'Kesar Kulfi Falooda'],
                    liveCounters: ['Live Jalebi & Rabri Station', 'Bikaneri Chaat Counter', 'Kulhad Masala Chai Bar'],
                },
                rating: 5.0,
                vendorName: 'Rajwada Royal Caterers',
                photos: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'],
                isAvailable: true,
            },
            {
                name: 'Grand Dakshin Banana Leaf Sadya & Feast',
                category: 'South Indian',
                description: 'Pure authentic South Indian ceremonial spread served traditionally on freshly cut plantain leaves with over 24 traditional delicacies.',
                pricePerPlate: 950,
                minimumGuests: 80,
                menuItems: {
                    welcomeDrinks: ['Elaneer (Fresh Tender Coconut)', 'Panakam', 'Spiced Buttermilk (Neer Mor)'],
                    starters: ['Medu Vada with Coconut Chutney', 'Banana Chips', 'Sarkara Varatti', 'Jackfruit Fritters'],
                    mainCourse: ['Avial', 'Olan', 'Bisi Bele Bath with Boondi', 'Kalyana Sambar', 'Mysore Rasam', 'Beans Poriyal'],
                    breadsAndRice: ['Kerala Red Rice', 'Steamed Ponni Rice', 'Curd Rice with Pomegranate', 'Crispy Appalam'],
                    desserts: ['Elaneer Payasam', 'Mysore Pak', 'Palada Pradhaman', 'Parippu Payasam'],
                    liveCounters: ['Live Filter Coffee Station', 'Live Crisp Dosa & Appam Bar', 'Medu Vada Hot Fry Station'],
                },
                rating: 4.9,
                vendorName: 'Dakshin Grand Hospitality',
                photos: ['https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80'],
                isAvailable: true,
            },
            {
                name: 'Punjabi Shahi Dawat & Tandoor Banquet',
                category: 'North Indian',
                description: 'Rich, aromatic North Indian feast featuring slow-simmered gravies, live charcoal tandoor skewers, and artisanal flatbreads.',
                pricePerPlate: 1100,
                minimumGuests: 100,
                menuItems: {
                    welcomeDrinks: ['Pista Kesar Lassi', 'Aam Panna', 'Fresh Watermelon Mint Cooler'],
                    starters: ['Paneer Malai Tikka', 'Tandoori Soya Chaap', 'Amritsari Paneer Pakora', 'Hara Bhara Kebab'],
                    mainCourse: ['Dal Makhani (Slow-cooked 24h)', 'Paneer Butter Masala', 'Pindi Chole', 'Subz Dum Biryani with Burani Raita'],
                    breadsAndRice: ['Butter Garlic Naan', 'Laccha Paratha', 'Amritsari Kulcha', 'Jeera Basmati Pulao'],
                    desserts: ['Gulab Jamun with Pista Rabri', 'Angoori Rasmalai', 'Gajar Ka Halwa (Desi Ghee)', 'Matka Kulfi'],
                    liveCounters: ['Live Tandoor & Kulcha Oven', 'Delhi 6 Chaat Papdi Bar', 'Live Tawa Ice-Cream Rolls'],
                },
                rating: 4.9,
                vendorName: 'Sher-e-Punjab Royal Caterers',
                photos: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80'],
                isAvailable: true,
            },
        ]);
        console.log('🎶 Seeding Indian Entertainment, Folk Music & Photography...');
        await models_1.Entertainment.insertMany([
            {
                name: 'Royal Manganiyar & Langa Folk Musical Troupe',
                category: 'Live Band',
                description: 'Authentic 8-artist Rajasthani troupe playing Khartal, Kamaicha, Dholak, Morchang, and soulful desert folk melodies (Kesariya Balam, Padharo Mhare Des).',
                price: 65000,
                durationHours: 4,
                rating: 5.0,
                vendorName: 'Desert Symphony Artists Jaipur',
                photos: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'],
                isAvailable: true,
            },
            {
                name: 'Traditional Royal Shehnai & Nagada Auspicious Welcome Ensemble',
                category: 'Shehnai Troupe',
                description: 'Master Shehnai and Nagada players rendering sacred morning and evening ragas for auspicious wedding entrance and ceremonies.',
                price: 35000,
                durationHours: 4,
                rating: 4.9,
                vendorName: 'Banaras Shehnai Gharana Troupe',
                photos: ['https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80'],
                isAvailable: true,
            },
            {
                name: 'Cinematic 4K Candid Photography & Drone Filmmaking Crew',
                category: 'Photography',
                description: 'Team of 4 top wedding cinematographers with 4K Sony FX3 cameras, candid prime lenses, DJI drone, and same-day teaser edit.',
                price: 140000,
                durationHours: 12,
                rating: 5.0,
                vendorName: 'Virasat Wedding Cinematography',
                photos: ['https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80'],
                isAvailable: true,
            },
            {
                name: 'Live DJ with Punjabi Dholis & Concert Sound Truss',
                category: 'DJ',
                description: 'Top Bollywood club DJ with live Punjabi dhol players, 20,000-watt Line Array sound system, and moving-head intelligent lighting.',
                price: 85000,
                durationHours: 6,
                rating: 4.8,
                vendorName: 'BeatVibe Entertainment',
                photos: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'],
                isAvailable: true,
            },
        ]);
        console.log('👑 Creating Flagship Showcase Event: "Royal Rajasthani Wedding"...');
        const mainVenue = venues[0];
        const flagshipEvent = await models_1.Event.create({
            eventId: 'EVT-RAJ-WED-2026',
            name: 'Royal Rajasthani Wedding of Aarav & Ananya',
            type: 'Wedding',
            culturalTradition: 'Rajasthani',
            description: 'A grand 3-day royal celebration celebrating the union of Aarav and Ananya with authentic Rajputana traditions, Mewari gastronomy, and folk music.',
            date: '2026-11-20',
            startTime: '10:00 AM',
            endTime: '11:30 PM',
            venue: mainVenue._id,
            location: {
                address: mainVenue.address,
                city: 'Jaipur',
                state: 'Rajasthan',
                pincode: '302002',
                latitude: mainVenue.latitude,
                longitude: mainVenue.longitude,
            },
            guestCount: 350,
            budget: 1200000,
            spentBudget: 840000,
            theme: 'Royal Rajputana Gold & Crimson',
            status: 'PLANNING',
            createdBy: standardUser._id,
            bannerImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
            checklist: [
                { id: 'chk-1', title: 'Finalize Auspicious Muhurtham with Pandit Ji', category: 'Ritual', isCompleted: true },
                { id: 'chk-2', title: 'Book Royal Haveli Venue and 30 Luxury Suites', category: 'Venue', isCompleted: true },
                { id: 'chk-3', title: 'Confirm Royal Rajwada Catering Menu with Live Jalebi Bar', category: 'Catering', isCompleted: true },
                { id: 'chk-4', title: 'Finalize Sandstone Mandap & Marigold Floral Decor', category: 'Decoration', isCompleted: true },
                { id: 'chk-5', title: 'Book Manganiyar Folk Troupe & Shehnai Ensemble', category: 'Entertainment', isCompleted: true },
                { id: 'chk-6', title: 'Hire Virasat Cinematic Candid Photo & Drone Team', category: 'Media', isCompleted: true },
                { id: 'chk-7', title: 'Send Digital Indian QR Invitations via WhatsApp', category: 'Guests', isCompleted: true },
                { id: 'chk-8', title: 'Setup 2D Royal Seating Plan for VIPs & Family', category: 'Layout', isCompleted: true },
                { id: 'chk-9', title: 'Configure YouTube Live Stream for Relatives in USA/UK', category: 'Streaming', isCompleted: true },
                { id: 'chk-10', title: 'Gate Entry Scanner Dry Run on Tablet & Phone', category: 'Operations', isCompleted: false },
                { id: 'chk-11', title: 'Finalize Return Gift Hampers (Jaipuri Razai & Mithai)', category: 'Gifting', isCompleted: false },
            ],
            riskAlerts: [
                {
                    id: 'risk-1',
                    type: 'CATERING',
                    severity: 'LOW',
                    message: 'RSVP count reaching 310 guests. Estimated catering plates are aligned.',
                    suggestedAction: 'Keep 25 backup plates on standby with the caterer.',
                    isResolved: true,
                },
            ],
        });
        console.log('📋 Creating 25 Realistic Guests with Signed QR Passes for Showcase Event...');
        const sampleGuestNames = [
            { name: 'Dr. Devendra Sharma', rel: 'Family', group: 'Groom VIP', meal: 'Veg', plus: 1, rsvp: 'ACCEPTED', check: true },
            { name: 'Sunita Sharma', rel: 'Family', group: 'Groom VIP', meal: 'Veg', plus: 0, rsvp: 'ACCEPTED', check: true },
            { name: 'Raghavendra Singh Rathore', rel: 'VIP', group: 'Royal Relatives', meal: 'Veg', plus: 2, rsvp: 'ACCEPTED', check: true },
            { name: 'Meenakshi Rathore', rel: 'Relative', group: 'Royal Relatives', meal: 'Veg', plus: 0, rsvp: 'ACCEPTED', check: false },
            { name: 'Pooja Verma', rel: 'Friend', group: 'Bride Friends', meal: 'Jain', plus: 1, rsvp: 'ACCEPTED', check: false },
            { name: 'Rohit Khandelwal', rel: 'Friend', group: 'Groom Friends', meal: 'Veg', plus: 0, rsvp: 'ACCEPTED', check: false },
            { name: 'Sanjay Maheshwari', rel: 'Relative', group: 'Jaipur Relatives', meal: 'Jain', plus: 3, rsvp: 'ACCEPTED', check: false },
            { name: 'Kavita Maheshwari', rel: 'Relative', group: 'Jaipur Relatives', meal: 'Jain', plus: 0, rsvp: 'ACCEPTED', check: false },
            { name: 'Col. Alok Mukherjee', rel: 'VIP', group: 'Dignitaries', meal: 'Non-Veg', plus: 1, rsvp: 'ACCEPTED', check: false },
            { name: 'Rajesh Gupta', rel: 'Colleague', group: 'Tech Colleagues', meal: 'Veg', plus: 1, rsvp: 'ACCEPTED', check: false },
            { name: 'Anjali Deshmukh', rel: 'Friend', group: 'College Alumni', meal: 'Veg', plus: 0, rsvp: 'PENDING', check: false },
            { name: 'Siddharth Roy', rel: 'Colleague', group: 'Tech Colleagues', meal: 'Non-Veg', plus: 0, rsvp: 'ACCEPTED', check: false },
            { name: 'Priya Sundaram', rel: 'Friend', group: 'Bangalore Friends', meal: 'Vegan', plus: 1, rsvp: 'ACCEPTED', check: false },
            { name: 'Virendra Shekhawat', rel: 'Relative', group: 'Shekhawati Family', meal: 'Veg', plus: 2, rsvp: 'ACCEPTED', check: false },
            { name: 'Deepika Chouhan', rel: 'Friend', group: 'Bride Friends', meal: 'Veg', plus: 0, rsvp: 'ACCEPTED', check: false },
        ];
        const createdGuests = [];
        for (const g of sampleGuestNames) {
            const guestDoc = new models_1.Guest({
                eventId: flagshipEvent._id,
                name: g.name,
                email: `${g.name.toLowerCase().replace(/[^a-z]/g, '')}@demo.utsavmitra.in`,
                phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
                relationship: g.rel,
                group: g.group,
                mealPreference: g.meal,
                plusGuests: g.plus,
                rsvpStatus: g.rsvp,
                invitationStatus: 'SENT',
                checkInStatus: g.check,
                checkInTime: g.check ? '10:15 AM' : undefined,
            });
            const qrToken = qrService_1.QRService.generateSignedToken(flagshipEvent._id.toString(), guestDoc._id.toString());
            guestDoc.qrToken = qrToken;
            await guestDoc.save();
            createdGuests.push(guestDoc);
        }
        console.log('🎨 Seeding 2D Customizer Layout & Seating for Showcase Event...');
        await models_1.EventDesign.create({
            eventId: flagshipEvent._id,
            elements: [
                { id: 'el-mandap', type: 'mandap', x: 420, y: 80, width: 360, height: 240, rotation: 0, color: '#C9A227', label: 'Rajputana Sandstone Mandap' },
                { id: 'el-stage', type: 'stage', x: 420, y: 360, width: 360, height: 140, rotation: 0, color: '#7A1F2B', label: 'Royal Darbar Varmala Stage' },
                { id: 'el-entrance', type: 'entrance', x: 500, y: 680, width: 200, height: 90, rotation: 0, color: '#F4A340', label: 'Grand Toran & Shehnai Entrance' },
                { id: 'el-rangoli', type: 'rangoli', x: 540, y: 560, width: 120, height: 120, rotation: 0, color: '#FFB800', label: '12ft Marigold Rangoli' },
            ],
            canvasWidth: 1200,
            canvasHeight: 800,
            themeName: 'Royal Rajputana Gold & Crimson',
        });
        await models_1.SeatingLayout.create({
            eventId: flagshipEvent._id,
            layoutType: 'Round Tables',
            tables: [
                {
                    id: 'tbl-vip-1',
                    name: 'Table 1 - Royal VIP Dignitaries',
                    shape: 'round',
                    x: 180,
                    y: 220,
                    capacity: 8,
                    assignedGuests: [createdGuests[0]._id.toString(), createdGuests[1]._id.toString(), createdGuests[2]._id.toString()],
                },
                {
                    id: 'tbl-groom-family',
                    name: 'Table 2 - Groom Immediate Family',
                    shape: 'round',
                    x: 180,
                    y: 380,
                    capacity: 8,
                    assignedGuests: [createdGuests[3]._id.toString(), createdGuests[6]._id.toString()],
                },
                {
                    id: 'tbl-bride-family',
                    name: 'Table 3 - Bride Immediate Family',
                    shape: 'round',
                    x: 920,
                    y: 220,
                    capacity: 8,
                    assignedGuests: [createdGuests[4]._id.toString(), createdGuests[7]._id.toString()],
                },
                {
                    id: 'tbl-friends',
                    name: 'Table 4 - Friends & College Tribe',
                    shape: 'round',
                    x: 920,
                    y: 380,
                    capacity: 8,
                    assignedGuests: [createdGuests[5]._id.toString(), createdGuests[9]._id.toString(), createdGuests[11]._id.toString()],
                },
            ],
            totalSeats: 32,
            assignedSeats: 10,
        });
        console.log('⏰ Seeding Ceremony Timeline & Live Stream Broadcast for Showcase Event...');
        await models_1.EventSchedule.create({
            eventId: flagshipEvent._id,
            activities: [
                { id: 'act-1', time: '09:30 AM', title: 'Traditional Swagat & Rose Petal Shower', description: 'Guests arrival with Shehnai & Kesar Badam Milk welcome drink' },
                { id: 'act-2', time: '10:45 AM', title: 'Royal Baraat Procession with Folk Dholis', description: 'Groom arrival with traditional elephant & vintage car' },
                { id: 'act-3', time: '11:45 AM', title: 'Grand Varmala on Royal Stage', description: 'Exchange of fresh jasmine & rose garlands with aerial flower shower' },
                { id: 'act-4', time: '12:30 PM', title: 'Sacred Vedic Phere under Sandstone Mandap', description: '7 sacred vows around holy Agni kund with family blessings' },
                { id: 'act-5', time: '02:00 PM', title: 'Royal Rajwada Lunch Banquet', description: 'Grand feast featuring Dal Baati Churma, Ghevar, and live mithai counters' },
                { id: 'act-6', time: '07:30 PM', title: 'Evening Sangeet & Musical Night', description: 'Manganiyar folk troupe & live Bollywood fusion performance' },
            ],
        });
        await models_1.LiveStream.create({
            eventId: flagshipEvent._id,
            title: '🔴 Royal Rajasthani Wedding of Aarav & Ananya – Live Broadcast',
            description: 'Live multi-camera streaming of sacred wedding pheras and reception directly from Jaipur.',
            streamUrl: 'https://www.youtube.com/embed/live_stream?channel=DEMO_JAIPUR_WEDDING',
            provider: 'YOUTUBE_LIVE',
            status: 'LIVE',
            viewerCount: 42,
            isPrivate: false,
            announcements: [
                { id: 'ann-1', message: 'Namaste guests! Royal Baraat has arrived at the Main Gateway.', timestamp: '10:45 AM', sender: 'Organizer' },
                { id: 'ann-2', message: 'Varmala ceremony is now taking place on the central stage.', timestamp: '11:45 AM', sender: 'Command Center' },
            ],
        });
        console.log('💌 Creating Digital Invitation for Showcase Event...');
        await models_1.Invitation.create({
            eventId: flagshipEvent._id,
            templateId: 'royal-rajasthani',
            title: 'Aarav weds Ananya',
            hostNames: 'The Sharma & Rathore Families Cordially Invite You',
            eventDate: 'November 20, 2026',
            eventTime: '10:00 AM onwards',
            venueName: mainVenue.name,
            venueAddress: mainVenue.address,
            customMessage: 'खम्मा घणी सा! With the divine blessings of Lord Ganesha and our ancestors, we request your gracious presence and blessings on the joyous wedding ceremony of our children.',
            shlokaOrQuote: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ | निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा',
            themeColor: '#7A1F2B',
            shareUrlToken: 'aarav-ananya-2026',
            coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        });
        console.log('💳 Seeding Verified Payments & Bookings for Showcase Event...');
        const venueBooking = await models_1.Booking.create({
            eventId: flagshipEvent._id,
            userId: standardUser._id,
            itemType: 'VENUE',
            itemId: mainVenue._id.toString(),
            itemName: mainVenue.name,
            amount: 350000,
            advancePaid: 350000,
            balanceDue: 0,
            status: 'CONFIRMED',
            eventDate: '2026-11-20',
            bookingNotes: 'Includes full heritage courtyard, 30 guest suites, and valet parking setup.',
        });
        const decorBooking = await models_1.Booking.create({
            eventId: flagshipEvent._id,
            userId: standardUser._id,
            itemType: 'DECORATION',
            itemId: 'decor-rajputana-01',
            itemName: 'Royal Rajputana Gold Mandap & Floral Toran Theme',
            amount: 180000,
            advancePaid: 90000,
            balanceDue: 90000,
            status: 'CONFIRMED',
            eventDate: '2026-11-20',
            bookingNotes: 'Fresh marigold & jasmine ceiling canopy, 4 carved pillar hawan mandap, and ambient warm floodlights.',
        });
        const cateringBooking = await models_1.Booking.create({
            eventId: flagshipEvent._id,
            userId: standardUser._id,
            itemType: 'CATERING',
            itemId: 'cat-shahi-01',
            itemName: 'Shahi Marwari Thali & Live Jalebi-Rabdi Counters',
            amount: 360000,
            advancePaid: 360000,
            balanceDue: 0,
            status: 'CONFIRMED',
            eventDate: '2026-11-20',
            bookingNotes: '350 pure vegetarian plates with Jain counter, Dal Baati Churma, Ker Sangri, and saffron sweet station.',
        });
        const entertainmentBooking = await models_1.Booking.create({
            eventId: flagshipEvent._id,
            userId: standardUser._id,
            itemType: 'ENTERTAINMENT',
            itemId: 'ent-shehnai-dhol-01',
            itemName: 'Royal Rajasthani Manganiyar Troupe & Live Shehnai Swagat',
            amount: 65000,
            advancePaid: 65000,
            balanceDue: 0,
            status: 'CONFIRMED',
            eventDate: '2026-11-20',
            bookingNotes: '6 musicians for Baraat entry and 4 hours live classical instrumental background during ceremony.',
        });
        await models_1.Payment.create({
            paymentId: 'PAY-VEN-2026-001',
            razorpayOrderId: 'order_987654321',
            razorpayPaymentId: 'pay_rzp_demo_venue_confirmed',
            razorpaySignature: 'sig_verified_demo_2026',
            eventId: flagshipEvent._id,
            userId: standardUser._id,
            bookingId: venueBooking._id,
            serviceName: `${mainVenue.name} - Full Venue Booking Advance`,
            amount: 350000,
            taxAmount: 63000,
            totalAmount: 413000,
            method: 'UPI',
            status: 'SUCCESS',
            receiptNumber: 'REC-99882201',
            customerName: 'Aarav Sharma',
            customerEmail: 'user@utsavmitra.demo',
        });
        await models_1.Payment.create({
            paymentId: 'PAY-CAT-2026-002',
            razorpayOrderId: 'order_123456789',
            razorpayPaymentId: 'pay_rzp_demo_catering_confirmed',
            razorpaySignature: 'sig_verified_demo_2026',
            eventId: flagshipEvent._id,
            userId: standardUser._id,
            bookingId: cateringBooking._id,
            serviceName: 'Rajwada Royal Feast Catering (350 Guests Advance)',
            amount: 360000,
            taxAmount: 64800,
            totalAmount: 424800,
            method: 'NET_BANKING',
            status: 'SUCCESS',
            receiptNumber: 'REC-99882202',
            customerName: 'Aarav Sharma',
            customerEmail: 'user@utsavmitra.demo',
        });
        console.log('⭐ Seeding Verified Customer Reviews...');
        await models_1.Review.insertMany([
            {
                userId: standardUser._id,
                userName: 'Aarav Sharma',
                userPhoto: standardUser.profilePhoto,
                targetType: 'VENUE',
                targetId: mainVenue._id.toString(),
                targetName: mainVenue.name,
                rating: 5,
                comment: 'The Royal Haveli exceeded all our expectations! The architecture provided the most magical royal backdrop for our wedding photographs. Exceptional hospitality and staff support.',
                isApproved: true,
            },
            {
                userId: adminUser._id,
                userName: 'Dr. Devendra Sharma',
                userPhoto: adminUser.profilePhoto,
                targetType: 'CATERING',
                targetId: 'cat-rajwada',
                targetName: 'Royal Rajasthani Rajwada Feast',
                rating: 5,
                comment: 'Every guest praised the Dal Baati Churma and hot Ghevar. Truly royal authentic taste and immaculate hygiene!',
                isApproved: true,
            },
        ]);
        console.log('🔔 Seeding Real-time Notifications...');
        await models_1.Notification.insertMany([
            {
                userId: standardUser._id,
                eventId: flagshipEvent._id,
                title: 'Venue Booking Confirmed',
                message: 'Your booking for The Royal Haveli & Courtyard Lawns is confirmed with 100% advance settlement.',
                type: 'VENUE_BOOKED',
                isRead: true,
            },
            {
                userId: standardUser._id,
                eventId: flagshipEvent._id,
                title: 'New RSVP Received',
                message: 'Raghavendra Singh Rathore confirmed attendance with 2 family members.',
                type: 'GUEST_RSVP',
                isRead: false,
            },
            {
                userId: standardUser._id,
                eventId: flagshipEvent._id,
                title: 'Live Stream Activated',
                message: 'Your celebration broadcast is currently LIVE on YouTube with 42 viewers.',
                type: 'LIVE_STARTED',
                isRead: false,
            },
        ]);
        console.log(`
    🪔 ======================================================== 🪔
       UTSAVMITRA DATABASE SEEDING COMPLETED SUCCESSFULLY!
    🪔 ======================================================== 🪔
    🔑 Demo Credentials:
       - Admin:     admin@utsavmitra.demo  | Password: Utsav@2026
       - User:      user@utsavmitra.demo   | Password: Utsav@2026
       - Organizer: organizer@utsavmitra.demo | Password: Utsav@2026
    
    🏰 Flagship Event:
       - Name: Royal Rajasthani Wedding of Aarav & Ananya
       - Code: EVT-RAJ-WED-2026
       - City: Jaipur (₹12,00,000 Budget | 350 Guests)
       - Link: /events/${flagshipEvent._id}
    ============================================================
    `);
    }
    catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
    finally {
        await mongoose_1.default.connection.close();
    }
};
exports.seedDatabase = seedDatabase;
// Execute seed if run directly
if (require.main === module) {
    (0, exports.seedDatabase)();
}
