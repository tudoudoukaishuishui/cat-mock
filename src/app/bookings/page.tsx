import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingsScreen } from "@/components/bookings-screen";

export const metadata: Metadata = {
  title: "我的预约",
  description: "查看、取消超级猫咪的演示预约。预约保存在本机浏览器里。",
};

export default function BookingsPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-8 text-sm">正在读取本机预约…</p>}>
      <BookingsScreen />
    </Suspense>
  );
}
