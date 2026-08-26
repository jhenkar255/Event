# 🪔 UtsavMitra (उत्सवमित्र) – AI-Powered Indian Event Management & Planning Platform

> *"Plan. Celebrate. Remember."*
> *"सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके"*

**UtsavMitra** is a complete, production-ready, full-stack event management ecosystem specifically crafted for Indian cultural celebrations — from grand Royal Rajasthani Weddings and high-energy Punjabi Sangeets to sacred South Indian Muhurthams, Griha Pravesh Housewarmings, and Corporate Galas.

---

## 🌟 Key Architecture & Highlights

1. **Authentic Indian Cultural Design System**:
   - Palette: Deep Royal Maroon (`#7A1F2B`), Saffron (`#F4A340`), Antique Gold (`#C9A227`), Warm Ivory (`#FFF8EC`), and Light Beige (`#F5EBDD`).
   - Cultural motifs: Diya animations, Mandala corner embellishments, Marigold garlands, Kalash icons, and Sanskrit Muhurtham blessings.
   - Light & Dark cultural modes.

2. **Culture-Aware AI Event Planner**:
   - Covers **12 Indian Regional Traditions** (Rajasthani, South Indian, Bengali, Punjabi, Gujarati, North Indian, Marathi, Tamil, Telugu, Kannada, Malayali, Custom).
   - "Create with AI" natural language prompt parser (e.g. *"Plan a 350-person wedding in Jaipur with ₹12L budget"*).
   - Multi-day Muhurtham schedules, 5-category budget optimizer, satvik & regional cuisine menu generator, and milestone checklists.
   - Floating **Utsav AI Copilot** drawer for instant budget advice, cost-cutting tips, and ritual guidance.

3. **Interactive 2D Cultural Venue & Mandap Customizer**:
   - Drag-and-drop 2D floorplan studio for Grand Mandaps, Main Varmala Stages, Royal Entrance Torans, Marigold Rangolis, and Dining Tables.
   - Rotation, color customization, axis alignment, and blueprint persistence.

4. **Table & Seating Allocator**:
   - Table capacity manager (Round tables, Rect tables, Theatre rows).
   - Real-time guest assignment, dietary requirements tracking, and capacity overload alerts.

5. **Digital Indian E-Invitations & Public RSVP**:
   - Royal digital wedding/puja invitation with Sanskrit shlokas, date, venue directions, and auspicious Santoor/Shehnai background audio.
   - Public RSVP form with meal preference selection (Pure Veg, Jain Satvik, Non-Veg) and plus guest counter.

6. **Cryptographically Signed QR Gate Passes & Live Scanner**:
   - HMAC-SHA256 signed QR passes generated for each invited guest.
   - In-browser live webcam gate scanner (`html5-qrcode`) with audio feedback chimes and instant duplicate entry prevention.

7. **Flagship Event Command Center & Live Mode**:
   - Real-time countdown timer & live gate attendance counter.
   - **Toggleable LIVE EVENT MODE**: Turns dashboard into a high-octane real-time control room with audio chime on check-in and WebSocket announcements.
   - 10-tab control suite: Overview, Checklist, 2D Mandap Studio, Seating Planner, Guest Directory, Budget Optimizer, Payments, Gate Scanner, Live Broadcast Room, and Digital Invite.

8. **Razorpay Payments & GST Tax Invoices**:
   - Escrow booking workflow with Razorpay order creation and HMAC signature verification.
   - Itemized 18% GST calculation (CGST 9% + SGST 9%) and printable/downloadable PDF tax invoices.

9. **Interactive Venue Discovery & Geolocation**:
   - Leaflet interactive map with custom gold/maroon pins and popup details.
   - "Find Venues Near Me" browser GPS locator with distance radius slider.

10. **Executive Admin Dashboard & CSV Export**:
    - Platform-wide KPIs, all celebrations table, user moderation, escrow transactions, and 1-click CSV reports for Users, Events, and Payments.

---

## ⚡ Demo Accounts & Credentials

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Demo Admin** | `admin@utsavmitra.demo` | `Utsav@2026` | Full platform governance, all celebrations, escrow volume, CSV export |
| **Demo Host User** | `user@utsavmitra.demo` | `Utsav@2026` | Host of flagship *"Royal Rajasthani Wedding of Aarav & Ananya"* |

> **Quick Login Shortcut**: Click the **"⚡ Quick Demo Login"** button in the top navigation bar to log in as either Demo User or Demo Admin with a single click.

---

## 🏛️ Flagship Showcase Event Pre-Loaded

