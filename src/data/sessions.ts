import type { Level, PriceStatus, Session } from "@/lib/types";

type Draft = {
  id: string;
  courseId: string;
  day: string;
  time: string;
  coachId: string;
  studioId: string;
  room: string;
  level: Level;
  capacity: number;
  booked: number;
  priceStatus: PriceStatus;
  notes?: string[];
};

function at(day: string, time: string) {
  return `${day}T${time}:00+08:00`;
}

function build(draft: Draft): Session {
  const start = at(draft.day, draft.time);
  return {
    id: draft.id,
    courseId: draft.courseId,
    start,
    end: start,
    coachId: draft.coachId,
    studioId: draft.studioId,
    room: draft.room,
    level: draft.level,
    capacity: draft.capacity,
    booked: draft.booked,
    price: 0,
    priceStatus: draft.priceStatus,
    notes: ["单节时长待确认。", ...(draft.notes ?? [])],
  };
}

const drafts: Draft[] = [
  { id: "bodycombat-0929-1900-jingan", courseId: "bodycombat", day: "2026-09-29", time: "19:00", coachId: "lin-xiaolan", studioId: "jingan", room: "团课教室 A", level: "初中级", capacity: 20, booked: 8, priceStatus: "pending" },
  { id: "bodycombat-1002-1830-guomao", courseId: "bodycombat", day: "2026-10-02", time: "18:30", coachId: "gu-yan", studioId: "guomao", room: "团课教室 A", level: "中级", capacity: 18, booked: 6, priceStatus: "pending", notes: ["这一场按中级节奏，仍可选低冲击版本。"] },
  { id: "bodycombat-1005-1930-taikoo", courseId: "bodycombat", day: "2026-10-05", time: "19:30", coachId: "lin-xiaolan", studioId: "taikoo", room: "团课教室 A", level: "初中级", capacity: 16, booked: 4, priceStatus: "pending" },
  { id: "bodypump-0930-1210-jingan", courseId: "bodypump", day: "2026-09-30", time: "12:10", coachId: "chen-yuan", studioId: "jingan", room: "力量教室", level: "初中级", capacity: 16, booked: 7, priceStatus: "pending", notes: ["首次参加从轻重量开始。"] },
  { id: "bodypump-1003-1100-guomao", courseId: "bodypump", day: "2026-10-03", time: "11:00", coachId: "chen-yuan", studioId: "guomao", room: "力量教室", level: "初中级", capacity: 16, booked: 5, priceStatus: "pending" },
  { id: "bodypump-1006-1840-taikoo", courseId: "bodypump", day: "2026-10-06", time: "18:40", coachId: "tang-xiaoman", studioId: "taikoo", room: "力量教室", level: "初中级", capacity: 14, booked: 3, priceStatus: "pending" },
  { id: "power-loop-0929-0710-bay", courseId: "power-loop", day: "2026-09-29", time: "07:10", coachId: "chen-yuan", studioId: "bay", room: "团课教室 B", level: "中级", capacity: 16, booked: 9, priceStatus: "pending" },
  { id: "power-loop-1001-1910-jingan", courseId: "power-loop", day: "2026-10-01", time: "19:10", coachId: "tang-xiaoman", studioId: "jingan", room: "团课教室 B", level: "中级", capacity: 18, booked: 10, priceStatus: "pending" },
  { id: "power-loop-1004-1000-taikoo", courseId: "power-loop", day: "2026-10-04", time: "10:00", coachId: "jiang-cheng", studioId: "taikoo", room: "团课教室 B", level: "中级", capacity: 14, booked: 2, priceStatus: "pending" },
  { id: "trx-0930-1830-jingan", courseId: "trx", day: "2026-09-30", time: "18:30", coachId: "he-qinghe", studioId: "jingan", room: "团课教室 C", level: "初中级", capacity: 12, booked: 6, priceStatus: "pending" },
  { id: "trx-1003-0930-guomao", courseId: "trx", day: "2026-10-03", time: "09:30", coachId: "he-qinghe", studioId: "guomao", room: "团课教室 C", level: "中级", capacity: 12, booked: 4, priceStatus: "pending" },
  { id: "trx-1007-1900-bay", courseId: "trx", day: "2026-10-07", time: "19:00", coachId: "qiao-mu", studioId: "bay", room: "团课教室 C", level: "初中级", capacity: 12, booked: 1, priceStatus: "pending" },
  { id: "battle-rope-1001-1800-jingan", courseId: "battle-rope", day: "2026-10-01", time: "18:00", coachId: "tang-xiaoman", studioId: "jingan", room: "体能区", level: "中级", capacity: 14, booked: 8, priceStatus: "pending", notes: ["训练密度较高，可按疲劳降低速度或休息。"] },
  { id: "battle-rope-1004-1930-guomao", courseId: "battle-rope", day: "2026-10-04", time: "19:30", coachId: "jiang-cheng", studioId: "guomao", room: "体能区", level: "中高级", capacity: 12, booked: 7, priceStatus: "pending" },
  { id: "battle-rope-1006-1200-taikoo", courseId: "battle-rope", day: "2026-10-06", time: "12:00", coachId: "tang-xiaoman", studioId: "taikoo", room: "体能区", level: "中级", capacity: 12, booked: 2, priceStatus: "pending" },
  { id: "medball-0930-2000-bay", courseId: "medball", day: "2026-09-30", time: "20:00", coachId: "jiang-cheng", studioId: "bay", room: "团课教室 B", level: "中级", capacity: 14, booked: 5, priceStatus: "pending" },
  { id: "medball-1002-1915-jingan", courseId: "medball", day: "2026-10-02", time: "19:15", coachId: "chen-yuan", studioId: "jingan", room: "团课教室 B", level: "中级", capacity: 16, booked: 6, priceStatus: "pending" },
  { id: "medball-1005-1100-guomao", courseId: "medball", day: "2026-10-05", time: "11:00", coachId: "jiang-cheng", studioId: "guomao", room: "团课教室 B", level: "中级", capacity: 14, booked: 3, priceStatus: "pending" },
  { id: "rpm-0929-0930-jingan", courseId: "rpm", day: "2026-09-29", time: "09:30", coachId: "ma-zhou", studioId: "jingan", room: "单车房", level: "初中级", capacity: 20, booked: 11, priceStatus: "pending", notes: ["首次上课请提前到，让教练协助调车。"] },
  { id: "rpm-1002-1845-bay", courseId: "rpm", day: "2026-10-02", time: "18:45", coachId: "ma-zhou", studioId: "bay", room: "单车房", level: "中级", capacity: 18, booked: 9, priceStatus: "pending" },
  { id: "rpm-1006-1000-taikoo", courseId: "rpm", day: "2026-10-06", time: "10:00", coachId: "ma-zhou", studioId: "taikoo", room: "单车房", level: "初中级", capacity: 16, booked: 4, priceStatus: "pending" },
  { id: "bodyjam-1001-1930-jingan", courseId: "bodyjam", day: "2026-10-01", time: "19:30", coachId: "su-wan", studioId: "jingan", room: "舞蹈教室", level: "初中级", capacity: 18, booked: 8, priceStatus: "pending" },
  { id: "bodyjam-1004-1410-bay", courseId: "bodyjam", day: "2026-10-04", time: "14:10", coachId: "su-wan", studioId: "bay", room: "舞蹈教室", level: "中级", capacity: 16, booked: 5, priceStatus: "pending" },
  { id: "bodyjam-1007-1900-guomao", courseId: "bodyjam", day: "2026-10-07", time: "19:00", coachId: "su-wan", studioId: "guomao", room: "舞蹈教室", level: "初中级", capacity: 16, booked: 2, priceStatus: "pending" },
  { id: "rebound-0930-1730-jingan", courseId: "rebound", day: "2026-09-30", time: "17:30", coachId: "tang-xiaoman", studioId: "jingan", room: "蹦床区", level: "中级", capacity: 12, booked: 6, priceStatus: "pending", notes: ["有跳跃限制的人请先咨询专业人员。"] },
  { id: "rebound-1003-1100-taikoo", courseId: "rebound", day: "2026-10-03", time: "11:00", coachId: "qiao-mu", studioId: "taikoo", room: "蹦床区", level: "中级", capacity: 10, booked: 3, priceStatus: "pending" },
  { id: "rebound-1006-1830-bay", courseId: "rebound", day: "2026-10-06", time: "18:30", coachId: "tang-xiaoman", studioId: "bay", room: "蹦床区", level: "中级", capacity: 12, booked: 4, priceStatus: "pending" },
  { id: "barre-0929-1830-guomao", courseId: "barre", day: "2026-09-29", time: "18:30", coachId: "he-qinghe", studioId: "guomao", room: "舞蹈教室", level: "初中级", capacity: 14, booked: 7, priceStatus: "pending" },
  { id: "barre-1002-1210-jingan", courseId: "barre", day: "2026-10-02", time: "12:10", coachId: "su-wan", studioId: "jingan", room: "舞蹈教室", level: "初中级", capacity: 14, booked: 5, priceStatus: "pending" },
  { id: "barre-1005-1000-taikoo", courseId: "barre", day: "2026-10-05", time: "10:00", coachId: "he-qinghe", studioId: "taikoo", room: "舞蹈教室", level: "初中级", capacity: 12, booked: 2, priceStatus: "pending" },
  { id: "mind-body-0929-1500-jingan", courseId: "mind-body", day: "2026-09-29", time: "15:00", coachId: "zhou-ning", studioId: "jingan", room: "瑜伽教室", level: "入门", capacity: 16, booked: 6, priceStatus: "pending", notes: ["具体课名到店确认为基础或舒缓，不能默认全部低强度，也不包含大器械普拉提。"] },
  { id: "mind-body-1002-1200-guomao", courseId: "mind-body", day: "2026-10-02", time: "12:00", coachId: "he-qinghe", studioId: "guomao", room: "瑜伽教室", level: "中级", capacity: 14, booked: 8, priceStatus: "pending", notes: ["这一场按中级控制练习，不是大器械普拉提。"] },
  { id: "mind-body-1006-1840-taikoo", courseId: "mind-body", day: "2026-10-06", time: "18:40", coachId: "zhou-ning", studioId: "taikoo", room: "瑜伽教室", level: "入门", capacity: 14, booked: 3, priceStatus: "pending" },
  { id: "hyrox-1001-0630-jingan", courseId: "hyrox", day: "2026-10-01", time: "06:30", coachId: "jiang-cheng", studioId: "jingan", room: "体能区", level: "中高级", capacity: 12, booked: 9, priceStatus: "pending", notes: ["入门班是否开放需单独确认。价格不套用普通团课区间。"] },
  { id: "hyrox-1004-0900-guomao", courseId: "hyrox", day: "2026-10-04", time: "09:00", coachId: "chen-yuan", studioId: "guomao", room: "体能区", level: "中级", capacity: 12, booked: 6, priceStatus: "pending", notes: ["价格待确认，不使用 69 元起或 179 元作为本课售价。"] },
  { id: "hyrox-1007-1830-taikoo", courseId: "hyrox", day: "2026-10-07", time: "18:30", coachId: "jiang-cheng", studioId: "taikoo", room: "体能区", level: "中高级", capacity: 10, booked: 4, priceStatus: "pending" },
  { id: "pt-foundation-0929-1000-jingan", courseId: "pt-foundation", day: "2026-09-29", time: "10:00", coachId: "chen-yuan", studioId: "jingan", room: "私教室 1", level: "入门", capacity: 1, booked: 0, priceStatus: "pending" },
  { id: "pt-foundation-1002-1700-guomao", courseId: "pt-foundation", day: "2026-10-02", time: "17:00", coachId: "chen-yuan", studioId: "guomao", room: "私教室 1", level: "入门", capacity: 1, booked: 0, priceStatus: "pending" },
  { id: "pt-foundation-1006-0930-taikoo", courseId: "pt-foundation", day: "2026-10-06", time: "09:30", coachId: "pei-nanxing", studioId: "taikoo", room: "私教室 1", level: "入门", capacity: 1, booked: 1, priceStatus: "pending" },
  { id: "pt-fat-0930-1800-jingan", courseId: "pt-fat", day: "2026-09-30", time: "18:00", coachId: "jiang-cheng", studioId: "jingan", room: "私教室 2", level: "入门", capacity: 1, booked: 0, priceStatus: "pending", notes: ["不承诺固定减重数值。"] },
  { id: "pt-fat-1003-0730-guomao", courseId: "pt-fat", day: "2026-10-03", time: "07:30", coachId: "jiang-cheng", studioId: "guomao", room: "私教室 2", level: "中级", capacity: 1, booked: 0, priceStatus: "pending" },
  { id: "pt-fat-1007-1200-taikoo", courseId: "pt-fat", day: "2026-10-07", time: "12:00", coachId: "tang-xiaoman", studioId: "taikoo", room: "私教室 2", level: "入门", capacity: 1, booked: 0, priceStatus: "pending" },
  { id: "pt-muscle-1001-1600-jingan", courseId: "pt-muscle", day: "2026-10-01", time: "16:00", coachId: "chen-yuan", studioId: "jingan", room: "私教室 1", level: "初中级", capacity: 1, booked: 0, priceStatus: "pending" },
  { id: "pt-muscle-1004-1100-bay", courseId: "pt-muscle", day: "2026-10-04", time: "11:00", coachId: "chen-yuan", studioId: "bay", room: "私教室 1", level: "中高级", capacity: 1, booked: 1, priceStatus: "pending" },
  { id: "pt-muscle-1006-1900-guomao", courseId: "pt-muscle", day: "2026-10-06", time: "19:00", coachId: "jiang-cheng", studioId: "guomao", room: "私教室 1", level: "中级", capacity: 1, booked: 0, priceStatus: "pending" },
  { id: "pt-control-0929-1530-jingan", courseId: "pt-control", day: "2026-09-29", time: "15:30", coachId: "pei-nanxing", studioId: "jingan", room: "私教室 2", level: "入门", capacity: 1, booked: 0, priceStatus: "pending", notes: ["有持续疼痛或伤病，请先做医疗评估。本课不替代诊疗。"] },
  { id: "pt-control-1003-1400-guomao", courseId: "pt-control", day: "2026-10-03", time: "14:00", coachId: "he-qinghe", studioId: "guomao", room: "私教室 2", level: "中级", capacity: 1, booked: 0, priceStatus: "pending" },
  { id: "pt-control-1005-1000-taikoo", courseId: "pt-control", day: "2026-10-05", time: "10:00", coachId: "pei-nanxing", studioId: "taikoo", room: "私教室 2", level: "入门", capacity: 1, booked: 0, priceStatus: "pending" },
  { id: "pt-performance-1002-0630-jingan", courseId: "pt-performance", day: "2026-10-02", time: "06:30", coachId: "jiang-cheng", studioId: "jingan", room: "私教室 1", level: "中级", capacity: 1, booked: 0, priceStatus: "pending", notes: ["专项服务是否另价需确认。教练专项范围不按职级默认。"] },
  { id: "pt-performance-1005-1730-guomao", courseId: "pt-performance", day: "2026-10-05", time: "17:30", coachId: "chen-yuan", studioId: "guomao", room: "私教室 1", level: "中高级", capacity: 1, booked: 1, priceStatus: "pending" },
  { id: "pt-performance-1007-0800-taikoo", courseId: "pt-performance", day: "2026-10-07", time: "08:00", coachId: "jiang-cheng", studioId: "taikoo", room: "私教室 1", level: "中级", capacity: 1, booked: 0, priceStatus: "pending" },
  { id: "open-public-0930-1400-jingan", courseId: "open-public", day: "2026-09-30", time: "14:00", coachId: "tang-xiaoman", studioId: "jingan", room: "团课教室 A", level: "入门", capacity: 16, booked: 4, priceStatus: "pending", notes: ["价格待确认，不是免费预约。"] },
  { id: "open-public-1002-1100-guomao", courseId: "open-public", day: "2026-10-02", time: "11:00", coachId: "gu-yan", studioId: "guomao", room: "团课教室 A", level: "入门", capacity: 16, booked: 3, priceStatus: "pending" },
  { id: "open-public-1005-1530-bay", courseId: "open-public", day: "2026-10-05", time: "15:30", coachId: "qiao-mu", studioId: "bay", room: "团课教室 A", level: "入门", capacity: 12, booked: 2, priceStatus: "pending" },
  { id: "open-chengdu-1001-1500-taikoo", courseId: "open-chengdu", day: "2026-10-01", time: "15:00", coachId: "zhou-ning", studioId: "taikoo", room: "多功能教室", level: "入门", capacity: 20, booked: 5, priceStatus: "consult", notes: ["未公布收费。面向校外公众的报名资格未确认。"] },
  { id: "open-chengdu-1004-1000-taikoo", courseId: "open-chengdu", day: "2026-10-04", time: "10:00", coachId: "qiao-mu", studioId: "taikoo", room: "多功能教室", level: "入门", capacity: 20, booked: 2, priceStatus: "consult", notes: ["请使用咨询报名，不要按免费预约理解。"] },
  { id: "open-chengdu-1007-1600-taikoo", courseId: "open-chengdu", day: "2026-10-07", time: "16:00", coachId: "tang-xiaoman", studioId: "taikoo", room: "多功能教室", level: "入门", capacity: 16, booked: 1, priceStatus: "consult" },
];

export const sessions: Session[] = drafts.map(build);
