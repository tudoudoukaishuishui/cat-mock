"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CancelBookingButton, ResetBookingsButton } from "@/components/booking-actions";
import { formatDateTime } from "@/lib/format";
import { listLocalBookings } from "@/lib/local-bookings";
import type { BookingView } from "@/lib/types";

export function BookingsScreen() {
  const params = useSearchParams();
  const phone = params.get("phone")?.trim() ?? "";
  const [bookings, setBookings] = useState<BookingView[] | null>(null);

  useEffect(() => {
    const apply = () => setBookings(listLocalBookings(phone || undefined));
    apply();
    window.addEventListener("super-cat-bookings", apply);
    return () => window.removeEventListener("super-cat-bookings", apply);
  }, [phone]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          首页
        </Link>
        <span> / 我的预约</span>
      </nav>
      <h1 className="mt-4 font-heading text-5xl">我的预约</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        预约保存在这台浏览器里。可以用手机号筛选。取消后，对应场次的已预约人数会减少。清空只影响本机记录，课表上原来的占位人数还在。
      </p>

      <form action="" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="grid gap-1 text-sm">
          手机号
          <input
            name="phone"
            defaultValue={phone}
            inputMode="numeric"
            placeholder="留空查看全部"
            className="h-10 w-full rounded-lg border border-input bg-card px-2.5 sm:w-64"
          />
        </label>
        <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm text-primary-foreground">
          筛选
        </button>
        {phone ? (
          <Link href="/bookings" className="inline-flex h-10 items-center text-sm">
            查看全部
          </Link>
        ) : null}
      </form>

      {bookings === null ? (
        <p className="mt-8 text-sm text-muted-foreground">正在读取本机预约…</p>
      ) : bookings.length === 0 ? (
        <div className="mt-8 border border-dashed border-border p-8">
          <p className="font-medium">{phone ? "这个手机号没有预约记录" : "还没有预约"}</p>
          <p className="mt-2 text-sm text-muted-foreground">从团课、私教或公开课挑一场还有名额的课。</p>
          <div className="mt-4 flex gap-4 text-sm">
            <Link href="/sections/group" className="text-persimmon">
              团课
            </Link>
            <Link href="/sections/personal" className="text-persimmon">
              私教
            </Link>
            <Link href="/sections/open" className="text-persimmon">
              公开课
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {bookings.map((booking) => (
            <li key={booking.id} data-booking-id={booking.id} className="border border-border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-heading text-2xl">
                  <Link href={`/courses/${booking.courseId}`} className="hover:text-persimmon">
                    {booking.courseName}
                  </Link>
                </h2>
                <p className="text-sm">{booking.statusLabel}</p>
              </div>
              <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">预约编号</dt>
                  <dd>{booking.id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">板块</dt>
                  <dd>
                    {booking.sectionName} · {booking.courseCode}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">时间</dt>
                  <dd>{booking.timeLabel}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">教练</dt>
                  <dd>{booking.coachLine}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-muted-foreground">地址</dt>
                  <dd>{booking.addressLine}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">预约人</dt>
                  <dd>
                    {booking.name} · {booking.phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">人数与价格</dt>
                  <dd>
                    {booking.partySize} 人 · 单价 ¥{booking.unitPrice} · 合计 ¥{booking.totalPrice}
                    {booking.discountNote ? ` · ${booking.discountNote}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">提交时间</dt>
                  <dd>{formatDateTime(booking.createdAt)}</dd>
                </div>
                {booking.cancelledAt ? (
                  <div>
                    <dt className="text-muted-foreground">取消时间</dt>
                    <dd>{formatDateTime(booking.cancelledAt)}</dd>
                  </div>
                ) : null}
              </dl>
              {booking.canCancel ? (
                <div className="mt-4">
                  <CancelBookingButton id={booking.id} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 border-t border-border pt-6">
        <h2 className="font-heading text-2xl">重置</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          清空后预约编号从 BK-1001 重新开始。已经写在课表里的初始已预约人数不会被清掉。
        </p>
        <div className="mt-4">
          <ResetBookingsButton />
        </div>
      </div>
    </main>
  );
}
