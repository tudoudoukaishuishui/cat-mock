export type PlateSlug = "park" | "indoor" | "walk";

export type Setting = "户外" | "室内";

export type AgeFilter = "3-5" | "0-2" | "6-8" | "9-12" | "全部";

export type BudgetFilter = "any" | "0" | "100" | "300" | "600";

export type PlateFilter = "全部" | PlateSlug;

export type CityName = "上海" | "北京" | "深圳" | "成都";

export type OutingFilters = {
  city: CityName;
  age: AgeFilter;
  budget: BudgetFilter;
  plate: PlateFilter;
  indoorOnly: boolean;
};

export type Stop = {
  id: string;
  title: string;
  detail: string;
  address: string;
  minutes: number;
  optional?: boolean;
  defaultOff?: boolean;
  extraBudget?: number;
};

export type Activity = {
  id: string;
  plate: PlateSlug;
  name: string;
  city: CityName;
  summary: string;
  description: string;
  ageMin: number;
  ageMax: number;
  budget: number;
  budgetNote: string;
  startTime: string;
  setting: Setting;
  rainId: string | null;
  meet: string;
  transit: string;
  stops: Stop[];
  bring: string[];
  notes: string[];
};

export type ScheduledStop = Stop & {
  time: string;
  end: string;
};

export type WeekPlan = {
  date: string;
  activity: Activity;
  repeated: boolean;
};

export type OutingPlan = {
  id: string;
  activityId: string;
  useRain: boolean;
  skippedStopIds: string[];
  date: string;
  parentName: string;
  phone: string;
  childAge: number;
  adults: number;
  children: number;
  budgetSnapshot: number;
  createdAt: string;
  cancelledAt: string | null;
  wentAt: string | null;
  experience: string | null;
  photos: string[];
  backfill: boolean;
};
