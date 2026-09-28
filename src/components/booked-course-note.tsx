"use client";

import { useEffect, useState } from "react";

import { listLocalBookings } from "@/lib/local-bookings";

export function BookedCourseNote({ courseId }: { courseId: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const apply = () => {
      setCount(
        listLocalBookings().filter((item) => !item.cancelledAt && item.courseId === courseId).length,
      );
    };
    apply();
    window.addEventListener("super-cat-bookings", apply);
    return () => window.removeEventListener("super-cat-bookings", apply);
  }, [courseId]);

  if (count === 0) return null;
  return <span className="text-persimmon">已约 {count} 场</span>;
}

export function BookedMatchSummary({ courseIds }: { courseIds: string[] }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const apply = () => {
      const booked = new Set(
        listLocalBookings()
          .filter((item) => !item.cancelledAt && courseIds.includes(item.courseId))
          .map((item) => item.courseId),
      );
      setCount(booked.size);
    };
    apply();
    window.addEventListener("super-cat-bookings", apply);
    return () => window.removeEventListener("super-cat-bookings", apply);
  }, [courseIds]);

  if (count === 0) return null;
  return <span> 已约其中 {count} 门。</span>;
}
