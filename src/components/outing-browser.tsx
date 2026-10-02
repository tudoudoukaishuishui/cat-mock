"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { plates } from "@/data/outings";
import { Button } from "@/components/ui/button";
import { plateImages, outingImage } from "@/lib/outing-images";
import {
  activeRoute,
  ageOptions,
  budgetOptions,
  cities,
  defaultFilters,
  defaultSkipped,
  describeWhen,
  filterActivities,
  filtersToQuery,
  formatAge,
  formatBudget,
  formatDuration,
  listedBudget,
  rainNote,
  routeSummary,
  suggestedChildAge,
  weekCardTitle,
  weeklyPlans,
} from "@/lib/outing-queries";
import type { Activity, OutingFilters, PlateSlug } from "@/lib/outing-types";
import { cn } from "cn";

const plateTone: Record<PlateSlug, string> = {
  park: "bg-moss text-primary-foreground",
  indoor: "bg-ink text-gold",
  walk: "bg-persimmon text-primary-foreground",
};

function sameFilters(a: OutingFilters, b: OutingFilters) {
  return (
    a.city === b.city &&
    a.age === b.age &&
    a.budget === b.budget &&
    a.plate === b.plate &&
    a.indoorOnly === b.indoorOnly
  );
}

export function OutingBrowser({ initial }: { initial: OutingFilters }) {
  const [filters, setFilters] = useState(initial);
  const [synced, setSynced] = useState(initial);
  if (!sameFilters(synced, initial)) {
    setSynced(initial);
    setFilters(initial);
  }

  function update(next: OutingFilters) {
    setFilters(next);
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    window.history.replaceState(null, "", `${base}/family${filtersToQuery(next)}`);
  }

  const weeks = weeklyPlans(filters);
  const matches = filterActivities(filters);
  const featured = weeks[0];
  const ageLabel = ageOptions.find((item) => item.id === filters.age)?.label ?? "";
  const budgetLabel = budgetOptions.find((item) => item.id === filters.budget)?.label ?? "";

  return (
    <div>
      <form
        className="grid gap-3 border border-border bg-card p-4 md:grid-cols-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="grid gap-1 text-sm">
          城市
          <select
            value={filters.city}
            onChange={(event) => update({ ...filters, city: event.target.value as OutingFilters["city"] })}
            className="h-10 rounded-lg border border-input bg-background px-2.5"
          >
            {cities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          孩子年龄
          <select
            value={filters.age}
            onChange={(event) => update({ ...filters, age: event.target.value as OutingFilters["age"] })}
            className="h-10 rounded-lg border border-input bg-background px-2.5"
          >
            {ageOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} · {item.hint}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          一家预算
          <select
            value={filters.budget}
            onChange={(event) => update({ ...filters, budget: event.target.value as OutingFilters["budget"] })}
            className="h-10 rounded-lg border border-input bg-background px-2.5"
          >
            {budgetOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={filters.indoorOnly}
            onChange={(event) => update({ ...filters, indoorOnly: event.target.checked })}
          />
          只看室内
        </label>
      </form>
      <p className="mt-3 text-sm text-muted-foreground">
        {filters.city} · {ageLabel} · {budgetLabel}
        {filters.indoorOnly ? " · 只看室内" : ""}。预算按 2 大 1 小估算，含默认路线里的门票和小食，不含打车。
      </p>

      <section className="mt-8" aria-label="接下来四个周六">
        <h2 className="font-heading text-3xl">接下来四个周六</h2>
        {weeks.length === 0 ? (
          <div className="mt-4 border border-dashed border-border p-8">
            <p className="font-medium">这个组合没有能出门的活动</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              把预算放到 ¥300，或换一个年龄。只看室内时，户外的公园和街区不会出现。
            </p>
            <Button type="button" variant="outline" className="mt-4 h-10 px-4" onClick={() => update(defaultFilters)}>
              恢复默认：上海 · 3–5 岁 · ¥300 以内
            </Button>
          </div>
        ) : (
          <>
            {featured ? <WeekFeature filters={filters} index={0} date={featured.date} activity={featured.activity} repeated={featured.repeated} /> : null}
            <ul className="mt-4 grid gap-4 md:grid-cols-3">
              {weeks.slice(1).map((week, index) => (
                <li key={week.date}>
                  <WeekCard filters={filters} index={index + 1} date={week.date} activity={week.activity} repeated={week.repeated} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section aria-label="三种出门方式" className="mt-10 grid gap-4 lg:grid-cols-3">
        {plates.map((plate) => {
          const count = filterActivities({ ...filters, plate: plate.slug, indoorOnly: false }).length;
          const selected = filters.plate === plate.slug;
          return (
            <article key={plate.slug} className={cn("flex flex-col border border-border bg-card", selected && "ring-2 ring-persimmon")}>
              <button
                type="button"
                onClick={() => update({ ...filters, plate: selected ? "全部" : plate.slug, indoorOnly: false })}
                className="text-left"
              >
                <span className="relative block aspect-[4/3] overflow-hidden">
                  <Image
                    src={plateImages[plate.slug].src}
                    alt={plateImages[plate.slug].alt}
                    fill
                    sizes="(min-width: 1024px) 360px, 100vw"
                    className="object-cover"
                  />
                </span>
                <span className="block p-5">
                  <span className={cn("w-fit px-2 py-1 text-xs", plateTone[plate.slug])}>{plate.index}</span>
                  <span className="mt-4 block font-heading text-3xl">{plate.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{plate.englishName}</span>
                  <span className="mt-3 block leading-7">{plate.summary}</span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">{plate.detail}</span>
                  <span className="mt-4 block text-sm">
                    当前筛选下 {count} 条{selected ? " · 已筛这项" : ""}
                  </span>
                </span>
              </button>
            </article>
          );
        })}
      </section>

      <section id="activity-list" className="mt-10" aria-label="符合条件的活动">
        <h2 className="font-heading text-3xl">全部符合的活动</h2>
        <p className="mt-2 text-sm text-muted-foreground">{matches.length} 条。点进去可以改路线、看下雨备选，再安排到某个周末。</p>
        {matches.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">上面的四个周六也是空的。放宽筛选后再看。</p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {matches.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} filters={filters} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function activityHref(activity: Activity, date: string, filters: OutingFilters, rain = false) {
  const params = new URLSearchParams({ date, age: String(suggestedChildAge(filters.age)) });
  if (rain) params.set("rain", "1");
  return `/family/activities/${activity.id}?${params.toString()}`;
}

function WeekFeature({
  filters,
  index,
  date,
  activity,
  repeated,
}: {
  filters: OutingFilters;
  index: number;
  date: string;
  activity: Activity;
  repeated: boolean;
}) {
  const rain = rainNote(activity, filters);
  const route = activeRoute(activity, defaultSkipped(activity));
  return (
    <article data-week-date={date} className="mt-4 grid gap-5 border border-border bg-card p-4 md:grid-cols-[16rem_1fr] md:p-5">
      <Link href={activityHref(activity, date, filters)} className="relative block aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-56">
        <Image src={outingImage(activity.id).src} alt={outingImage(activity.id).alt} fill sizes="256px" className="object-cover" />
      </Link>
      <div>
        <p className="text-sm text-persimmon">
          {weekCardTitle(index, date)} · {describeWhen(date)}
        </p>
        <h3 className="mt-2 font-heading text-4xl">{activity.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {activity.city} · {formatAge(activity)} · {activity.setting} · {formatBudget(route.budget)} · {formatDuration(route.minutes)}
        </p>
        <p className="mt-3 leading-7">{activity.summary}</p>
        <p className="mt-2 text-sm leading-6">路线：{routeSummary(activity)}</p>
        {repeated ? <p className="mt-2 text-sm text-muted-foreground">符合条件的活动不多，这周仍是这一条。</p> : null}
        <p className="mt-3 text-sm leading-6">
          {rain.backup ? (
            <>
              下雨改去{" "}
              <Link href={activityHref(rain.backup, date, filters, true)} className="text-persimmon">
                {rain.backup.name}
              </Link>
              。{rain.warning}
            </>
          ) : (
            "这场在室内，下雨不用改日子。"
          )}
        </p>
        <Link
          href={activityHref(activity, date, filters)}
          className="mt-4 inline-flex h-10 items-center bg-primary px-4 text-sm text-primary-foreground"
        >
          安排这个周六
        </Link>
      </div>
    </article>
  );
}

function WeekCard({
  filters,
  index,
  date,
  activity,
  repeated,
}: {
  filters: OutingFilters;
  index: number;
  date: string;
  activity: Activity;
  repeated: boolean;
}) {
  const rain = rainNote(activity, filters);
  return (
    <article data-week-date={date} className="flex h-full flex-col border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        {weekCardTitle(index, date)} · {describeWhen(date)}
      </p>
      <h3 className="mt-2 font-heading text-2xl">
        <Link href={activityHref(activity, date, filters)} className="hover:text-persimmon">
          {activity.name}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{routeSummary(activity)}</p>
      <p className="mt-2 text-sm">{formatBudget(listedBudget(activity))}</p>
      <p className="mt-2 text-sm leading-6">{rain.backup ? `下雨：${rain.backup.name}` : "室内，下雨不用改"}</p>
      {repeated ? <p className="mt-2 text-xs text-muted-foreground">和前面某一周相同</p> : null}
    </article>
  );
}

function ActivityRow({ activity, filters }: { activity: Activity; filters: OutingFilters }) {
  const rain = rainNote(activity, filters);
  const date = weeklyPlans(filters)[0]?.date;
  return (
    <li className="py-6" data-activity-id={activity.id}>
      <div className="grid gap-4 md:grid-cols-[14rem_1fr] md:gap-6">
        <Link
          href={activityHref(activity, date ?? "", filters)}
          className="relative block aspect-[4/3] overflow-hidden"
        >
          <Image
            src={outingImage(activity.id).src}
            alt={outingImage(activity.id).alt}
            fill
            sizes="224px"
            className="object-cover"
          />
        </Link>
        <div>
          <p className="text-sm text-muted-foreground">
            {activity.city} · {activity.setting}
          </p>
          <h3 className="mt-1 font-heading text-3xl">
            <Link href={activityHref(activity, date ?? "", filters)} className="hover:text-persimmon">
              {activity.name}
            </Link>
          </h3>
          <p className="mt-2 leading-7">{activity.summary}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatAge(activity)} · {formatBudget(listedBudget(activity))} · {formatDuration(activeRoute(activity, defaultSkipped(activity)).minutes)}
          </p>
          <p className="mt-2 text-sm leading-6">
            {rain.backup ? `下雨备选：${rain.backup.name}` : "室内活动，下雨不用换地方"}
            {rain.warning ? ` ${rain.warning}` : ""}
          </p>
        </div>
      </div>
    </li>
  );
}
