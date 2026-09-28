import { coaches, courses, sections, sessions, studios } from "@/data/catalog";
import { formatPrice, formatPriceRange, formatSessionTime } from "@/lib/format";
import type {
  Course,
  CourseListItem,
  CourseView,
  Level,
  SectionSlug,
  Session,
  SessionStatus,
  SessionView,
} from "@/lib/types";

function loadExtras() {
  return new Map<string, number>();
}

export function sessionStatus(session: Session, booked: number, now = Date.now()): SessionStatus {
  if (booked < session.capacity) return "open";
  const end = new Date(session.end).getTime();
  if (now >= end) return "ended";
  return "full";
}

const statusLabel: Record<SessionStatus, string> = {
  open: "可预约",
  full: "已满员",
  started: "已开始",
  ended: "已结束",
};

export function withExtraBookings(view: SessionView, extra: number, now = Date.now()): SessionView {
  const booked = view.booked + extra;
  const status = sessionStatus(
    { start: view.start, end: view.end, capacity: view.capacity } as Session,
    booked,
    now,
  );
  return {
    ...view,
    booked,
    remaining: Math.max(view.capacity - booked, 0),
    status,
    statusLabel: statusLabel[status],
  };
}

export function getSessionView(
  session: Session,
  now = Date.now(),
  extras?: Map<string, number>,
): SessionView {
  const course = courses.find((item) => item.id === session.courseId);
  const coach = coaches.find((item) => item.id === session.coachId);
  const studio = studios.find((item) => item.id === session.studioId);
  const section = sections.find((item) => item.slug === course?.section);
  if (!course || !coach || !studio || !section) {
    throw new Error(`场次数据不完整：${session.id}`);
  }

  const extra = (extras ?? loadExtras()).get(session.id) ?? 0;
  const booked = session.booked + extra;
  const status = sessionStatus(session, booked, now);
  const credentials = coach.credentials.join("、");

  return {
    id: session.id,
    courseId: course.id,
    courseName: course.name,
    courseCode: course.code,
    section: course.section,
    sectionName: section.name,
    start: session.start,
    end: session.end,
    timeLabel: formatSessionTime(session.start, session.end),
    durationMinutes: course.durationMinutes,
    coachId: coach.id,
    coachName: coach.name,
    coachTitle: coach.title,
    coachLine: `${coach.name}，${coach.title}，${credentials}，执教 ${coach.years} 年`,
    level: session.level,
    studioName: studio.name,
    city: studio.city,
    address: studio.address,
    transit: studio.transit,
    room: session.room,
    frontDesk: studio.frontDesk,
    facilities: studio.facilities,
    addressLine: `${studio.name}，${studio.address}，${session.room}`,
    capacity: session.capacity,
    booked,
    remaining: Math.max(session.capacity - booked, 0),
    price: session.price,
    priceLabel: formatPrice(session.price),
    priceIncludes: course.priceIncludes,
    notes: [...course.generalNotes, ...session.notes],
    cancelRule: course.cancelRule,
    status,
    statusLabel: statusLabel[status],
  };
}

export function listSessionViews(now = Date.now()) {
  const extras = loadExtras();
  return sessions.map((session) => getSessionView(session, now, extras));
}

function priceLabelFor(prices: number[]) {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return formatPriceRange(min, max);
}

export function listCourseItems(section: SectionSlug, now = Date.now()): CourseListItem[] {
  const extras = loadExtras();
  return courses
    .filter((course) => course.section === section)
    .map((course) => toListItem(course, now, extras))
    .sort((a, b) => {
      if (a.bookableCount === 0 && b.bookableCount > 0) return 1;
      if (b.bookableCount === 0 && a.bookableCount > 0) return -1;
      const aTime = a.next ? new Date(a.next.start).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.next ? new Date(b.next.start).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
}

function toListItem(course: Course, now: number, extras: Map<string, number>): CourseListItem {
  const views = sessions
    .filter((session) => session.courseId === course.id)
    .map((session) => getSessionView(session, now, extras))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const prices = views.map((view) => view.price);
  const levels = [...new Set(views.map((view) => view.level))];
  const next = views.find((view) => view.status === "open") ?? null;

  return {
    id: course.id,
    code: course.code,
    name: course.name,
    englishName: course.englishName,
    summary: course.summary,
    level: course.level,
    durationMinutes: course.durationMinutes,
    intensity: course.intensity,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    priceLabel: priceLabelFor(prices),
    sessionCount: views.length,
    bookableCount: views.filter((view) => view.status === "open").length,
    mixedLevels: levels.length > 1,
    coaches: [...new Set(views.map((view) => view.coachName))],
    cities: [...new Set(views.map((view) => view.city))],
    levels: levels as Level[],
    next,
  };
}

export function getCourseView(courseId: string, now = Date.now()): CourseView | null {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return null;
  const section = sections.find((item) => item.slug === course.section);
  if (!section) return null;
  const extras = loadExtras();
  const sessionViews = sessions
    .filter((session) => session.courseId === course.id)
    .map((session) => getSessionView(session, now, extras))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const coachIds = new Set(
    sessions.filter((session) => session.courseId === course.id).map((session) => session.coachId),
  );
  const prices = sessionViews.map((view) => view.price);

  return {
    course,
    section,
    sessions: sessionViews,
    coaches: coaches.filter((coach) => coachIds.has(coach.id)),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    priceLabel: priceLabelFor(prices),
  };
}

export function getSection(slug: string) {
  return sections.find((section) => section.slug === slug) ?? null;
}

export function homeData(now = Date.now()) {
  const all = listSessionViews(now);
  const upcoming = all
    .filter((session) => session.status === "open")
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 6);

  const plates = sections.map((section) => {
    const items = listCourseItems(section.slug, now);
    const sectionSessions = all.filter((session) => session.section === section.slug);
    const prices = sectionSessions.map((session) => session.price);
    const next = sectionSessions
      .filter((session) => session.status === "open")
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

    return {
      ...section,
      courseCount: items.length,
      sessionCount: sectionSessions.length,
      bookableCount: sectionSessions.filter((session) => session.status === "open").length,
      priceLabel: priceLabelFor(prices),
      next: next ?? null,
      highlights: items.slice(0, 3).map((item) => ({ id: item.id, name: item.name, summary: item.summary })),
    };
  });

  return {
    courseCount: courses.length,
    cityCount: new Set(studios.map((studio) => studio.city)).size,
    bookableCount: all.filter((session) => session.status === "open").length,
    plates,
    upcoming,
  };
}

export function sectionCities(section: SectionSlug) {
  const ids = new Set(
    sessions
      .filter((session) => courses.find((course) => course.id === session.courseId)?.section === section)
      .map((session) => session.studioId),
  );
  return [...new Set(studios.filter((studio) => ids.has(studio.id)).map((studio) => studio.city))];
}
