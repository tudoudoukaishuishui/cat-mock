"use client";

import { useEffect, useState } from "react";

import { GroupBookSheet } from "@/components/group-book-sheet";
import { courses, studios } from "@/data/catalog";
import { formatClockRange, shanghaiDateKey } from "@/lib/format";
import { courseImage } from "@/lib/images";
import { localExtra } from "@/lib/local-bookings";
import { withExtraBookings } from "@/lib/queries";
import type { SessionView } from "@/lib/types";
import { cn } from "cn";

function shiftDay(key: string, days: number) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function dayMark(key: string, today: string) {
  if (key === today) return "今";
  if (key === shiftDay(today, 1)) return "明";
  const weekday = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    weekday: "short",
  }).format(new Date(`${key}T12:00:00+08:00`));
  return weekday.replace("周", "");
}

function hourOf(iso: string) {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Shanghai",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date(iso)),
  );
}

function timeSlot(iso: string) {
  const hour = hourOf(iso);
  if (hour < 12) return "上午";
  if (hour < 18) return "下午";
  return "晚上";
}

function unique(values: string[]) {
  return [...new Set(values)];
}

export function GroupTimetable({ sessions, sectionName }: { sessions: SessionView[]; sectionName: string }) {
  const [cards, setCards] = useState(sessions);
  const [city, setCity] = useState("全部");
  const [store, setStore] = useState("全部");
  const [courseId, setCourseId] = useState("全部");
  const [coachId, setCoachId] = useState("全部");
  const [slot, setSlot] = useState("全部");
  const [query, setQuery] = useState("");
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [active, setActive] = useState<SessionView | null>(null);

  useEffect(() => {
    const apply = () => {
      setCards(sessions.map((session) => withExtraBookings(session, localExtra(session.id))));
    };
    apply();
    window.addEventListener("super-cat-bookings", apply);
    return () => window.removeEventListener("super-cat-bookings", apply);
  }, [sessions]);

  const today = shanghaiDateKey(new Date().toISOString());
  const inCity = cards.filter((card) => city === "全部" || card.city === city);
  const cities = unique(cards.map((card) => card.city));
  const stores = unique(inCity.map((card) => card.studioName));
  const courseOptions = unique(inCity.map((card) => card.courseId))
    .map((id) => courses.find((course) => course.id === id))
    .filter((course) => course !== undefined);
  const coachOptions = unique(inCity.map((card) => `${card.coachId}\t${card.coachName}`)).map((item) => {
    const [id, name] = item.split("\t");
    return { id, name };
  });

  const narrowed = inCity.filter((card) => {
    if (store !== "全部" && card.studioName !== store) return false;
    if (courseId !== "全部" && card.courseId !== courseId) return false;
    if (coachId !== "全部" && card.coachId !== coachId) return false;
    if (slot !== "全部" && timeSlot(card.start) !== slot) return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    const course = courses.find((item) => item.id === card.courseId);
    const blob = `${card.courseName} ${course?.englishName ?? ""} ${card.coachName} ${card.studioName}`.toLowerCase();
    return blob.includes(needle);
  });

  const dayKeys = unique(narrowed.map((card) => shanghaiDateKey(card.start))).sort();
  const selectedDay =
    pickedDay && dayKeys.includes(pickedDay) ? pickedDay : (dayKeys.find((key) => key >= today) ?? dayKeys[0] ?? "");
  const statusRank = { open: 0, started: 1, full: 2, ended: 3 };
  const rows = narrowed
    .filter((card) => shanghaiDateKey(card.start) === selectedDay)
    .sort((a, b) => statusRank[a.status] - statusRank[b.status] || a.start.localeCompare(b.start));
  const headline = store !== "全部" ? store : city !== "全部" ? `${city} · 全部门店` : "全部门店";

  return (
    <div className="pt-6 pb-16">
      <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
        {dayKeys.map((key) => {
          const selected = key === selectedDay;
          const mark = dayMark(key, today);
          return (
            <button
              key={key}
              type="button"
              onClick={() => setPickedDay(key)}
              className={cn(
                "flex h-16 w-14 shrink-0 flex-col items-center justify-center border text-sm",
                selected
                  ? "border-persimmon bg-persimmon text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-foreground",
              )}
            >
              <span className="font-heading text-xl leading-none">{Number(key.slice(-2))}</span>
              <span className={cn("mt-1 text-xs", selected ? "text-primary-foreground" : "text-muted-foreground")}>{mark}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.3fr)_repeat(5,minmax(0,1fr))]">
        <label>
          <span className="sr-only">搜索课程、教练或门店</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="搜索课程、教练或门店"
            placeholder="搜索课程、教练或门店"
            className="h-10 w-full border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring"
          />
        </label>
        <Filter
          label="城市"
          value={city}
          onChange={(value) => {
            setCity(value);
            setStore("全部");
          }}
          options={[{ value: "全部", label: "全部城市" }, ...cities.map((item) => ({ value: item, label: item }))]}
        />
        <Filter
          label="门店"
          value={store}
          onChange={setStore}
          options={[{ value: "全部", label: "全部门店" }, ...stores.map((item) => ({ value: item, label: studios.find((studio) => studio.name === item)?.short ?? item }))]}
        />
        <Filter
          label="课程"
          value={courseId}
          onChange={setCourseId}
          options={[{ value: "全部", label: "全部课程" }, ...courseOptions.map((course) => ({ value: course.id, label: course.name }))]}
        />
        <Filter
          label="教练"
          value={coachId}
          onChange={setCoachId}
          options={[{ value: "全部", label: "全部教练" }, ...coachOptions.map((coach) => ({ value: coach.id, label: coach.name }))]}
        />
        <Filter
          label="时间"
          value={slot}
          onChange={setSlot}
          options={[
            { value: "全部", label: "全部时间" },
            { value: "上午", label: "上午" },
            { value: "下午", label: "下午" },
            { value: "晚上", label: "晚上" },
          ]}
        />
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        {headline} · {rows.length} 场
      </p>

      {rows.length === 0 ? (
        <div className="mt-4 border border-dashed border-border p-8">
          <p className="font-medium">这一天没有{sectionName}</p>
          <p className="mt-1 text-sm text-muted-foreground">换一天，或放宽城市、门店和课程筛选。</p>
        </div>
      ) : (
        <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((card) => {
            const course = courses.find((item) => item.id === card.courseId);
            const image = courseImage(card.courseId, card.courseName);
            const place = studios.find((item) => item.name === card.studioName)?.short ?? card.studioName;
            const tags = course ? `${course.level} · 强度${course.intensity}` : "";
            return (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => setActive(card)}
                  data-session-id={card.id}
                  data-status={card.status}
                  data-course={card.courseName}
                  data-coach={card.coachName}
                  data-price={card.price}
                  data-remaining={card.remaining}
                  className="flex h-full w-full gap-3 border border-border bg-card p-3 text-left transition-colors hover:border-persimmon"
                >
                  <img src={image.src} alt="" className="size-16 shrink-0 object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-heading text-xl leading-tight">{card.courseName}</span>
                      {card.status !== "open" ? (
                        <span className="shrink-0 bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{card.statusLabel}</span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs tracking-wide text-muted-foreground uppercase">{course?.englishName}</span>
                    <span className="mt-2 block text-sm">
                      {formatClockRange(card.start, card.end)}
                      {card.start === card.end ? " · 时长待确认" : ""}{" "}
                      <span className="font-medium text-persimmon">{card.priceLabel}</span>
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {card.coachName} · {tags}
                      {tags ? " · " : ""}
                      {place} · 余 {card.remaining}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {active ? <GroupBookSheet session={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full border border-border bg-card px-3 text-sm outline-none focus-visible:border-ring"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
