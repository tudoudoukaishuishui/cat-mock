import type { ScheduledStop } from "@/lib/outing-types";

export function OutingRoute({ stops }: { stops: ScheduledStop[] }) {
  return (
    <ol className="mt-3 space-y-4">
      {stops.map((stop, index) => (
        <li key={stop.id} className="grid grid-cols-[4.75rem_1fr] gap-3">
          <p className="text-sm text-muted-foreground">
            {stop.time}
            <span className="mt-0.5 block text-xs">{stop.minutes} 分钟</span>
          </p>
          <div>
            <p className="font-medium">
              {index + 1}. {stop.title}
              {stop.optional ? <span className="ml-2 text-xs text-muted-foreground">可拿掉</span> : null}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{stop.detail}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stop.address}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
