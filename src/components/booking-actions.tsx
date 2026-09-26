"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function CancelBookingButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="h-9 px-3"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          try {
            const response = await fetch(`/api/bookings/${id}/cancel`, { method: "POST" });
            const data = (await response.json()) as { ok: boolean; error?: string };
            if (!response.ok || !data.ok) {
              setError(data.error ?? "取消失败");
              setPending(false);
              return;
            }
            router.refresh();
          } catch {
            setError("网络异常，取消没有提交成功");
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
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {armed ? (
        <Button
          type="button"
          variant="destructive"
          className="h-10 px-4"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            setError(null);
            try {
              const response = await fetch("/api/reset", { method: "POST" });
              const data = (await response.json()) as { ok: boolean; error?: string };
              if (!response.ok || !data.ok) {
                setError(data.error ?? "清空失败");
                setPending(false);
                return;
              }
              setArmed(false);
              setPending(false);
              router.refresh();
            } catch {
              setError("网络异常，没有清空");
              setPending(false);
            }
          }}
        >
          {pending ? "正在清空" : "确认清空"}
        </Button>
      ) : (
        <Button type="button" variant="outline" className="h-10 px-4" onClick={() => setArmed(true)}>
          清空演示预约
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
