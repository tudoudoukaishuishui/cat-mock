import { asset } from "@/lib/asset";
import type { PlateSlug } from "@/lib/outing-types";

const fileById: Record<string, string> = {
  century: "lawn.jpg",
  "nature-sh": "museum.jpg",
  wukang: "street.jpg",
  astro: "space.jpg",
  olympic: "park.jpg",
  "science-bj": "science.jpg",
  beihai: "lake.jpg",
  capital: "hall.jpg",
  bay: "bay.jpg",
  "sz-museum": "hall.jpg",
  oct: "street.jpg",
  people: "tea.jpg",
  "cd-nature": "museum.jpg",
};

const altById: Record<string, string> = {
  century: "公园大树下，大人和孩子走在路边草坪旁",
  "nature-sh": "博物馆展厅里成排的白色雕塑",
  wukang: "秋天的林荫人行道，两个人往前走",
  astro: "星空和星云",
  olympic: "林间小路，阳光从树干之间照下来",
  "science-bj": "夜色里从高处看地球上的城市灯光",
  beihai: "湖面和远处的山",
  capital: "红墙上挂着一排画的展厅",
  bay: "晴天的海边",
  "sz-museum": "红墙上挂着一排画的展厅",
  oct: "秋天的林荫人行道",
  people: "两边开着花的园中小路",
  "cd-nature": "博物馆展厅里成排的白色雕塑",
};

export const familyHero = {
  src: asset("/images/family/hero.jpg"),
  alt: "孩子坐在公园长椅上笑",
};

export const plateImages: Record<PlateSlug, { src: string; alt: string }> = {
  park: { src: asset("/images/family/lawn.jpg"), alt: "公园里大人和孩子在树下走动" },
  indoor: { src: asset("/images/family/museum.jpg"), alt: "室内展厅" },
  walk: { src: asset("/images/family/street.jpg"), alt: "林荫人行道" },
};

export function outingImage(id: string) {
  return {
    src: asset(`/images/family/${fileById[id] ?? "park.jpg"}`),
    alt: altById[id] ?? "周末出门",
  };
}
