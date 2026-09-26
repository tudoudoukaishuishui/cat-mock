import { EARLY_BIRD_OFF, earlyBirdPrice, plans, type PlanId } from "@/data/membership";

const KEY = "super-cat-memberships";

export type MembershipRecord = {
  id: string;
  planId: PlanId;
  planName: string;
  name: string;
  phone: string;
  days: number;
  listPrice: number;
  paid: number;
  earlyBird: boolean;
  createdAt: string;
};

type State = { nextNumber: number; memberships: MembershipRecord[] };

function empty(): State {
  return { nextNumber: 1001, memberships: [] };
}

function read(): State {
  if (typeof window === "undefined") return empty();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "") as State;
    if (!parsed || !Array.isArray(parsed.memberships) || typeof parsed.nextNumber !== "number") return empty();
    return parsed;
  } catch {
    return empty();
  }
}

function write(state: State) {
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("super-cat-memberships"));
}

function cleanPhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

export function listMemberships() {
  return read().memberships.slice().reverse();
}

export function isNewMember(phone: string) {
  const cleaned = cleanPhone(phone);
  return !read().memberships.some((item) => item.phone === cleaned);
}

export function joinMembership(input: { planId: PlanId; name: string; phone: string }):
  | { ok: true; membership: MembershipRecord }
  | { ok: false; error: string } {
  const name = input.name.trim();
  const phone = cleanPhone(input.phone);
  if (!/^[\u4e00-\u9fa5a-zA-Z·]{2,20}$/.test(name)) {
    return { ok: false, error: "请填写 2 到 20 个字的姓名，不要包含数字或符号" };
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) return { ok: false, error: "请填写 11 位中国大陆手机号" };
  const plan = plans.find((item) => item.id === input.planId);
  if (!plan) return { ok: false, error: "请选择月卡、季卡、半年卡或年卡" };

  const earlyBird = isNewMember(phone);
  const state = read();
  const membership: MembershipRecord = {
    id: `MB-${state.nextNumber}`,
    planId: plan.id,
    planName: plan.name,
    name,
    phone,
    days: plan.days,
    listPrice: plan.price,
    paid: earlyBird ? earlyBirdPrice(plan.price) : plan.price,
    earlyBird,
    createdAt: new Date().toISOString(),
  };
  write({ nextNumber: state.nextNumber + 1, memberships: [...state.memberships, membership] });
  return { ok: true, membership };
}

export { EARLY_BIRD_OFF };
