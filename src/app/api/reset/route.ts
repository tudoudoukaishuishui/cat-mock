import { resetBookings } from "@/lib/booking";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  resetBookings();
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
