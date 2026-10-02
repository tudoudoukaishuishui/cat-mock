import { getActivity, rainActivity } from "@/data/outings";
import { bookableDates, isOnOrBeforeToday, pastWeekendDates } from "@/lib/outing-dates";
import { activeRoute, childAgeFits, defaultSkipped } from "@/lib/outing-queries";
import type { Activity, OutingPlan } from "@/lib/outing-types";

const KEY = "super-parent-plans";
export const PLAN_EVENT = "super-parent-plans";

type State = {
  nextNumber: number;
  plans: OutingPlan[];
};

export type PlanInput = {
  activityId: string;
  useRain: boolean;
  skippedStopIds: string[];
  date: string;
  parentName: string;
  phone: string;
  childAge: number;
  adults: number;
  children: number;
  agreed: boolean;
};

export type BackfillInput = PlanInput & {
  experience: string;
  photos: string[];
};

type Ok = { ok: true; plan: OutingPlan };
type Err = { ok: false; error: string };

function emptyState(): State {
  return { nextNumber: 1001, plans: [] };
}

function readState(): State {
  if (typeof window === "undefined") return emptyState();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "") as State;
    if (!parsed || !Array.isArray(parsed.plans) || typeof parsed.nextNumber !== "number") return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

function writeState(state: State): Err | null {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(PLAN_EVENT));
    return null;
  } catch {
    return { ok: false, error: "这台浏览器存不下，照片可能太大。少传一张再试。" };
  }
}

function cleanPhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

function validateIdentity(input: {
  parentName: string;
  phone: string;
  childAge: number;
  adults: number;
  children: number;
  agreed: boolean;
}): Err | null {
  const name = input.parentName.trim();
  const phone = cleanPhone(input.phone);
  if (!input.agreed) return { ok: false, error: "请先确认已看过路线、预算和雨天备选" };
  if (!/^[\u4e00-\u9fa5a-zA-Z·]{2,20}$/.test(name)) {
    return { ok: false, error: "请填写 2 到 20 个字的姓名，不要包含数字或符号" };
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) return { ok: false, error: "请填写 11 位中国大陆手机号" };
  if (!Number.isInteger(input.childAge) || input.childAge < 0 || input.childAge > 12) {
    return { ok: false, error: "孩子年龄请选 0 到 12 岁" };
  }
  if (!Number.isInteger(input.adults) || input.adults < 1 || input.adults > 4) {
    return { ok: false, error: "大人请选 1 到 4 人" };
  }
  if (!Number.isInteger(input.children) || input.children < 1 || input.children > 4) {
    return { ok: false, error: "孩子请选 1 到 4 人" };
  }
  return null;
}

export function routeActivity(plan: Pick<OutingPlan, "activityId" | "useRain">) {
  const main = getActivity(plan.activityId);
  if (!main) return null;
  if (!plan.useRain) return main;
  return rainActivity(main) ?? main;
}

function budgetFor(activity: Activity, skipped: string[]) {
  return activeRoute(activity, skipped).budget;
}

export function listPlans() {
  return readState()
    .plans.slice()
    .reverse();
}

export function createPlan(input: PlanInput, now = new Date()): Ok | Err {
  const identity = validateIdentity(input);
  if (identity) return identity;
  const main = getActivity(input.activityId);
  if (!main) return { ok: false, error: "找不到这个活动" };
  const going = input.useRain ? (rainActivity(main) ?? main) : main;
  if (input.useRain && !main.rainId) return { ok: false, error: "这个活动在室内，没有另外的雨天备选" };
  if (!childAgeFits(going, input.childAge)) {
    return { ok: false, error: `这条路线适合 ${going.ageMin}–${going.ageMax} 岁` };
  }
  if (!bookableDates(now).includes(input.date)) return { ok: false, error: "请选接下来四个周末里的一天" };

  const phone = cleanPhone(input.phone);
  const state = readState();
  const duplicated = state.plans.some(
    (plan) =>
      plan.phone === phone &&
      plan.date === input.date &&
      plan.activityId === main.id &&
      plan.cancelledAt === null,
  );
  if (duplicated) return { ok: false, error: "这个手机号这天已经安排过同一条路线" };

  const skipped = input.skippedStopIds.filter((id) => going.stops.some((stop) => stop.id === id));
  const created: OutingPlan = {
    id: `LW-${state.nextNumber}`,
    activityId: main.id,
    useRain: input.useRain && Boolean(main.rainId),
    skippedStopIds: skipped,
    date: input.date,
    parentName: input.parentName.trim(),
    phone,
    childAge: input.childAge,
    adults: input.adults,
    children: input.children,
    budgetSnapshot: budgetFor(going, skipped),
    createdAt: new Date().toISOString(),
    cancelledAt: null,
    wentAt: null,
    experience: null,
    photos: [],
    backfill: false,
  };
  const failed = writeState({ nextNumber: state.nextNumber + 1, plans: [...state.plans, created] });
  if (failed) return failed;
  return { ok: true, plan: created };
}

