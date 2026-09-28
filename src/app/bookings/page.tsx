import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingsScreen } from "@/components/bookings-screen";
import { listFatLossPlan } from "@/lib/fat-loss-plan";

export const metadata: Metadata = {
  title: "我的运动",
  description: "按减肥匹配现有课程，并查看累计训练天数、次数和每月预约记录。",
};

export default function BookingsPage() {
  const plan = listFatLossPlan();
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-8 text-sm">正在读取本机预约…</p>}>
      <BookingsScreen plan={plan} />
    </Suspense>
  );
}
