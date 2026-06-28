import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  uuid,
  varchar,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

export const cityEnum = pgEnum("city", [
  "chandigarh", "delhi", "bangalore", "mumbai", "hyderabad", "pune", "chennai",
]);

export const membershipTierEnum = pgEnum("membership_tier", [
  "free", "member", "pro", "select",
]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "active", "cancelled", "expired", "pending",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending", "confirmed", "completed", "cancelled", "refunded",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "city-drive", "workshop", "road-trip", "track-day", "steerFest",
]);

export const userRoleEnum = pgEnum("user_role", [
  "client", "parent", "coach", "admin",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new", "contacted", "qualified", "converted", "lost",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "scheduled", "completed", "cancelled",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present", "absent", "late", "excused",
]);

export const announcementAudienceEnum = pgEnum("announcement_audience", [
  "all", "members", "city", "program",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  city: cityEnum("city"),
  image: text("image"),
  role: userRoleEnum("role").default("client").notNull(),
  emailVerified: timestamp("email_verified"),
  lastLoginAt: timestamp("last_login_at"),
  // Client profile fields
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  vehicleOwned: varchar("vehicle_owned", { length: 120 }),
  drivingGoals: text("driving_goals"),
  commPrefs: jsonb("comm_prefs").$type<{ email: boolean; whatsapp: boolean; sms: boolean }>(),
  directoryVisible: boolean("directory_visible").default(false).notNull(),
  branchId: uuid("branch_id"), // staff branch scope (null = HQ/all); FK added in migration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // score | booking | program | system
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  link: varchar("link", { length: 255 }),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: varchar("token_type", { length: 50 }),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

// Single-use, hashed magic-link tokens for passwordless login.
export const loginTokens = pgTable("login_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: varchar("identifier", { length: 255 }).notNull(), // email
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
  expires: timestamp("expires").notNull(),
  consumedAt: timestamp("consumed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const steerScores = pgTable("steer_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  guestEmail: varchar("guest_email", { length: 255 }),
  total: integer("total").notNull(),
  dimensions: jsonb("dimensions").notNull().$type<{
    vehicleControl: number;
    hazardPerception: number;
    cityNavigation: number;
    highwayDriving: number;
    allConditions: number;
    defensiveDriving: number;
  }>(),
  instructorId: uuid("instructor_id").references(() => instructors.id),
  assessmentDate: timestamp("assessment_date").notNull(),
  bookingId: uuid("booking_id"),
  reportUrl: text("report_url"),
  recommendedProgram: varchar("recommended_program", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const programs = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  memberPrice: integer("member_price").notNull(),
  scoreMin: integer("score_min").notNull(),
  scoreMax: integer("score_max"),
  sessions: integer("sessions").notNull(),
  durationHours: integer("duration_hours").notNull(),
  outcomes: jsonb("outcomes").$type<string[]>(),
  forProfile: text("for_profile"),
  cities: jsonb("cities").$type<string[]>(),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0),
});

export const cohorts = pgTable("cohorts", {
  id: uuid("id").primaryKey().defaultRandom(),
  programId: uuid("program_id").notNull().references(() => programs.id),
  city: cityEnum("city").notNull(),
  startDate: timestamp("start_date").notNull(),
  maxSize: integer("max_size").default(10).notNull(),
  currentSize: integer("current_size").default(0).notNull(),
  instructorId: uuid("instructor_id").references(() => instructors.id),
  isOpen: boolean("is_open").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assessmentBookings = pgTable("assessment_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  city: cityEnum("city").notNull(),
  preferredDate: timestamp("preferred_date"),
  carOwned: boolean("car_owned").default(true),
  notes: text("notes"),
  status: bookingStatusEnum("status").default("pending").notNull(),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  amount: integer("amount").default(29900).notNull(),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const programBookings = pgTable("program_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  programId: uuid("program_id").notNull().references(() => programs.id),
  cohortId: uuid("cohort_id").references(() => cohorts.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  city: cityEnum("city").notNull(),
  status: bookingStatusEnum("status").default("pending").notNull(),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  amount: integer("amount").notNull(),
  isMemberPrice: boolean("is_member_price").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tier: membershipTierEnum("tier").notNull(),
  status: membershipStatusEnum("status").default("active").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  razorpaySubscriptionId: text("razorpay_subscription_id"),
  razorpayCustomerId: text("razorpay_customer_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  amount: integer("amount"), // paise paid for this term (for revenue reporting)
  isAnnual: boolean("is_annual").default(false),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: eventTypeEnum("type").notNull(),
  city: cityEnum("city").notNull(),
  eventDate: timestamp("event_date").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  locationUrl: text("location_url"),
  capacity: integer("capacity").notNull(),
  memberOnly: boolean("member_only").default(true).notNull(),
  price: integer("price").default(0),
  imageUrl: text("image_url"),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  status: bookingStatusEnum("status").default("confirmed").notNull(),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  amount: integer("amount").default(0),
  attended: boolean("attended").default(false).notNull(),
  attendanceMarkedAt: timestamp("attendance_marked_at"),
  markedById: uuid("marked_by_id").references(() => users.id),
  reminderSentAt: timestamp("reminder_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniqUserEvent: unique().on(t.userId, t.eventId),
}));

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  authorId: uuid("author_id").references(() => instructors.id),
  authorName: varchar("author_name", { length: 255 }),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at"),
  isPublished: boolean("is_published").default(false).notNull(),
  metaTitle: varchar("meta_title", { length: 70 }),
  metaDescription: varchar("meta_description", { length: 160 }),
  readTimeMinutes: integer("read_time_minutes").default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const instructors = pgTable("instructors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }), // coach login link
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio").notNull(),
  photo: text("photo"),
  city: cityEnum("city").notNull(),
  specialties: jsonb("specialties").$type<string[]>(),
  kmDriven: varchar("km_driven", { length: 50 }),
  ratePerSession: integer("rate_per_session").default(0), // paise, for payroll
  certifiedAt: timestamp("certified_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coachAvailability = pgTable("coach_availability", {
  id: uuid("id").primaryKey().defaultRandom(),
  instructorId: uuid("instructor_id").notNull().references(() => instructors.id, { onDelete: "cascade" }),
  weekday: integer("weekday").notNull(), // 0=Sun … 6=Sat
  startTime: varchar("start_time", { length: 5 }).notNull(), // "HH:MM"
  endTime: varchar("end_time", { length: 5 }).notNull(),
});

export const programSessions = pgTable("program_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  cohortId: uuid("cohort_id").notNull().references(() => cohorts.id, { onDelete: "cascade" }),
  sessionNo: integer("session_no").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMins: integer("duration_mins").default(120).notNull(),
  instructorId: uuid("instructor_id").references(() => instructors.id),
  location: varchar("location", { length: 255 }),
  status: sessionStatusEnum("status").default("scheduled").notNull(),
  reminderSentAt: timestamp("reminder_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => programSessions.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: attendanceStatusEnum("status").notNull(),
  markedById: uuid("marked_by_id").references(() => users.id),
  markedAt: timestamp("marked_at").defaultNow().notNull(),
}, (t) => ({
  uniqSessionUser: unique().on(t.sessionId, t.userId),
}));

export const sessionFeedback = pgTable("session_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => programSessions.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  instructorId: uuid("instructor_id").references(() => instructors.id),
  notes: text("notes"),
  skillRatings: jsonb("skill_ratings").$type<Record<string, number>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  programId: uuid("program_id").notNull().references(() => programs.id),
  serial: varchar("serial", { length: 40 }).notNull().unique(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  name: varchar("name", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull(),
  city: cityEnum("city"),
  source: varchar("source", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  name: varchar("name", { length: 255 }),
  source: varchar("source", { length: 100 }),
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  pageUrl: text("page_url"),
  city: cityEnum("city"),
  // Mini-CRM fields
  status: leadStatusEnum("status").default("new").notNull(),
  stage: varchar("stage", { length: 100 }),
  assignedToId: uuid("assigned_to_id").references(() => users.id),
  nextFollowUpAt: timestamp("next_follow_up_at"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Timeline of actions/notes against a lead (calls, messages, status changes).
export const leadActivities = pgTable("lead_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // note | call | whatsapp | email | status_change
  note: text("note"),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit trail for admin/coach mutations across the platform.
export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Community announcements, targeted by audience/city.
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  audience: announcementAudienceEnum("audience").default("all").notNull(),
  city: cityEnum("city"), // when audience = city
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Community photo gallery (Cloudinary-hosted URLs), moderated before public.
export const galleryPhotos = pgTable("gallery_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").references(() => events.id, { onDelete: "set null" }),
  imageUrl: text("image_url").notNull(),
  caption: varchar("caption", { length: 255 }),
  city: cityEnum("city"),
  uploadedById: uuid("uploaded_by_id").references(() => users.id),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Phase 5: Growth (finance) ----------
// `source` is the booking table a finance row points at (polymorphic, no FK):
//   "assessment" | "program" | "event" | "membership" | "gift".

// Razorpay refunds against a paid booking.
export const refunds = pgTable("refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: varchar("source", { length: 20 }).notNull(),
  bookingId: uuid("booking_id"),
  paymentId: text("payment_id"),
  amount: integer("amount").notNull(), // paise
  reason: text("reason"),
  status: varchar("status", { length: 20 }).default("processed").notNull(), // processed | failed | pending
  razorpayRefundId: text("razorpay_refund_id"),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Numbered tax-invoice/receipt per paid booking (GST-ready via nullable gstBreakup).
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: varchar("number", { length: 32 }).notNull().unique(),
  source: varchar("source", { length: 20 }).notNull(),
  bookingId: uuid("booking_id").notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  email: varchar("email", { length: 255 }),
  lineItem: varchar("line_item", { length: 255 }).notNull(),
  subtotal: integer("subtotal").notNull(), // paise (taxable value when GST applies, else == total)
  gstBreakup: jsonb("gst_breakup").$type<{
    rate: number;
    taxable: number;
    cgst: number;
    sgst: number;
    igst: number;
    gstin: string;
    hsn: string;
  } | null>(),
  total: integer("total").notNull(), // paise charged
  status: varchar("status", { length: 20 }).default("issued").notNull(), // issued | refunded
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
}, (t) => ({
  uniqSourceBooking: unique().on(t.source, t.bookingId),
}));

// Marketing campaigns (email now; whatsapp/push scaffolded).
export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  channel: varchar("channel", { length: 10 }).default("email").notNull(), // email|whatsapp|push
  segment: varchar("segment", { length: 60 }).notNull(), // segment key (see lib/marketing/segments)
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  status: varchar("status", { length: 12 }).default("draft").notNull(), // draft|scheduled|sending|sent
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  stats: jsonb("stats").$type<{ recipients: number; sent: number; failed: number }>(),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaignRecipients = pgTable("campaign_recipients", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  email: varchar("email", { length: 255 }).notNull(),
  status: varchar("status", { length: 10 }).default("pending").notNull(), // pending|sent|failed
  sentAt: timestamp("sent_at"),
});

// Generic idempotency ledger for lifecycle automations (one row per (type, refId)).
export const automationLog = pgTable("automation_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 40 }).notNull(),
  refId: varchar("ref_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniqTypeRef: unique().on(t.type, t.refId),
}));

// Discount coupons applied at checkout.
export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  type: varchar("type", { length: 10 }).notNull(), // flat | percent
  value: integer("value").notNull(), // paise (flat) or percent (1-100)
  minAmount: integer("min_amount").default(0), // paise
  appliesTo: varchar("applies_to", { length: 20 }).default("all").notNull(), // all|assessment|program|event|membership
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  usageLimit: integer("usage_limit"), // null = unlimited
  usedCount: integer("used_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const couponRedemptions = pgTable("coupon_redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  couponId: uuid("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  email: varchar("email", { length: 255 }),
  source: varchar("source", { length: 20 }),
  bookingId: uuid("booking_id"),
  amountDiscounted: integer("amount_discounted").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// One referral code per member; redemptions tracked when referred friends pay.
export const referralCodes = pgTable("referral_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  code: varchar("code", { length: 16 }).notNull().unique(),
  rewardType: varchar("reward_type", { length: 20 }).default("credit"),
  rewardValue: integer("reward_value").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralRedemptions = pgTable("referral_redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  referralCodeId: uuid("referral_code_id").notNull().references(() => referralCodes.id, { onDelete: "cascade" }),
  referredEmail: varchar("referred_email", { length: 255 }),
  source: varchar("source", { length: 20 }),
  bookingId: uuid("booking_id"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending|qualified|rewarded
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Gift purchases (membership or program), redeemable by a recipient via code.
export const giftPurchases = pgTable("gift_purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 20 }).notNull(), // membership | program
  refId: varchar("ref_id", { length: 100 }), // tier or program slug
  amount: integer("amount").notNull(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  buyerName: varchar("buyer_name", { length: 255 }),
  buyerEmail: varchar("buyer_email", { length: 255 }),
  recipientName: varchar("recipient_name", { length: 255 }),
  recipientEmail: varchar("recipient_email", { length: 255 }),
  razorpayPaymentId: text("razorpay_payment_id"),
  redeemedByUserId: uuid("redeemed_by_user_id").references(() => users.id),
  redeemedAt: timestamp("redeemed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Phase 6: Content CMS ----------
export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: varchar("question", { length: 500 }).notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 50 }),
  displayOrder: integer("display_order").default(0).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  cityOrRole: varchar("city_or_role", { length: 120 }),
  quote: text("quote").notNull(),
  rating: integer("rating").default(5),
  imageUrl: text("image_url"),
  displayOrder: integer("display_order").default(0).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const banners = pgTable("banners", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  ctaLabel: varchar("cta_label", { length: 80 }),
  ctaHref: varchar("cta_href", { length: 255 }),
  placement: varchar("placement", { length: 20 }).default("global").notNull(), // home|membership|global
  isActive: boolean("is_active").default(false).notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Phase 6: Settings & governance ----------
// Singleton org/branding/tax config (one row). issuer.ts reads this first, env fallback.
export const orgSettings = pgTable("org_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  legalName: varchar("legal_name", { length: 255 }),
  gstin: varchar("gstin", { length: 20 }),
  gstRate: integer("gst_rate"),
  hsn: varchar("hsn", { length: 20 }),
  supportEmail: varchar("support_email", { length: 255 }),
  brandLogoUrl: text("brand_logo_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Editable transactional templates (key e.g. booking_confirmed). renderTemplate falls back to code.
export const notificationTemplates = pgTable("notification_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 60 }).notNull().unique(),
  channel: varchar("channel", { length: 10 }).default("email").notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------- Phase 6: Granular RBAC + branches ----------
// Permission grants per role (the catalog of keys lives in src/lib/auth/permissions.ts).
export const rolePermissions = pgTable("role_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: userRoleEnum("role").notNull(),
  permissionKey: varchar("permission_key", { length: 60 }).notNull(),
}, (t) => ({
  uniqRolePerm: unique().on(t.role, t.permissionKey),
}));

// Multi-city branches; admins/coaches can be scoped to one (null = HQ/all).
export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  city: cityEnum("city").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Parent ↔ student links (read-only family access). Student- or admin-initiated.
export const parentLinks = pgTable("parent_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentUserId: uuid("parent_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  studentUserId: uuid("student_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  relationship: varchar("relationship", { length: 40 }),
  approved: boolean("approved").default(true).notNull(),
  invitedByUserId: uuid("invited_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniqParentStudent: unique().on(t.parentUserId, t.studentUserId),
}));

// Programmatic API keys (hash stored, shown once on creation).
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  prefix: varchar("prefix", { length: 12 }).notNull(),
  tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
  scopes: jsonb("scopes").$type<string[]>(),
  lastUsedAt: timestamp("last_used_at"),
  createdById: uuid("created_by_id").references(() => users.id),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
