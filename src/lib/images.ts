import type { SectionSlug } from "@/lib/types";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string) {
  return `${base}${path}`;
}

export const heroImage = {
  src: asset("/images/hero.jpg"),
  alt: "超级猫咪门店里，学员在柿红色墙面前做弓步和哑铃训练",
};

export const sectionImages: Record<SectionSlug, { src: string; alt: string }> = {
  group: { src: asset("/images/section-group.jpg"), alt: "团课现场，教练带十几位学员一起深蹲" },
  personal: { src: asset("/images/section-personal.jpg"), alt: "私教一对一纠正学员的壶铃硬拉动作" },
  open: { src: asset("/images/section-open.jpg"), alt: "清晨公园草坪上的公开拉伸课" },
};

const kind: Record<string, string> = {
  bodycombat: "boxing",
  bodypump: "strength",
  "power-loop": "strength",
  trx: "strength",
  "battle-rope": "hiit",
  medball: "hiit",
  rpm: "ride",
  bodyjam: "dance",
  rebound: "hiit",
  barre: "dance",
  "mind-body": "stretch",
  hyrox: "hiit",
  "pt-foundation": "strength",
  "pt-fat": "hiit",
  "pt-muscle": "strength",
  "pt-control": "pilates",
  "pt-performance": "hiit",
  "open-public": "intro",
  "open-chengdu": "intro",
};

const kindAlt: Record<string, string> = {
  boxing: "戴拳套的学员对着手靶出拳",
  stretch: "学员在垫子上做坐姿前屈拉伸",
  strength: "学员用哑铃和杠铃做力量训练",
  ride: "暖色灯光下的室内骑行课",
  dance: "镜子前一起跳有氧舞蹈的学员",
  pilates: "学员在垫子上做普拉提核心动作",
  hiit: "学员做波比跳和跳蹲的间歇训练",
  intro: "教练给新学员讲解动作和场馆",
};

export function courseImage(courseId: string, courseName: string) {
  const key = kind[courseId] ?? "intro";
  return { src: asset(`/images/course-${key}.jpg`), alt: `${courseName}：${kindAlt[key]}` };
}