- **Name**: `"Royal Rajasthani Wedding of Aarav & Ananya"`
- **Tradition**: Rajasthani Heritage Wedding
- **Venue**: The Royal Haveli & Courtyard Lawns, MI Road, Jaipur
- **Budget**: ₹12,00,000 (Allocated) | ₹9,30,000 (Committed)
- **Guests**: 25 Pre-seeded guests with signed QR passes & dietary preferences.
- **2D Blueprint & Seating**: Pre-configured Mandap layout with 4 dining tables.
- **Verified Payments**: Venue advance (₹4,50,000) + Royal Feast catering (₹3,00,000) with downloadable GST tax invoices.

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js 18+ & npm
- MongoDB running on `mongodb://127.0.0.1:27017`

### 1. Start Backend (Port 5050)
```bash
cd backend
npm install
npm run seed     # Seeds demo users, venues, decor, and flagship wedding event
npm run dev      # Starts Express & Socket.IO server on port 5050
```

### 2. Start Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

### 3. Run Backend Integration Tests
```bash
cd backend
npm test         # Runs 10 Jest + Supertest API integration tests
```

---

## 📂 Project Structure

```
Event/
├── shared/                       # Shared TypeScript types and Indian constants
│   ├── types.ts                  # 19 TypeScript domain interfaces
│   └── constants.ts              # 12 Regional traditions, menus, and checklists
├── backend/
│   ├── src/
│   │   ├── config/database.ts    # Mongoose MongoDB connection
│   │   ├── models/               # 19 Mongoose schemas
│   │   ├── middleware/           # JWT auth, Joi validation, error handling
│   │   ├── services/             # AI, Razorpay, QR HMAC, Socket.IO, Reports
│   │   ├── controllers/          # REST API controllers
│   │   ├── routes/               # Express route definitions
│   │   ├── seed/seedData.ts      # Demo database seeder
│   │   └── server.ts             # Express & Socket.IO entrypoint
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/client.ts         # Authenticated API client
    │   ├── context/              # Auth, Socket.IO, Theme contexts
    │   ├── components/
    │   │   ├── layout/           # Navbar, Footer, IndianMotifs (Diya, Kalash)
    │   │   ├── ai/               # UtsavAIChat, AIEventWizardModal
    │   │   ├── customizer/       # Interactive2DDesigner, SeatingPlanner
    │   │   ├── events/           # EventCard, ChecklistProgress, RiskAlertsBanner
    │   │   ├── invitations/      # DigitalInvitationTemplate
    │   │   ├── qr/               # QREntryScanner
    │   │   ├── live/             # LiveStreamPlayer
    │   │   ├── maps/             # VenueMap, FindVenuesNearMe
    │   │   └── payments/         # RazorpayCheckoutModal, InvoiceReceiptModal
    │   ├── pages/                # 14 Full React Views
    │   ├── App.tsx               # Client routes & layout
    │   └── main.tsx              # React DOM entry
    ├── vite.config.ts            # Proxy to port 5050 & path aliases
    └── tailwind.config.js        # Indian cultural tokens & animation keyframes
```

---

## 🛡️ API Endpoints Summary

| Module | Route | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | POST | Authenticate user & issue JWT |
| **Auth** | `/api/auth/register` | POST | Register host or organizer |
| **Events** | `/api/events` | GET / POST | List events or create new celebration |
| **Events** | `/api/events/:id` | GET / PUT | Fetch event command center details |
| **Design** | `/api/events/:id/design` | GET / POST | Save / load 2D Mandap floorplan |
| **Seating** | `/api/events/:id/seating` | GET / POST | Table layout & guest seat assignment |
| **QR Gate** | `/api/qr/checkin` | POST | Verify HMAC signed QR token & mark attendance |
| **Payments** | `/api/payments/order` | POST | Initialize Razorpay escrow order |
| **Payments** | `/api/payments/verify` | POST | Verify HMAC signature & generate receipt |
| **AI Planner** | `/api/ai/plan` | POST | Generate 12-tradition ceremony plan & budget |
| **AI Prompt** | `/api/ai/parse-prompt` | POST | Natural language sentence parser |
| **AI Chat** | `/api/ai/chat` | POST | Interactive Utsav AI assistant chat |
| **Admin** | `/api/admin/reports/:type/csv` | GET | Download CSV audit reports (Events/Users/Payments) |

---

## 📜 Cultural Craftsmanship

Crafted with 🪔 for auspicious Indian celebrations worldwide.
*"सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके"*
