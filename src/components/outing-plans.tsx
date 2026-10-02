"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { OutingRoute } from "@/components/outing-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { activities, rainActivity } from "@/data/outings";
import { formatOutingDate, isOnOrBeforeToday, pastWeekendDates } from "@/lib/outing-dates";
import {
  PLAN_EVENT,
  cancelPlan,
  createBackfill,
  listPlans,
  markWent,
  removePlan,
  resetPlans,
  routeActivity,
  saveExperience,
  setPlanRain,
} from "@/lib/outing-plans";
import { activeRoute, formatBudget, shareCopy } from "@/lib/outing-queries";
import type { OutingPlan } from "@/lib/outing-types";

export function OutingPlans({ initialPhone }: { initialPhone: string }) {
  const [phone, setPhone] = useState(initialPhone);
  const [plans, setPlans] = useState<OutingPlan[] | null>(null);

  useEffect(() => {
    const apply = () => setPlans(listPlans());
    apply();
    window.addEventListener(PLAN_EVENT, apply);
    return () => window.removeEventListener(PLAN_EVENT, apply);
  }, []);

  const needle = phone.replace(/[\s-]/g, "");
  const visible = (plans ?? []).filter((plan) => (needle ? plan.phone === needle : true));
  const active = visible.filter((plan) => !plan.cancelledAt);
  const went = active.filter((plan) => plan.wentAt).length;
  const waiting = active.length - went;

  return (
    <div>
      <section className="mt-6 grid gap-4 border border-border bg-card p-4 sm:grid-cols-3">
        <Stat label="待出门" value={plans === null ? "—" : String(waiting)} />
        <Stat label="已出门" value={plans === null ? "—" : String(went)} />
        <Stat label="写了体验" value={plans === null ? "—" : String(active.filter((plan) => plan.experience).length)} />
      </section>

      <label className="mt-4 grid max-w-xs gap-1 text-sm">
        按手机号看
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          inputMode="numeric"
          className="h-10 rounded-lg border border-input bg-background px-2.5"
        />
      </label>

      {plans === null ? (
        <p className="mt-6 text-sm text-muted-foreground">正在读这台浏览器里的计划。</p>
      ) : visible.length === 0 ? (
        <div className="mt-6 border border-dashed border-border p-8">
          <p className="font-medium">还没有遛娃计划</p>
          <p className="mt-1 text-sm text-muted-foreground">从本周的周六里选一条路线。已经去过的，可以在下面补记。</p>
          <Link href="/family" className="mt-4 inline-flex h-10 items-center text-persimmon">
            去看这周
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {visible.map((plan) => (
            <li key={plan.id}>
              <PlanCard plan={plan} />
            </li>
          ))}
        </ul>
      )}

      <BackfillForm />

      <div className="mt-8 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          className="h-10 px-4"
          onClick={() => {
            if (window.confirm("清空这台浏览器里的遛娃计划？")) resetPlans();
          }}
        >
          清空遛娃记录
        </Button>
        <p className="mt-2 text-sm text-muted-foreground">清空只影响这台浏览器。照片和体验都在本地，不会上传。</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-heading text-4xl text-persimmon">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function PlanCard({ plan }: { plan: OutingPlan }) {
  const main = activities.find((item) => item.id === plan.activityId);
  const going = routeActivity(plan);
  const backup = main ? rainActivity(main) : null;
  const [error, setError] = useState<string | null>(null);
  const [experience, setExperience] = useState(plan.experience ?? "");
  const [photos, setPhotos] = useState<string[]>(plan.photos);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  if (!main || !going) {
    return <article className="border border-border p-4 text-sm">这条计划对应的活动已经不在列表里。</article>;
  }

  const route = activeRoute(going, plan.skippedStopIds);
  const cancelled = Boolean(plan.cancelledAt);
  const future = !isOnOrBeforeToday(plan.date);
  const text = shareCopy({
    date: plan.date,
    city: going.city,
    name: going.name,
    childAge: plan.childAge,
    adults: plan.adults,
    children: plan.children,
    budget: plan.budgetSnapshot,
    route: route.stops.map((stop) => stop.title),
    experience: plan.experience,
    rainy: plan.useRain,
  });

  let status = "待出门";
  if (cancelled) status = "已取消";
  else if (plan.experience) status = "已写体验";
  else if (plan.wentAt) status = "已出门";
  else if (!future) status = "可以记成行";

  return (
    <article data-plan-id={plan.id} className="border border-border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {plan.id} · {status}
            {plan.backfill ? " · 补记" : ""}
          </p>
          <h2 className="mt-1 font-heading text-3xl">{going.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatOutingDate(plan.date)} · {going.city} · 孩子 {plan.childAge} 岁 · {plan.adults} 大 {plan.children} 小 ·{" "}
            {formatBudget(plan.budgetSnapshot)}
          </p>
        </div>
        <Link href={`/family/activities/${going.id}`} className="text-sm text-persimmon">
          看活动
        </Link>
      </div>
      {plan.useRain ? <p className="mt-3 text-sm">这天走的是雨天备选，原计划是{main.name}。</p> : null}
      {!cancelled && !plan.wentAt && backup ? (
        <Button
          type="button"
          variant="outline"
          className="mt-3 h-10 px-4"
          onClick={() => {
            const result = setPlanRain(plan.id, !plan.useRain);
            setError(result.ok ? null : result.error);
          }}
        >
          {plan.useRain ? `改回晴天：${main.name}` : `下雨了，改去${backup.name}`}
        </Button>
      ) : null}
      <OutingRoute stops={route.stops} />
      {error ? <p className="mt-3 text-sm text-persimmon">{error}</p> : null}
      {!cancelled && !plan.wentAt ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {!future ? (
            <Button
              type="button"
              className="h-10 px-4"
              onClick={() => {
                const result = markWent(plan.id);
                setError(result.ok ? null : result.error);
              }}
            >
              标记已出门
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">还没到 {formatOutingDate(plan.date)}。出门当天可以上传照片和体验。</p>
          )}
          <Button
            type="button"
            variant="outline"
            className="h-10 px-4"
            onClick={() => {
              const result = cancelPlan(plan.id);
              setError(result.ok ? null : result.error);
            }}
          >
            取消这次
          </Button>
        </div>
      ) : null}
      {!cancelled && plan.wentAt ? (
        <form
          className="mt-4 grid gap-3 border-t border-border pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            const result = saveExperience(plan.id, experience, photos);
            setError(result.ok ? null : result.error);
            if (result.ok) setShareMessage(null);
          }}
        >
          <label className="grid gap-1 text-sm">
            照片，1 到 3 张
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (event) => {
                const files = [...(event.target.files ?? [])].slice(0, 3);
                try {
                  const next = await Promise.all(files.map((file) => compressPhoto(file)));
                  setPhotos(next);
                  setError(null);
                } catch (caught) {
                  setError(caught instanceof Error ? caught.message : "照片处理失败");
                }
              }}
            />
          </label>
          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                // User photos are local data URLs.
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${index}-${photo.length}`} src={photo} alt="这次出门的照片" className="aspect-square w-full object-cover" />
              ))}
            </div>
          ) : null}
          <label className="grid gap-1 text-sm">
            体验，8 到 200 字
            <textarea
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
              rows={4}
              className="rounded-lg border border-input bg-background px-2.5 py-2"
            />
          </label>
          <Button type="submit" className="h-10 w-fit px-4">
            保存体验
          </Button>
        </form>
      ) : null}
      {!cancelled && plan.experience ? (
        <div className="mt-4 border border-border p-4" data-share-card={plan.id}>
          <p className="text-xs tracking-[0.16em] text-muted-foreground">可以分享</p>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6">{text}</pre>
          {plan.photos.length > 0 ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {plan.photos.map((photo, index) => (
                // User photos are local data URLs.
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${index}-${photo.length}`} src={photo} alt="" className="aspect-[4/3] w-full object-cover" />
              ))}
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              className="h-10 px-4"
              onClick={async () => {
                try {
                  await sharePlan(text, plan.photos);
                  setShareMessage("已交给系统分享，或已复制文案。");
                } catch {
                  try {
                    await navigator.clipboard.writeText(text);
                    setShareMessage("已复制文案。");
                  } catch {
                    setShareMessage("没复制成功，可以手动选中上面的文字。");
                  }
                }
              }}
            >
              分享
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(text);
                  setShareMessage("已复制分享文案。");
                } catch {
                  setShareMessage("没复制成功，可以手动选中上面的文字。");
                }
              }}
            >
              复制文案
            </Button>
          </div>
          {shareMessage ? <p className="mt-2 text-sm text-moss">{shareMessage}</p> : null}
        </div>
      ) : null}
      {!cancelled && plan.wentAt ? (
        <Button
          type="button"
          variant="ghost"
          className="mt-3 h-10 px-4"
          onClick={() => {
            const result = removePlan(plan.id);
            setError(result.ok ? null : result.error);
          }}
        >
          删除这条记录
        </Button>
      ) : null}
    </article>
  );
}

