import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AugustTraining } from "@/components/august-training";
import { ResetBookingsButton } from "@/components/booking-actions";
import { BookingsScreen } from "@/components/bookings-screen";
import { TrainingTotals } from "@/components/training-totals";
import { augustTrainingSummary } from "@/data/august-training";

export const metadata: Metadata = {
  title: "我的运动",
  description: "查看累计训练天数、次数，以及上个月的减脂训练记录。",
};

export default function BookingsPage() {
  const august = augustTrainingSummary();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          首页
        </Link>
        <span> / 我的运动</span>
      </nav>
      <h1 className="mt-4 text-center font-heading text-4xl md:text-5xl">我的运动</h1>
      <TrainingTotals baseCount={august.count} historyDays={august.dayKeys} />
      <Suspense fallback={<p className="mt-10 text-sm text-muted-foreground">正在读取本机预约…</p>}>
        <BookingsScreen />
      </Suspense>
      <AugustTraining />
      <div className="mt-10 border-t border-border pt-6">
        <h2 className="font-heading text-2xl">清空记录</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          清空只清掉本机新预约，预约编号从 BK-1001 重新开始。8 月的训练记录会保留。课表上原来的已预约人数不会被清掉。
        </p>
        <div className="mt-4">
          <ResetBookingsButton />
        </div>
      </div>
    </main>
  );
}
