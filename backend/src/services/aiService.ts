import {
  IAIEventPlanRequest,
  IAIEventPlanResponse,
  CulturalTradition,
  EventType,
} from '../shared/types';
import { CULTURAL_THEMES_METADATA, DEFAULT_BUDGET_RATIOS } from '../shared/constants';

export class AIService {
  /**
   * Parse natural language prompts into structured event parameters
   * E.g., "I want to plan a South Indian wedding for 300 guests in Bangalore with 8 lakh budget"
   */
  public static parseNaturalPrompt(prompt: string): Partial<IAIEventPlanRequest> {
    const text = prompt.toLowerCase();
    const result: Partial<IAIEventPlanRequest> = {
      naturalPrompt: prompt,
    };

    // Detect Event Type
    if (text.includes('wedding') || text.includes('marriage') || text.includes('shaadi')) {
      result.eventType = 'Wedding';
    } else if (text.includes('engagement') || text.includes('roka') || text.includes('ring')) {
      result.eventType = 'Engagement';
    } else if (text.includes('reception')) {
      result.eventType = 'Reception';
    } else if (text.includes('birthday') || text.includes('bday')) {
      result.eventType = 'Birthday';
    } else if (text.includes('baby shower') || text.includes('seemantham') || text.includes('godh bharai')) {
      result.eventType = 'Baby Shower';
    } else if (text.includes('housewarming') || text.includes('griha pravesh') || text.includes('gruhapravesham')) {
      result.eventType = 'Housewarming';
    } else if (text.includes('corporate') || text.includes('conference') || text.includes('annual meet')) {
      result.eventType = 'Corporate Event';
    } else if (text.includes('college') || text.includes('fest')) {
      result.eventType = 'College Event';
    } else if (text.includes('anniversary')) {
      result.eventType = 'Anniversary';
    } else {
      result.eventType = 'Wedding';
    }

    // Detect Cultural Tradition
    if (text.includes('rajasthani') || text.includes('marwari') || text.includes('jaipur')) {
      result.culturalTradition = 'Rajasthani';
    } else if (text.includes('south indian') || text.includes('tam brahm') || text.includes('karnataka')) {
      result.culturalTradition = 'South Indian';
    } else if (text.includes('bengali') || text.includes('kolkata')) {
      result.culturalTradition = 'Bengali';
    } else if (text.includes('punjabi') || text.includes('sikh') || text.includes('anand karaj')) {
      result.culturalTradition = 'Punjabi';
    } else if (text.includes('gujarati') || text.includes('garba')) {
      result.culturalTradition = 'Gujarati';
    } else if (text.includes('marathi') || text.includes('maharashtrian')) {
      result.culturalTradition = 'Marathi';
    } else if (text.includes('tamil') || text.includes('chennai')) {
      result.culturalTradition = 'Tamil';
    } else if (text.includes('telugu') || text.includes('hyderabad') || text.includes('andhra')) {
      result.culturalTradition = 'Telugu';
    } else if (text.includes('kannada') || text.includes('bangalore') || text.includes('mysore')) {
      result.culturalTradition = 'Kannada';
    } else if (text.includes('malayali') || text.includes('kerala') || text.includes('kochi')) {
      result.culturalTradition = 'Malayali';
    } else if (text.includes('north indian') || text.includes('delhi')) {
      result.culturalTradition = 'North Indian';
    } else {
      result.culturalTradition = 'North Indian';
    }

    // Detect Guest Count (e.g., "300 guests", "for 500 people", "250 pax")
    const guestMatch = text.match(/(\d+)\s*(guests|people|pax|persons|members|attendees)/i) || text.match(/(?:for|with)\s*(\d+)/i);
    if (guestMatch && guestMatch[1]) {
      result.guestCount = parseInt(guestMatch[1], 10);
    } else {
      result.guestCount = 250;
    }

    // Detect Budget (e.g., "8 lakh", "15 lakhs", "12,00,000", "500000", "₹10L")
    const lakhMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b/i);
    const croreMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)\b/i);
    const directNumberMatch = text.match(/(?:₹|rs\.?|inr|budget\s*(?:of|is)?)\s*(\d{5,8})/i);

    if (croreMatch && croreMatch[1]) {
      result.budget = parseFloat(croreMatch[1]) * 10000000;
    } else if (lakhMatch && lakhMatch[1]) {
      result.budget = parseFloat(lakhMatch[1]) * 100000;
    } else if (directNumberMatch && directNumberMatch[1]) {
      result.budget = parseInt(directNumberMatch[1], 10);
    } else {
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
    if (!result.city) result.city = 'Jaipur';

    // Detect Food Preference
    if (text.includes('jain')) {
      result.foodPreference = 'Jain';
    } else if (text.includes('non veg') || text.includes('non-veg') || text.includes('chicken') || text.includes('mutton')) {
      result.foodPreference = 'Non-Veg';
    } else if (text.includes('vegan')) {
      result.foodPreference = 'Vegan';
    } else {
      result.foodPreference = 'Veg';
    }

    return result;
  }

  /**
   * Generate comprehensive cultural event plan
   */
  public static async generateEventPlan(params: IAIEventPlanRequest): Promise<IAIEventPlanResponse> {
    const tradition = params.culturalTradition || 'North Indian';
    const metadata = CULTURAL_THEMES_METADATA[tradition] || CULTURAL_THEMES_METADATA['North Indian'];
    const totalBudget = params.budget || 1000000;
    const guests = params.guestCount || 200;

    // Intelligent dynamic budget distribution
    const venueBudget = Math.round(totalBudget * DEFAULT_BUDGET_RATIOS.venue);
    const cateringBudget = Math.round(totalBudget * DEFAULT_BUDGET_RATIOS.catering);
    const decorationBudget = Math.round(totalBudget * DEFAULT_BUDGET_RATIOS.decoration);
    const photoBudget = Math.round(totalBudget * DEFAULT_BUDGET_RATIOS.photography);
    const entertainmentBudget = Math.round(totalBudget * DEFAULT_BUDGET_RATIOS.entertainment);
    const invitationBudget = Math.round(totalBudget * DEFAULT_BUDGET_RATIOS.invitation);
    const transportationBudget = Math.round(totalBudget * DEFAULT_BUDGET_RATIOS.transportation);
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
    const riskWarnings: string[] = [];
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
  public static optimizeBudget(totalBudget: number, priorityCategory?: string): Record<string, any> {
    const ratios = { ...DEFAULT_BUDGET_RATIOS };

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
   * Grok AI Bot Integration for UtsavMitra
   * Strictly constrained to answer ONLY about what the UTSAVMITRA website creates and manages.
   */
  public static async answerAssistantQuery(
    query: string,
    eventContext?: {
      name?: string;
      type?: string;
      budget?: number;
      spentBudget?: number;
      guestCount?: number;
      culturalTradition?: string;
      city?: string;
    }
  ): Promise<string> {
    const grokApiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.AI_API_KEY;
    const grokApiUrl = process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions';
    const grokModel = process.env.GROK_MODEL || 'grok-beta';

    const systemPrompt = `You are Utsav AI, the official Grok-powered Indian Event Management Copilot for UTSAVMITRA (utsavmitra.com).

CRITICAL DIRECTIVE & STRICT DOMAIN LOCK:
You are STRICTLY LIMITED to answering questions exclusively about what the UTSAVMITRA website creates, provides, and manages:
1. AI Cultural Event Planner & Muhurtham Timelines (/ai-planner)
2. 7-Step Auspicious Event Creation Wizard (/events/create)
3. 2D Royal Mandap & Stage Blueprint Studio (/mandap-builder)
4. Royal Baithak & Banquet Dining Seating Planner (/seating)
5. Heritage Palaces, Forts & Banquets with Geolocation (/venues)
6. Regional Gastronomy & Feasts with Satvik/Jain & Live Counters (/catering)
7. Mandap, Floral Decor, Diya Walkways & Stage Setups (/decorations)
8. Shehnai, Dhol Tasha, Live Bands & Cinematic 4K Photo (/entertainment)
9. Digital E-Invitations, Signed HMAC QR Entry Passes & Webcam QR Gate Scanner (/scanner)
10. Live Event Command Center, Broadcast & Attendance Tracking (/events/:id)
11. Role-Based Access: Client/Host Dashboard, Organizer Studio (/organizer/dashboard), and Admin Portal (/admin).

IF THE USER ASKS ABOUT ANYTHING UNRELATED TO UTSAVMITRA OR INDIAN EVENT PLANNING (such as general software code, politics, outside companies, unrelated trivia, etc.):
You MUST politely decline and refocus them with this exact greeting and boundary:
"Namaste! 🙏 I am **Utsav AI** (powered by Grok), specialized exclusively in **UtsavMitra** — India's premier AI-powered cultural event planning platform. I can only assist you with what this website creates: traditional celebration planning, 2D mandap blueprints, regional feasts, seating layouts, heritage venues, and QR entry passes. How can I help you organize your celebration on UtsavMitra today?"

Always maintain a warm, respectful, and authentic Indian tone ("Namaste! 🙏"). Use markdown formatting with bullet points and bold highlights.`;

    // Attempt live Grok API call if API key is provided
    if (grokApiKey) {
      try {
        const response = await fetch(grokApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${grokApiKey}`,
          },
          body: JSON.stringify({
            model: grokModel,
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: `Event Context: ${JSON.stringify(eventContext || {})}\n\nUser Question: ${query}`,
              },
            ],
            temperature: 0.4,
            max_tokens: 600,
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) return reply;
        }
      } catch (err) {
        console.warn('Grok AI API call failed, falling back to local Grok knowledge engine:', err);
      }
    }

    // Local Grok-Powered Domain-Locked Knowledge Engine
    return this.answerWithGrokKnowledgeEngine(query, eventContext);
  }

  /**
   * Local Grok Knowledge Engine strictly answering what UTSAVMITRA website creates
   */
  private static answerWithGrokKnowledgeEngine(
    query: string,
    eventContext?: {
      name?: string;
      type?: string;
      budget?: number;
      spentBudget?: number;
      guestCount?: number;
      culturalTradition?: string;
      city?: string;
    }
  ): string {
    const q = query.toLowerCase();

    // 1. Inquiries about what the website creates / platform overview
    if (
      q.includes('what website create') ||
      q.includes('what does this website') ||
      q.includes('what is utsavmitra') ||
      q.includes('what can you do') ||
      q.includes('features') ||
      q.includes('about') ||
      q.includes('platform')
    ) {
      return `Namaste! 🙏 **UTSAVMITRA** is India's premier AI-powered cultural event management platform. Here is everything our website creates and manages for your celebrations:

1. 🪔 **AI Cultural Planner (\`/ai-planner\`):** Generates auspicious Muhurtham schedules, ritual timelines, and dynamic budget breakdowns for 12 Indian regional traditions.
2. 🏛️ **Heritage Venues & Forts (\`/venues\`):** Discover and book royal palaces, heritage forts, and luxury banquets with Razorpay escrow protection and interactive maps.
3. 🎨 **2D Mandap Studio (\`/mandap-builder\`):** Interactive visual designer for traditional floral mandaps, havan kunds, varmala stages, and royal entry arches.
4. 🪑 **Royal Baithak & Seating Planner (\`/seating\`):** Drag-and-drop banquet table layouts, royal diwan arrangements, and VIP guest seat allocations.
5. 🍲 **Regional Gastronomy & Feasts (\`/catering\`):** Curate authentic multi-course menus, live jalebi/chaat counters, pure desi ghee preparations, and Satvik/Jain dietary headcounts.
6. 🌸 **Decor, Floral & Music Marketplace (\`/decorations\`, \`/entertainment\`):** Book verified traditional marigold decor, brass diyas, shehnai troupes, dhol tasha, and cinematic 4K photographers.
7. 🎟️ **Cryptographic QR Passes & Live Gate Scanner (\`/scanner\`):** Send Sanskrit digital WhatsApp invitations and verify guests at the entrance using HMAC digital QR passes.
8. 📡 **Live Command Center (\`/events/:id\`):** Real-time gate check-in attendance, ceremony live stream broadcast, and instant schedule alerts.

How can I help you plan your next celebration on UtsavMitra?`;
    }

    // 2. Inquiries about 2D Mandap Studio
    if (q.includes('mandap') || q.includes('2d') || q.includes('stage design') || q.includes('havan kund')) {
      return `🎨 **2D Royal Mandap Studio (Created by UtsavMitra):**\nOur interactive studio (\`/mandap-builder\`) allows you to architect your ceremonial stage:\n- **Drag-and-Drop Elements:** Place floral mandaps, sacred havan kunds, varmala stages, marigold rangolis, and royal archways.\n- **Vedic Directional Guidance:** Orient the sacred mandap towards auspicious directions.\n- **Theme Customization:** Choose from *Royal Rajputana Gold & Crimson*, *Vedic Temple Sandalwood*, and *Mogra Bliss*.\n- **Instant Export:** Share blueprints directly with decorators and venue managers.`;
    }

    // 3. Inquiries about Seating & Baithak Planner
    if (q.includes('seating') || q.includes('baithak') || q.includes('table') || q.includes('chair')) {
      return `🪑 **Royal Baithak & Seating Planner (Created by UtsavMitra):**\nOur dedicated layout manager (\`/seating\`) lets you configure guest comfort:\n- **Table Arrangements:** Round banquet tables, royal floor diwans, and theatre rows.\n- **VIP Guest Mapping:** Assign specific guests and family elders to designated tables.\n- **Dietary Synced:** Automatically see Satvik, Jain, and Pure-Veg guest counts per table.`;
    }

    // 4. Inquiries about QR Gate Passes & Entry Scanner
    if (q.includes('qr') || q.includes('pass') || q.includes('scanner') || q.includes('gate') || q.includes('checkin') || q.includes('check-in')) {
      return `🎟️ **Cryptographic QR Gate Passes & Scanner (Created by UtsavMitra):**\n- **Digital E-Invitations:** Generate cultural Sanskrit invitations with personalized HMAC signed QR codes.\n- **Webcam / Camera Gate Scanner (\`/scanner\`):** Real-time check-in using any phone or laptop camera.\n- **Anti-Duplicate Security:** Prevents duplicate pass re-use and alerts gate security instantly.\n- **Arrival Notifications:** Real-time guest attendance synced to your event command center.`;
    }

    // 5. Inquiries about Budgets & Escrow
    if (q.includes('budget') || q.includes('cost') || q.includes('money') || q.includes('price') || q.includes('lakh')) {
      if (eventContext && eventContext.budget) {
        const spent = eventContext.spentBudget || 0;
        const remaining = eventContext.budget - spent;
        return `📊 **UtsavMitra Budget Optimizer for "${eventContext.name || 'Your Celebration'}":**\n- **Allocated Budget:** ₹${eventContext.budget.toLocaleString('en-IN')}\n- **Committed:** ₹${spent.toLocaleString('en-IN')} (${((spent / eventContext.budget) * 100).toFixed(1)}%)\n- **Balance Available:** ₹${remaining.toLocaleString('en-IN')}\n\n💡 *UtsavMitra Protection:* All vendor payments are held in Razorpay Escrow until milestone completion!`;
      }
      return `💰 **UtsavMitra Budget Management:**\nOur platform provides AI-driven dynamic budget distribution:\n- **Venue:** 35% | **Catering:** 30% | **Decor:** 15% | **Photography & Music:** 12% | **Invites & Buffer:** 8%\n- **Razorpay Escrow:** Complete payment security with milestone-based vendor payouts and instant GST invoices.`;
    }

    // 6. Inquiries about Venues & Forts
    if (q.includes('venue') || q.includes('palace') || q.includes('fort') || q.includes('hall') || q.includes('resort')) {
      const city = eventContext?.city || 'Jaipur';
      return `🏰 **Heritage Venues & Forts on UtsavMitra (\`/venues\`):**\n- **Curated Heritage Properties in ${city}:** Royal palaces, fort courtyards, luxury AC banquets, and open-air lawns.\n- **Filter by Policy:** Pure Veg Only, External Catering Allowed, Capacity (100 to 2,000+ guests).\n- **Map Discovery:** Geolocation locator to find verified banquet halls near your location.`;
    }

    // 7. Inquiries about Regional Feasts & Catering
    if (q.includes('menu') || q.includes('food') || q.includes('catering') || q.includes('feast') || q.includes('satvik') || q.includes('jain')) {
      const tradition = (eventContext?.culturalTradition as CulturalTradition) || 'Rajasthani';
      const meta = CULTURAL_THEMES_METADATA[tradition] || CULTURAL_THEMES_METADATA['Rajasthani'];
      return `🍲 **Regional Gastronomy & Catering on UtsavMitra (\`/catering\`):**\n- **Authentic Cuisines:** ${tradition} Royal Feast, South Indian Banana Leaf Sadya, Punjabi Shahi Dawat, Gujarati Thali, and Bengali Bhoj.\n- **Specialty Delicacies:** ${meta.specialDishes.join(', ')}\n- **Live Counters:** Live Jalebi & Rabri Bar, Royal Chaat Station, Wood-fired kulhad chai.\n- **Dietary Precision:** Dedicated counters for 100% Jain Satvik & Pure Vegetarian headcounts.`;
    }

    // 8. Inquiries about Traditions & Rituals
    if (q.includes('tradition') || q.includes('wedding') || q.includes('muhurtham') || q.includes('ritual') || q.includes('schedule') || q.includes('puja')) {
      return `🪔 **Indian Cultural Traditions Supported on UtsavMitra:**\nWe support 12 distinct regional celebration traditions with pre-configured Vedic milestones:\n- **Rajasthani / Marwari:** Ganpati Sthapana, Mayra, Sangeet, Royal Baraat, Phere.\n- **South Indian:** Muhurtham, Kasi Yatra, Kanyadanam, Mangalya Dharanam, Sadya.\n- **Punjabi / Sikh:** Roka, Chunni, Mehndi, Sangeet, Anand Karaj.\n- **Gujarati, Bengali, Marathi, Telugu, Tamil, Kannada, Malayali:** Custom ritual checklists and regional vendor pairing.`;
    }

    // 9. Strict Out-of-Scope Fallback (Politely declines general or outside topics)
    const isEventRelated = [
      'event', 'wedding', 'party', 'celebration', 'guest', 'decor', 'photo', 'camera',
      'music', 'dhol', 'shehnai', 'invite', 'host', 'organizer', 'admin', 'login', 'create'
    ].some((w) => q.includes(w));

    if (isEventRelated) {
      return `Namaste! 🙏 I am **Utsav AI** (powered by Grok), your dedicated cultural planning copilot on **UtsavMitra**.\n\nI can assist you with everything this website creates:\n- 📅 Designing ceremony timelines & checklists\n- 🎨 Building 2D Mandap and stage layouts (\`/mandap-builder\`)\n- 🪑 Configuring royal banquet seating (\`/seating\`)\n- 🏰 Finding heritage venues across Indian cities (\`/venues\`)\n- 🍲 Customizing regional catering menus (\`/catering\`)\n- 🎟️ Generating signed QR gate entry passes (\`/scanner\`)\n\nWhat would you like to configure for your celebration?`;
    }

    // Explicitly non-UtsavMitra topic
    return `Namaste! 🙏 I am **Utsav AI** (powered by Grok), specialized exclusively in **UtsavMitra** — India's premier AI-powered cultural event planning platform.\n\nI can only assist you with what this website creates: traditional celebration planning, 2D mandap blueprints, regional feasts, seating layouts, heritage venues, and QR entry passes.\n\nHow can I help you organize your celebration on UtsavMitra today?`;
  }

  private static generateCustomTimeline(eventType: EventType, tradition: CulturalTradition): Array<{ time: string; title: string; note: string }> {
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
