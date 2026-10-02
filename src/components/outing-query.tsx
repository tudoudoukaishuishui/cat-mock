"use client";

import { useSearchParams } from "next/navigation";

import { OutingBrowser } from "@/components/outing-browser";
import { OutingPlanner } from "@/components/outing-planner";
import { OutingPlans } from "@/components/outing-plans";
import { parseFilters, suggestedChildAge } from "@/lib/outing-queries";
import type { Activity } from "@/lib/outing-types";

export function OutingBrowserFromUrl() {
  const params = useSearchParams();
  const filters = parseFilters({
    city: params.get("city") ?? undefined,
    age: params.get("age") ?? undefined,
    budget: params.get("budget") ?? undefined,
    plate: params.get("plate") ?? undefined,
    indoor: params.get("indoor") ?? undefined,
  });
  return <OutingBrowser initial={filters} />;
}

export function OutingPlannerFromUrl({ activity, rain }: { activity: Activity; rain: Activity | null }) {
  const params = useSearchParams();
  const age = Number(params.get("age"));
  const initialAge = Number.isInteger(age) && age >= 0 && age <= 12 && params.get("age") !== null ? age : suggestedChildAge("3-5");
  return (
    <OutingPlanner
      key={params.toString()}
      activity={activity}
      rain={rain}
      initialDate={params.get("date") ?? ""}
      initialAge={initialAge}
      initialRain={params.get("rain") === "1"}
    />
  );
}

export function OutingPlansFromUrl() {
  const params = useSearchParams();
  return <OutingPlans key={params.get("phone") ?? ""} initialPhone={params.get("phone") ?? ""} />;
}
