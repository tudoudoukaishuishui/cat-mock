import Image from "next/image";
import Link from "next/link";

import { sections } from "@/data/catalog";
import { sectionImages } from "@/lib/images";

export default function HomePage() {
  return (
    <main data-layer="home" className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <h1 className="sr-only">超级猫咪</h1>
      <section aria-label="三个板块" className="grid gap-3 md:grid-cols-3 md:gap-4">
        {sections.map((section) => (
          <Link
            key={section.slug}
            href={`/sections/${section.slug}`}
            data-section={section.slug}
            className="group relative block min-h-64 overflow-hidden md:min-h-[32rem]"
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
            <span className="absolute inset-x-0 bottom-0 p-5 font-heading text-4xl text-primary-foreground md:text-5xl">
              {section.name}
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
