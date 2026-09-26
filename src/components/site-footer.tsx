import { studios } from "@/data/catalog";

export function SiteFooter() {
  const shops = studios.filter((studio) => studio.kind === "门店");

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 text-sm text-muted-foreground md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="font-heading text-base text-foreground">超级猫咪</p>
        </div>
        <ul className="space-y-1">
          {shops.map((studio) => (
            <li key={studio.id}>
              {studio.short} · {studio.address}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
