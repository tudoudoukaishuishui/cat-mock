import { getCourseView } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const view = getCourseView(id);
  if (!view) {
    return Response.json({ ok: false, error: "找不到这个课程" }, { status: 404 });
  }
  return Response.json({ ok: true, course: view }, { headers: { "Cache-Control": "no-store" } });
}
