"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

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

export function GroupTimetable({ sessions }: { sessions: SessionView[] }) {
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
    <div className="mx-auto min-h-[70vh] w-full max-w-md px-4 pt-2 pb-16">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center py-3">
        <label className="relative inline-flex w-fit items-center text-sm">
          <select
            aria-label="城市"
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
              setStore("全部");
            }}
            className="appearance-none bg-transparent pr-5 text-white outline-none"
          >
            <option value="全部">全部</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 size-3.5 text-white/70" />
        </label>
        <h1 className="text-lg font-semibold">课表</h1>
        <span />
      </div>

      <nav aria-label="课程类型" className="flex gap-6 border-b border-white/10 text-sm">
        <span className="border-b-2 border-[#f5c518] pb-2 font-medium">团课</span>
        <Link href="/sections/personal" className="pb-2 text-white/50">
          私教
        </Link>
        <Link href="/sections/open" className="pb-2 text-white/50">
          公开课
        </Link>
      </nav>

      <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
        {dayKeys.map((key) => {
          const selected = key === selectedDay;
          const mark = dayMark(key, today);
          return (
            <button
              key={key}
              type="button"
              onClick={() => setPickedDay(key)}
              className="flex w-12 shrink-0 flex-col items-center gap-1"
            >
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full text-sm font-semibold",
                  selected ? "bg-[#f5a623] text-black" : mark === "今" ? "bg-[#f6c445] text-black" : "text-white",
                )}
              >
                {Number(key.slice(-2))}
              </span>
              <span className={cn("text-[11px]", selected ? "text-white" : "text-white/55")}>{mark}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 text-xs">
        <label className="flex h-8 shrink-0 items-center rounded-full bg-[#2a2a2a] px-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="搜索课程、教练或门店"
            className="w-14 bg-transparent outline-none placeholder:text-white/55"
            placeholder="搜索"
          />
        </label>
        <Filter
          label="课程"
          value={courseId}
          onChange={setCourseId}
          options={[{ value: "全部", label: "全部" }, ...courseOptions.map((course) => ({ value: course.id, label: course.name }))]}
        />
        <Filter
          label="门店"
          value={store}
          onChange={setStore}
          options={[{ value: "全部", label: "全部" }, ...stores.map((item) => ({ value: item, label: item }))]}
        />
        <Filter
          label="教练"
          value={coachId}
          onChange={setCoachId}
          options={[{ value: "全部", label: "全部" }, ...coachOptions.map((coach) => ({ value: coach.id, label: coach.name }))]}
        />
        <Filter
          label="时间"
          value={slot}
          onChange={setSlot}
          options={[
            { value: "全部", label: "全部" },
            { value: "上午", label: "上午" },
            { value: "下午", label: "下午" },
            { value: "晚上", label: "晚上" },
          ]}
        />
      </div>

      <p className="mt-4 text-sm text-white/80">{headline}</p>

      <ul className="mt-3 space-y-3">
        {rows.map((card) => {
          const course = courses.find((item) => item.id === card.courseId);
          const image = courseImage(card.courseId, card.courseName);
          const place = studios.find((item) => item.name === card.studioName)?.short ?? card.studioName;
          const tags = course ? `${course.level} · ${course.intensity}` : "";
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
                className="flex w-full gap-3 rounded-2xl bg-[#1c1c1c] p-3 text-left"
              >
                <img src={image.src} alt="" className="size-14 shrink-0 rounded-full object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-medium">
                      {card.courseName}{" "}
                      <span className="text-sm font-normal text-white/45 uppercase">{course?.englishName}</span>
                    </span>
                    {card.status !== "open" ? (
                      <span className="shrink-0 rounded bg-[#f5a623] px-1.5 py-0.5 text-[10px] font-medium text-black">
                        {card.statusLabel}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm text-white/80">
                    {formatClockRange(card.start, card.end)}{" "}
                    <span className="text-[#f6c445]">{card.price === 0 ? "免费" : `¥${card.price}`}</span>
                  </span>
                  <span className="mt-1 block text-xs text-white/40">
                    {tags}
                    {tags ? " · " : ""}
                    {place} · 余 {card.remaining}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {rows.length === 0 ? <p className="mt-8 text-center text-sm text-white/45">这一天没有团课</p> : null}
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
  const current = options.find((option) => option.value === value);
  const text = !current || current.value === "全部" ? label : current.label;
  return (
    <label className="relative flex h-8 shrink-0 items-center rounded-full bg-[#2a2a2a] pr-7 pl-3">
      <span className="max-w-24 truncate">{text}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-white/60" />
    </label>
  );
}
