import { couponLabel, couponMark } from "@/data/bananas";

export function CouponMark({ courseId }: { courseId: string }) {
  const mark = couponMark(courseId);
  const label = couponLabel(courseId);
  if (!label) return null;
  return (
    <span
      data-coupon={mark}
      className={
        mark === "hot"
          ? "mt-1 inline-block bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
          : "mt-1 inline-block bg-persimmon/10 px-1.5 py-0.5 text-[11px] text-persimmon"
      }
    >
      {label}
    </span>
  );
}
