"use client";

import { useEffect, useState } from "react";

import { bananaAccount } from "@/data/bananas";
import { subscribeCoupons, usedCoupons } from "@/lib/banana-wallet";

export function BananaStatus({ earned }: { earned: number }) {
  const [used, setUsed] = useState(0);

  useEffect(() => {
    const apply = () => setUsed(usedCoupons());
    apply();
    return subscribeCoupons(apply);
  }, []);

  const account = bananaAccount(earned, used);

  return (
    <section data-bananas className="mx-auto mt-4 max-w-xl border border-border bg-card px-5 py-5 text-center">
      <p className="text-xs tracking-[0.16em] text-muted-foreground">现有积分</p>
      <p className="mt-2 font-heading text-5xl text-persimmon">{account.bananas} 根香蕉</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        8 月完成 {account.earned} 节活动课，获得 {account.earned} 根香蕉。每 8 根兑换 1 张 10 元优惠券，已兑换{" "}
        {account.couponsIssued} 张。手上还有 {account.couponsLeft} 张可用，兑换后剩 {account.bananas} 根香蕉。
      </p>
    </section>
  );
}
