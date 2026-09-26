"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EARLY_BIRD_OFF, earlyBirdPrice, plans, type PlanId } from "@/data/membership";
import { formatDateTime } from "@/lib/format";
import { joinMembership, listMemberships, type MembershipRecord } from "@/lib/local-memberships";

export function MembershipJoin() {
  const [planId, setPlanId] = useState<PlanId>("month");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<MembershipRecord | null>(null);
  const [records, setRecords] = useState<MembershipRecord[]>([]);

  useEffect(() => {
    const apply = () => setRecords(listMemberships());
    apply();
    window.addEventListener("super-cat-memberships", apply);
    return () => window.removeEventListener("super-cat-memberships", apply);
  }, []);

  const plan = plans.find((item) => item.id === planId) ?? plans[0];

  return (
    <div className="mt-10 grid gap-8 border-t border-border pt-8 lg:grid-cols-[1fr_1fr]">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          const result = joinMembership({ planId, name, phone });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setDone(result.membership);
          setName("");
          setPhone("");
        }}
      >
        <h2 className="font-heading text-3xl">办理会员</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          这个手机号第一次办卡，按早鸟价，立减 ¥{EARLY_BIRD_OFF}。办过卡的手机号按标价。
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {plans.map((item) => (
            <label key={item.id} className="flex cursor-pointer items-start gap-2 border border-border bg-card p-3 text-sm">
              <input
                type="radio"
                name="plan"
                className="mt-1"
                checked={planId === item.id}
                onChange={() => setPlanId(item.id)}
              />
              <span>
                <span className="font-medium">{item.name}</span>
                <span className="mt-1 block text-muted-foreground">
                  标价 ¥{item.price} · 早鸟 ¥{earlyBirdPrice(item.price)} · {item.days} 天
                </span>
              </span>
            </label>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="member-name">姓名</Label>
          <Input id="member-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如 林小满" className="h-10" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="member-phone">手机号</Label>
          <Input id="member-phone" value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="numeric" placeholder="11 位手机号" className="h-10" required />
        </div>
        <p className="text-sm">
          当前选择 {plan.name}。新会员支付 <span className="font-medium">¥{earlyBirdPrice(plan.price)}</span>
          ，老会员支付 ¥{plan.price}。
        </p>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {done ? (
          <p className="text-sm text-moss">
            办理成功，编号 {done.id}。{done.planName} {done.days} 天，实付 ¥{done.paid}
            {done.earlyBird ? "（新会员早鸟价）" : "（标价）"}。
          </p>
        ) : null}
        <Button type="submit" className="h-10 px-4">
          确认办理
        </Button>
      </form>

      <div>
        <h2 className="font-heading text-3xl">本机已办的卡</h2>
        {records.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">还没有办理记录。</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {records.map((item) => (
              <li key={item.id} className="border border-border bg-card p-3 text-sm">
                <p className="font-medium">
                  {item.planName} · {item.id}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {item.name} · {item.phone} · {item.days} 天 · 实付 ¥{item.paid}
                  {item.earlyBird ? " · 早鸟价" : ""}
                </p>
                <p className="mt-1 text-muted-foreground">{formatDateTime(item.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
