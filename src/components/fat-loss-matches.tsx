import Link from "next/link";

import type { FatLossGroup } from "@/lib/fat-loss-plan";

export function FatLossMatches({
  plan,
  bookedByCourse,
}: {
  plan: FatLossGroup[];
  bookedByCourse: Map<string, number>;
}) {
  const bookedMatches = plan.reduce(
    (sum, group) => sum + group.courses.filter((course) => (bookedByCourse.get(course.courseId) ?? 0) > 0).length,
    0,
  );

  return (
    <section data-goal="fat-loss" className="mt-10 border-t border-border pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.16em] text-muted-foreground">当前目标</p>
          <h2 className="mt-1 font-heading text-3xl">减肥</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          按现有团课、私教和公开课来配。一周排 2 节减脂主课、2 节力量、1 节恢复；有氧间歇可以换进主课的位置。价格和时长以各课场次为准。
          {bookedMatches > 0 ? ` 已约其中 ${bookedMatches} 门。` : ""}
        </p>
      </div>
      <div className="mt-6 space-y-8">
        {plan.map((group) => (
          <div key={group.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-heading text-2xl">{group.title}</h3>
              <p className="text-sm text-persimmon">{group.weekly}</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{group.detail}</p>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {group.courses.map((course) => {
                const booked = bookedByCourse.get(course.courseId) ?? 0;
                return (
                  <li key={course.courseId}>
                    <Link
                      href={`/courses/${course.courseId}`}
                      data-match={course.courseId}
                      className="grid h-full grid-cols-[6.5rem_1fr] border border-border bg-card hover:border-persimmon"
                    >
                      <img src={course.imageSrc} alt="" className="h-full w-full object-cover" />
                      <span className="block p-4">
                        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {course.sectionName} · {course.durationMinutes} 分钟 · {course.intensity}
                          </span>
                          {booked > 0 ? <span className="text-persimmon">已约 {booked} 场</span> : null}
                        </span>
                        <span className="mt-1 block font-heading text-2xl">{course.name}</span>
                        <span className="mt-1 block text-xs tracking-wide text-muted-foreground">{course.englishName}</span>
                        <span className="mt-2 block text-sm leading-6">{course.summary}</span>
                        {course.next ? (
                          <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                            下一场可约 · {course.next.timeLabel} · {course.next.city} · {course.next.coachName} · 余{" "}
                            {course.next.remaining} · {course.next.priceLabel}
                          </span>
                        ) : (
                          <span className="mt-2 block text-sm text-muted-foreground">这门课当前没有剩余名额。</span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
