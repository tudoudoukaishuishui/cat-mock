"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "cn";

const links = [
  { href: "/family", label: "遛娃" },
  { href: "/sections/group", label: "团课" },
  { href: "/sections/personal", label: "私教" },
  { href: "/sections/open", label: "公开课" },
  { href: "/membership", label: "会员" },
  { href: "/bookings", label: "我的运动" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-foreground">
          <CatMark />
          <span className="font-heading text-lg leading-none whitespace-nowrap">超级猫咪</span>
        </Link>
        <nav aria-label="主导航" className="ml-auto flex gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
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

function CatMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8 text-persimmon">
      <path
        fill="currentColor"
        d="M6.2 13.5 9.2 5.2l4.2 7.2L16.2 7l2.8 5.4 4.2-7.2 3 8.3v9.2a6.2 6.2 0 0 1-6.2 6.2h-7.6a6.2 6.2 0 0 1-6.2-6.2v-9.2Z"
      />
      <circle cx="13" cy="18" r="1.2" fill="white" />
      <circle cx="19" cy="18" r="1.2" fill="white" />
    </svg>
  );
}
