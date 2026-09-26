"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronLeft, Clock3, MapPin, UserRound } from "lucide-react";

import { courses } from "@/data/catalog";
import { classTotal } from "@/data/membership";
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
  const [resultId, setResultId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const quote = classTotal("group", session.price, party);
  const bookable = session.status === "open" && session.remaining > 0;

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/70" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-book-title"
        data-booking-sheet={session.id}
        className="mx-auto flex h-full w-full max-w-md flex-col bg-[#161616] text-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-36 shrink-0">
          <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/55" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 grid size-9 place-items-center rounded-full bg-black/45"
            aria-label="关闭"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 rounded-full bg-black/55 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("self")}
              className={cn("rounded-full px-4 py-1", mode === "self" ? "bg-white text-black" : "text-white/80")}
            >
              自己买
            </button>
            <button
              type="button"
              onClick={() => setMode("gift")}
              className={cn("rounded-full px-4 py-1", mode === "gift" ? "bg-white text-black" : "text-white/80")}
            >
              送朋友
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
          <div className="flex items-start justify-between gap-3">
            <h2 id="group-book-title" className="text-2xl font-semibold tracking-wide">
              {session.courseName}{" "}
              <span className="text-lg font-medium text-white/80 uppercase">{course?.englishName}</span>
            </h2>
            <Link
              href={`/courses/${session.courseId}#session-${session.id}`}
              className="shrink-0 rounded-full border border-white/25 px-3 py-1 text-xs text-white/80"
            >
              详情
            </Link>
          </div>

          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 shrink-0 text-white/70" />
              <dt className="shrink-0 text-white/45">教练</dt>
              <dd>{session.coachName}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock3 className="size-4 shrink-0 text-white/70" />
              <dt className="shrink-0 text-white/45">时间</dt>
              <dd>{formatSheetWhen(session.start, session.end)}</dd>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-white/70" />
              <dt className="shrink-0 whitespace-nowrap text-white/45">地点</dt>
              <dd className="min-w-0">
                {session.studioName}
                <span className="mt-0.5 block text-white/60">
                  {session.address} {session.room}
                </span>
              </dd>
            </div>
          </dl>

          {resultId ? (
            <div className="mt-6 rounded-xl bg-[#242424] p-4" data-booking-id={resultId}>
              <p className="text-lg font-semibold text-[#f5c518]">预约成功</p>
              <p className="mt-2 text-sm text-white/75">预约号 {resultId}</p>
              <p className="mt-1 text-sm text-white/75">
                {party} 人 · {quote.total === 0 ? "免费" : `¥${quote.total}`}
                {quote.note ? ` · ${quote.note}` : ""}
              </p>
              <Link href={`/bookings?phone=${phone}`} className="mt-4 inline-block text-sm text-[#f5c518]">
                查看我的预约
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
                const data = createLocalBooking({
                  sessionId: session.id,
                  name,
                  phone,
                  partySize: party,
                  companions: party,
                  agreed: true,
                });
                setPending(false);
                if (!data.ok) {
                  setError(data.error);
                  return;
                }
                setResultId(data.booking.id);
              }}
            >
              <div className="flex items-center justify-between gap-3 border-t border-white/10 py-4">
                <span>人数</span>
                <div className="flex gap-2">
                  {[1, 2, 3].map((count) => {
                    const disabled = !bookable || count > session.remaining;
                    return (
                      <button
                        key={count}
                        type="button"
                        disabled={disabled}
                        onClick={() => setParty(count)}
                        className={cn(
                          "h-10 min-w-16 rounded-lg text-sm",
                          party === count ? "bg-[#f5c518] font-semibold text-black" : "bg-[#2c2c2c] text-white",
                          disabled && "opacity-35",
                        )}
                      >
                        {count}人
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-baseline justify-between border-t border-white/10 py-4">
                <span>总价</span>
                <span className="text-right">
                  {quote.listTotal !== quote.total ? (
                    <span className="mr-2 text-sm text-white/35 line-through">¥{quote.listTotal}</span>
                  ) : null}
                  <span className="text-lg">{quote.total === 0 ? "免费" : `${quote.total}元`}</span>
                  {quote.note ? <span className="mt-1 block text-xs text-[#f5c518]">{quote.note}</span> : null}
                </span>
              </div>
              <p className="text-xs text-white/45">本场剩余 {session.remaining} 个名额 · {session.statusLabel}</p>

              <div className="mt-4 text-xs leading-5 text-white/70">
                <p className="text-sm text-white">退课须知：</p>
                <p>距离开课时间大于6小时取消预约，支持全额退款；</p>
                <p>距离开课时间不满6小时取消预约，不支持退款。</p>
              </div>

              <div className="mt-4 grid gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="text-white/55">{mode === "gift" ? "好友姓名" : "姓名"}</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    autoComplete="name"
                    placeholder={mode === "gift" ? "送给谁" : "上课人姓名"}
                    className="h-10 rounded-lg bg-[#2c2c2c] px-3 outline-none"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-white/55">{mode === "gift" ? "好友手机号" : "手机号"}</span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="11 位手机号"
                    className="h-10 rounded-lg bg-[#2c2c2c] px-3 outline-none"
                  />
                </label>
              </div>
              {error ? <p className="mt-3 text-sm text-[#ff8d7a]">{error}</p> : null}
            </form>
          )}
        </div>

        {resultId ? null : (
          <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
            <div>
              <p className="text-xs text-white/45">待支付</p>
              <p className="text-xl font-semibold">{quote.total === 0 ? "免费" : `¥${quote.total}`}</p>
            </div>
            <button
              type="submit"
              form="group-book-form"
              disabled={!bookable || pending}
              className="h-12 min-w-36 rounded-lg bg-[#f5c518] px-6 text-base font-semibold text-black disabled:opacity-40"
            >
              {bookable ? (pending ? "提交中" : "确认预约") : session.statusLabel}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
