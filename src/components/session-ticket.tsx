"use client";

import { useEffect, useState } from "react";

import { BookDialog } from "@/components/book-dialog";
import { GroupBookSheet } from "@/components/group-book-sheet";
import { Button } from "@/components/ui/button";
import { localExtra } from "@/lib/local-bookings";
import { withExtraBookings } from "@/lib/queries";
import type { SessionView } from "@/lib/types";

export function SessionTicket({ session }: { session: SessionView }) {
  const [view, setView] = useState(session);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    const apply = () => setView(withExtraBookings(session, localExtra(session.id)));
    apply();
    window.addEventListener("super-cat-bookings", apply);
    return () => window.removeEventListener("super-cat-bookings", apply);
  }, [session]);

  return (
    <article
      id={`session-${view.id}`}
      data-session-id={view.id}
      data-status={view.status}
      className="scroll-mt-24 border border-border bg-card p-4 md:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-heading text-2xl">{view.timeLabel}</h3>
        <p className="text-sm">
          {view.statusLabel} · {view.id}
        </p>
      </div>
      <dl className="mt-3">
        <Field label="教练" field="coach" value={view.coachLine} />
        <Field label="等级" field="level" value={view.level} />
        <Field label="时间" field="time" value={`${view.timeLabel}（${view.durationMinutes} 分钟）`} />
        <Field
          label="地址"
          field="address"
          value={
            <span>
              {view.addressLine}
              <span className="mt-1 block text-muted-foreground">
                {view.transit}。签到：{view.frontDesk}。{view.facilities}
              </span>
            </span>
          }
        />
        <Field label="最多人数" field="capacity" value={`${view.capacity} 人`} />
        <Field label="已预约" field="booked" value={`${view.booked} 人`} />
        <Field label="剩余名额" field="remaining" value={`${view.remaining} 人`} />
        <Field
          label="价格"
          field="price"
          value={
            <span>
              {view.priceLabel}
              <span className="mt-1 block text-muted-foreground">{view.priceIncludes}</span>
            </span>
          }
        />
        <Field
          label="注意事项"
          field="notes"
          value={
            <ul className="space-y-1">
              {view.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
              <li>{view.cancelRule}</li>
            </ul>
          }
        />
      </dl>
      <div className="mt-4">
        {view.section === "group" ? (
          <>
            <Button type="button" className="h-10 px-4" onClick={() => setSheet(true)}>
              {view.status === "open" ? "预约此场次" : "查看场次"}
            </Button>
            {sheet ? <GroupBookSheet session={view} onClose={() => setSheet(false)} /> : null}
          </>
        ) : (
          <BookDialog session={view} />
        )}
      </div>
    </article>
  );
}

function Field({ label, field, value }: { label: string; field: string; value: React.ReactNode }) {
  return (
    <div data-field={field} className="grid gap-1 border-t border-border py-3 text-sm sm:grid-cols-[6.5rem_1fr]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="leading-6">{value}</dd>
    </div>
  );
}
