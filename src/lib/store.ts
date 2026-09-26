import fs from "fs";

import type { BookingRecord } from "@/lib/types";

type State = {
  nextNumber: number;
  bookings: BookingRecord[];
};

const FILE = "/tmp/super-cat-bookings.json";

function emptyState(): State {
  return { nextNumber: 1001, bookings: [] };
}

function load(): State {
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as State;
    if (!parsed || !Array.isArray(parsed.bookings) || typeof parsed.nextNumber !== "number") {
      throw new Error("预约数据格式不正确");
    }
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyState();
    throw error;
  }
}

function save(state: State) {
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, FILE);
}

export function readState() {
  return load();
}

export function updateState(mutate: (state: State) => void) {
  const state = load();
  mutate(state);
  save(state);
  return state;
}
