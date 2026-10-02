import { courses } from "@/data/catalog";

export const BANANAS_PER_COUPON = 8;
export const COUPON_YUAN = 10;

export function formatBananas(value: number) {
  const halves = Math.round(value * 2);
  if (halves % 2 === 0) return String(halves / 2);
  return `${Math.floor(halves / 2)}.5`;
}

const hotCourseIds = new Set(["hiit", "ride", "boxing-fit", "dance", "bodypump", "hyrox"]);

const freeCourseIds = new Set(["open-intro", "open-stretch", "open-assess"]);

export type CouponMark = "coupon" | "hot" | "none";

export function couponMark(courseId: string): CouponMark {
  if (hotCourseIds.has(courseId)) return "hot";
  if (freeCourseIds.has(courseId)) return "none";
  if (!courses.some((course) => course.id === courseId)) return "none";
  return "coupon";
}

export function couponLabel(courseId: string) {
  const mark = couponMark(courseId);
  if (mark === "hot") return "热门课程，不支持优惠券";
  if (mark === "coupon") return "可使用10元优惠券";
  return "";
}

export const hotCourseNames = courses.filter((course) => hotCourseIds.has(course.id)).map((course) => course.name);

export function bananaAccount(earned: number, usedCoupons = 0) {
  const halves = Math.round(earned * 2);
  const couponHalves = BANANAS_PER_COUPON * 2;
  const kept = Math.min(halves, couponHalves);
  const couponsIssued = Math.floor((halves - kept) / couponHalves);
  return {
    earned,
    bananas: (halves - couponsIssued * couponHalves) / 2,
    couponsIssued,
    couponsLeft: Math.max(0, couponsIssued - usedCoupons),
  };
}
