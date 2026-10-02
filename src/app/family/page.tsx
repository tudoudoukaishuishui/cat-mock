import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { OutingBrowser } from "@/components/outing-browser";
import { activities } from "@/data/outings";
import { familyHero } from "@/lib/outing-images";
import { cities, parseFilters } from "@/lib/outing-queries";

export const metadata: Metadata = {
  title: "周末遛娃",
  description: "按孩子年龄和预算选周末活动，排好路线。下雨有备选。出门之后可以记照片和体验。",
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FamilyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters({
    city: first(params.city),
    age: first(params.age),
    budget: first(params.budget),
    plate: first(params.plate),
    indoor: first(params.indoor),
  });

  return (
    <main data-layer="family" className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          首页
        </Link>
        <span> / 周末遛娃</span>
      </nav>
      <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]">
        <Image src={familyHero.src} alt={familyHero.alt} fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
      </div>
      <header className="mt-8 grid items-end gap-6 border-b border-border pb-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-sm tracking-[0.18em] text-muted-foreground">WEEKEND WITH KIDS</p>
          <h1 className="mt-3 font-heading text-5xl leading-none md:text-7xl">周末遛娃</h1>
          <p className="mt-5 max-w-xl text-lg leading-8">
            每周一条能出门的计划。先选城市、孩子年龄和一家预算，再看周六怎么走。下雨换成备选。去过之后，照片和体验可以分享。
          </p>
          <ol className="mt-5 grid gap-2 text-sm leading-6 sm:grid-cols-3">
            <li>1. 按年龄和预算选出这周能去的活动</li>
            <li>2. 路线排好，可选的站可以拿掉</li>
            <li>3. 出门当天记照片和几句体验</li>
          </ol>
        </div>
        <div className="border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">现在能排</p>
          <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">活动</dt>
              <dd className="font-medium">{activities.length} 条</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">城市</dt>
              <dd className="font-medium">{cities.length} 座</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">周末</dt>
              <dd className="font-medium">4 个周六</dd>
            </div>
          </dl>
          <Link href="/family/plans" className="mt-4 inline-flex text-sm text-persimmon">
            我的遛娃
          </Link>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">不卖票，不收款。预约和门票自己办。记录存在这台浏览器里。</p>
        </div>
      </header>
      <div className="mt-8">
        <OutingBrowser initial={filters} />
      </div>
    </main>
  );
}
