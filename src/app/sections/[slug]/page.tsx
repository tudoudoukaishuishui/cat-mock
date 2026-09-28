import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CityReference } from "@/components/city-reference";
import { GroupTimetable } from "@/components/group-timetable";
import { MissingPage } from "@/components/missing-page";
import { sectionImages } from "@/lib/images";
import { getSection, listSessionViews } from "@/lib/queries";
import type { SectionSlug } from "@/lib/types";

export function generateStaticParams() {
  return [{ slug: "group" }, { slug: "personal" }, { slug: "open" }];
}

export const dynamicParams = false;

const slugs = new Set<SectionSlug>(["group", "personal", "open"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const section = getSection(slug);
  if (!section) return { title: "没有这个板块" };
  return { title: section.name, description: section.summary };
}

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slugs.has(slug as SectionSlug)) {
    return (
      <MissingPage
        title="没有这个板块"
        body="只有团课、私教和公开课。回首页选一个板块。"
      />
    );
  }
  const section = getSection(slug);
  if (!section) {
    return (
      <MissingPage
        title="没有这个板块"
        body="只有团课、私教和公开课。回首页选一个板块。"
      />
    );
  }
  const sectionSessions = listSessionViews().filter((item) => item.section === section.slug);

  return (
    <main data-layer="section" data-section={section.slug} className="mx-auto w-full max-w-6xl px-4 py-8">
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          首页
        </Link>
        <span> / {section.name}</span>
      </nav>
      <header className="mt-4 grid gap-6 border-b border-border pb-6 md:grid-cols-[1fr_0.8fr] md:items-end">
        <div>
          <p className="text-xs tracking-[0.16em] text-muted-foreground">
            {section.index} · {section.englishName}
          </p>
          <h1 className="mt-2 font-heading text-5xl">{section.name}</h1>
          <p className="mt-4 leading-7">{section.detail}</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.bookingRule}</p>
          {section.slug === "group" ? null : (
            <p className="mt-2 text-sm text-muted-foreground">
              免费取消需要在开课前满 {section.cancelHours} 小时。逾期仍可在本站取消并释放名额，记录会标明已超过免费时限。
            </p>
          )}
        </div>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={sectionImages[section.slug].src}
            alt={sectionImages[section.slug].alt}
            fill
            priority
            sizes="(min-width: 768px) 460px, 100vw"
            className="object-cover"
          />
        </div>
      </header>
      <CityReference section={section.slug} />
      <GroupTimetable sessions={sectionSessions} sectionName={section.name} />
    </main>
  );
}
