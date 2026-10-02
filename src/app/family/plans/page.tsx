import type { Metadata } from "next";
import Link from "next/link";

import { OutingPlans } from "@/components/outing-plans";

export const metadata: Metadata = {
  title: "我的遛娃",
  description: "已安排的周末计划。出门之后上传照片、写体验，再分享。",
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <main data-layer="outing-plans" className="mx-auto w-full max-w-6xl px-4 py-8">
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          首页
        </Link>
        <span> / </span>
        <Link href="/family" className="hover:text-foreground">
          周末遛娃
        </Link>
        <span> / 我的遛娃</span>
      </nav>
      <h1 className="mt-4 font-heading text-5xl">我的遛娃</h1>
      <p className="mt-3 max-w-2xl leading-7">
        安排过的周末在这里。还没出门可以改成雨天备选。出门之后上传照片、写几句体验，生成一段可以复制或分享的文字。
      </p>
      <OutingPlans initialPhone={first(params.phone) ?? ""} />
    </main>
  );
}
