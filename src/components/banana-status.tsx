import { bananaAccount, formatBananas } from "@/data/bananas";

export function BananaStatus({ earned }: { earned: number }) {
  const account = bananaAccount(earned);

  return (
    <section data-bananas className="mx-auto mt-4 max-w-xl border border-border bg-card px-5 py-5 text-center">
      <p className="text-xs tracking-[0.16em] text-muted-foreground">剩余香蕉</p>
      <p className="mt-2 font-heading text-5xl text-persimmon">{formatBananas(account.bananas)} 根香蕉</p>
    </section>
  );
}
