"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cancelLocalBooking, resetLocalBookings } from "@/lib/local-bookings";

export function CancelBookingButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="h-9 px-3"
        disabled={pending}
        onClick={() => {
          setPending(true);
          setError(null);
          const data = cancelLocalBooking(id);
          if (!data.ok) {
            setError(data.error);
            setPending(false);
          }
        }}
      >
        {pending ? "正在取消" : "取消预约"}
      </Button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ResetBookingsButton() {
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {armed ? (
        <Button
          type="button"
          variant="destructive"
          className="h-10 px-4"
          onClick={() => {
            resetLocalBookings();
            setArmed(false);
            setError(null);
          }}
        >
          确认清空
        </Button>
      ) : (
        <Button type="button" variant="outline" className="h-10 px-4" onClick={() => setArmed(true)}>
          清空预约记录
        </Button>
      )}
      {armed ? (
        <button type="button" className="text-sm text-muted-foreground" onClick={() => setArmed(false)}>
          先不清空
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
