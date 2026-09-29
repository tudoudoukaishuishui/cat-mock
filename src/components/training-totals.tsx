import { UserRound } from "lucide-react";

export function TrainingTotals({
  baseCount,
  historyDays,
}: {
  baseCount: number;
  historyDays: string[];
}) {
  return (
    <section className="mx-auto mt-8 grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-4">
      <div className="text-center">
        <p className="font-heading text-5xl text-persimmon" data-total="days">
          {historyDays.length}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">示例天数</p>
      </div>
      <div className="grid size-20 place-items-center rounded-full border border-border bg-card text-muted-foreground">
        <UserRound className="size-8" />
      </div>
      <div className="text-center">
        <p className="font-heading text-5xl text-persimmon" data-total="count">
          {baseCount}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">示例训练/次</p>
      </div>
    </section>
  );
}
