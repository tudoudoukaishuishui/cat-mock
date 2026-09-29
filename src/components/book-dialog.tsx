"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { classTotal } from "@/data/membership";
import { createLocalBooking } from "@/lib/local-bookings";
import { cn } from "cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SessionView } from "@/lib/types";

type BookingResult = {
  id: string;
  name: string;
  phone: string;
  partySize: number;
  totalPrice: number;
  discountNote: string | null;
  timeLabel: string;
  courseName: string;
};

export function BookDialog({ session }: { session: SessionView }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);

  const maxParty = session.section === "personal" ? 1 : Math.min(3, session.remaining);
  const quote = classTotal(session.section, session.price, partySize);

  if (session.status !== "open") {
    return (
      <Button type="button" disabled className="h-10 px-4">
        {session.statusLabel}
      </Button>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(null);
          setPending(false);
          setResult(null);
        }
      }}
    >
      <DialogTrigger className={cn(buttonVariants(), "h-10 px-4")}>预约此场次</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>预约 {session.courseName}</DialogTitle>
          <DialogDescription>
            {session.timeLabel} · {session.coachName} · {session.addressLine}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3" data-booking-id={result.id}>
            <p className="font-medium text-moss">预约成功</p>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt>预约编号</dt>
                <dd>{result.id}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>课程</dt>
                <dd>{result.courseName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>时间</dt>
                <dd className="text-right">{result.timeLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>姓名</dt>
                <dd>{result.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>手机</dt>
                <dd>{result.phone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>人数</dt>
                <dd>{result.partySize} 人</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>合计</dt>
                <dd>
                  ¥{result.totalPrice}
                  {result.discountNote ? `（${result.discountNote}）` : ""}
                </dd>
              </div>
            </dl>
            <Button
              type="button"
              className="h-10 px-4"
              onClick={() => {
                router.push(`/bookings?phone=${result.phone}`);
              }}
            >
              查看我的运动
            </Button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setPending(true);
              setError(null);
              const data = createLocalBooking({
                sessionId: session.id,
                name,
                phone,
                partySize,
                agreed,
              });
              if (!data.ok) {
                setError(data.error);
                setPending(false);
                return;
              }
              setResult(data.booking);
              setPending(false);
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor={`${session.id}-name`}>姓名</Label>
              <Input
                id={`${session.id}-name`}
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                placeholder="例如 林小满"
                className="h-10"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${session.id}-phone`}>手机号</Label>
              <Input
                id={`${session.id}-phone`}
                name="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="11 位手机号"
                className="h-10"
                required
              />
            </div>
            <div className="space-y-1.5">
              {session.section === "personal" ? (
                <p className="text-sm">本场 1 人。不能加朋友一起练，也没有多人 9 折。</p>
              ) : (
                <select
                  id={`${session.id}-party`}
                  name="partySize"
                  value={partySize}
                  onChange={(event) => setPartySize(Number(event.target.value))}
                  className="h-10 w-full rounded-lg border border-input bg-card px-2.5 text-sm"
                >
                  {Array.from({ length: maxParty }, (_, index) => index + 1).map((count) => (
                    <option key={count} value={count}>
                      {count} 人
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-sm">
              单价 {session.priceLabel}
              {quote.note ? `，标价 ¥${quote.listTotal}，${quote.note}` : ""}
              ，本次合计 <span className="font-medium text-foreground">¥{quote.total}</span>
              。剩余 {session.remaining} 个名额。
            </p>
            <ul className="max-h-36 space-y-1 overflow-y-auto text-sm text-muted-foreground">
              {session.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
              <li>{session.cancelRule}</li>
            </ul>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-1"
                required
              />
              <span>我已阅读本场次的注意事项、不适人群和取消规则</span>
            </label>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button type="submit" disabled={pending} className="h-10 px-4">
              {pending ? "正在提交" : "确认预约"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