function BackfillForm() {
  const dates = pastWeekendDates(6);
  const [open, setOpen] = useState(false);
  const [activityId, setActivityId] = useState(activities[0]?.id ?? "");
  const [date, setDate] = useState(dates[0] ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [childAge, setChildAge] = useState(4);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [experience, setExperience] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <section className="mt-8 border border-border bg-card p-4">
        <h2 className="font-heading text-2xl">已经去过</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">补记最近一个周末。写上体验、放上照片，就可以分享。</p>
        <Button type="button" className="mt-4 h-10 px-4" onClick={() => setOpen(true)}>
          补记一次出门
        </Button>
      </section>
    );
  }

  return (
    <section className="mt-8 border border-border bg-card p-4">
      <h2 className="font-heading text-2xl">补记一次出门</h2>
      <form
        className="mt-4 grid gap-3 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const result = createBackfill({
            activityId,
            useRain: false,
            skippedStopIds: [],
            date,
            parentName: name,
            phone,
            childAge,
            adults,
            children,
            agreed,
            experience,
            photos,
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setOpen(false);
          setExperience("");
          setPhotos([]);
          setError(null);
        }}
      >
        <label className="grid gap-1 text-sm">
          活动
          <select
            value={activityId}
            onChange={(event) => setActivityId(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-2.5"
          >
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.city} · {activity.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          哪一天
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
        <div className="grid gap-1">
          <Label htmlFor="backfill-name">家长姓名</Label>
          <Input id="backfill-name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="backfill-phone">手机号</Label>
          <Input id="backfill-phone" value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="numeric" />
        </div>
        <label className="grid gap-1 text-sm">
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
                  {count}
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
                  {count}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-1 text-sm md:col-span-2">
          照片
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (event) => {
              const files = [...(event.target.files ?? [])].slice(0, 3);
              try {
                setPhotos(await Promise.all(files.map((file) => compressPhoto(file))));
                setError(null);
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : "照片处理失败");
              }
            }}
          />
        </label>
        <label className="grid gap-1 text-sm md:col-span-2">
          体验
          <textarea
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
            rows={4}
            className="rounded-lg border border-input bg-background px-2.5 py-2"
          />
        </label>
        <label className="flex items-start gap-2 text-sm md:col-span-2">
          <input type="checkbox" className="mt-1" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
          这次已经去过，路线和花费按页面估算即可。
        </label>
        {error ? <p className="text-sm text-persimmon md:col-span-2">{error}</p> : null}
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" className="h-10 px-4">
            保存并生成分享
          </Button>
          <Button type="button" variant="outline" className="h-10 px-4" onClick={() => setOpen(false)}>
            收起
          </Button>
        </div>
      </form>
    </section>
  );
}

async function compressPhoto(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("请上传图片");
  const bitmap = await createImageBitmap(file);
  const max = 960;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("这张图处理不了");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.72);
}

async function sharePlan(text: string, photos: string[]) {
  const files = await Promise.all(
    photos.map(async (photo, index) => {
      const response = await fetch(photo);
      const blob = await response.blob();
      return new File([blob], `outing-${index + 1}.jpg`, { type: "image/jpeg" });
    }),
  );
  if (navigator.share) {
    const payload: ShareData = { title: "周末遛娃", text };
    if (files.length > 0 && navigator.canShare?.({ files })) payload.files = files;
    await navigator.share(payload);
    return;
  }
  await navigator.clipboard.writeText(text);
}
