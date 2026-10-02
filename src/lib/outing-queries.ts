import { activities, getActivity, rainActivity } from "@/data/outings";
import { formatOutingDate, upcomingSaturdays, weekTitle } from "@/lib/outing-dates";
import type {
  Activity,
  AgeFilter,
  BudgetFilter,
  CityName,
  OutingFilters,
  ScheduledStop,
  Stop,
  WeekPlan,
} from "@/lib/outing-types";

export const cities: CityName[] = ["上海", "北京", "深圳", "成都"];

export const ageOptions: Array<{ id: AgeFilter; label: string; hint: string }> = [
  { id: "0-2", label: "0–2 岁", hint: "推车为主" },
  { id: "3-5", label: "3–5 岁", hint: "能走一小段" },
  { id: "6-8", label: "6–8 岁", hint: "能逛半天" },
  { id: "9-12", label: "9–12 岁", hint: "能走完整路线" },
  { id: "全部", label: "年龄不限", hint: "先看这座城市有什么" },
];

export const budgetOptions: Array<{ id: BudgetFilter; label: string; max: number | null }> = [
  { id: "any", label: "预算不限", max: null },
  { id: "0", label: "免费", max: 0 },
  { id: "100", label: "¥100 以内", max: 100 },
  { id: "300", label: "¥300 以内", max: 300 },
  { id: "600", label: "¥600 以内", max: 600 },
];

const ageRange: Record<Exclude<AgeFilter, "全部">, { min: number; max: number }> = {
  "0-2": { min: 0, max: 2 },
  "3-5": { min: 3, max: 5 },
  "6-8": { min: 6, max: 8 },
  "9-12": { min: 9, max: 12 },
};

export const defaultFilters: OutingFilters = {
  city: "上海",
  age: "3-5",
  budget: "300",
  plate: "全部",
  indoorOnly: false,
};

export function defaultSkipped(activity: Activity) {
  return activity.stops.filter((stop) => stop.defaultOff).map((stop) => stop.id);
}

export function planBudget(activity: Activity, skipped: string[]) {
  return activity.stops
    .filter((stop) => !skipped.includes(stop.id))
    .reduce((sum, stop) => sum + (stop.extraBudget ?? 0), activity.budget);
}

export function listedBudget(activity: Activity) {
  return planBudget(activity, defaultSkipped(activity));
}

export function formatBudget(amount: number) {
  if (amount === 0) return "免费";
  return `约 ¥${amount}`;
}

