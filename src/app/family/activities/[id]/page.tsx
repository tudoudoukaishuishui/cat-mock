import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { MissingPage } from "@/components/missing-page";
import { OutingPlanner } from "@/components/outing-planner";
import { OutingPlannerFromUrl } from "@/components/outing-query";
import { getActivity, plates, rainActivity } from "@/data/outings";
import { activities } from "@/data/outings";
import { outingImage } from "@/lib/outing-images";
import {
  activeRoute,
  defaultSkipped,
  formatAge,
  formatBudget,
  formatDuration,
  listedBudget,
  suggestedChildAge,
} from "@/lib/outing-queries";

export function generateStaticParams() {
  return activities.map((activity) => ({ id: activity.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const activity = getActivity(id);
  if (!activity) return { title: "没有这个活动" };
  return { title: activity.name, description: activity.summary };
}

export default async function ActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = getActivity(id);
  if (!activity) {
    return (
      <MissingPage
        title="没有这个活动"
        body="回超级家长，按城市、年龄和预算再选一条。"
        href="/family"
        linkLabel="回超级家长"
      />
    );
  }
  const rain = rainActivity(activity);
  const plate = plates.find((item) => item.slug === activity.plate);
  const route = activeRoute(activity, defaultSkipped(activity));
  const payload = {
    活动: activity.name,
    城市: activity.city,
    板块: plate?.name,
    适合年龄: formatAge(activity),
    预算: formatBudget(listedBudget(activity)),
    预算说明: activity.budgetNote,
    室内室外: activity.setting,
    时长: formatDuration(route.minutes),
    集合: activity.meet,
    交通: activity.transit,
    雨天备选: rain?.name ?? "室内，不用换",
    路线: route.stops.map((stop) => ({
      时间: `${stop.time}–${stop.end}`,
      站: stop.title,
      地址: stop.address,
      说明: stop.detail,
    })),
    注意事项: activity.notes,
  };

  return (
    <main data-layer="outing" data-activity-id={activity.id} className="mx-auto w-full max-w-6xl px-4 py-8">
      <script
        id="outing-json"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link href="/family" className="hover:text-foreground">
          超级家长
        </Link>
        <span> / {activity.name}</span>
      </nav>
      <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden md:aspect-[21/8]">
        <Image
          src={outingImage(activity.id).src}
          alt={outingImage(activity.id).alt}
          fill
          priority
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="object-cover"
        />
      </div>
      <header className="mt-4 grid gap-6 border-b border-border pb-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-sm text-muted-foreground">
            {activity.city} · {plate?.name} · {activity.setting}
          </p>
          <h1 className="mt-2 font-heading text-5xl">{activity.name}</h1>
          <p className="mt-4 max-w-2xl leading-8">{activity.description}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="border border-border p-3">
            <dt className="text-muted-foreground">年龄</dt>
            <dd className="mt-1 font-medium">{formatAge(activity)}</dd>
          </div>
          <div className="border border-border p-3">
            <dt className="text-muted-foreground">一家大约</dt>
            <dd className="mt-1 font-medium">{formatBudget(listedBudget(activity))}</dd>
          </div>
          <div className="border border-border p-3">
            <dt className="text-muted-foreground">时长</dt>
            <dd className="mt-1 font-medium">{formatDuration(route.minutes)}</dd>
          </div>
          <div className="border border-border p-3">
            <dt className="text-muted-foreground">下雨</dt>
            <dd className="mt-1 font-medium">{rain ? rain.name : "不用换地方"}</dd>
          </div>
        </dl>
      </header>
      <Suspense
        fallback={
          <OutingPlanner activity={activity} rain={rain} initialDate="" initialAge={suggestedChildAge("3-5")} initialRain={false} />
        }
      >
        <OutingPlannerFromUrl activity={activity} rain={rain} />
      </Suspense>
    </main>
  );
}
