import { classPoints, tierFor, topUps, type TopUpId } from "@/data/membership";

const KEY = "super-cat-memberships";

export type TopUpEntry = {
  id: string;
  amount: number;
  bonus: number;
  createdAt: string;
};

export type Account = {
  phone: string;
  name: string;
  balance: number;
  points: number;
  topUps: TopUpEntry[];
};

type State = { nextNumber: number; accounts: Account[] };

function empty(): State {
  return { nextNumber: 1001, accounts: [] };
}

function read(): State {
  if (typeof window === "undefined") return empty();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "") as State;
    if (!parsed || !Array.isArray(parsed.accounts) || typeof parsed.nextNumber !== "number") return empty();
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

export function listAccounts() {
  return read()
    .accounts.slice()
    .sort((a, b) => {
      const last = (account: Account) => account.topUps[account.topUps.length - 1]?.createdAt ?? "";
      return last(b).localeCompare(last(a));
    });
}

export function accountFor(phone: string) {
  const cleaned = cleanPhone(phone);
  return read().accounts.find((account) => account.phone === cleaned) ?? null;
}

export function hasCard(phone: string) {
  return accountFor(phone) !== null;
}

export function addPoints(phone: string, delta: number) {
  if (!delta) return;
  const cleaned = cleanPhone(phone);
  const state = read();
  const account = state.accounts.find((item) => item.phone === cleaned);
  if (!account) return;
  account.points = Math.max(0, account.points + delta);
  write(state);
}

export function awardClassPoints(section: "group" | "personal" | "open", phone: string, seats: number) {
  if (!hasCard(phone)) return 0;
  return classPoints(section, seats);
}

export function topUpCard(input: { topUpId: TopUpId; name: string; phone: string; agreed: boolean }):
  | { ok: true; account: Account; credited: number; topUpId: string }
  | { ok: false; error: string } {
  const name = input.name.trim();
  const phone = cleanPhone(input.phone);
  if (!input.agreed) return { ok: false, error: "请先阅读并同意《会员卡用户协议》" };
  if (!/^[\u4e00-\u9fa5a-zA-Z·]{2,20}$/.test(name)) {
    return { ok: false, error: "请填写 2 到 20 个字的姓名，不要包含数字或符号" };
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) return { ok: false, error: "请填写 11 位中国大陆手机号" };
  const option = topUps.find((item) => item.id === input.topUpId);
  if (!option) return { ok: false, error: "请选择充值金额" };

  const state = read();
  let account = state.accounts.find((item) => item.phone === phone);
  if (option.firstOnly && account) return { ok: false, error: "首充专享只适用于第一次充值" };
  if (!account) {
    account = { phone, name, balance: 0, points: 0, topUps: [] };
    state.accounts.push(account);
  }
  account.name = name;
  const credited = option.amount + option.bonus;
  account.balance += credited;
  const entry: TopUpEntry = {
    id: `MB-${state.nextNumber}`,
    amount: option.amount,
    bonus: option.bonus,
    createdAt: new Date().toISOString(),
  };
  account.topUps.push(entry);
  state.nextNumber += 1;
  write(state);
  return { ok: true, account, credited, topUpId: entry.id };
}

export function tierName(points: number) {
  return tierFor(points).name;
}
