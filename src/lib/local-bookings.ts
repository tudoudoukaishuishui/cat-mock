import { listAugustWorkouts } from "@/data/august-training";
import { COUPON_YUAN, bananaAccount, couponMark } from "@/data/bananas";
import { courses, sections, sessions } from "@/data/catalog";
import { classTotal } from "@/data/membership";
import { awardClassPoints, hasCard } from "@/lib/local-memberships";
import { consumeCoupon, releaseCoupon, resetCoupons, usedCoupons } from "@/lib/banana-wallet";
import { getSessionView, withExtraBookings } from "@/lib/queries";
import type { BookingRecord, BookingView } from "@/lib/types";

const KEY = "super-cat-bookings";

type State = {
  nextNumber: number;
  bookings: BookingRecord[];
};

export type BookInput = {
  sessionId: string;
  name: string;
  phone: string;
  partySize: number;
  agreed: boolean;
  useCoupon?: boolean;
};

type BookOk = { ok: true; booking: BookingView };
type BookErr = { ok: false; error: string };

function emptyState(): State {
  return { nextNumber: 1001, bookings: [] };
}

function readState(): State {
  if (typeof window === "undefined") return emptyState();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "") as State;
    if (!parsed || !Array.isArray(parsed.bookings) || typeof parsed.nextNumber !== "number") {
      return emptyState();
    }
    return parsed;
  } catch {
    return emptyState();
  }
}

function writeState(state: State) {
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("super-cat-bookings"));
}

export function localExtra(sessionId: string) {
  return readState()
    .bookings.filter((booking) => booking.sessionId === sessionId && !booking.cancelledAt)
    .reduce((sum, booking) => sum + booking.partySize, 0);
}

function cleanPhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

function toView(record: BookingRecord): BookingView {
  const session = sessions.find((item) => item.id === record.sessionId);
  const seed = session ? getSessionView(session) : null;
  const view = seed ? withExtraBookings(seed, localExtra(seed.id)) : null;
  const ended = view ? view.status === "ended" || view.status === "started" : true;
  const groupLocked =
    view?.section === "group" &&
    session !== undefined &&
    new Date(session.start).getTime() - Date.now() < 6 * 60 * 60 * 1000;
  let statusLabel = "已预约";
  if (record.cancelledAt) statusLabel = record.lateCancel ? "已取消（超过免费时限）" : "已取消";
  else if (ended) statusLabel = view?.statusLabel ?? "已结束";

  return {
    ...record,
    courseName: view?.courseName ?? record.courseId,
    courseCode: view?.courseCode ?? "",
    sectionName: view?.sectionName ?? "",
    timeLabel: view?.timeLabel ?? "",
    coachLine: view?.coachLine ?? "",
    addressLine: view?.addressLine ?? "",
    start: view?.start ?? record.createdAt,
    durationMinutes: view?.durationMinutes ?? 0,
    statusLabel,
    canCancel: !record.cancelledAt && !ended && !groupLocked,
  };
}

export function listLocalBookings(phone?: string): BookingView[] {
  const needle = phone?.replace(/[\s-]/g, "");
  return readState()
    .bookings.filter((booking) => (needle ? booking.phone === needle : true))
    .slice()
    .reverse()
    .map(toView);
}

