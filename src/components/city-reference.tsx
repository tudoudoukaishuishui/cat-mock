import { cityPrices, levelGuide, personalOffer } from "@/data/city-prices";
import type { SectionSlug } from "@/lib/types";

export function CityReference({ section }: { section: SectionSlug }) {
  const key = section === "group" ? "group" : section === "personal" ? "personal" : "open";

  return (
    <section className="mt-8 space-y-6">
      <div>
        <h2 className="font-heading text-3xl">价格信息</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          按城市列出的是历史参考或待确认口径，不是当前可购买报价。
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {cityPrices.map((item) => (
            <article key={item.city} className="border border-border bg-card p-4">
              <h3 className="font-heading text-2xl">{item.city}</h3>
              <p className="mt-2 text-sm leading-6">{item[key]}</p>
            </article>
          ))}
        </div>
      </div>

      {section === "personal" ? <PersonalOffer /> : null}

      {section === "open" ? null : (
        <div>
          <h2 className="font-heading text-3xl">难度分级</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {levelGuide.map((item) => (
              <li key={item.name} className="border border-border bg-card p-4 text-sm leading-6">
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function PersonalOffer() {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl">课时与课包</h2>
      <p className="max-w-3xl text-sm leading-6">{personalOffer.duration}</p>
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="bg-card text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">城市</th>
              <th className="px-4 py-3 font-medium">课包课时数</th>
              <th className="px-4 py-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {personalOffer.specs.map((item) => (
              <tr key={item.city} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{item.city}</td>
                <td className="px-4 py-3">{item.hours}</td>
                <td className="px-4 py-3 text-muted-foreground">待核实</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2 text-sm leading-6 text-muted-foreground">
        <p>{personalOffer.source}</p>
        <p>{personalOffer.history}</p>
        <p>{personalOffer.match}</p>
        <p>{personalOffer.schedule}</p>
        <p>{personalOffer.price}</p>
      </div>
      <h3 className="font-heading text-2xl">历史单课标价 · 元/课时</h3>
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-card text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">职级</th>
              <th className="px-4 py-3 font-medium">北京</th>
              <th className="px-4 py-3 font-medium">上海</th>
              <th className="px-4 py-3 font-medium">成都</th>
            </tr>
          </thead>
          <tbody>
            {personalOffer.ranks.map((row) => (
              <tr key={row.rank} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{row.rank}</td>
                <td className="px-4 py-3">{row.beijing}</td>
                <td className="px-4 py-3">{row.shanghai}</td>
                <td className="px-4 py-3">{row.chengdu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{personalOffer.rankSource}</p>
    </div>
  );
}