export function formatAge(activity: Activity) {
  return `${activity.ageMin}–${activity.ageMax} 岁`;
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} 分钟`;
  if (rest === 0) return `${hours} 小时`;
  return `${hours} 小时 ${rest} 分`;
}

function clock(total: number) {
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function scheduleStops(start: string, stops: Stop[], skipped: string[]): ScheduledStop[] {
  const [hourText, minuteText] = start.split(":");
  let cursor = Number(hourText) * 60 + Number(minuteText);
  const planned: ScheduledStop[] = [];
  for (const stop of stops) {
    if (skipped.includes(stop.id)) continue;
    const time = clock(cursor);
    cursor += stop.minutes;
    planned.push({ ...stop, time, end: clock(cursor) });
  }
  return planned;
}

export function activeRoute(activity: Activity, skipped: string[]) {
  const stops = scheduleStops(activity.startTime, activity.stops, skipped);
  const minutes = stops.reduce((sum, stop) => sum + stop.minutes, 0);
  return { stops, minutes, budget: planBudget(activity, skipped) };
}

export function ageFits(activity: Activity, age: AgeFilter) {
  if (age === "全部") return true;
  const band = ageRange[age];
  return activity.ageMax >= band.min && activity.ageMin <= band.max;
}

export function childAgeFits(activity: Activity, childAge: number) {
  return childAge >= activity.ageMin && childAge <= activity.ageMax;
}

export function suggestedChildAge(age: AgeFilter) {
  if (age === "0-2") return 1;
  if (age === "3-5") return 4;
  if (age === "6-8") return 7;
  if (age === "9-12") return 10;
  return 4;
}

export function budgetFits(activity: Activity, budget: BudgetFilter) {
  const cap = budgetOptions.find((item) => item.id === budget)?.max;
  if (cap === null || cap === undefined) return true;
  return listedBudget(activity) <= cap;
}

export function matchesFilters(activity: Activity, filters: OutingFilters) {
  if (activity.city !== filters.city) return false;
  if (filters.plate !== "全部" && activity.plate !== filters.plate) return false;
  if (!ageFits(activity, filters.age)) return false;
  if (!budgetFits(activity, filters.budget)) return false;
  if (filters.indoorOnly && activity.setting !== "室内") return false;
  return true;
}

function score(activity: Activity, filters: OutingFilters) {
  let value = 0;
  if (filters.indoorOnly || activity.setting === "室内") value += filters.indoorOnly ? 20 : 0;
  if (!filters.indoorOnly && activity.setting === "户外") value += 8;
  if (filters.age === "0-2" && activity.plate === "park") value += 6;
  if (filters.age === "9-12" && activity.plate === "indoor") value += 10;
  if (filters.age === "3-5" && activity.plate === "park") value += 4;
  value += Math.min(listedBudget(activity), 120) / 40;
  return value;
}

export function filterActivities(filters: OutingFilters) {
  return activities
    .filter((activity) => matchesFilters(activity, filters))
    .sort((a, b) => score(b, filters) - score(a, filters) || a.name.localeCompare(b.name, "zh"));
}

export function weeklyPlans(filters: OutingFilters, now = new Date()): WeekPlan[] {
  const ranked = filterActivities(filters);
  if (ranked.length === 0) return [];
  return upcomingSaturdays(4, now).map((date, index) => ({
    date,
    activity: ranked[index % ranked.length],
    repeated: index >= ranked.length,
  }));
}

export function weekCardTitle(index: number, date: string) {
  return weekTitle(index, date);
}

export function routeSummary(activity: Activity) {
  const route = activeRoute(activity, defaultSkipped(activity));
  const titles = route.stops.map((stop) => stop.title);
  if (titles.length <= 3) return titles.join(" → ");
  return `${titles[0]} → ${titles[1]} → ${titles[titles.length - 1]}`;
}

export function rainNote(activity: Activity, filters: OutingFilters) {
  const backup = rainActivity(activity);
  if (!backup) return { backup: null, warning: null as string | null };
  const warnings: string[] = [];
  if (!ageFits(backup, filters.age) && filters.age !== "全部") {
    warnings.push(`备选适合 ${formatAge(backup)}，和当前年龄不完全重合。`);
  }
  if (!budgetFits(backup, filters.budget)) {
    warnings.push(`备选 ${formatBudget(listedBudget(backup))}，超出当前预算。`);
  }
  return { backup, warning: warnings.length ? warnings.join("") : null };
}

export function parseFilters(input: {
  city?: string;
  age?: string;
  budget?: string;
  plate?: string;
  indoor?: string;
}): OutingFilters {
  const city = cities.find((item) => item === input.city) ?? defaultFilters.city;
  const age = ageOptions.some((item) => item.id === input.age) ? (input.age as AgeFilter) : defaultFilters.age;
  const budget = budgetOptions.some((item) => item.id === input.budget)
    ? (input.budget as BudgetFilter)
    : defaultFilters.budget;
  const plate =
    input.plate === "park" || input.plate === "indoor" || input.plate === "walk" || input.plate === "全部"
      ? input.plate
      : defaultFilters.plate;
  return { city, age, budget, plate, indoorOnly: input.indoor === "1" };
}

export function filtersToQuery(filters: OutingFilters) {
  const params = new URLSearchParams();
  if (filters.city !== defaultFilters.city) params.set("city", filters.city);
  if (filters.age !== defaultFilters.age) params.set("age", filters.age);
  if (filters.budget !== defaultFilters.budget) params.set("budget", filters.budget);
  if (filters.plate !== "全部") params.set("plate", filters.plate);
  if (filters.indoorOnly) params.set("indoor", "1");
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function activityCountByPlate(filters: OutingFilters, plate: OutingFilters["plate"]) {
  return filterActivities({ ...filters, plate, indoorOnly: false }).length;
}

export function describeWhen(date: string) {
  return formatOutingDate(date);
}

export function findActivity(id: string) {
  return getActivity(id);
}

export function shareCopy(input: {
  date: string;
  city: string;
  name: string;
  childAge: number;
  adults: number;
  children: number;
  budget: number;
  route: string[];
  experience: string | null;
  rainy: boolean;
}) {
  const lines = [
    `超级家长 · ${formatOutingDate(input.date)}`,
    `${input.city} · ${input.name}${input.rainy ? "（雨天备选）" : ""}`,
    `孩子 ${input.childAge} 岁 · ${input.adults} 大 ${input.children} 小 · 一家${formatBudget(input.budget)}`,
    `路线：${input.route.join(" → ")}`,
  ];
  if (input.experience) lines.push(`体验：${input.experience}`);
  return lines.join("\n");
}
