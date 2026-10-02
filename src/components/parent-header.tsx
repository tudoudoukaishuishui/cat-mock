"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "cn";

const links = [
  { href: "/family", label: "本周计划" },
  { href: "/family/plans", label: "我的出门" },
];

export function ParentHeader() {
  const pathname = usePathname().replace(/\/$/, "") || "/";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/family" className="flex shrink-0 items-center gap-2 text-foreground">
          <ParentMark />
          <span className="font-heading text-lg leading-none whitespace-nowrap">超级家长</span>
        </Link>
        <nav aria-label="主导航" className="ml-auto flex gap-1 overflow-x-auto">
          {links.map((link) => {
            const active =
              link.href === "/family"
                ? pathname === "/family" || pathname.startsWith("/family/activities")
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm whitespace-nowrap",
                  active ? "bg-ink text-primary-foreground" : "text-foreground hover:bg-muted",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function ParentMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8 text-persimmon">
      <circle cx="11" cy="8" r="3" fill="currentColor" />
      <circle cx="21.5" cy="11" r="2.2" fill="currentColor" />
      <path
        fill="currentColor"
        d="M5.5 25.5v-1.2c0-3.2 2.6-5.3 6.2-5.3 1.3 0 2.4.2 3.3.6-.8.9-1.3 2-1.5 3.2H5.5Zm8.2-1.2c.2-2.4 1.6-4.2 4.3-5.1 1.2-.4 2.5-.6 3.8-.6 3.2 0 5.7 1.8 5.7 4.6v1.1H13.7Z"
      />
    </svg>
  );
}
