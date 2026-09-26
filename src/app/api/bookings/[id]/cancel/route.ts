import { sessions } from "@/data/catalog";
import { cancelBooking } from "@/lib/booking";
import { getSessionView } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = cancelBooking(id);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.status });
  }
  const session = sessions.find((item) => item.id === result.booking.sessionId);
  const live = session ? getSessionView(session) : null;
  return Response.json(
    {
      ok: true,
      booking: result.booking,
      session: live
        ? { id: live.id, booked: live.booked, capacity: live.capacity, remaining: live.remaining }
        : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
