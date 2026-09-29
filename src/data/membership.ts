import { courses, sessions } from "@/data/catalog";

const groupCourseIds = new Set(courses.filter((course) => course.section === "group").map((course) => course.id));
const groupPrices = sessions
  .filter((session) => groupCourseIds.has(session.courseId) && session.price > 0)
  .map((session) => session.price);

export const GROUP_FROM_PRICE = Math.min(...groupPrices);
export const GYM_HOUR_PRICE = 50;
export const CARD_GROUP_RATE = 0.95;

export const topUps = [
  { id: "288", amount: 288, bonus: 0, firstOnly: true, badge: "首充专享" },
  { id: "500", amount: 500, bonus: 0, firstOnly: false, badge: "" },
  { id: "2000", amount: 2000, bonus: 100, firstOnly: false, badge: "" },
  { id: "5000", amount: 5000, bonus: 250, firstOnly: false, badge: "" },
] as const;

export type TopUpId = (typeof topUps)[number]["id"];

export const tiers = [
  { name: "新会员", points: 0, perk: "完课后开始累计香蕉。本站不能兑换权益。" },
  { name: "银卡", points: 20, perk: "说明中有一张 ¥10 团课抵扣券。本站不能兑换，也不扣香蕉。" },
  { name: "金卡", points: 80, perk: "说明中有 1 小时自助健身。本站不能兑换。" },
  { name: "铂金", points: 200, perk: "说明中有生日券和满员候补。本站不能发放，也不能排队。" },
  { name: "钻石", points: 500, perk: "说明中有换课。仍受该课取消时限约束，本站不能代为改期。" },
] as const;

export const benefits = [
  { title: "训练成就", detail: "上课打卡，点亮成就" },
  { title: "训练奖励", detail: "香蕉兑换券和课时" },
  { title: "满员等候", detail: "满员场次可以排队" },
  { title: "新课体验", detail: "新课上线优先试听" },
  { title: "训练排名", detail: "按城市查看上课排名" },
  { title: "生日礼券", detail: "生日当月赠送礼券" },
  { title: "无忧换课", detail: "改约仍受 6 小时或 24 小时时限约束" },
] as const;

export const bananaRates = [
  { name: "团课", rate: "1 根香蕉 / 人，完课后入账" },
  { name: "私教", rate: "1.5 根香蕉 / 节，固定 1 人" },
  { name: "公开课", rate: "完课不获得香蕉" },
  { name: "自助健身", rate: "0.5 根香蕉 / 小时，本站不能预约" },
] as const;

export function tierFor(points: number) {
  return [...tiers].reverse().find((tier) => points >= tier.points) ?? tiers[0];
}

export function classBananas(section: "group" | "personal" | "open", seats: number) {
  if (section === "personal") return 1.5;
  if (section === "group") return seats;
  return 0;
}

export function classTotal(
  section: "group" | "personal" | "open",
  unitPrice: number,
  headcount: number,
  cardHolder = false,
) {
  const listTotal = unitPrice * (section === "personal" ? 1 : headcount);
  const notes: string[] = [];
  let total = listTotal;
  if (cardHolder && section === "group" && unitPrice > 0) {
    total = Math.round(total * CARD_GROUP_RATE);
    notes.push("持卡预约团课，95 折");
  }
  if (section === "group" && headcount >= 2 && unitPrice > 0) {
    total = Math.round(total * 0.9);
    notes.push("同一订单 2 人或 3 人，打 9 折");
  }
  return { listTotal, total, note: notes.join("；") };
}
