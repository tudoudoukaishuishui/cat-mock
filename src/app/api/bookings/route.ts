import { sessions } from "@/data/catalog";
import { createBooking } from "@/lib/booking";
import { bookingViews, getSessionView } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const phone = new URL(request.url).searchParams.get("phone") ?? undefined;
  return Response.json({ ok: true, bookings: bookingViews(phone || undefined) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let body: {
    sessionId?: string;
    name?: string;
    phone?: string;
    partySize?: number;
    agreed?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, error: "请求体不是 JSON" }, { status: 400 });
  }

  const result = createBooking({
    sessionId: body.sessionId ?? "",
    name: body.name ?? "",
    phone: body.phone ?? "",
    partySize: body.partySize ?? 1,
    agreed: Boolean(body.agreed),
  });

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
        ? {
            id: live.id,
            booked: live.booked,
            capacity: live.capacity,
            remaining: live.remaining,
            status: live.status,
            statusLabel: live.statusLabel,
          }
        : null,
    },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
