const TZ = "Asia/Shanghai";

function parts(date: Date) {
  const map: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat("zh-CN", {
    timeZone: TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return map;
}

export function formatSessionTime(startIso: string, endIso: string) {
  const start = parts(new Date(startIso));
  const end = parts(new Date(endIso));
  return `${start.year}年${start.month}月${start.day}日 ${start.weekday} ${start.hour}:${start.minute}–${end.hour}:${end.minute}`;
}

export function formatDateTime(iso: string) {
  const value = parts(new Date(iso));
  return `${value.year}年${value.month}月${value.day}日 ${value.weekday} ${value.hour}:${value.minute}`;
}

export function formatPrice(price: number) {
  if (price === 0) return "免费";
  return `¥${price} / 人`;
}

export function formatPriceRange(min: number, max: number) {
  if (min === 0 && max === 0) return "免费";
  if (min === 0) return `免费–¥${max} / 人`;
  if (min === max) return `¥${min} / 人`;
  return `¥${min}–¥${max} / 人`;
}

export function formatTotal(price: number, partySize: number) {
  return `¥${price * partySize}`;
}
