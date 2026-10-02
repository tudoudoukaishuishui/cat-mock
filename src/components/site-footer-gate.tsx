"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Shop = {
  id: string;
  short: string;
  address: string;
};

export function SiteFooterGate({ shops }: { shops: Shop[] }) {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 text-sm text-muted-foreground md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="font-heading text-base text-foreground">超级猫咪</p>
          <p className="mt-2">
            <Link href="/membership" className="text-foreground">
              会员：按次付费。充值超猫卡后，预约团课享 95 折。
            </Link>
          </p>
        </div>
        <ul className="space-y-1">
          {shops.map((studio) => (
            <li key={studio.id}>
              {studio.short} · {studio.address}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
