export type SectionSlug = "group" | "personal" | "open";

export type Level = "入门" | "初级" | "中级" | "高级";

export type Intensity = "低" | "中" | "中高" | "高";

export type Studio = {
  id: string;
  kind: "门店" | "户外集合点";
  name: string;
  short: string;
  city: string;
  address: string;
  transit: string;
  phone: string;
  frontDesk: string;
  facilities: string;
};

export type Coach = {
  id: string;
  name: string;
  title: string;
  credentials: string[];
  years: number;
  specialties: string[];
  bio: string;
};

export type OutlineBlock = {
  minutes: string;
  title: string;
  detail: string;
};

export type Course = {
  id: string;
  code: string;
  section: SectionSlug;
  name: string;
  englishName: string;
  summary: string;
  description: string;
  durationMinutes: number;
  level: Level;
  levelDetail?: string;
  audience?: string;
  tags?: string[];
  intensity: Intensity;
  calories: string;
  goals: string[];
  outline: OutlineBlock[];
  suitableFor: string[];
  notSuitableFor: string[];
  equipmentProvided: string[];
  bring: string[];
  generalNotes: string[];
  cancelRule: string;
  priceIncludes: string;
};

export type Session = {
  id: string;
  courseId: string;
  start: string;
  end: string;
  coachId: string;
  studioId: string;
  room: string;
  level: Level;
  capacity: number;
  booked: number;
  price: number;
  notes: string[];
  hostCancel?: "weather";
};

export type SectionInfo = {
  slug: SectionSlug;
  name: string;
  englishName: string;
  index: string;
  summary: string;
  detail: string;
  bookingRule: string;
  cancelHours: number;
};

export type SessionStatus = "open" | "full" | "started" | "ended" | "host-cancelled";

export type SessionView = {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  section: SectionSlug;
  sectionName: string;
  start: string;
  end: string;
  timeLabel: string;
  durationMinutes: number;
  coachId: string;
  coachName: string;
  coachTitle: string;
  coachLine: string;
  level: Level;
  studioName: string;
  city: string;
  address: string;
  transit: string;
  room: string;
  frontDesk: string;
  facilities: string;
  addressLine: string;
  capacity: number;
  booked: number;
  remaining: number;
  price: number;
  priceLabel: string;
  priceIncludes: string;
  notes: string[];
  cancelRule: string;
  status: SessionStatus;
  statusLabel: string;
};

export type CourseListItem = {
  id: string;
  code: string;
  name: string;
  englishName: string;
  summary: string;
  level: Level;
  durationMinutes: number;
  intensity: Intensity;
  minPrice: number;
  maxPrice: number;
  priceLabel: string;
  sessionCount: number;
  bookableCount: number;
  mixedLevels: boolean;
  coaches: string[];
  cities: string[];
  levels: Level[];
  next: SessionView | null;
};

export type CourseView = {
  course: Course;
  section: SectionInfo;
  sessions: SessionView[];
  coaches: Coach[];
  minPrice: number;
  maxPrice: number;
  priceLabel: string;
};

export type BookingRecord = {
  id: string;
  sessionId: string;
  courseId: string;
  name: string;
  phone: string;
  partySize: number;
  unitPrice: number;
  totalPrice: number;
  discountNote: string | null;
  createdAt: string;
  cancelledAt: string | null;
  lateCancel: boolean;
  pointsAwarded?: number;
  couponYuan?: number;
};

export type BookingView = BookingRecord & {
  courseName: string;
  courseCode: string;
  sectionName: string;
  timeLabel: string;
  coachLine: string;
  addressLine: string;
  start: string;
  durationMinutes: number;
  statusLabel: string;
  canCancel: boolean;
};
