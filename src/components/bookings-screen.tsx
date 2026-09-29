"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CancelBookingButton } from "@/components/booking-actions";
import { formatBananas } from "@/data/bananas";
import { formatDateTime, shanghaiDateKey } from "@/lib/format";
import { courseImage, heroImage } from "@/lib/images";
import { listLocalBookings } from "@/lib/local-bookings";
import type { BookingView } from "@/lib/types";
import { cn } from "cn";

function monthKey(iso: string) {
  return shanghaiDateKey(iso).slice(0, 7);
}

function monthTitle(key: string, current: string) {
  if (key === current) return "本月";
  const [year, month] = key.split("-");
  return `${year}年${Number(month)}月`;
}

function summarize(items: BookingView[]) {
  const active = items.filter((item) => !item.cancelledAt);
  return {
    count: active.length,
    days: new Set(active.map((item) => shanghaiDateKey(item.start))).size,
    minutes: active.reduce((sum, item) => sum + item.durationMinutes, 0),
  };
}

export function BookingsScreen() {
  const params = useSearchParams();
  const phone = params.get("phone")?.trim() ?? "";
  const [bookings, setBookings] = useState<BookingView[] | null>(null);
  const [openMonth, setOpenMonth] = useState<string | null>(null);

  useEffect(() => {
    const apply = () => setBookings(listLocalBookings(phone || undefined));
    apply();
    window.addEventListener("super-cat-bookings", apply);
    return () => window.removeEventListener("super-cat-bookings", apply);
  }, [phone]);

  const currentMonth = monthKey(new Date().toISOString());
  const grouped = new Map<string, BookingView[]>();
  for (const booking of bookings ?? []) {
    const key = monthKey(booking.start);
    grouped.set(key, [...(grouped.get(key) ?? []), booking]);
  }
  if (!grouped.has(currentMonth)) grouped.set(currentMonth, []);
  const months = [...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  const shownMonth =
    openMonth === null ? (months.find(([, items]) => items.length > 0)?.[0] ?? currentMonth) : openMonth;

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-heading text-2xl">预约记录</h2>
        <form action="" className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm text-muted-foreground">
            <span className="sr-only">手机号</span>
            <input
              name="phone"
              defaultValue={phone}
              inputMode="numeric"
              placeholder="按手机号筛选"
              className="h-10 w-full border border-border bg-card px-3 sm:w-52"
            />
          </label>
          <button type="submit" className="h-10 bg-primary px-4 text-sm text-primary-foreground">
            筛选
          </button>
          {phone ? (
            <Link href="/bookings" className="text-sm text-persimmon">
              查看全部
            </Link>
          ) : null}
        </form>
      </div>

      {bookings === null ? (
        <p className="mt-6 text-sm text-muted-foreground">正在读取记录…</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {months.map(([key, items]) => {
            const stats = summarize(items);
            const image = items[0] ? courseImage(items[0].courseId, items[0].courseName) : heroImage;
            const open = key === shownMonth;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setOpenMonth(open ? "" : key)}
                  className={cn("relative w-full overflow-hidden border border-border text-left", open && "border-persimmon")}
                >
                  <img src={image.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-background/88" />
                  <div className="relative grid gap-4 p-5 sm:grid-cols-4 sm:items-end">
                    <p className="font-heading text-3xl">{monthTitle(key, currentMonth)}</p>
                    <Stat value={stats.count} label="训练次数" />
                    <Stat value={stats.days} label="训练天数" />
                    <Stat value={stats.minutes} label="训练时长/分钟" />
                  </div>
                </button>
                {open ? (
                  items.length === 0 ? (
                    <p className="border border-t-0 border-border px-5 py-4 text-sm text-muted-foreground">这个月还没有训练。</p>
                  ) : (
                    <ul className="border border-t-0 border-border">
                      {items.map((booking) => (
                        <li key={booking.id} data-booking-id={booking.id} className="border-t border-border px-5 py-4 first:border-t-0">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="font-heading text-2xl">
                              <Link href={`/courses/${booking.courseId}`} className="hover:text-persimmon">
                                {booking.courseName}
                              </Link>
                            </h3>
                            <p className="text-sm">{booking.statusLabel}</p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {booking.timeLabel} · {booking.durationMinutes} 分钟 · {booking.sectionName}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {booking.name} · {booking.phone} · {booking.partySize} 人 · 应付 ¥{booking.totalPrice}
                            {booking.pointsAwarded && !booking.cancelledAt
                              ? ` · ${new Date(booking.start).getTime() + booking.durationMinutes * 60 * 1000 <= Date.now() ? "已入账" : "待入账"} ${formatBananas(booking.pointsAwarded)} 根香蕉`
                              : ""}
                            {booking.discountNote ? ` · ${booking.discountNote}` : ""}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">{booking.addressLine}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {booking.id} · 提交于 {formatDateTime(booking.createdAt)}
                            {booking.cancelledAt ? ` · 取消于 ${formatDateTime(booking.cancelledAt)}` : ""}
                          </p>
                          {booking.canCancel ? (
                            <div className="mt-3">
                              <CancelBookingButton id={booking.id} />
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-heading text-3xl">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
