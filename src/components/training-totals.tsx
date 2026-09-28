"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";

import { shanghaiDateKey } from "@/lib/format";
import { listLocalBookings } from "@/lib/local-bookings";

export function TrainingTotals({
  baseCount,
  historyDays,
}: {
  baseCount: number;
  historyDays: string[];
}) {
  const [local, setLocal] = useState({ days: [] as string[], count: 0 });

  useEffect(() => {
    const apply = () => {
      const active = listLocalBookings().filter((item) => !item.cancelledAt);
      setLocal({
        count: active.length,
        days: active.map((item) => shanghaiDateKey(item.start)),
      });
    };
    apply();
    window.addEventListener("super-cat-bookings", apply);
    return () => window.removeEventListener("super-cat-bookings", apply);
  }, []);

  const days = new Set([...historyDays, ...local.days]).size;
  const count = baseCount + local.count;

  return (
    <section className="mx-auto mt-8 grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-4">
      <div className="text-center">
        <p className="font-heading text-5xl text-persimmon" data-total="days">
          {days}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">累计天数</p>
      </div>
      <div className="grid size-20 place-items-center rounded-full border border-border bg-card text-muted-foreground">
        <UserRound className="size-8" />
      </div>
      <div className="text-center">
        <p className="font-heading text-5xl text-persimmon" data-total="count">
          {count}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">累计训练/次</p>
      </div>
    </section>
  );
}
