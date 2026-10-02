import Link from "next/link";

import { cities } from "@/lib/outing-queries";

export function ParentFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 text-sm text-muted-foreground md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="font-heading text-base text-foreground">超级家长</p>
          <p className="mt-2">
            <Link href="/family" className="text-foreground">
              按孩子年龄和预算排周六路线。下雨有备选。出门后可以记照片和体验。
            </Link>
          </p>
          <p className="mt-2">不卖票，不收款。记录只存在这台浏览器里。</p>
        </div>
        <div>
          <p className="text-foreground">现在有计划的城市</p>
          <ul className="mt-2 space-y-1">
            {cities.map((city) => (
              <li key={city}>{city}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
