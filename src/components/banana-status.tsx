"use client";

import { useEffect, useState } from "react";

import { bananaAccount, formatBananas } from "@/data/bananas";
import { subscribeCoupons, usedCoupons } from "@/lib/banana-wallet";

export function BananaStatus({ earned, detail }: { earned: number; detail: string }) {
  const [used, setUsed] = useState(0);

  useEffect(() => {
    const apply = () => setUsed(usedCoupons());
    apply();
    return subscribeCoupons(apply);
  }, []);

  const account = bananaAccount(earned, used);

  return (
    <section data-bananas className="mx-auto mt-4 max-w-xl border border-border bg-card px-5 py-5 text-center">
      <p className="text-xs tracking-[0.16em] text-muted-foreground">剩余香蕉</p>
      <p className="mt-2 font-heading text-5xl text-persimmon">{formatBananas(account.bananas)} 根香蕉</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        8 月{detail}，共 {formatBananas(account.earned)} 根香蕉。每 8 根兑换 1 张 10 元优惠券，已兑换 {account.couponsIssued}{" "}
        张。当前可用 {account.couponsLeft} 张，兑换后剩余 {formatBananas(account.bananas)} 根。
      </p>
    </section>
  );
}
