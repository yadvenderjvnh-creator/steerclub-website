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
  userId: uuid("user_id").notNull().references(() => users.id),
  eventId: uuid("event_id").notNull().references(() => events.id),
  status: bookingStatusEnum("status").default("confirmed").notNull(),
  razorpayPaymentId: text("razorpay_payment_id"),
  amount: integer("amount").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
