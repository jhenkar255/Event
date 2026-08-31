// ===================================================
// UtsavMitra - Shared TypeScript Definitions
// ===================================================

export type UserRole = 'USER' | 'ORGANIZER' | 'ADMIN' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
export type OrganizerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface IUser {
  _id?: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  status?: UserStatus;
  emailVerified?: boolean;
  isVerified?: boolean;
  profilePhoto?: string;
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  // Organizer Profile Fields
  organizationName?: string;
  organizationDescription?: string;
  businessCategory?: string;
  experience?: string;
  services?: string[];
  documents?: string[];
  organizerStatus?: OrganizerStatus;
  dietaryPreference?: 'Veg' | 'Non-Veg' | 'Jain' | 'Vegan' | 'All';
  preferences?: {
    culturalPreference?: string;
    foodPreference?: 'Veg' | 'Non-Veg' | 'Jain' | 'Vegan' | 'All';
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAuditLog {
  _id?: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export type EventType =
  | 'Wedding'
  | 'Engagement'
  | 'Reception'
  | 'Birthday'
  | 'Anniversary'
  | 'Baby Shower'
  | 'Naming Ceremony'
  | 'Housewarming'
  | 'Traditional Ceremony'
  | 'Corporate Event'
  | 'College Event'
  | 'Tech Meet & Hackathon'
  | 'Startup Conclave'
  | 'Product Launch'
  | 'Cultural Fest'
  | 'Festival'
  | 'Religious Event'
  | 'Private Party'
  | 'Other';

export type EventStatus =
  | 'DRAFT'
  | 'PLANNING'
  | 'CONFIRMED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export type CulturalTradition =
  | 'North Indian'
  | 'South Indian'
  | 'Bengali'
  | 'Punjabi'
  | 'Gujarati'
  | 'Rajasthani'
  | 'Marathi'
  | 'Tamil'
  | 'Telugu'
  | 'Kannada'
  | 'Malayali'
  | 'Custom';

export interface ILocation {
  address: string;
  city: string;
  state: string;
  pincode?: string;
  latitude: number;
  longitude: number;
}

export interface IEvent {
  _id?: any;
  eventId?: string;
  name: string;
  type: EventType;
  eventType?: string;
  category?: string;
  subcategory?: string;
  culturalTradition?: CulturalTradition;
  description?: string;
  organizerName?: string;
  institutionName?: string;
  department?: string;
  academicYear?: string;
  date: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  venue?: any;
  venueId?: any;
  location: ILocation;
  guestCount: number;
  capacity?: number;
  availableSeats?: number;
  registeredCount?: number;
  budget: number;
  spentBudget?: number;
  price?: number;
  ticketPrice?: number;
  isFree?: boolean;
  eventFormat?: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  streamUrl?: string;
  meetingPlatform?: string;
  certificateProvided?: boolean;
  registrationDeadline?: string;
  isLive?: boolean;
  isFeatured?: boolean;
  speakers?: { name: string; designation?: string; organization?: string; topic?: string; photo?: string }[];
  chiefGuests?: string[];
  sponsors?: { name: string; tier?: string; logo?: string }[];
  schedule?: { time: string; title: string; description?: string; speaker?: string }[];
  visibility?: 'PUBLIC' | 'PRIVATE' | 'INVITATION_ONLY';
  ticketTiers?: Array<{
    id: string;
    name: string;
    price: number;
    capacity: number;
    availableSeats: number;
    description?: string;
  }>;
  bookingStartDate?: string;
  bookingEndDate?: string;
  isSoldOut?: boolean;
  isRegistrationClosed?: boolean;
  cancellationPolicy?: string;
  refundPolicy?: string;
  termsAndConditions?: string;
  distanceKm?: number;
  theme?: string;
  status: EventStatus;
  createdBy: any;
  bannerImage?: string;
  checklist?: IChecklistItem[];
  riskAlerts?: IRiskAlert[];
  invitation?: IInvitation;
  createdAt?: string;
  updatedAt?: string;
}

export interface IChecklistItem {
  id: string;
  title: string;
  category: string;
  isCompleted: boolean;
  dueDate?: string;
  assignedTo?: string;
}

export interface IRiskAlert {
  id: string;
  type: 'BUDGET' | 'VENUE' | 'CATERING' | 'SEATING' | 'PAYMENT' | 'RSVP' | 'DEADLINE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  suggestedAction?: string;
  isResolved?: boolean;
}

export interface IVenue {
  _id?: any;
  name: string;
  description: string;
  city: string;
  state: string;
  address: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  venueType?: string;
  capacity: {
    min: number;
    max: number;
  };
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  photos: string[];
  features: {
    indoor: boolean;
    outdoor: boolean;
    parking: boolean;
    parkingCapacity?: number;
    ac: boolean;
    cateringAvailable: boolean;
    roomsAvailable?: number;
    alcoholAllowed: boolean;
    powerBackup: boolean;
  };
  cateringPolicy?: {
    pureVegOnly?: boolean;
    externalCateringAllowed?: boolean;
  };
  roomsAvailable?: number;
  vendorName: string;
  vendorPhone?: string;
  vendorEmail?: string;
  isAvailable: boolean;
  isDemo?: boolean;
  distanceKm?: number;
  createdAt?: string;
}

export interface IDecoration {
  _id?: any;
  name: string;
  category:
    | 'Stage'
    | 'Backdrop'
    | 'Entrance'
    | 'Flowers'
    | 'Balloons'
    | 'Lighting'
    | 'Ceiling'
    | 'Rangoli'
    | 'Mandap'
    | 'Tables'
    | 'Chairs'
    | 'Traditional Decor'
    | 'Modern Decor';
  culturalStyle?: CulturalTradition;
  style?: string;
  description: string;
  price: number;
  rating: number;
  photos: string[];
  vendorName: string;
  isAvailable: boolean;
  isDemo?: boolean;
}

export interface ICateringPackage {
  _id?: any;
  name: string;
  category:
    | 'Veg'
    | 'Non-Veg'
    | 'Jain'
    | 'Vegan'
    | 'South Indian'
    | 'North Indian'
    | 'Continental'
    | 'Royal Rajasthani'
    | 'Gujarati Thali'
    | 'Bengali Feast';
  cuisineType?: string;
  description: string;
  pricePerPlate: number;
  minimumGuests: number;
  items?: string[];
  menuItems: {
    welcomeDrinks: string[];
    starters: string[];
    mainCourse: string[];
    breadsAndRice: string[];
    desserts: string[];
    liveCounters?: string[];
  };
  rating: number;
  vendorName: string;
  photos: string[];
  isAvailable: boolean;
}

export interface IEntertainment {
  _id?: any;
  name: string;
  category:
    | 'DJ'
    | 'Live Band'
    | 'Classical Music'
    | 'Dhol'
    | 'Dance Performance'
    | 'Anchor'
    | 'Photography'
    | 'Videography'
    | 'Drone Photography'
    | 'Lighting & SFX'
    | 'Sound System'
    | 'Shehnai Troupe';
  description: string;
  price: number;
  durationHours?: number;
  rating: number;
  reviewsCount?: number;
  vendorName: string;
  photos: string[];
  sampleAudioVideoUrl?: string;
  isAvailable: boolean;
}

export interface IGuest {
  _id?: any;
  eventId: any;
  name: string;
  email?: string;
  phone?: string;
  relationship?: 'Family' | 'Friend' | 'Colleague' | 'VIP' | 'Relative' | 'Other';
  group?: string;
  invitationStatus: 'NOT_SENT' | 'SENT' | 'OPENED' | 'FAILED';
  rsvpStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';
  mealPreference: 'Veg' | 'Non-Veg' | 'Jain' | 'Vegan';
  plusGuests: number;
  assignedTable?: string;
  assignedSeat?: string;
  checkInStatus?: boolean;
  checkedIn?: boolean;
  checkInTime?: string;
  qrToken?: string;
  qrCodeDataUrl?: string;
}

export interface IInvitation {
  _id?: any;
  eventId: any;
  templateId: string;
  title: string;
  hostNames: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  customMessage: string;
  shlokaOrQuote?: string;
  themeColor: string;
  musicUrl?: string;
  coverImage?: string;
  photos?: string[];
  shareUrlToken: string;
}

export interface IEventDesign {
  _id?: any;
  eventId: any;
  elements: Array<{
    id: string;
    type: 'mandap' | 'stage' | 'entrance' | 'rangoli' | 'table' | 'chair' | 'lighting' | 'photo_booth';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    color?: string;
    label?: string;
  }>;
  canvasWidth: number;
  canvasHeight: number;
  themeName: string;
}

export interface ISeatingLayout {
  _id?: any;
  eventId: any;
  layoutType: 'Round Tables' | 'Rectangle Tables' | 'Theatre' | 'Classroom' | 'Banquet' | 'Custom';
  tables: Array<{
    id: string;
    name: string;
    shape: 'round' | 'rect' | 'theatre_row';
    x: number;
    y: number;
    capacity: number;
    assignedGuests: string[]; // guest IDs
  }>;
  totalSeats: number;
  assignedSeats: number;
}

export interface IBooking {
  _id?: any;
  bookingNumber: string;
  eventId: any;
  userId: any;
  bookingType?: 'EVENT_TICKET' | 'VENDOR_SERVICE';
  ticketTier?: string; // 'General' | 'VIP' | 'Premium' | 'Free'
  ticketTypeId?: string;
  quantity?: number;
  unitPrice?: number;
  totalAmount?: number;
  platformFee?: number;
  taxAmount?: number;
  discountAmount?: number;
  itemType?: 'EVENT_TICKET' | 'VENUE' | 'DECORATION' | 'CATERING' | 'ENTERTAINMENT' | 'PACKAGE';
  itemId?: string;
  itemName?: string;
  amount: number;
  advancePaid?: number;
  balanceDue?: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED' | 'EXPIRED';
  bookingStatus?: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED' | 'COMPLETED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  attendeeDetails?: {
    name: string;
    email: string;
    phone?: string;
  };
  qrToken?: string;
  qrCodeId?: any;
  checkedIn?: boolean;
  checkedInAt?: string;
  cancellationPolicy?: string;
  refundAmount?: number;
  eventDate?: string;
  bookingNotes?: string;
  eventDetails?: Partial<IEvent>;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface IPayment {
  _id?: any;
  paymentId?: string;
  transactionId?: string;
  purpose?: string;
  paymentMethod?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  eventId: any;
  userId: any;
  bookingId?: any;
  serviceName?: string;
  amount: number;
  currency?: string;
  taxAmount?: number;
  totalAmount?: number;
  method?: 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET' | 'DEMO_SIMULATION';
  status: PaymentStatus;
  receiptNumber?: string;
  customerName?: string;
  customerEmail?: string;
  createdAt?: string;
}

export interface IEventSchedule {
  _id?: any;
  eventId: any;
  activities: Array<{
    id: string;
    time: string;
    title: string;
    description?: string;
    location?: string;
    isCompleted?: boolean;
  }>;
}

export interface ILiveStream {
  _id?: any;
  eventId: any;
  streamUrl: string;
  provider: 'YOUTUBE_LIVE' | 'EMBEDDED' | 'CUSTOM';
  status: 'NOT_STARTED' | 'LIVE' | 'ENDED';
  title: string;
  description?: string;
  scheduledStartTime?: string;
  viewerCount?: number;
  isPrivate: boolean;
  accessCode?: string;
  announcements?: Array<{
    id: string;
    message: string;
    timestamp: string;
    sender: string;
  }>;
}

export interface INotification {
  _id?: any;
  userId: any;
  eventId?: any;
  title: string;
  message: string;
  type:
    | 'EVENT_CREATED'
    | 'VENUE_BOOKED'
    | 'PAYMENT_SUCCESS'
    | 'PAYMENT_FAILED'
    | 'EVENT_REMINDER'
    | 'GUEST_RSVP'
    | 'GUEST_CHECKIN'
    | 'LIVE_STARTED'
    | 'BOOKING_CANCELLED'
    | 'AI_ALERT';
  isRead: boolean;
  createdAt?: string;
}

export interface IReview {
  _id?: any;
  userId: any;
  userName: string;
  userPhoto?: string;
  targetType: 'VENUE' | 'CATERING' | 'DECORATION' | 'ENTERTAINMENT' | 'ORGANIZER' | 'PLATFORM';
  targetId: string;
  targetName: string;
  rating: number; // 1 - 5
  comment: string;
  photos?: string[];
  reply?: string;
  isApproved: boolean;
  createdAt?: string;
}

export interface IAIEventPlanRequest {
  eventType: EventType;
  culturalTradition?: CulturalTradition;
  guestCount: number;
  city: string;
  budget: number;
  theme?: string;
  foodPreference?: 'Veg' | 'Non-Veg' | 'Jain' | 'Vegan' | 'All';
  eventDate?: string;
  naturalPrompt?: string;
}

export interface IAIEventPlanResponse {
  summary: string;
  estimatedBudget: {
    total: number;
    venue: number;
    catering: number;
    decoration: number;
    photography: number;
    entertainment: number;
    invitation: number;
    transportation: number;
    contingency: number;
  };
  venueSuggestions: string[];
  decorationSuggestions: {
    mandapOrStage: string;
    floralTheme: string;
    lighting: string;
    rangoli: string;
  };
  foodRecommendations: {
    cuisines: string[];
    highlightDishes: string[];
    liveCounters: string[];
    pricePerPlateEstimate: number;
  };
  entertainmentRecommendations: string[];
  timeline: Array<{ time: string; title: string; note: string }>;
  culturalRituals: string[];
  clothingAndColorPalette: {
    colors: string[];
    dressCodeSuggestion: string;
  };
  checklist: string[];
  riskWarnings: string[];
}

export type QRCodeStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';

export type CheckInResultType =
  | 'VALID_CHECKIN'
  | 'ALREADY_CHECKED_IN'
  | 'INVALID_QR'
  | 'WRONG_EVENT'
  | 'EXPIRED_QR'
  | 'CANCELLED_INVITATION';

export interface IEventQRCode {
  _id?: any;
  eventId: any;
  guestId?: any;
  userId?: any;
  token: string;
  tokenHash: string;
  status: QRCodeStatus;
  expiresAt?: Date | string;
  lastUsedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IEventCheckIn {
  _id?: any;
  eventId: any;
  guestId?: any;
  qrCodeId?: any;
  checkedIn: boolean;
  checkedInAt: Date | string;
  checkedInBy?: any;
  gateName: string;
  result: CheckInResultType;
  errorMessage?: string;
  createdAt?: Date | string;
}

export interface IAttendanceSummary {
  totalGuests: number;
  confirmedGuests: number;
  checkedIn: number;
  notCheckedIn: number;
  declined: number;
  pending: number;
  attendanceRate: number;
}

