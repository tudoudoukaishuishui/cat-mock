import { courses } from "@/data/catalog";

export const BANANAS_PER_CLASS = 1;
export const BANANAS_PER_COUPON = 8;
export const COUPON_YUAN = 10;

const hotCourseIds = new Set(["hiit", "ride", "boxing-fit", "dance", "bodypump", "hyrox"]);

const freeCourseIds = new Set(["open-intro", "open-stretch", "open-assess"]);

export type CouponMark = "coupon" | "hot" | "none";

export function couponMark(courseId: string): CouponMark {
  if (hotCourseIds.has(courseId)) return "hot";
  if (freeCourseIds.has(courseId)) return "none";
  if (!courses.some((course) => course.id === courseId)) return "none";
  return "coupon";
}

export function earnsBanana(courseId: string) {
  return couponMark(courseId) !== "none";
}

export function couponLabel(courseId: string) {
  const mark = couponMark(courseId);
  if (mark === "hot") return "热门课程，不支持优惠券";
  if (mark === "coupon") return "可使用10元优惠券";
  return "";
}

export const hotCourseNames = courses.filter((course) => hotCourseIds.has(course.id)).map((course) => course.name);

export function bananaAccount(earned: number, usedCoupons = 0) {
  const couponsIssued = Math.floor(earned / BANANAS_PER_COUPON);
  return {
    earned,
    bananas: earned % BANANAS_PER_COUPON,
    couponsIssued,
    couponsLeft: Math.max(0, couponsIssued - usedCoupons),
  };
}
