import { courses, sections } from "@/data/catalog";
import { courseImage } from "@/lib/images";
import { getCourseView } from "@/lib/queries";
import type { SectionSlug } from "@/lib/types";

const groups = [
  {
    id: "main",
    title: "减脂主课",
    weekly: "每周 2 节",
    detail: "课名和说明就是减脂或燃脂。",
    courseIds: ["pt-fat", "hiit", "ride", "boxing-fit"],
  },
  {
    id: "cardio",
    title: "有氧间歇",
    weekly: "可替换 1 节主课",
    detail: "同样是把心率拉起来的现有课，用来换一节减脂主课。",
    courseIds: ["battle-rope", "medball", "dance", "rebound", "open-box"],
  },
  {
    id: "strength",
    title: "力量",
    weekly: "每周 2 节",
    detail: "循环、杠铃和悬挂带，用来把训练量补上。",
    courseIds: ["power-loop", "bodypump", "trx"],
  },
  {
    id: "recover",
    title: "恢复",
    weekly: "每周 1 节",
    detail: "低强度，排在有氧和力量之后。",
    courseIds: ["fascia", "yin-yoga", "open-stretch"],
  },
] as const;

export type FatLossNext = {
  timeLabel: string;
  city: string;
  coachName: string;
  remaining: number;
  priceLabel: string;
};

export type FatLossMatch = {
  courseId: string;
  name: string;
  englishName: string;
  section: SectionSlug;
  sectionName: string;
  summary: string;
  durationMinutes: number;
  intensity: string;
  imageSrc: string;
  imageAlt: string;
  next: FatLossNext | null;
};

export type FatLossGroup = {
  id: string;
  title: string;
  weekly: string;
  detail: string;
  courses: FatLossMatch[];
};

export function listFatLossPlan(now = Date.now()): FatLossGroup[] {
  return groups.map((group) => ({
    id: group.id,
    title: group.title,
    weekly: group.weekly,
    detail: group.detail,
    courses: group.courseIds.map((courseId) => toMatch(courseId, now)),
  }));
}

function toMatch(courseId: string, now: number): FatLossMatch {
  const course = courses.find((item) => item.id === courseId);
  const view = getCourseView(courseId, now);
  const section = sections.find((item) => item.slug === course?.section);
  if (!course || !view || !section) throw new Error(`减肥匹配缺少课程：${courseId}`);
  const upcoming = view.sessions.find(
    (session) => session.status === "open" && new Date(session.start).getTime() >= now,
  );
  const next = upcoming ?? view.sessions.find((session) => session.status === "open") ?? null;
  const image = courseImage(course.id, course.name);
  return {
    courseId: course.id,
    name: course.name,
    englishName: course.englishName,
    section: course.section,
    sectionName: section.name,
    summary: course.summary,
    durationMinutes: course.durationMinutes,
    intensity: course.intensity,
    imageSrc: image.src,
    imageAlt: image.alt,
    next: next
      ? {
          timeLabel: next.timeLabel,
          city: next.city,
          coachName: next.coachName,
          remaining: next.remaining,
          priceLabel: next.priceLabel,
        }
      : null,
  };
}
