import { coaches, courses, sections, studios } from "@/data/catalog";
import { classBananas, classTotal, tierFor } from "@/data/membership";
import { formatSessionTime, shanghaiDateKey } from "@/lib/format";
import { courseImage } from "@/lib/images";

const BEIJING = "guomao";
const TOP_UP = 2000;
const BONUS = 100;

const rows = [
  { id: "AU-0801", courseId: "hiit", start: "2026-08-01T10:00:00+08:00", end: "2026-08-01T10:40:00+08:00", coachId: "gu-yan", price: 109 },
  { id: "AU-0802", courseId: "pt-fat", start: "2026-08-02T10:00:00+08:00", end: "2026-08-02T11:00:00+08:00", coachId: "jiang-cheng", price: 420 },
  { id: "AU-0805", courseId: "hiit", start: "2026-08-05T19:30:00+08:00", end: "2026-08-05T20:10:00+08:00", coachId: "gu-yan", price: 109 },
  { id: "AU-0808", courseId: "ride", start: "2026-08-08T10:00:00+08:00", end: "2026-08-08T10:45:00+08:00", coachId: "ma-zhou", price: 99 },
  { id: "AU-0809", courseId: "battle-rope", start: "2026-08-09T11:00:00+08:00", end: "2026-08-09T11:45:00+08:00", coachId: "gu-yan", price: 129 },
  { id: "AU-0812", courseId: "pt-fat", start: "2026-08-12T19:00:00+08:00", end: "2026-08-12T20:00:00+08:00", coachId: "jiang-cheng", price: 460 },
  { id: "AU-0815", courseId: "pt-fat", start: "2026-08-15T10:30:00+08:00", end: "2026-08-15T11:30:00+08:00", coachId: "jiang-cheng", price: 420 },
  { id: "AU-0816", courseId: "hiit", start: "2026-08-16T10:00:00+08:00", end: "2026-08-16T10:40:00+08:00", coachId: "gu-yan", price: 109 },
  { id: "AU-0819", courseId: "ride", start: "2026-08-19T19:15:00+08:00", end: "2026-08-19T20:00:00+08:00", coachId: "ma-zhou", price: 99 },
  { id: "AU-0822", courseId: "boxing-fit", start: "2026-08-22T10:30:00+08:00", end: "2026-08-22T11:30:00+08:00", coachId: "gu-yan", price: 129 },
  { id: "AU-0823", courseId: "pt-fat", start: "2026-08-23T10:00:00+08:00", end: "2026-08-23T11:00:00+08:00", coachId: "jiang-cheng", price: 420 },
  { id: "AU-0826", courseId: "boxing-fit", start: "2026-08-26T19:00:00+08:00", end: "2026-08-26T20:00:00+08:00", coachId: "gu-yan", price: 129 },
  { id: "AU-0829", courseId: "ride", start: "2026-08-29T10:00:00+08:00", end: "2026-08-29T10:45:00+08:00", coachId: "ma-zhou", price: 99 },
  { id: "AU-0830", courseId: "battle-rope", start: "2026-08-30T11:00:00+08:00", end: "2026-08-30T11:45:00+08:00", coachId: "gu-yan", price: 129 },
] as const;

export type AugustWorkout = {
  id: string;
  courseId: string;
  courseName: string;
  sectionName: string;
  start: string;
  timeLabel: string;
  durationMinutes: number;
  coachName: string;
  place: string;
  listPrice: number;
  paid: number;
  payLabel: string;
  bananas: number;
};

function weekdayOf(iso: string) {
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", weekday: "short" }).format(new Date(iso));
}

function hourOf(iso: string) {
  const hour = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(new Date(iso))
    .find((part) => part.type === "hour")?.value;
  return Number(hour);
}

export function listAugustWorkouts(): AugustWorkout[] {
  const studio = studios.find((item) => item.id === BEIJING);
  if (!studio || studio.city !== "北京") throw new Error("8 月训练必须在北京门店");

  return rows
    .map((row) => {
      const course = courses.find((item) => item.id === row.courseId);
      const coach = coaches.find((item) => item.id === row.coachId);
      const section = sections.find((item) => item.slug === course?.section);
      if (!course || !coach || !section) throw new Error(`8 月训练缺少课程：${row.id}`);
      const minutes = (new Date(row.end).getTime() - new Date(row.start).getTime()) / 60000;
      if (minutes !== course.durationMinutes) throw new Error(`8 月训练时长不符：${row.id}`);
      const weekday = weekdayOf(row.start);
      const hour = hourOf(row.start);
      const afterWork = weekday === "周三" && hour >= 19;
      const weekend = weekday === "周六" || weekday === "周日";
      if (!afterWork && !weekend) throw new Error(`8 月训练不在周三晚上或周末：${row.id} ${weekday}`);
      if (course.section !== "group" && course.section !== "personal") {
        throw new Error(`8 月训练需要团课或私教：${row.id}`);
      }
      const cardHolder = course.section === "group";
      const quote = classTotal(course.section, row.price, 1, cardHolder);
      return {
        id: row.id,
        courseId: course.id,
        courseName: course.name,
        sectionName: section.name,
        start: row.start,
        timeLabel: formatSessionTime(row.start, row.end),
        durationMinutes: course.durationMinutes,
        coachName: coach.name,
        place: `${studio.short} · ${studio.city}`,
        listPrice: row.price,
        paid: quote.total,
        payLabel: course.section === "group" ? `持卡 ¥${quote.total}` : `¥${quote.total}`,
        bananas: classBananas(course.section, 1),
      };
    })
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
}

export function augustTrainingSummary() {
  const items = listAugustWorkouts();
  const group = items.filter((item) => item.sectionName === "团课");
  const personal = items.filter((item) => item.sectionName === "私教");
  const groupPaid = group.reduce((sum, item) => sum + item.paid, 0);
  const personalPaid = personal.reduce((sum, item) => sum + item.paid, 0);
  const credited = TOP_UP + BONUS;
  const bananasEarned = items.reduce((sum, item) => sum + item.bananas, 0);
  return {
    count: items.length,
    days: new Set(items.map((item) => shanghaiDateKey(item.start))).size,
    minutes: items.reduce((sum, item) => sum + item.durationMinutes, 0),
    dayKeys: [...new Set(items.map((item) => shanghaiDateKey(item.start)))],
    image: courseImage(items[0]?.courseId ?? "hiit", items[0]?.courseName ?? "间歇燃脂"),
    groupCount: group.length,
    personalCount: personal.length,
    topUp: TOP_UP,
    bonus: BONUS,
    credited,
    groupPaid,
    personalPaid,
    balance: credited - groupPaid,
    points: bananasEarned,
    tier: tierFor(bananasEarned).name,
    bananasEarned,
  };
}