export function createBackfill(input: BackfillInput, now = new Date()): Ok | Err {
  const identity = validateIdentity(input);
  if (identity) return identity;
  const activity = getActivity(input.activityId);
  if (!activity) return { ok: false, error: "找不到这个活动" };
  if (!pastWeekendDates(8, now).includes(input.date)) return { ok: false, error: "补记请选最近去过的周末" };
  if (!childAgeFits(activity, input.childAge)) {
    return { ok: false, error: `这个活动适合 ${activity.ageMin}–${activity.ageMax} 岁` };
  }
  const experience = input.experience.trim();
  if (experience.length < 8 || experience.length > 200) {
    return { ok: false, error: "体验写 8 到 200 个字" };
  }
  if (input.photos.length < 1 || input.photos.length > 3) return { ok: false, error: "请上传 1 到 3 张照片" };

  const phone = cleanPhone(input.phone);
  const state = readState();
  const skipped = defaultSkipped(activity);
  const created: OutingPlan = {
    id: `LW-${state.nextNumber}`,
    activityId: activity.id,
    useRain: false,
    skippedStopIds: skipped,
    date: input.date,
    parentName: input.parentName.trim(),
    phone,
    childAge: input.childAge,
    adults: input.adults,
    children: input.children,
    budgetSnapshot: budgetFor(activity, skipped),
    createdAt: new Date().toISOString(),
    cancelledAt: null,
    wentAt: new Date().toISOString(),
    experience,
    photos: input.photos.slice(0, 3),
    backfill: true,
  };
  const failed = writeState({ nextNumber: state.nextNumber + 1, plans: [...state.plans, created] });
  if (failed) return failed;
  return { ok: true, plan: created };
}

export function cancelPlan(id: string, now = new Date()): Ok | Err {
  const state = readState();
  const existing = state.plans.find((plan) => plan.id === id);
  if (!existing) return { ok: false, error: "找不到这条计划" };
  if (existing.cancelledAt) return { ok: false, error: "已经取消过了" };
  if (existing.wentAt) return { ok: false, error: "已经记了成行，不能取消" };
  if (isOnOrBeforeToday(existing.date, now) && existing.backfill) {
    return { ok: false, error: "补记不能取消" };
  }
  const plans = state.plans.map((plan) =>
    plan.id === id ? { ...plan, cancelledAt: new Date().toISOString() } : plan,
  );
  const failed = writeState({ ...state, plans });
  if (failed) return failed;
  const updated = plans.find((plan) => plan.id === id);
  if (!updated) return { ok: false, error: "找不到这条计划" };
  return { ok: true, plan: updated };
}

export function setPlanRain(id: string, useRain: boolean): Ok | Err {
  const state = readState();
  const existing = state.plans.find((plan) => plan.id === id);
  if (!existing || existing.cancelledAt || existing.wentAt) return { ok: false, error: "这条计划不能再改路线" };
  const main = getActivity(existing.activityId);
  if (!main) return { ok: false, error: "找不到这个活动" };
  if (useRain && !main.rainId) return { ok: false, error: "没有雨天备选" };
  const going = useRain ? (rainActivity(main) ?? main) : main;
  if (!childAgeFits(going, existing.childAge)) {
    return { ok: false, error: `雨天备选适合 ${going.ageMin}–${going.ageMax} 岁，和这位孩子对不上` };
  }
  const skipped = defaultSkipped(going);
  const plans = state.plans.map((plan) =>
    plan.id === id
      ? { ...plan, useRain, skippedStopIds: skipped, budgetSnapshot: budgetFor(going, skipped) }
      : plan,
  );
  const failed = writeState({ ...state, plans });
  if (failed) return failed;
  const updated = plans.find((plan) => plan.id === id);
  if (!updated) return { ok: false, error: "找不到这条计划" };
  return { ok: true, plan: updated };
}

export function markWent(id: string, now = new Date()): Ok | Err {
  const state = readState();
  const existing = state.plans.find((plan) => plan.id === id);
  if (!existing || existing.cancelledAt) return { ok: false, error: "找不到这条计划" };
  if (existing.wentAt) return { ok: true, plan: existing };
  if (!isOnOrBeforeToday(existing.date, now)) return { ok: false, error: "还没到出门那天" };
  const plans = state.plans.map((plan) =>
    plan.id === id ? { ...plan, wentAt: new Date().toISOString() } : plan,
  );
  const failed = writeState({ ...state, plans });
  if (failed) return failed;
  const updated = plans.find((plan) => plan.id === id);
  if (!updated) return { ok: false, error: "找不到这条计划" };
  return { ok: true, plan: updated };
}

export function saveExperience(id: string, experience: string, photos: string[]): Ok | Err {
  const text = experience.trim();
  if (text.length < 8 || text.length > 200) return { ok: false, error: "体验写 8 到 200 个字" };
  if (photos.length < 1 || photos.length > 3) return { ok: false, error: "请上传 1 到 3 张照片" };
  const state = readState();
  const existing = state.plans.find((plan) => plan.id === id);
  if (!existing || existing.cancelledAt || !existing.wentAt) return { ok: false, error: "先标记已经出门" };
  const plans = state.plans.map((plan) =>
    plan.id === id ? { ...plan, experience: text, photos: photos.slice(0, 3) } : plan,
  );
  const failed = writeState({ ...state, plans });
  if (failed) return failed;
  const updated = plans.find((plan) => plan.id === id);
  if (!updated) return { ok: false, error: "找不到这条计划" };
  return { ok: true, plan: updated };
}

export function removePlan(id: string): Ok | Err {
  const state = readState();
  const existing = state.plans.find((plan) => plan.id === id);
  if (!existing) return { ok: false, error: "找不到这条计划" };
  if (!existing.wentAt) return { ok: false, error: "还没出门的计划请用取消" };
  const plans = state.plans.filter((plan) => plan.id !== id);
  const failed = writeState({ ...state, plans });
  if (failed) return failed;
  return { ok: true, plan: existing };
}

export function resetPlans() {
  writeState(emptyState());
}
