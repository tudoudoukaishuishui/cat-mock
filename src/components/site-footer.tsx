import { studios } from "@/data/catalog";

export function SiteFooter() {
  const shops = studios.filter((studio) => studio.kind === "门店");

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 text-sm text-muted-foreground md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="font-heading text-base text-foreground">超级猫咪 · 模拟预约站</p>
          <p className="mt-2 max-w-xl leading-6">
            这是给智能体演练用的课程站，不是真实门店。预约写在服务器的临时文件里，清空或重启环境后，已预约人数会回到课表上的初始数字。
          </p>
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
