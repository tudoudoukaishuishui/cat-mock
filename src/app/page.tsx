import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { homeData } from "@/lib/queries";
import { cn } from "cn";

const tone: Record<string, string> = {
  group: "bg-persimmon text-primary-foreground",
  personal: "bg-moss text-primary-foreground",
  open: "bg-ink text-gold",
};

export default function HomePage() {
  const data = homeData();

  return (
    <main data-layer="home" className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <section className="grid items-end gap-8 border-b border-border pb-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-sm tracking-[0.18em] text-muted-foreground">SUPER CAT · 模拟预约站</p>
          <h1 className="mt-3 font-heading text-5xl leading-none md:text-7xl">超级猫咪</h1>
          <p className="mt-5 max-w-xl text-lg leading-8">
            按次上课，不办卡。首页三个板块：团课、私教、公开课。点进去看课程列表，再点一门课，看这一场的教练、等级、时间、地址、名额和价格。
          </p>
          <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">课程</dt>
              <dd className="font-medium">{data.courseCount} 门</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">城市</dt>
              <dd className="font-medium">{data.cityCount} 座</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">当前可约</dt>
              <dd className="font-medium">{data.bookableCount} 场</dd>
            </div>
          </dl>
        </div>
        <div className="border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">接下来可约</p>
          <ul className="mt-2 divide-y divide-border">
            {data.upcoming.map((session) => (
              <li key={session.id} className="py-2 text-sm">
                <Link href={`/courses/${session.courseId}#session-${session.id}`} className="hover:text-persimmon">
                  <span className="text-muted-foreground">{session.sectionName}</span> {session.courseName}
                  <span className="mt-0.5 block text-muted-foreground">
                    {session.timeLabel} · {session.city} · 剩余 {session.remaining} · {session.priceLabel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label="三个板块" className="mt-8 grid gap-4 lg:grid-cols-3">
        {data.plates.map((plate) => (
          <article
            key={plate.slug}
            data-section={plate.slug}
            className="flex min-h-[28rem] flex-col border border-border bg-card p-5"
          >
            <p className={cn("w-fit px-2 py-1 text-xs", tone[plate.slug])}>{plate.index}</p>
            <h2 className="mt-4 font-heading text-4xl">{plate.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{plate.englishName}</p>
            <p className="mt-4 leading-7">{plate.summary}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{plate.detail}</p>
            <dl className="mt-5 grid grid-cols-3 gap-2 border-y border-border py-3 text-sm">
              <div>
                <dt className="text-muted-foreground">课程</dt>
                <dd>{plate.courseCount} 门</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">可约</dt>
                <dd>{plate.bookableCount} 场</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">价格</dt>
                <dd>{plate.priceLabel}</dd>
              </div>
            </dl>
            <ul className="mt-4 space-y-2 text-sm">
              {plate.highlights.map((item) => (
                <li key={item.id}>
                  <Link href={`/courses/${item.id}`} className="hover:text-persimmon">
                    {item.name}
                  </Link>
                  <span className="text-muted-foreground"> · {item.summary}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              {plate.next ? (
                <p className="mb-3 text-sm text-muted-foreground">
                  下一场 {plate.next.courseName}，{plate.next.timeLabel}，剩余 {plate.next.remaining} 人
                </p>
              ) : null}
              <Link href={`/sections/${plate.slug}`} className={cn(buttonVariants(), "h-10 px-4")}>
                进入{plate.name}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
