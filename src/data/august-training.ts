import { coaches, courses, sections, studios } from "@/data/catalog";
import { shanghaiDateKey, formatSessionTime } from "@/lib/format";
import { courseImage } from "@/lib/images";

const rows = [
  { id: "AU-0803", courseId: "hiit", start: "2026-08-03T18:30:00+08:00", end: "2026-08-03T19:10:00+08:00", coachId: "tang-xiaoman", studioId: "jingan" },
  { id: "AU-0805", courseId: "ride", start: "2026-08-05T19:15:00+08:00", end: "2026-08-05T20:00:00+08:00", coachId: "ma-zhou", studioId: "guomao" },
  { id: "AU-0806", courseId: "pt-fat", start: "2026-08-06T07:30:00+08:00", end: "2026-08-06T08:30:00+08:00", coachId: "jiang-cheng", studioId: "jingan" },
  { id: "AU-0808", courseId: "boxing-fit", start: "2026-08-08T19:00:00+08:00", end: "2026-08-08T20:00:00+08:00", coachId: "lin-xiaolan", studioId: "bay" },
  { id: "AU-0810", courseId: "hiit", start: "2026-08-10T18:30:00+08:00", end: "2026-08-10T19:10:00+08:00", coachId: "tang-xiaoman", studioId: "jingan" },
  { id: "AU-0812", courseId: "battle-rope", start: "2026-08-12T20:10:00+08:00", end: "2026-08-12T20:55:00+08:00", coachId: "gu-yan", studioId: "guomao" },
  { id: "AU-0813", courseId: "pt-fat", start: "2026-08-13T07:30:00+08:00", end: "2026-08-13T08:30:00+08:00", coachId: "jiang-cheng", studioId: "guomao" },
  { id: "AU-0815", courseId: "dance", start: "2026-08-15T19:00:00+08:00", end: "2026-08-15T19:55:00+08:00", coachId: "su-wan", studioId: "taikoo" },
  { id: "AU-0817", courseId: "ride", start: "2026-08-17T19:15:00+08:00", end: "2026-08-17T20:00:00+08:00", coachId: "ma-zhou", studioId: "jingan" },
  { id: "AU-0819", courseId: "hiit", start: "2026-08-19T18:40:00+08:00", end: "2026-08-19T19:20:00+08:00", coachId: "tang-xiaoman", studioId: "bay" },
  { id: "AU-0820", courseId: "pt-fat", start: "2026-08-20T07:30:00+08:00", end: "2026-08-20T08:30:00+08:00", coachId: "jiang-cheng", studioId: "taikoo" },
  { id: "AU-0822", courseId: "boxing-fit", start: "2026-08-22T19:00:00+08:00", end: "2026-08-22T20:00:00+08:00", coachId: "lin-xiaolan", studioId: "guomao" },
  { id: "AU-0824", courseId: "power-loop", start: "2026-08-24T07:10:00+08:00", end: "2026-08-24T08:00:00+08:00", coachId: "chen-yuan", studioId: "jingan" },
  { id: "AU-0826", courseId: "ride", start: "2026-08-26T19:15:00+08:00", end: "2026-08-26T20:00:00+08:00", coachId: "ma-zhou", studioId: "bay" },
  { id: "AU-0827", courseId: "fascia", start: "2026-08-27T12:30:00+08:00", end: "2026-08-27T13:15:00+08:00", coachId: "qiao-mu", studioId: "jingan" },
  { id: "AU-0829", courseId: "hiit", start: "2026-08-29T10:00:00+08:00", end: "2026-08-29T10:40:00+08:00", coachId: "tang-xiaoman", studioId: "jingan" },
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
};

export function listAugustWorkouts(): AugustWorkout[] {
  return rows
    .map((row) => {
      const course = courses.find((item) => item.id === row.courseId);
      const coach = coaches.find((item) => item.id === row.coachId);
      const studio = studios.find((item) => item.id === row.studioId);
      const section = sections.find((item) => item.slug === course?.section);
      if (!course || !coach || !studio || !section) throw new Error(`8 月训练缺少课程：${row.id}`);
      const minutes = (new Date(row.end).getTime() - new Date(row.start).getTime()) / 60000;
      if (minutes !== course.durationMinutes) {
        throw new Error(`8 月训练时长不符：${row.id}`);
      }
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
      };
    })
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
}

export function augustTrainingSummary() {
  const items = listAugustWorkouts();
  return {
    count: items.length,
    days: new Set(items.map((item) => shanghaiDateKey(item.start))).size,
    minutes: items.reduce((sum, item) => sum + item.durationMinutes, 0),
    dayKeys: [...new Set(items.map((item) => shanghaiDateKey(item.start)))],
    image: courseImage(items[0]?.courseId ?? "hiit", items[0]?.courseName ?? "间歇燃脂"),
  };
}
