import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MissingPage } from "@/components/missing-page";
import { SessionTicket } from "@/components/session-ticket";
import { courses } from "@/data/catalog";
import { courseImage } from "@/lib/images";
import { getCourseView } from "@/lib/queries";

export function generateStaticParams() {
  return courses.map((course) => ({ id: course.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const view = getCourseView(id);
  if (!view) return { title: "没有这门课" };
  return { title: view.course.name, description: view.course.summary };
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getCourseView(id);
  if (!view) {
    return (
      <MissingPage
        title="没有这门课"
        body="课程编号不存在。回首页看团课、私教和公开课，或从板块列表进入。"
      />
    );
  }
  const { course, section, sessions, coaches } = view;

  const payload = {
    课程编号: course.code,
    课程: course.name,
    板块: section.name,
    课程内容介绍: course.description,
    时长分钟: course.durationMinutes,
    课程等级: course.levelNote,
    用户画像: course.audience,
    匹配标签: course.tags,
    价格说明: course.priceNote,
    强度: course.intensity,
    预计消耗: course.calories,
    价格区间: view.priceLabel,
    适合: course.suitableFor,
    不适合: course.notSuitableFor,
    注意事项: course.generalNotes,
    取消规则: course.cancelRule,
    场次: sessions.map((session) => ({
      场次编号: session.id,
      教练: session.coachLine,
      等级: session.level,
      时间: session.timeLabel,
      地址: session.addressLine,
      交通: session.transit,
      最多人数: session.capacity,
      已预约: session.booked,
      剩余名额: session.remaining,
      价格: session.priceLabel,
      状态: session.statusLabel,
      注意事项: session.notes,
    })),
  };

  return (
    <main data-layer="course" data-course-id={course.id} className="mx-auto w-full max-w-6xl px-4 py-8">
      <script
        id="course-json"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          首页
        </Link>
        <span> / </span>
        <Link href={`/sections/${section.slug}`} className="hover:text-foreground">
          {section.name}
        </Link>
        <span> / {course.name}</span>
      </nav>

      <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden md:aspect-[21/8]">
        <Image
          src={courseImage(course.id, course.name).src}
          alt={courseImage(course.id, course.name).alt}
          fill
          priority
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="object-cover"
        />
      </div>

      <header className="mt-4 grid gap-6 border-b border-border pb-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-xs tracking-[0.16em] text-muted-foreground">
            {course.code} · {section.name}
          </p>
          <h1 className="mt-2 font-heading text-5xl md:text-6xl">{course.name}</h1>
          <p className="mt-2 text-muted-foreground">{course.englishName}</p>
          <p className="mt-5 max-w-2xl text-lg leading-8">{course.summary}</p>
        </div>
        <dl className="grid content-start gap-3 border border-border bg-card p-4 text-sm">
          <Fact label="时长" value={course.durationMinutes ? `${course.durationMinutes} 分钟` : "待确认"} field="duration" />
          <Fact label="课程等级" value={course.levelNote} field="course-level" />
          <Fact label="强度" value={course.intensity} field="intensity" />
          <Fact label="价格" value={view.priceLabel} field="price-range" />
          <Fact label="预计消耗" value={course.calories} field="calories" />
        </dl>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_18rem]">
        <article className="space-y-8">
          <section>
            <h2 className="font-heading text-3xl">课程内容介绍</h2>
            <p data-field="description" className="mt-3 max-w-3xl leading-7">
              {course.description}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{course.levelNote}</p>
          </section>

          <section>
            <h2 className="font-heading text-3xl">用户画像</h2>
            <p className="mt-3 max-w-3xl leading-7">{course.audience}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <li key={tag} className="bg-muted px-2 py-1 text-xs">
                  {tag}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-3xl">价格说明</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6">{course.priceNote}</p>
          </section>

          <section>
            <h2 className="font-heading text-3xl">课程结构</h2>
            <ol className="mt-4 space-y-3">
              {course.outline.map((block) => (
                <li key={block.title} className="grid gap-1 border-t border-border pt-3 sm:grid-cols-[6rem_1fr]">
                  <p className="text-sm text-muted-foreground">{block.minutes}</p>
                  <div>
                    <p className="font-medium">{block.title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{block.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <List title="这节课要完成" items={course.goals} />
            <List title="适合" items={course.suitableFor} />
            <List title="不适合" items={course.notSuitableFor} />
            <List title="场地提供" items={course.equipmentProvided} />
            <List title="请自备" items={course.bring} />
          </section>

          <section>
            <h2 className="font-heading text-3xl">课程注意事项</h2>
            <ul data-field="course-notes" className="mt-3 space-y-2 text-sm leading-6">
              {course.generalNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{course.cancelRule}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{course.priceIncludes}</p>
          </section>
        </article>

        <aside>
          <h2 className="font-heading text-2xl">教练</h2>
          <ul className="mt-3 space-y-4">
            {coaches.map((coach) => (
              <li key={coach.id} className="border border-border bg-card p-3 text-sm">
                <p className="font-medium">
                  {coach.name} · {coach.title}
                </p>
                <p className="mt-1 text-muted-foreground">{coach.credentials.join("、")}</p>
                <p className="mt-1">执教 {coach.years} 年 · {coach.specialties.join("、")}</p>
                <p className="mt-2 leading-6">{coach.bio}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <section className="mt-12" aria-label="场次">
        <h2 className="font-heading text-3xl">场次</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          已预约人数含课表初始占位，以及你在这台浏览器里新约的人数。每场的教练、等级、时间和价格以这一栏为准。
        </p>
        <div className="mt-5 space-y-5">
          {sessions.map((session) => (
            <SessionTicket key={session.id} session={session} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Fact({ label, value, field }: { label: string; value: string; field: string }) {
  return (
    <div data-field={field}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 leading-6">{value}</dd>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="font-medium">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm leading-6">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
