"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Clock3, MapPin, UserRound, X } from "lucide-react";

import { listAugustWorkouts } from "@/data/august-training";
import { COUPON_YUAN, bananaAccount, couponMark, formatBananas } from "@/data/bananas";
import { courses } from "@/data/catalog";
import { classTotal } from "@/data/membership";
import { subscribeCoupons, usedCoupons } from "@/lib/banana-wallet";
import { hasCard } from "@/lib/local-memberships";
import { formatSheetWhen } from "@/lib/format";
import { courseImage } from "@/lib/images";
import { createLocalBooking } from "@/lib/local-bookings";
import type { SessionView } from "@/lib/types";
import { cn } from "cn";

export function GroupBookSheet({ session, onClose }: { session: SessionView; onClose: () => void }) {
  const course = courses.find((item) => item.id === session.courseId);
  const image = courseImage(session.courseId, session.courseName);
  const [mode, setMode] = useState<"self" | "gift">("self");
  const [party, setParty] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [justBooked, setJustBooked] = useState(0);
  const [usedCouponCount, setUsedCouponCount] = useState(0);
  const [applyCoupon, setApplyCoupon] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [result, setResult] = useState<{ id: string; seats: number; points: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const applyCoupons = () => setUsedCouponCount(usedCoupons());
    applyCoupons();
    const unsubscribe = subscribeCoupons(applyCoupons);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      unsubscribe();
    };
  }, [onClose]);

  const personal = session.section === "personal";
  const cardHolder = session.section === "group" && hasCard(phone);
  const quote = classTotal(session.section, session.price, party, cardHolder);
  const mark = couponMark(session.courseId);
  const earned = listAugustWorkouts().reduce((sum, item) => sum + item.bananas, 0);
  const couponsLeft = bananaAccount(earned, usedCouponCount).couponsLeft;
  const canUseCoupon = mark === "coupon" && couponsLeft > 0 && session.price > 0;
  const couponOff = canUseCoupon && applyCoupon ? COUPON_YUAN : 0;
  const payable = Math.max(0, quote.total - couponOff);
  const priceNote = [quote.note, couponOff ? `${couponOff}元优惠券` : ""].filter(Boolean).join("；");
  const bookable = session.status === "open" && session.remaining > justBooked;
  const signedUp = session.booked + justBooked;
  const seatsLeft = Math.max(session.remaining - justBooked, 0);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-book-title"
        data-booking-sheet={session.id}
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground sm:max-h-[min(760px,92dvh)] sm:max-w-3xl sm:flex-row sm:border sm:border-border"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-36 shrink-0 sm:h-auto sm:w-[42%]">
          <img src={image.src} alt={image.alt} className="h-full w-full object-cover sm:absolute sm:inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-ink/10 sm:bg-gradient-to-t" />
          <div className="absolute bottom-3 left-3 flex rounded-full bg-background/90 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("self")}
              className={cn("rounded-full px-3 py-1", mode === "self" ? "bg-ink text-primary-foreground" : "text-foreground")}
            >
              自己买
            </button>
            <button
              type="button"
              onClick={() => setMode("gift")}
              className={cn("rounded-full px-3 py-1", mode === "gift" ? "bg-ink text-primary-foreground" : "text-foreground")}
            >
              送朋友
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3 px-5 pt-4">
            <div>
              <h2 id="group-book-title" className="font-heading text-3xl leading-none">
                {session.courseName}
              </h2>
              <p className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">{course?.englishName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/courses/${session.courseId}#session-${session.id}`} className="text-sm text-persimmon">
                详情
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="grid size-8 place-items-center border border-border"
                aria-label="关闭"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-5">
            <dl className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <UserRound className="size-4 shrink-0 text-muted-foreground" />
                <dt className="shrink-0 text-muted-foreground">教练</dt>
                <dd>{session.coachName}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="size-4 shrink-0 text-muted-foreground" />
                <dt className="shrink-0 text-muted-foreground">时间</dt>
                <dd>{formatSheetWhen(session.start, session.end)}</dd>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <dt className="shrink-0 whitespace-nowrap text-muted-foreground">地点</dt>
                <dd className="min-w-0">
                  {session.studioName}
                  <span className="mt-0.5 block text-muted-foreground">
                    {session.address} {session.room}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="mt-4 grid grid-cols-2 border-t border-border">
              <div className="py-4 pr-3">
                <p className="text-sm text-muted-foreground">报名人数</p>
                <p data-field="signup-count" className="mt-1 font-heading text-3xl">
                  {signedUp} 人
                </p>
              </div>
              <div className="border-l border-border py-4 pl-4">
                <p className="text-sm text-muted-foreground">剩余人数</p>
                <p data-field="remaining-count" className="mt-1 font-heading text-3xl">
                  {seatsLeft} 人
                </p>
              </div>
            </div>

            {result ? (
              <div className="mt-5 border border-border bg-card p-4" data-booking-id={result.id}>
                <p className="font-medium text-moss">预约成功</p>
                <p className="mt-2 text-sm">预约号 {result.id}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  占用 {result.seats} 个名额 · {payable === 0 ? "免费" : `应付 ¥${payable}`}
                  {priceNote ? ` · ${priceNote}` : ""}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {payable === 0 ? "本场免费，名额已占用。" : "名额已占用。应付金额不从超猫卡余额扣除。"}
                  {result.points > 0
                    ? new Date(session.end).getTime() <= Date.now()
                      ? ` 已入账 ${formatBananas(result.points)} 根香蕉，这场已经结束，记在这个手机号上。`
                      : ` 待入账 ${formatBananas(result.points)} 根香蕉，记在这个手机号上，场次结束后才计入等级。`
                    : ""}
                </p>
                <Link href={`/bookings?phone=${phone}`} className="mt-4 inline-block text-sm text-persimmon">
                  查看我的运动
                </Link>
              </div>
            ) : (
              <form
                id="group-book-form"
                className="mt-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!bookable) return;
                  setPending(true);
                  setError(null);
                  const seats = personal ? 1 : party;
                  const data = createLocalBooking({
                    sessionId: session.id,
                    name,
                    phone,
                    partySize: seats,
                    agreed,
                    useCoupon: couponOff > 0,
                  });
                  setPending(false);
                  if (!data.ok) {
                    setError(data.error);
                    return;
                  }
                  setJustBooked(seats);
                  setResult({ id: data.booking.id, seats, points: data.booking.pointsAwarded ?? 0 });
                }}
              >
                {personal ? (
                  <p className="border-t border-border py-4 text-sm">本场 1 人。不能加朋友一起练，也没有多人 9 折。朋友需要另约一场。</p>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-4">
                    <span>人数</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((count) => {
                        const disabled = !bookable || count > seatsLeft;
                        return (
                          <button
                            key={count}
                            type="button"
                            disabled={disabled}
                            onClick={() => setParty(count)}
                            className={cn(
                              "h-10 min-w-16 border text-sm",
                              party === count
                                ? "border-persimmon bg-persimmon font-medium text-primary-foreground"
                                : "border-border bg-card",
                              disabled && "opacity-35",
                            )}
                          >
                            {count}人
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="mt-1 text-sm leading-6" data-field="limits">
                  <p className="text-foreground">本场限制</p>
                  <p className="mt-1 text-muted-foreground">
                    等级 {session.level}
                    {course ? ` · 强度 ${course.intensity}` : ""}。是否适合运动由专业人员评估，勾选不能代替医生意见。
                  </p>
                  {course && course.notSuitableFor.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
                      {course.notSuitableFor.map((item) => (
                        <li key={item}>不适合：{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <label className="mt-3 flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                  />
                  <span>
                    {mode === "gift"
                      ? "我已把本场限制告知上课人，并代为确认其符合这些限制，也已阅读取消规则。"
                      : personal || party === 1
                        ? "我确认上课人符合本场限制，并已阅读取消规则。"
                        : `我确认这 ${party} 位上课人都符合本场限制。代为确认只覆盖这一单里的人，并已阅读取消规则。`}
                  </span>
                </label>
                {canUseCoupon ? (
                  <label className="flex items-center gap-2 border-t border-border py-4 text-sm">
                    <input
                      type="checkbox"
                      checked={applyCoupon}
                      onChange={(event) => setApplyCoupon(event.target.checked)}
                    />
                    使用 10 元优惠券，抵扣 10 元
                  </label>
                ) : null}
                <div className="flex items-baseline justify-between border-t border-border py-4">
                  <span>应付</span>
                  <span className="text-right">
                    {quote.listTotal !== payable ? (
                      <span className="mr-2 text-sm text-muted-foreground line-through">¥{quote.listTotal}</span>
                    ) : null}
                    <span className="font-heading text-2xl">{payable === 0 ? "免费" : `${payable}元`}</span>
                    {priceNote ? <span className="mt-1 block text-xs text-persimmon">{priceNote}</span> : null}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {session.statusLabel}
                  {session.section === "group" && party >= 2 ? "。这一单按 2 人或 3 人占名额，并打 9 折。" : ""}
                </p>

                <div className="mt-4 text-sm leading-6 text-muted-foreground">
                  <p className="text-foreground">退课须知</p>
                  <p>{session.cancelRule}</p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm">
                    <span className="text-muted-foreground">{mode === "gift" ? "好友姓名" : "姓名"}</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      autoComplete="name"
                      placeholder={mode === "gift" ? "送给谁" : "上课人姓名"}
                      className="h-10 border border-border bg-card px-3 outline-none focus-visible:border-ring"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="text-muted-foreground">{mode === "gift" ? "好友手机号" : "手机号"}</span>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      required
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="11 位手机号"
                      className="h-10 border border-border bg-card px-3 outline-none focus-visible:border-ring"
                    />
                  </label>
                </div>
                {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
              </form>
            )}
          </div>

          {result ? null : (
            <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
              <div>
                <p className="text-xs text-muted-foreground">应付</p>
                <p className="font-heading text-2xl">{payable === 0 ? "免费" : `¥${payable}`}</p>
              </div>
              <button
                type="submit"
                form="group-book-form"
                disabled={!bookable || pending || !agreed}
                className="h-11 min-w-36 bg-persimmon px-6 text-sm font-medium text-primary-foreground disabled:opacity-40"
              >
                {bookable ? (pending ? "提交中" : "确认预约") : session.statusLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
