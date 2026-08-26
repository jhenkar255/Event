"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const constants_1 = require("../../../shared/constants");
class AIService {
    /**
     * Parse natural language prompts into structured event parameters
     * E.g., "I want to plan a South Indian wedding for 300 guests in Bangalore with 8 lakh budget"
     */
    static parseNaturalPrompt(prompt) {
        const text = prompt.toLowerCase();
        const result = {
            naturalPrompt: prompt,
        };
        // Detect Event Type
        if (text.includes('wedding') || text.includes('marriage') || text.includes('shaadi')) {
            result.eventType = 'Wedding';
        }
        else if (text.includes('engagement') || text.includes('roka') || text.includes('ring')) {
            result.eventType = 'Engagement';
        }
        else if (text.includes('reception')) {
            result.eventType = 'Reception';
        }
        else if (text.includes('birthday') || text.includes('bday')) {
            result.eventType = 'Birthday';
        }
        else if (text.includes('baby shower') || text.includes('seemantham') || text.includes('godh bharai')) {
            result.eventType = 'Baby Shower';
        }
        else if (text.includes('housewarming') || text.includes('griha pravesh') || text.includes('gruhapravesham')) {
            result.eventType = 'Housewarming';
        }
        else if (text.includes('corporate') || text.includes('conference') || text.includes('annual meet')) {
            result.eventType = 'Corporate Event';
        }
        else if (text.includes('college') || text.includes('fest')) {
            result.eventType = 'College Event';
        }
        else if (text.includes('anniversary')) {
            result.eventType = 'Anniversary';
        }
        else {
            result.eventType = 'Wedding';
        }
        // Detect Cultural Tradition
        if (text.includes('rajasthani') || text.includes('marwari') || text.includes('jaipur')) {
            result.culturalTradition = 'Rajasthani';
        }
        else if (text.includes('south indian') || text.includes('tam brahm') || text.includes('karnataka')) {
            result.culturalTradition = 'South Indian';
        }
        else if (text.includes('bengali') || text.includes('kolkata')) {
            result.culturalTradition = 'Bengali';
        }
        else if (text.includes('punjabi') || text.includes('sikh') || text.includes('anand karaj')) {
            result.culturalTradition = 'Punjabi';
        }
        else if (text.includes('gujarati') || text.includes('garba')) {
            result.culturalTradition = 'Gujarati';
        }
        else if (text.includes('marathi') || text.includes('maharashtrian')) {
            result.culturalTradition = 'Marathi';
        }
        else if (text.includes('tamil') || text.includes('chennai')) {
            result.culturalTradition = 'Tamil';
        }
        else if (text.includes('telugu') || text.includes('hyderabad') || text.includes('andhra')) {
            result.culturalTradition = 'Telugu';
        }
        else if (text.includes('kannada') || text.includes('bangalore') || text.includes('mysore')) {
            result.culturalTradition = 'Kannada';
        }
        else if (text.includes('malayali') || text.includes('kerala') || text.includes('kochi')) {
            result.culturalTradition = 'Malayali';
        }
        else if (text.includes('north indian') || text.includes('delhi')) {
            result.culturalTradition = 'North Indian';
        }
        else {
            result.culturalTradition = 'North Indian';
        }
        // Detect Guest Count (e.g., "300 guests", "for 500 people", "250 pax")
        const guestMatch = text.match(/(\d+)\s*(guests|people|pax|persons|members|attendees)/i) || text.match(/(?:for|with)\s*(\d+)/i);
        if (guestMatch && guestMatch[1]) {
            result.guestCount = parseInt(guestMatch[1], 10);
        }
        else {
            result.guestCount = 250;
        }
        // Detect Budget (e.g., "8 lakh", "15 lakhs", "12,00,000", "500000", "₹10L")
        const lakhMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b/i);
        const croreMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)\b/i);
        const directNumberMatch = text.match(/(?:₹|rs\.?|inr|budget\s*(?:of|is)?)\s*(\d{5,8})/i);
        if (croreMatch && croreMatch[1]) {
            result.budget = parseFloat(croreMatch[1]) * 10000000;
        }
        else if (lakhMatch && lakhMatch[1]) {
            result.budget = parseFloat(lakhMatch[1]) * 100000;
        }
        else if (directNumberMatch && directNumberMatch[1]) {
            result.budget = parseInt(directNumberMatch[1], 10);
        }
        else {
            result.budget = 1000000; // Default ₹10 Lakhs
        }
        // Detect City
        const cities = ['Jaipur', 'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Lucknow', 'Ahmedabad', 'Pune', 'Udaipur', 'Goa', 'Chandigarh'];
        for (const city of cities) {
            if (text.includes(city.toLowerCase())) {
                result.city = city;
                break;
            }
        }
        if (!result.city)
            result.city = 'Jaipur';
        // Detect Food Preference
        if (text.includes('jain')) {
            result.foodPreference = 'Jain';
        }
        else if (text.includes('non veg') || text.includes('non-veg') || text.includes('chicken') || text.includes('mutton')) {
            result.foodPreference = 'Non-Veg';
        }
        else if (text.includes('vegan')) {
            result.foodPreference = 'Vegan';
        }
        else {
            result.foodPreference = 'Veg';
        }
        return result;
    }
    /**
     * Generate comprehensive cultural event plan
     */
    static async generateEventPlan(params) {
        const tradition = params.culturalTradition || 'North Indian';
        const metadata = constants_1.CULTURAL_THEMES_METADATA[tradition] || constants_1.CULTURAL_THEMES_METADATA['North Indian'];
        const totalBudget = params.budget || 1000000;
        const guests = params.guestCount || 200;
        // Intelligent dynamic budget distribution
        const venueBudget = Math.round(totalBudget * constants_1.DEFAULT_BUDGET_RATIOS.venue);
        const cateringBudget = Math.round(totalBudget * constants_1.DEFAULT_BUDGET_RATIOS.catering);
        const decorationBudget = Math.round(totalBudget * constants_1.DEFAULT_BUDGET_RATIOS.decoration);
        const photoBudget = Math.round(totalBudget * constants_1.DEFAULT_BUDGET_RATIOS.photography);
        const entertainmentBudget = Math.round(totalBudget * constants_1.DEFAULT_BUDGET_RATIOS.entertainment);
        const invitationBudget = Math.round(totalBudget * constants_1.DEFAULT_BUDGET_RATIOS.invitation);
        const transportationBudget = Math.round(totalBudget * constants_1.DEFAULT_BUDGET_RATIOS.transportation);
        const contingencyBudget = totalBudget - (venueBudget + cateringBudget + decorationBudget + photoBudget + entertainmentBudget + invitationBudget + transportationBudget);
        const pricePerPlateEstimate = Math.max(500, Math.round(cateringBudget / (guests * 1.5)));
        // City-based venue suggestions
        const city = params.city || 'Jaipur';
        const venueSuggestions = [
            `The Grand ${tradition} Palace & Heritage Lawns, ${city}`,
            `${city} Royal Fort & Banquets (Capacity: ${guests + 150} guests)`,
            `Saffron Bloom Luxury Courtyard & Glass Ballroom, ${city}`,
            `Vedic Courtyard & Open-Air Amphitheatre, ${city}`,
        ];
        // Timeline based on Event Type and Tradition
        const timeline = this.generateCustomTimeline(params.eventType, tradition);
        // AI Risk Warnings
        const riskWarnings = [];
        if (cateringBudget / guests < 600 && params.foodPreference === 'Non-Veg') {
            riskWarnings.push('Catering budget is tight for multi-cuisine Non-Veg menu. Consider adjusting dessert live counters.');
        }
        if (guests > 350 && venueBudget < totalBudget * 0.25) {
            riskWarnings.push('High guest count requires a venue with at least 500+ capacity to ensure comfortable dining and seating.');
        }
        if (decorationBudget < 100000 && params.eventType === 'Wedding') {
            riskWarnings.push('Grand mandap and stage floral setups usually average ₹1.5L+. Recommended to prioritize stage & entrance over ceiling drapes.');
        }
        return {
            summary: `Exquisite AI-crafted plan for a ${tradition} ${params.eventType} in ${city} for ${guests} guests. Balanced across royal decor, authentic regional gastronomy, auspicious rituals, and seamless guest hospitality with an optimized budget of ₹${(totalBudget / 100000).toFixed(1)} Lakhs.`,
            estimatedBudget: {
                total: totalBudget,
                venue: venueBudget,
                catering: cateringBudget,
                decoration: decorationBudget,
                photography: photoBudget,
                entertainment: entertainmentBudget,
                invitation: invitationBudget,
                transportation: transportationBudget,
                contingency: Math.max(0, contingencyBudget),
            },
            venueSuggestions,
            decorationSuggestions: {
                mandapOrStage: metadata.recommendedDecor,
                floralTheme: `Fresh Marigolds, Imperial Red Carnations & Fragrant Mogra chandeliers with gold zardozi tassels`,
                lighting: 'Warm ambient amber wash, antique brass chandeliers, fairy light canopy, and traditional Diya walkways',
                rangoli: `Grand entrance floral & colored powder Rangoli depicting traditional ${tradition} sacred motifs`,
            },
            foodRecommendations: {
                cuisines: [
                    `${tradition} Traditional Gourmet Feast`,
                    'Pan-Indian Live Chaat Counter',
                    'Tandoori & Royal Starters',
                    'Artisanal Indian Mithai & Dessert Counter',
                ],
                highlightDishes: metadata.specialDishes,
                liveCounters: [
                    'Live Jalebi & Rabri Station',
                    'Chaat Papdi & Golgappa Live Bar',
                    'Fresh Filter Coffee / Kulhad Masala Chai Bar',
                    'Live Pasta & Wood-fired Flatbread Counter',
                ],
                pricePerPlateEstimate,
            },
            entertainmentRecommendations: metadata.musicHighlights.concat([
                'Cinematic 4K Drone & Candid Wedding Photo Team',
                'Traditional Welcome Dholis & Flower Petal Shower',
            ]),
            timeline,
            culturalRituals: metadata.keyRituals,
            clothingAndColorPalette: {
                colors: [metadata.themeColor, metadata.secondaryColor, metadata.accentColor, '#FFFFFF'],
                dressCodeSuggestion: metadata.dressCodeSuggestion,
            },
            checklist: [
                `Book ${tradition}-style venue in ${city} for ${guests} guests`,
                'Reserve authentic regional catering and finalize live food counters',
                'Book Mandap & Stage floral decor with antique brass accessories',
                'Hire cinematic candid photographer and drone crew',
                'Design cultural digital invitations with QR codes',
                'Conduct Seating Plan & Table allocations for VIP families',
                'Setup Live Stream broadcast for relatives overseas',
            ],
            riskWarnings,
        };
    }
    /**
     * Optimize and rebalance budget based on user total budget and priorities
     */
    static optimizeBudget(totalBudget, priorityCategory) {
        const ratios = { ...constants_1.DEFAULT_BUDGET_RATIOS };
        if (priorityCategory && ratios[priorityCategory] !== undefined) {
            // Increase prioritized category and balance others
            ratios[priorityCategory] += 0.08;
            const otherKeys = Object.keys(ratios).filter((k) => k !== priorityCategory);
            const deduct = 0.08 / otherKeys.length;
            otherKeys.forEach((k) => {
                ratios[k] = Math.max(0.01, ratios[k] - deduct);
            });
        }
        const breakdown = Object.entries(ratios).map(([cat, ratio]) => ({
            category: cat.charAt(0).toUpperCase() + cat.slice(1),
            percentage: Math.round(ratio * 100),
            amount: Math.round(totalBudget * ratio),
        }));
        return {
            totalBudget,
            breakdown,
            savingsAdvice: [
                'Booking venue and catering package bundled with in-house decor saves up to 15% on vendor logistics.',
                'Selecting seasonal flowers (Marigold, Jasmine, local Roses) reduces floral decor expenses by up to 25% without compromising aesthetics.',
                'Sending digital QR-embedded invitations eliminates paper printing and courier costs completely.',
            ],
        };
    }
    /**
     * Intelligent Chat Assistant ("Utsav AI") Q&A context engine
     */
    static async answerAssistantQuery(query, eventContext) {
        const q = query.toLowerCase();
        if (q.includes('remaining budget') || q.includes('how much budget left') || q.includes('budget left')) {
            if (eventContext && eventContext.budget) {
                const spent = eventContext.spentBudget || 0;
                const remaining = eventContext.budget - spent;
                return `📊 **Budget Overview for "${eventContext.name || 'Your Event'}":**\n- **Total Budget:** ₹${eventContext.budget.toLocaleString('en-IN')}\n- **Spent / Committed:** ₹${spent.toLocaleString('en-IN')} (${((spent / eventContext.budget) * 100).toFixed(1)}%)\n- **Remaining Balance:** ₹${remaining.toLocaleString('en-IN')}\n\n💡 *Tip:* Maintain at least 5% contingency for last-minute guest additions!`;
            }
            return 'Please specify your event budget, and I will calculate your remaining amount and suggested vendor allocations!';
        }
        if (q.includes('reduce') && (q.includes('cost') || q.includes('budget') || q.includes('decoration'))) {
            return `✨ **Smart Ways to Optimize Costs without sacrificing grandeur:**\n1. **Floral Selection:** Combine local marigolds, mogra, and banana stems instead of imported orchids/tulips for a rich authentic traditional look at 40% less cost.\n2. **Lighting Over Physical Props:** Rich amber architectural LED uplighting and fairy light canopies create royal drama at a fraction of heavy wooden backdrop costs.\n3. **Catering Live Counters:** Limit live food stations to 3 curated crowd favorites (e.g., Royal Chaat, Live Jalebi-Rabri, Dosa bar) to eliminate food wastage.\n4. **Digital QR Invitations:** Use UtsavMitra\'s digital invitation studio with WhatsApp delivery and instant RSVP tracking.`;
        }
        if (q.includes('venue') && (q.includes('suggest') || q.includes('recommend') || q.includes('under') || q.includes('find'))) {
            const city = eventContext?.city || 'Jaipur';
            return `🏰 **Curated Venues in ${city}:**\n1. **The Heritage Palace Lawns (${city})** — Capacity: 500 | Rating: 4.9⭐ | Features: Indoor AC Banquet + Heritage Courtyard.\n2. **Saffron Bloom Luxury Banquets** — Capacity: 350 | Rating: 4.8⭐ | Features: Valet parking, in-house catering, bridal suites.\n3. **Vedic Courtyard Garden** — Capacity: 250 | Rating: 4.7⭐ | Perfect for traditional rituals, mandap ceremonies, and open-air receptions.\n\n*Would you like me to check real-time availability or launch the map locator?*`;
        }
        if (q.includes('schedule') || q.includes('timeline') || q.includes('2-day') || q.includes('itinerary')) {
            return `📅 **Recommended 2-Day Indian Celebration Itinerary:**\n\n**Day 1 (Joy & Festivities):**\n- **10:00 AM:** Haldi & Chuda Ceremony (Yellow floral decor & live dhol)\n- **01:00 PM:** Traditional Festive Luncheon\n- **05:30 PM:** High-Tea & Henna / Mehndi Lounge\n- **07:30 PM:** Sangeet Night, Family Choreographies & DJ\n\n**Day 2 (Auspicious Rituals & Gala):**\n- **09:30 AM:** Auspicious Puja & Ganesh Sthapana\n- **11:00 AM:** Royal Baraat & Varmala Exchange\n- **12:30 PM:** Sacred Phere / Muhurtham under Mandap\n- **02:00 PM:** Grand Traditional Feast\n- **07:00 PM:** Reception Gala & Live Musical Ensemble`;
        }
        if (q.includes('menu') || q.includes('food') || q.includes('catering')) {
            const tradition = eventContext?.culturalTradition || 'North Indian';
            const meta = constants_1.CULTURAL_THEMES_METADATA[tradition] || constants_1.CULTURAL_THEMES_METADATA['North Indian'];
            return `🍲 **Recommended ${tradition} Feast Menu (${eventContext?.guestCount || 300} Guests):**\n\n- **Welcome Drinks:** Kesar Badam Milk, Kokum Sherbet, Tender Coconut Water\n- **Live Starters:** Paneer Malai Tikka, Crispy Corn Chaat, Cocktail Samosas\n- **Main Course Highlights:** ${meta.specialDishes.slice(0, 3).join(', ')}, Dal Makhani / Sambar, Assorted Naans & Basmati Pulao\n- **Desserts:** ${meta.specialDishes.slice(3).join(', ')}, Artisanal Gulab Jamun with Kulfi\n\n*Estimated cost: ₹750 – ₹1,100 per plate.*`;
        }
        return `Namaste! I am **Utsav AI**, your dedicated Indian Event Planning Copilot. I can assist you with:\n\n- 🎨 Selecting cultural decor, mandap styles, and color palettes\n- 💰 Optimizing your budget and alerting you to vendor overruns\n- 🍽️ Customizing regional catering menus (South Indian, Rajasthani, Gujarati, etc.)\n- ⏱️ Structuring ceremony timelines and coordinating live event check-ins\n- 📍 Recommending the best heritage and modern venues\n\nWhat would you like assistance with today?`;
    }
    static generateCustomTimeline(eventType, tradition) {
        if (eventType === 'Wedding') {
            return [
                { time: '09:00 AM', title: 'Traditional Welcome & Shehnai / Nadaswaram', note: 'Guests arrival with rose water & marigold garland reception' },
                { time: '10:15 AM', title: 'Baraat Procession & Dhol Entry', note: 'Groom royal entry with traditional percussion' },
                { time: '11:00 AM', title: 'Varmala & Flower Petal Shower', note: 'Grand stage exchange with royal background instrumental' },
                { time: '11:45 AM', title: `Sacred ${tradition} Phere / Muhurtham`, note: 'Vedic rituals around sacred fire with priest blessings' },
                { time: '01:30 PM', title: 'Traditional Grand Lunch Buffet', note: 'Full course feast featuring regional delicacies' },
                { time: '04:00 PM', title: 'Candid Photography & Family Blessings', note: 'Photo sessions on the decorated stage' },
                { time: '07:30 PM', title: 'Royal Reception & Live Sangeet Band', note: 'Evening celebration, cake cutting, and musical performance' },
            ];
        }
        if (eventType === 'Engagement') {
            return [
                { time: '05:00 PM', title: 'Guest Arrival & Welcome Mocktails', note: 'Ambient instrumental sitar / violin fusion music' },
                { time: '06:00 PM', title: 'Ceremonial Ring Exchange', note: 'Special floral stage presentation and confetti celebration' },
                { time: '07:00 PM', title: 'Family Speeches & Video Presentation', note: 'Couple journey video on LED display screen' },
                { time: '08:00 PM', title: 'Gourmet Dinner Buffet & Live DJ', note: 'Multi-cuisine banquet and musical celebration' },
            ];
        }
        return [
            { time: '11:00 AM', title: 'Welcome & Auspicious Lighting of Diya', note: 'Inaugural lamp lighting with traditional blessings' },
            { time: '12:00 PM', title: 'Main Celebration & Activity', note: 'Key ceremonies, addresses, or performances' },
            { time: '01:30 PM', title: 'Festive Lunch & Networking', note: 'Catered regional banquet' },
            { time: '03:30 PM', title: 'Photo Sessions & Return Gifts', note: 'Memento distribution and concluding blessings' },
        ];
    }
}
exports.AIService = AIService;
