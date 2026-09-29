import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AugustTraining } from "@/components/august-training";
import { BananaStatus } from "@/components/banana-status";
import { ResetBookingsButton } from "@/components/booking-actions";
import { BookingsScreen } from "@/components/bookings-screen";
import { TrainingTotals } from "@/components/training-totals";
import { augustTrainingSummary } from "@/data/august-training";

export const metadata: Metadata = {
  title: "我的运动",
  description: "查看北京 8 月的减脂训练，以及超猫卡余额。",
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
      <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-6 text-muted-foreground">
        这里是 2026 年 8 月的上课记录、超猫卡余额和香蕉。新的预约列在预约记录里，不改变 8 月余额。
      </p>
      <TrainingTotals baseCount={august.count} historyDays={august.dayKeys} />
      <section data-balance className="mx-auto mt-8 max-w-xl border border-border bg-card px-5 py-5 text-center">
        <p className="text-xs tracking-[0.16em] text-muted-foreground">超猫卡余额</p>
        <p className="mt-2 font-heading text-5xl text-persimmon">¥{august.balance}</p>
      </section>
      <BananaStatus earned={august.bananasEarned} />
      <Suspense fallback={<p className="mt-10 text-sm text-muted-foreground">正在读取预约…</p>}>
        <BookingsScreen />
      </Suspense>
      <AugustTraining />
      <div className="mt-10 border-t border-border pt-6">
        <h2 className="font-heading text-2xl">清空记录</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          清空会删除预约记录，编号从 BK-1001 重新开始。8 月已完成的课程、余额和香蕉保留。课表里原有的已预约人数不变。
        </p>
        <div className="mt-4">
          <ResetBookingsButton />
        </div>
      </div>
    </main>
  );
}
