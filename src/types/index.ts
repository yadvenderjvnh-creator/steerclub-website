export type City = "chandigarh" | "delhi" | "bangalore" | "mumbai" | "hyderabad" | "pune" | "chennai";

export type ProgramSlug =
  | "confidence-foundation"
  | "city-mastery"
  | "highway-freedom"
  | "all-conditions"
  | "roadtrip-ready"
  | "advanced";

export type MembershipTier = "free" | "member" | "pro" | "select";

export type EventType = "city-drive" | "workshop" | "road-trip" | "track-day" | "steerFest";

export type BlogCategory = "city-guides" | "technique" | "routes" | "member-stories" | "news";

export interface Program {
  slug: ProgramSlug;
  name: string;
  tagline: string;
  description: string;
  price: number;
  memberPrice: number;
  scoreRange: [number, number];
  sessions: number;
  durationHours: number;
  outcomes: string[];
  forProfile: string;
  campaignLine: string;
  cities: City[];
}

export interface MembershipPlan {
  tier: MembershipTier;
  name: string;
  monthlyPrice: number | null;
  annualPrice: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  city: City;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  memberOnly: boolean;
  price: number;
  image?: string;
  description: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  publishedAt: string;
  readTime: number;
  image?: string;
  content?: string;
}

export interface SteerScore {
  total: number;
  dimensions: {
    vehicleControl: number;
    hazardPerception: number;
    cityNavigation: number;
    highwayDriving: number;
    allConditions: number;
    defensiveDriving: number;
  };
  assessedAt: string;
  instructorName: string;
  recommendedProgram: ProgramSlug;
}

export interface Testimonial {
  name: string;
  city: City;
  scoreFrom: number;
  scoreTo: number;
  program: string;
  quote: string;
  image?: string;
}

export interface Instructor {
  id: string;
  name: string;
  city: City;
  bio: string;
  specialties: string[];
  kmDriven: string;
  photo?: string;
  certified: boolean;
}
