export const EARLY_BIRD_OFF = 20;

export const plans = [
  {
    id: "month",
    name: "月卡",
    days: 30,
    price: 399,
    note: "适合先上一个月，看门店和课表是否合适。",
  },
  {
    id: "quarter",
    name: "季卡",
    days: 90,
    price: 1099,
    note: "按月折合约 ¥366，比月卡少一截。",
  },
  {
    id: "half",
    name: "半年卡",
    days: 182,
    price: 1999,
    note: "按月折合约 ¥330。",
  },
  {
    id: "year",
    name: "年卡",
    days: 365,
    price: 3599,
    note: "按月折合约 ¥300，四种里最低。",
  },
] as const;

export type PlanId = (typeof plans)[number]["id"];

export function earlyBirdPrice(listPrice: number) {
  return listPrice - EARLY_BIRD_OFF;
}

export function classTotal(section: "group" | "personal" | "open", unitPrice: number, headcount: number) {
  const listTotal = unitPrice * (section === "personal" ? 1 : headcount);
  const eligible = (section === "group" || section === "personal") && headcount >= 2 && unitPrice > 0;
  const total = eligible ? Math.round(listTotal * 0.9) : listTotal;
  return {
    listTotal,
    total,
    note: eligible ? "两人及以上报名，打 9 折" : "",
  };
}