export function createLocalBooking(input: BookInput): BookOk | BookErr {
  const name = input.name.trim();
  const phone = cleanPhone(input.phone ?? "");
  const partySize = input.partySize;

  if (!input.agreed) return { ok: false, error: "请先确认已阅读注意事项和取消规则" };
  if (!/^[\u4e00-\u9fa5a-zA-Z·]{2,20}$/.test(name)) {
    return { ok: false, error: "请填写 2 到 20 个字的姓名，不要包含数字或符号" };
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) return { ok: false, error: "请填写 11 位中国大陆手机号" };
  if (!Number.isInteger(partySize) || partySize < 1) return { ok: false, error: "预约人数必须是正整数" };

  const session = sessions.find((item) => item.id === input.sessionId);
  if (!session) return { ok: false, error: "找不到这个场次" };
  const course = courses.find((item) => item.id === session.courseId);
  const section = sections.find((item) => item.slug === course?.section);
  if (!course || !section) return { ok: false, error: "找不到这个课程" };

  const seats = partySize;
  if (section.slug === "personal" && partySize !== 1) {
    return { ok: false, error: "私教每场只能预约 1 人，不能多人一起报名" };
  }
  if (section.slug !== "personal" && partySize > 3) {
    return { ok: false, error: "单次最多预约 3 人" };
  }

  const state = readState();
  const view = withExtraBookings(getSessionView(session), localExtra(session.id));
  if (view.status === "host-cancelled") return { ok: false, error: "这场已由主办方取消，不需要到场，也不会记逾期" };
  if (view.status === "ended") return { ok: false, error: "场次已结束，不能预约" };
  if (view.status === "started") return { ok: false, error: "场次已开始，不能预约" };
  if (view.status === "full" || view.remaining < 1) {
    return { ok: false, error: `该场次已满（${view.booked}/${view.capacity}），无法预约` };
  }
  if (seats > view.remaining) {
    return { ok: false, error: `剩余 ${view.remaining} 个名额，无法预约 ${seats} 人` };
  }
  const duplicated = state.bookings.some(
    (booking) => booking.sessionId === session.id && booking.phone === phone && booking.cancelledAt === null,
  );
  if (duplicated) return { ok: false, error: "此手机号已预约该场次，请到我的运动查看" };

  const cardHolder = section.slug === "group" && hasCard(phone);
  const quote = classTotal(section.slug, session.price, partySize, cardHolder);
  const useCoupon = Boolean(input.useCoupon);
  if (useCoupon && couponMark(course.id) !== "coupon") {
    return { ok: false, error: "这门课不支持使用优惠券" };
  }
  if (useCoupon && session.price <= 0) return { ok: false, error: "免费课不能使用优惠券" };
  const earned = listAugustWorkouts().reduce((sum, item) => sum + item.bananas, 0);
  if (useCoupon && bananaAccount(earned, usedCoupons()).couponsLeft < 1) {
    return { ok: false, error: "没有可用的10元优惠券" };
  }
  if (useCoupon) consumeCoupon();
  const couponYuan = useCoupon ? COUPON_YUAN : 0;
  const totalPrice = Math.max(0, quote.total - couponYuan);
  const discountNote = [quote.note, couponYuan ? `${couponYuan}元优惠券` : ""].filter(Boolean).join("；") || null;
  const pointsAwarded = awardClassPoints(section.slug, phone, seats);
  const created: BookingRecord = {
    id: `BK-${state.nextNumber}`,
    sessionId: session.id,
    courseId: course.id,
    name,
    phone,
    partySize: seats,
    unitPrice: session.price,
    totalPrice,
    discountNote,
    couponYuan,
    createdAt: new Date().toISOString(),
    cancelledAt: null,
    lateCancel: false,
    pointsAwarded,
  };
  writeState({ nextNumber: state.nextNumber + 1, bookings: [...state.bookings, created] });
  return { ok: true, booking: toView(created) };
}

export function cancelLocalBooking(id: string): BookOk | BookErr {
  const state = readState();
  const existing = state.bookings.find((booking) => booking.id === id);
  if (!existing) return { ok: false, error: "找不到这张预约" };
  if (existing.cancelledAt) return { ok: false, error: "该预约已取消" };

  const session = sessions.find((item) => item.id === existing.sessionId);
  const course = courses.find((item) => item.id === existing.courseId);
  const section = sections.find((item) => item.slug === course?.section);
  if (!session || !section) return { ok: false, error: "找不到这个场次" };

  const view = withExtraBookings(getSessionView(session), localExtra(session.id));
  if (view.status === "ended" || view.status === "started") {
    return { ok: false, error: "场次已开始或已结束，不能取消" };
  }

  const late = new Date(session.start).getTime() - Date.now() < section.cancelHours * 60 * 60 * 1000;
  if (section.slug === "group" && late) {
    return { ok: false, error: "距开课不足 6 小时，不能取消，也不退模拟应付。" };
  }
  if (existing.couponYuan) releaseCoupon();
  const bookings = state.bookings.map((booking) =>
    booking.id === id ? { ...booking, cancelledAt: new Date().toISOString(), lateCancel: late } : booking,
  );
  writeState({ ...state, bookings });
  const updated = bookings.find((booking) => booking.id === id);
  if (!updated) return { ok: false, error: "该预约已取消" };
  return { ok: true, booking: toView(updated) };
}

export function pointLedger(phone: string) {
  const cleaned = cleanPhone(phone);
  let posted = 0;
  let pending = 0;
  for (const booking of readState().bookings) {
    if (booking.phone !== cleaned || booking.cancelledAt || !booking.pointsAwarded) continue;
    const session = sessions.find((item) => item.id === booking.sessionId);
    const finished = session ? new Date(session.end).getTime() <= Date.now() : false;
    if (finished) posted += booking.pointsAwarded;
    else pending += booking.pointsAwarded;
  }
  return { posted, pending };
}

export function resetLocalBookings() {
  writeState(emptyState());
  resetCoupons();
}
