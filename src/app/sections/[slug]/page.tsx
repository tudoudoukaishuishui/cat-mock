import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseBrowser } from "@/components/course-browser";
import { getSection, listCourseItems, sectionCities } from "@/lib/queries";
import type { SectionSlug } from "@/lib/types";

export const dynamic = "force-dynamic";

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
  if (!slugs.has(slug as SectionSlug)) notFound();
  const section = getSection(slug);
  if (!section) notFound();
  const items = listCourseItems(section.slug);
  const cities = sectionCities(section.slug);

  return (
    <main data-layer="section" data-section={section.slug} className="mx-auto w-full max-w-6xl px-4 py-8">
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          首页
        </Link>
        <span> / {section.name}</span>
      </nav>
      <header className="mt-4 max-w-3xl border-b border-border pb-6">
        <p className="text-xs tracking-[0.16em] text-muted-foreground">
          {section.index} · {section.englishName}
        </p>
        <h1 className="mt-2 font-heading text-5xl">{section.name}</h1>
        <p className="mt-4 leading-7">{section.detail}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.bookingRule}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          免费取消需要在开课前满 {section.cancelHours} 小时。逾期仍可在本站取消并释放名额，记录会标明已超过免费时限。
        </p>
      </header>
      <div className="mt-6">
        <CourseBrowser items={items} cities={cities} />
      </div>
    </main>
  );
}
