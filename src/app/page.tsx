import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { heroImage, sectionImages } from "@/lib/images";
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
      <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]">
        <Image src={heroImage.src} alt={heroImage.alt} fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <p className="absolute bottom-4 left-4 hidden max-w-md text-sm leading-6 text-primary-foreground sm:block md:bottom-6 md:left-6 md:text-base">
          上海、北京、深圳、成都四家门店，外加两处户外公开课集合点。按场次预约，不办卡。
        </p>
      </div>
      <section className="grid items-end gap-8 border-b border-border pb-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-sm tracking-[0.18em] text-muted-foreground">SUPER CAT</p>
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

      <section className="mt-8 flex flex-col gap-3 border border-border bg-card p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.16em] text-muted-foreground">会员</p>
          <h2 className="mt-1 font-heading text-3xl">月卡、季卡、半年卡、年卡</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            有效期内预约团课和公开课。课程也可以按场次单独买。新会员早鸟立减 ¥20。团课或私教两人及以上报名打 9 折。
          </p>
        </div>
        <Link href="/membership" className={cn(buttonVariants(), "h-10 shrink-0 px-4")}>
          查看会员
        </Link>
      </section>

      <section aria-label="三个板块" className="mt-8 grid gap-4 lg:grid-cols-3">
        {data.plates.map((plate) => (
          <article
            key={plate.slug}
            data-section={plate.slug}
            className="flex min-h-[28rem] flex-col border border-border bg-card p-5"
          >
            <Link href={`/sections/${plate.slug}`} className="relative -mx-5 -mt-5 mb-5 block aspect-[4/3] overflow-hidden">
              <Image
                src={sectionImages[plate.slug].src}
                alt={sectionImages[plate.slug].alt}
                fill
                sizes="(min-width: 1024px) 360px, 100vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </Link>
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
