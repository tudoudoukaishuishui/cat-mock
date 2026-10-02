"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, BarChart3, Cake, Check, Clock3, Compass, Gift, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBananas } from "@/data/bananas";
import { benefits, tierFor, topUps, type TopUpId } from "@/data/membership";
import { formatDateTime } from "@/lib/format";
import { pointLedger } from "@/lib/local-bookings";
import { accountFor, listAccounts, topUpCard, type Account } from "@/lib/local-memberships";
import { cn } from "cn";

const benefitIcons = [Award, Gift, Clock3, Compass, BarChart3, Cake, RefreshCcw];

export function MembershipJoin() {
  const [topUpId, setTopUpId] = useState<TopUpId>("288");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [done, setDone] = useState<string | null>(null);

  const [ledgerTick, setLedgerTick] = useState(0);
  useEffect(() => {
    const apply = () => {
      setAccounts(listAccounts());
      setLedgerTick((value) => value + 1);
    };
    apply();
    window.addEventListener("super-cat-memberships", apply);
    window.addEventListener("super-cat-bookings", apply);
    return () => {
      window.removeEventListener("super-cat-memberships", apply);
      window.removeEventListener("super-cat-bookings", apply);
    };
  }, []);

  const option = topUps.find((item) => item.id === topUpId) ?? topUps[0];
  const current = accountFor(phone);
  useEffect(() => {
    if (current && topUpId === "288") setTopUpId("500");
  }, [current, topUpId]);
  const balance = current?.balance ?? 0;
  const ledger = useMemo(() => pointLedger(phone), [phone, ledgerTick]);
  const tier = tierFor(ledger.posted);
  const firstUsed = current !== null;

  return (
    <div className="mt-10 grid gap-8 border-t border-border pt-8 lg:grid-cols-[0.9fr_1.1fr]">
      <form
        className="border border-border bg-card p-4 sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          const result = topUpCard({ topUpId, name, phone, agreed });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setDone(result.topUpId);
        }}
      >
        <div className="flex items-end justify-between gap-3 border border-border bg-background p-4">
          <div>
            <p className="text-xs tracking-[0.16em] text-muted-foreground">超猫卡</p>
            <p className="mt-1 font-heading text-3xl">超猫卡</p>
          </div>
          <p className="font-heading text-4xl">¥{balance}</p>
        </div>
        <p className="mt-3 border border-border bg-accent px-3 py-2 text-sm">
          充值后，团课按持卡 95 折计算应付金额。确认预约不从余额扣款。
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {topUps.map((item) => {
            const selected = item.id === topUpId;
            const locked = item.firstOnly && firstUsed;
            return (
              <button
                key={item.id}
                type="button"
                disabled={locked}
                onClick={() => {
                  setTopUpId(item.id);
                  setDone(null);
                }}
                className={cn(
                  "relative min-h-24 border px-3 py-4 text-center disabled:opacity-40",
                  selected ? "border-persimmon bg-background" : "border-border bg-background",
                )}
              >
                {item.badge ? (
                  <span className="absolute top-0 left-0 bg-persimmon px-1.5 py-0.5 text-[11px] text-primary-foreground">
                    {item.badge}
                  </span>
                ) : null}
                {selected ? <Check className="absolute top-2 right-2 size-4 text-persimmon" /> : null}
                <span className="mt-3 block font-heading text-3xl">¥{item.amount}</span>
                {item.bonus > 0 ? <span className="mt-1 block text-xs text-muted-foreground">赠送 ¥{item.bonus}</span> : null}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {current
            ? `${current.name} · ${tier.name} · 已入账 ${formatBananas(ledger.posted)} 根香蕉 · 待入账 ${formatBananas(ledger.pending)} 根香蕉`
            : "未充值，余额 ¥0"}
          {firstUsed ? "。首充专享已使用。" : ""}
        </p>

        <h3 className="mt-6 text-center font-heading text-xl">充值开通享会员权益</h3>
        <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-4 text-center">
          {benefits.map((benefit, index) => {
            const Icon = benefitIcons[index] ?? Award;
            return (
              <li key={benefit.title} className="w-16">
                <span className="mx-auto grid size-10 place-items-center rounded-full border border-border text-persimmon">
                  <Icon className="size-4" />
                </span>
                <span className="mt-1 block text-xs">{benefit.title}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 grid gap-3">
          <label className="grid gap-1 text-sm">
            <Label htmlFor="member-name">姓名</Label>
            <Input id="member-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如 林小满" className="h-10" required />
          </label>
          <label className="grid gap-1 text-sm">
            <Label htmlFor="member-phone">手机号</Label>
            <Input
              id="member-phone"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setDone(null);
              }}
              inputMode="numeric"
              placeholder="11 位手机号"
              className="h-10"
              required
            />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} required />
            <span>我已阅读并同意《会员卡用户协议》</span>
          </label>
        </div>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        {done ? (
          <p className="mt-3 text-sm text-moss">
            充值成功，编号 {done}。入账 ¥{option.amount + option.bonus}
            {option.bonus ? `（含赠送 ¥${option.bonus}）` : ""}。
          </p>
        ) : null}
        <Button type="submit" className="mt-4 h-11 w-full">
          充值 ¥{option.amount}
        </Button>
      </form>

      <div>
        <h2 className="font-heading text-3xl">充值记录</h2>
        {accounts.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">还没有充值记录。</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {accounts.map((account) => (
              <li key={account.phone} className="border border-border bg-card p-4 text-sm">
                <p className="font-medium">
                  {account.name} · {account.phone}
                </p>
                <p className="mt-1">
                  余额 ¥{account.balance} · {tierFor(pointLedger(account.phone).posted).name} · 已入账 {formatBananas(pointLedger(account.phone).posted)} 根香蕉 · 待入账 {formatBananas(pointLedger(account.phone).pending)} 根香蕉
                </p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {account.topUps
                    .slice()
                    .reverse()
                    .map((entry) => (
                      <li key={entry.id}>
                        {entry.id} · 充值 ¥{entry.amount}
                        {entry.bonus ? `，赠送 ¥${entry.bonus}` : ""} · {formatDateTime(entry.createdAt)}
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
