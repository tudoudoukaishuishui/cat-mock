"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CourseListItem, Level } from "@/lib/types";

const levels: Array<Level | "全部"> = ["全部", "入门", "初级", "中级", "高级"];

export function CourseBrowser({
  items,
  cities,
}: {
  items: CourseListItem[];
  cities: string[];
}) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("全部");
  const [level, setLevel] = useState<Level | "全部">("全部");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (onlyOpen && item.bookableCount === 0) return false;
      if (city !== "全部" && !item.cities.includes(city)) return false;
      if (level !== "全部" && !item.levels.includes(level)) return false;
      if (!needle) return true;
      const haystack = [item.name, item.englishName, item.code, item.summary, ...item.coaches]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [city, items, level, onlyOpen, query]);

  return (
    <div>
      <form
        className="grid gap-3 border border-border bg-card p-4 md:grid-cols-[1.4fr_repeat(3,auto)] md:items-end"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="grid gap-1 text-sm">
          搜索课程、教练或编号
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例如 搏击、林晓猫、SC-GRP-01"
            className="h-10 rounded-lg border border-input bg-background px-2.5"
          />
        </label>
        <label className="grid gap-1 text-sm">
          城市
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-2.5"
          >
            <option>全部</option>
            {cities.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          等级
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value as Level | "全部")}
            className="h-10 rounded-lg border border-input bg-background px-2.5"
          >
            {levels.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="flex h-10 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(event) => setOnlyOpen(event.target.checked)}
          />
          仅看有位
        </label>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        {filtered.length} 门课。价格、教练和名额按场次变化，以课程页为准。
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 border border-dashed border-border p-8">
          <p className="font-medium">没有符合条件的课程</p>
          <p className="mt-1 text-sm text-muted-foreground">清空筛选后再看这一板块的全部课程。</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 h-10 px-4"
            onClick={() => {
              setQuery("");
              setCity("全部");
              setLevel("全部");
              setOnlyOpen(false);
            }}
          >
            清空筛选
          </Button>
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {filtered.map((item) => (
            <li key={item.id} className="py-6" data-course-id={item.id}>
              <div className="grid gap-4 md:grid-cols-[1.3fr_0.9fr] md:gap-8">
                <div>
                  <p className="text-xs tracking-wide text-muted-foreground">
                    {item.code} · {item.level} · {item.durationMinutes} 分钟 · 强度{item.intensity}
                  </p>
                  <h2 className="mt-1 font-heading text-3xl">
                    <Link href={`/courses/${item.id}`} className="hover:text-persimmon">
                      {item.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.englishName}</p>
                  <p className="mt-3 max-w-xl leading-6">{item.summary}</p>
                  <p className="mt-3 text-sm">
                    教练 {item.coaches.join("、")} · {item.cities.join("、")} · {item.sessionCount} 个场次 · 可约{" "}
                    {item.bookableCount} 场
                  </p>
                  {item.mixedLevels ? (
                    <p className="mt-1 text-sm text-muted-foreground">部分场次等级不同，以课程页为准。</p>
                  ) : null}
                </div>
                <div className="border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">最近可约</p>
                  {item.next ? (
                    <div className="mt-2 space-y-1 text-sm">
                      <p data-field="time">{item.next.timeLabel}</p>
                      <p data-field="coach">{item.next.coachName}</p>
                      <p data-field="address">
                        {item.next.city} · {item.next.studioName}
                      </p>
                      <p data-field="booked">
                        已预约 {item.next.booked} / {item.next.capacity} 人，剩余 {item.next.remaining}
                      </p>
                      <p data-field="price">{item.priceLabel}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm">当前没有可预约场次。已满或已结束的场次仍可在课程页查看。</p>
                  )}
                  <Link
                    href={`/courses/${item.id}`}
                    className="mt-4 inline-flex h-10 items-center text-sm font-medium text-persimmon"
                  >
                    查看课程与全部场次
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
