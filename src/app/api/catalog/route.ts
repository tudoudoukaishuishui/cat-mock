import { homeData, listCourseItems, listSessionViews } from "@/lib/queries";
import { sections } from "@/data/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const home = homeData();
  return Response.json(
    {
      ok: true,
      sections: sections.map((section) => ({
        ...section,
        courses: listCourseItems(section.slug),
      })),
      sessions: listSessionViews(),
      bookableCount: home.bookableCount,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
