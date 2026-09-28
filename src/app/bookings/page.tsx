import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingsScreen } from "@/components/bookings-screen";

export const metadata: Metadata = {
  title: "我的运动",
  description: "查看累计训练天数、次数和每月预约记录。",
};

export default function BookingsPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-8 text-sm">正在读取本机预约…</p>}>
      <BookingsScreen />
    </Suspense>
  );
}
