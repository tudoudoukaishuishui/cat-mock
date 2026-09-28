import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { BookingsScreen } from "@/components/bookings-screen";
import { FatLossMatches } from "@/components/fat-loss-matches";
import { TrainingTotals } from "@/components/training-totals";
import { listFatLossPlan } from "@/lib/fat-loss-plan";

export const metadata: Metadata = {
  title: "我的运动",
  description: "按减肥匹配现有课程，并查看累计训练天数、次数和每月预约记录。",
};

export default function BookingsPage() {
  const plan = listFatLossPlan();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          首页
        </Link>
        <span> / 我的运动</span>
      </nav>
      <h1 className="mt-4 text-center font-heading text-4xl md:text-5xl">我的运动</h1>
      <TrainingTotals />
      <FatLossMatches plan={plan} />
      <Suspense fallback={<p className="mt-10 text-sm text-muted-foreground">正在读取本机预约…</p>}>
        <BookingsScreen />
      </Suspense>
    </main>
  );
}
