export const GROUP_FROM_PRICE = 69;
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
  { name: "新会员", points: 0, perk: "完成充值后开始累计积分。" },
  { name: "银卡", points: 200, perk: "可兑换一张 ¥10 团课抵扣券。" },
  { name: "金卡", points: 800, perk: "可兑换 1 小时自助健身。" },
  { name: "铂金", points: 2000, perk: "生日当月赠送团课券，满员场次优先候补。" },
  { name: "钻石", points: 5000, perk: "换课不限次数，新课优先预约。" },
] as const;

export const benefits = [
  { title: "训练成就", detail: "上课打卡，点亮成就" },
  { title: "训练奖励", detail: "积分兑换券和课时" },
  { title: "满员等候", detail: "满员场次可以排队" },
  { title: "新课体验", detail: "新课上线优先试听" },
  { title: "训练排名", detail: "按城市查看上课排名" },
  { title: "生日礼券", detail: "生日当月赠送礼券" },
  { title: "无忧换课", detail: "开课前可改约其他场次" },
] as const;

export const pointRates = [
  { name: "团课", rate: "10 积分 / 节" },
  { name: "私教", rate: "20 积分 / 节" },
  { name: "公开课", rate: "5 积分 / 节" },
  { name: "自助健身", rate: "8 积分 / 小时" },
] as const;

export function tierFor(points: number) {
  return [...tiers].reverse().find((tier) => points >= tier.points) ?? tiers[0];
}

export function classPoints(section: "group" | "personal" | "open", seats: number) {
  const unit = section === "personal" ? 20 : section === "group" ? 10 : 5;
  return unit * (section === "personal" ? 1 : seats);
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
  if ((section === "group" || section === "personal") && headcount >= 2 && unitPrice > 0) {
    total = Math.round(total * 0.9);
    notes.push("两人及以上报名，打 9 折");
  }
  return { listTotal, total, note: notes.join("；") };
}
