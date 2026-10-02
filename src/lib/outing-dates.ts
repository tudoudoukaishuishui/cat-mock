const TZ = "Asia/Shanghai";

export function shanghaiKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addDays(key: string, days: number) {
  const date = new Date(`${key}T04:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return shanghaiKey(date);
}

/** 0 周日 … 6 周六，按北京时间。 */
export function weekdayIndex(key: string) {
  const date = new Date(`${key}T04:00:00Z`);
  const short = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(short);
}

const weekdayLabel = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function formatOutingDate(key: string) {
  const date = new Date(`${key}T04:00:00Z`);
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: TZ,
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return `${month}月${day}日 ${weekdayLabel[weekdayIndex(key)]}`;
}

export function upcomingSaturdays(count: number, now = new Date()) {
  const today = shanghaiKey(now);
  const weekday = weekdayIndex(today);
  const delta = (6 - weekday + 7) % 7;
  const dates: string[] = [];
  let cursor = addDays(today, delta);
  for (let index = 0; index < count; index += 1) {
    dates.push(cursor);
    cursor = addDays(cursor, 7);
  }
  return dates;
}

export function bookableDates(now = new Date()) {
  const today = shanghaiKey(now);
  const dates = upcomingSaturdays(4, now).flatMap((saturday) => [saturday, addDays(saturday, 1)]);
  return dates.filter((date) => date >= today);
}

export function pastWeekendDates(count: number, now = new Date()) {
  const today = shanghaiKey(now);
  const dates: string[] = [];
  let cursor = addDays(today, -1);
  while (dates.length < count) {
    const weekday = weekdayIndex(cursor);
    if (weekday === 6 || weekday === 0) dates.push(cursor);
    cursor = addDays(cursor, -1);
  }
  return dates;
}

export function isOnOrBeforeToday(key: string, now = new Date()) {
  return key <= shanghaiKey(now);
}

export function weekTitle(index: number, date: string) {
  if (index === 0) return "本周";
  if (index === 1) return "下周";
  return formatOutingDate(date).split(" ")[0];
}
