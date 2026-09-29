import Image from "next/image";
import Link from "next/link";

import { sections } from "@/data/catalog";
import { sectionImages } from "@/lib/images";

const homeLine: Record<(typeof sections)[number]["slug"], string> = {
  group: "教练带整班。当前课表 ¥89–179/人",
  personal: "一对一。¥420–560/节，不是都接受零基础",
  open: "免费及付费体验。¥0 或 ¥49",
};

export default function HomePage() {
  return (
    <main data-layer="home" className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-4 md:py-6">
      <h1 className="sr-only">超级猫咪</h1>
      <section aria-label="三个板块" className="grid flex-1 grid-rows-3 gap-3 md:grid-cols-3 md:grid-rows-1 md:gap-4">
        {sections.map((section) => (
          <Link
            key={section.slug}
            href={`/sections/${section.slug}`}
            data-section={section.slug}
            className="group relative block min-h-64 overflow-hidden"
          >
            <Image
              src={sectionImages[section.slug].src}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 360px, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
              <span className="block font-heading text-4xl md:text-5xl">{section.name}</span>
              <span className="mt-2 block max-w-xs text-sm leading-5 text-primary-foreground/90">{homeLine[section.slug]}</span>
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
