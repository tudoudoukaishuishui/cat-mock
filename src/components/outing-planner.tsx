"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { OutingRoute } from "@/components/outing-route";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { bookableDates, formatOutingDate } from "@/lib/outing-dates";
import { createPlan } from "@/lib/outing-plans";
import {
  activeRoute,
  childAgeFits,
  defaultSkipped,
  formatBudget,
  formatDuration,
} from "@/lib/outing-queries";
import type { Activity } from "@/lib/outing-types";
import { cn } from "cn";

export function OutingPlanner({
  activity,
  rain,
  initialDate,
  initialAge,
  initialRain,
}: {
  activity: Activity;
  rain: Activity | null;
  initialDate: string;
  initialAge: number;
  initialRain: boolean;
}) {
  const dates = bookableDates();
  const [useRain, setUseRain] = useState(initialRain && Boolean(rain));
  const going = useRain && rain ? rain : activity;
  const [skipped, setSkipped] = useState<string[]>(() => defaultSkipped(going));
  const [childAge, setChildAge] = useState(initialAge);
  const route = activeRoute(going, skipped);

  function switchRain(next: boolean) {
    const target = next && rain ? rain : activity;
    setUseRain(next && Boolean(rain));
    setSkipped(defaultSkipped(target));
  }

  function toggleStop(id: string) {
    setSkipped((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  const ageOk = childAgeFits(going, childAge);

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]" aria-label="路线">
      <div className="border border-border bg-card p-4 md:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.16em] text-muted-foreground">{useRain ? "雨天备选" : going.setting}</p>
            <h2 className="mt-1 font-heading text-3xl">{going.name}</h2>
          </div>
          <p className="text-sm">
            {formatBudget(route.budget)} · {formatDuration(route.minutes)}
          </p>
        </div>
        {rain ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant={useRain ? "outline" : "default"}
              className="h-10 px-4"
              aria-pressed={!useRain}
              onClick={() => switchRain(false)}
            >
              晴天：{activity.name}
            </Button>
            <Button
              type="button"
              variant={useRain ? "default" : "outline"}
              className="h-10 px-4"
              aria-pressed={useRain}
              onClick={() => switchRain(true)}
            >
              下雨：{rain.name}
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted-foreground">这场在室内，下雨不用换地方。</p>
        )}
        {useRain ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            原计划是{activity.city}的{activity.name}。下雨改去{going.name}，集合点和路线都换了。
          </p>
        ) : null}
        <p className="mt-4 text-sm leading-6">{going.budgetNote}</p>
        <p className="mt-2 text-sm text-muted-foreground">集合：{going.meet}</p>
        <p className="text-sm text-muted-foreground">{going.transit}</p>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium">路线，可拿掉的站默认按建议来</legend>
          <ul className="mt-3 space-y-3">
            {going.stops.map((stop) => {
              const removed = skipped.includes(stop.id);
              return (
                <li key={stop.id} className={cn("border border-border p-3", removed && "opacity-50")}>
                  {stop.optional ? (
                    <label className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={!removed}
                        onChange={() => toggleStop(stop.id)}
                      />
                      <span>
                        <span className="font-medium">{stop.title}</span>
                        {stop.extraBudget ? <span className="text-muted-foreground"> · 加上约 ¥{stop.extraBudget}</span> : null}
                        <span className="mt-1 block text-muted-foreground">{stop.detail}</span>
                      </span>
                    </label>
                  ) : (
                    <p className="text-sm">
                      <span className="font-medium">{stop.title}</span>
                      <span className="mt-1 block text-muted-foreground">{stop.detail}</span>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </fieldset>

        <h3 className="mt-6 text-sm font-medium">按这个时间走</h3>
        <OutingRoute stops={route.stops} />
      </div>

      <aside className="border border-border bg-card p-4 md:p-5">
        <h2 className="font-heading text-2xl">安排到周末</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          选一个接下来的周六或周日。这里不卖票，也不收款，只把路线记在这台浏览器里。
        </p>
        <label className="mt-4 grid gap-1 text-sm">
          孩子年龄
          <select
            value={childAge}
            onChange={(event) => setChildAge(Number(event.target.value))}
            className="h-10 rounded-lg border border-input bg-background px-2.5"
          >
            {Array.from({ length: 13 }, (_, age) => (
              <option key={age} value={age}>
                {age} 岁
              </option>
            ))}
          </select>
        </label>
        {ageOk ? null : (
          <p className="mt-2 text-sm text-persimmon">
            {going.name}适合 {going.ageMin}–{going.ageMax} 岁。换年龄，或换回另一条路线。
          </p>
        )}
        <ArrangeDialog
          activity={activity}
          going={going}
          useRain={useRain && Boolean(rain)}
          skipped={skipped}
          childAge={childAge}
          initialDate={dates.includes(initialDate) ? initialDate : (dates[0] ?? "")}
          disabled={!ageOk || route.stops.length === 0}
        />
        <div className="mt-6 border-t border-border pt-4 text-sm leading-6">
          <p className="font-medium">出门前看一眼</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
            {going.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p className="mt-4 font-medium text-foreground">带上</p>
          <p className="mt-1 text-muted-foreground">{going.bring.join("、")}</p>
        </div>
        {rain && !useRain ? (
          <p className="mt-4 text-sm leading-6">
            出门当天如果下雨，回到上面点「下雨：{rain.name}」，再保存计划。
            <Link href={`/family/activities/${rain.id}`} className="ml-1 text-persimmon">
              先看备选
            </Link>
          </p>
        ) : null}
      </aside>
    </section>
  );
}

function ArrangeDialog({
  activity,
  going,
  useRain,
  skipped,
  childAge,
  initialDate,
  disabled,
}: {
  activity: Activity;
  going: Activity;
  useRain: boolean;
  skipped: string[];
  childAge: number;
  initialDate: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const dates = bookableDates();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [date, setDate] = useState(initialDate);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(null);
          setPending(false);
          setPlanId(null);
        }
      }}
    >
      <DialogTrigger className={cn(buttonVariants(), "mt-4 h-10 px-4")} disabled={disabled}>
        安排这天
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>安排 {going.name}</DialogTitle>
          <DialogDescription>
            {useRain ? `雨天备选，原计划是${activity.name}。` : "按刚才的路线。"}
            {formatBudget(activeRoute(going, skipped).budget)}，{formatDuration(activeRoute(going, skipped).minutes)}。
          </DialogDescription>
        </DialogHeader>
        {planId ? (
          <div className="space-y-3" data-plan-id={planId}>
            <p className="font-medium text-moss">已安排。出门当天可以记照片和体验。</p>
            <p className="text-sm text-muted-foreground">编号 {planId}。换一台电脑或清空浏览器后，这条记录会消失。</p>
            <Link href="/family/plans" className={cn(buttonVariants(), "h-10 px-4")}>
              去我的出门
            </Link>
          </div>
        ) : (
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setPending(true);
              setError(null);
              const result = createPlan({
                activityId: activity.id,
                useRain,
                skippedStopIds: skipped,
                date,
                parentName: name,
                phone,
                childAge,
                adults,
                children,
                agreed,
              });
              setPending(false);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setPlanId(result.plan.id);
              router.refresh();
            }}
          >
            <div className="grid gap-1">
              <Label htmlFor="parent-name">家长姓名</Label>
              <Input id="parent-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="parent-phone">手机号</Label>
              <Input
                id="parent-phone"
                inputMode="numeric"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                大人
                <select
                  value={adults}
                  onChange={(event) => setAdults(Number(event.target.value))}
                  className="h-10 rounded-lg border border-input bg-background px-2.5"
                >
                  {[1, 2, 3, 4].map((count) => (
                    <option key={count} value={count}>
                      {count} 人
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                孩子
                <select
                  value={children}
                  onChange={(event) => setChildren(Number(event.target.value))}
                  className="h-10 rounded-lg border border-input bg-background px-2.5"
                >
                  {[1, 2, 3, 4].map((count) => (
                    <option key={count} value={count}>
                      {count} 人
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-1 text-sm">
              出门日
              <select
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-2.5"
              >
                {dates.map((item) => (
                  <option key={item} value={item}>
                    {formatOutingDate(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-start gap-2 text-sm leading-6">
              <input type="checkbox" className="mt-1" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
              已看过路线、预算说明和雨天备选。门票和预约要自己办。
            </label>
            {error ? <p className="text-sm text-persimmon">{error}</p> : null}
            <Button type="submit" className="h-10 px-4" disabled={pending}>
              {pending ? "保存中" : "保存这个周末"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
