import Link from "next/link";

import { CouponMark } from "@/components/coupon-mark";
import { augustTrainingSummary, listAugustWorkouts } from "@/data/august-training";

export function AugustTraining() {
  const items = listAugustWorkouts();
  const summary = augustTrainingSummary();

  return (
    <section data-month="2026-08" className="mt-4 border border-persimmon">
      <div className="relative overflow-hidden border-b border-persimmon">
        <img src={summary.image.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/88" />
        <div className="relative grid gap-4 p-5 sm:grid-cols-4 sm:items-end">
          <p className="font-heading text-3xl">2026年8月 · 示例</p>
          <Stat value={summary.count} label="训练次数" />
          <Stat value={summary.days} label="训练天数" />
          <Stat value={summary.minutes} label="训练时长/分钟" />
        </div>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id} data-workout={item.id} className="border-t border-border px-5 py-4 first:border-t-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-heading text-2xl">
                <Link href={`/courses/${item.courseId}`} className="hover:text-persimmon">
                  {item.courseName}
                </Link>
              </h3>
              <p className="text-sm">已完成</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.timeLabel} · {item.durationMinutes} 分钟 · {item.sectionName}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.coachName} · {item.place} · {item.payLabel} · 计 1 根香蕉
            </p>
            <CouponMark courseId={item.courseId} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-heading text-3xl">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
