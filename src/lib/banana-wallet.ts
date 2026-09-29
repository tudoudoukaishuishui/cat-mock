const KEY = "super-cat-coupons-used";
const EVENT = "super-cat-coupons";

function readUsed() {
  if (typeof window === "undefined") return 0;
  const value = Number(window.localStorage.getItem(KEY) || "0");
  return Number.isInteger(value) && value > 0 ? value : 0;
}

function writeUsed(used: number) {
  window.localStorage.setItem(KEY, String(Math.max(0, used)));
  window.dispatchEvent(new Event(EVENT));
}

export function usedCoupons() {
  return readUsed();
}

export function consumeCoupon() {
  const used = readUsed();
  writeUsed(used + 1);
}

export function releaseCoupon() {
  writeUsed(readUsed() - 1);
}

export function resetCoupons() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeCoupons(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}
