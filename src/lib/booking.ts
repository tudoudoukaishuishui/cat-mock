import { courses, sections, sessions } from "@/data/catalog";
import { formatTotal } from "@/lib/format";
import { getSessionView } from "@/lib/queries";
import { readState, updateState } from "@/lib/store";
import type { BookingRecord, BookingView } from "@/lib/types";

export type BookInput = {
  sessionId: string;
  name: string;
  phone: string;
  partySize: number;
  agreed: boolean;
};

type BookOk = { ok: true; booking: BookingView };
type BookErr = { ok: false; status: number; error: string };

function cleanPhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

function toView(record: BookingRecord): BookingView {
  const session = sessions.find((item) => item.id === record.sessionId);
  const view = session ? getSessionView(session) : null;
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
    statusLabel: record.cancelledAt ? (record.lateCancel ? "已取消（超过免费时限）" : "已取消") : "已预约",
    canCancel: !record.cancelledAt,
  };
}

export function createBooking(input: BookInput): BookOk | BookErr {
  const name = input.name.trim();
  const phone = cleanPhone(input.phone ?? "");
  const partySize = input.partySize;

  if (!input.agreed) {
    return { ok: false, status: 400, error: "请先确认已阅读注意事项和取消规则" };
  }
  if (!/^[\u4e00-\u9fa5a-zA-Z·]{2,20}$/.test(name)) {
    return { ok: false, status: 400, error: "请填写 2 到 20 个字的姓名，不要包含数字或符号" };
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return { ok: false, status: 400, error: "请填写 11 位中国大陆手机号" };
  }
  if (!Number.isInteger(partySize) || partySize < 1) {
    return { ok: false, status: 400, error: "预约人数必须是正整数" };
  }

  const session = sessions.find((item) => item.id === input.sessionId);
  if (!session) return { ok: false, status: 404, error: "找不到这个场次" };

  const course = courses.find((item) => item.id === session.courseId);
  const section = sections.find((item) => item.slug === course?.section);
  if (!course || !section) return { ok: false, status: 404, error: "找不到这个课程" };

  const maxParty = section.slug === "personal" ? 1 : 3;
  if (partySize > maxParty) {
    return {
      ok: false,
      status: 400,
      error: section.slug === "personal" ? "私教每场只能预约 1 人" : "单次最多预约 3 人",
    };
  }

  let created: BookingRecord | null = null;
  let failure: BookErr | null = null;

  updateState((state) => {
    const view = getSessionView(session);
    if (view.status === "ended") {
      failure = { ok: false, status: 409, error: "场次已结束，不能预约" };
      return;
    }
    if (view.status === "started") {
      failure = { ok: false, status: 409, error: "场次已开始，不能预约" };
      return;
    }
    if (view.status === "full" || view.remaining < 1) {
      failure = {
        ok: false,
        status: 409,
        error: `该场次已满（${view.booked}/${view.capacity}），无法预约`,
      };
      return;
    }
    if (partySize > view.remaining) {
      failure = {
        ok: false,
        status: 409,
        error: `剩余 ${view.remaining} 个名额，无法预约 ${partySize} 人`,
      };
      return;
    }
    const duplicated = state.bookings.some(
      (booking) =>
        booking.sessionId === session.id && booking.phone === phone && booking.cancelledAt === null,
    );
    if (duplicated) {
      failure = { ok: false, status: 409, error: "此手机号已预约该场次，请到我的运动查看" };
      return;
    }

    created = {
      id: `BK-${state.nextNumber}`,
      sessionId: session.id,
      courseId: course.id,
      name,
      phone,
      partySize,
      unitPrice: session.price,
      totalPrice: session.price * partySize,
      discountNote: null,
      createdAt: new Date().toISOString(),
      cancelledAt: null,
      lateCancel: false,
    };
    state.nextNumber += 1;
    state.bookings.push(created);
  });

  if (failure) return failure;
  if (!created) return { ok: false, status: 500, error: "预约没有写成功" };
  return { ok: true, booking: toView(created) };
}

export function cancelBooking(id: string): BookOk | BookErr {
  const existing = readState().bookings.find((booking) => booking.id === id);
  if (!existing) return { ok: false, status: 404, error: "找不到这张预约" };
  if (existing.cancelledAt) return { ok: false, status: 409, error: "该预约已取消" };

  const session = sessions.find((item) => item.id === existing.sessionId);
  const course = courses.find((item) => item.id === existing.courseId);
  const section = sections.find((item) => item.slug === course?.section);
  if (!session || !section) return { ok: false, status: 404, error: "找不到这个场次" };

  const view = getSessionView(session);
  if (view.status === "ended" || view.status === "started") {
    return { ok: false, status: 409, error: "场次已开始或已结束，不能取消" };
  }

  const late = new Date(session.start).getTime() - Date.now() < section.cancelHours * 60 * 60 * 1000;
  if (section.slug === "group" && late) {
    return { ok: false, status: 409, error: "距离开课不满 6 小时，不支持退款，不能取消。" };
  }
  let updated: BookingRecord | null = null;

  updateState((state) => {
    const booking = state.bookings.find((item) => item.id === id);
    if (!booking || booking.cancelledAt) return;
    booking.cancelledAt = new Date().toISOString();
    booking.lateCancel = late;
    updated = booking;
  });

  if (!updated) return { ok: false, status: 409, error: "该预约已取消" };
  return { ok: true, booking: toView(updated) };
}

export function resetBookings() {
  updateState((state) => {
    state.bookings = [];
    state.nextNumber = 1001;
  });
}

export function totalLabel(price: number, partySize: number) {
  return formatTotal(price, partySize);
}
