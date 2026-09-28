import type { Metadata } from "next";
import Link from "next/link";

import { MembershipJoin } from "@/components/membership-join";
import { GROUP_FROM_PRICE, GYM_HOUR_PRICE, pointRates, tiers } from "@/data/membership";

export const metadata: Metadata = {
  title: "会员",
  description: "超级猫咪按次付费。团课和自助健身舱按单次或按小时计费，充值超猫卡后预约团课享 95 折。",
};

export default function MembershipPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          首页
        </Link>
        <span> / 会员</span>
      </nav>
      <header className="mt-4 max-w-3xl">
        <p className="text-xs tracking-[0.16em] text-muted-foreground">MEMBERSHIP</p>
        <h1 className="mt-2 font-heading text-5xl">会员</h1>
        <p className="mt-4 leading-7">
          按次付费，没有年卡。团课和自助健身都按单次或按小时支付。超猫卡是储值余额，充值后预约团课享 95 折。
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="border border-border bg-card p-5">
          <h2 className="font-heading text-2xl">团课</h2>
          <p className="mt-3 font-heading text-4xl">官网 {GROUP_FROM_PRICE} 元/节起</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            这是品牌官网的全国口径，不是各门店的保证价，也不能据此认为成都有 69 元课程。北京、上海的历史参考是 89—179 元/节，当前场次价待确认。
          </p>
        </article>
        <article className="border border-border bg-card p-5">
          <h2 className="font-heading text-2xl">自助健身舱</h2>
          <p className="mt-3 font-heading text-4xl">¥{GYM_HOUR_PRICE}/小时</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            24 小时无人值守。进舱按小时计费，约 ¥{GYM_HOUR_PRICE}/小时，用超猫卡余额支付。
          </p>
        </article>
        <article className="border border-border bg-card p-5">
          <h2 className="font-heading text-2xl">怎么预约</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            团课、私教和公开课在本站课表预约。也可以在微信公众号或小程序里查看场次、改约和看余额。
          </p>
        </article>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-3xl">会员等级</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          上课积累积分，集满后兑换权益。充值只增加余额，不直接升级。
        </p>
        <div className="mt-4 overflow-x-auto border border-border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-card text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">等级</th>
                <th className="px-4 py-3 font-medium">积分</th>
                <th className="px-4 py-3 font-medium">可兑换</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.name} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{tier.name}</td>
                  <td className="px-4 py-3">{tier.points === 0 ? "开始累计" : `${tier.points} 起`}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tier.perk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {pointRates.map((item) => (
            <li key={item.name} className="border border-border bg-card px-3 py-2">
              <span className="text-muted-foreground">{item.name}</span>
              <span className="mt-1 block font-medium">{item.rate}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 max-w-3xl text-sm leading-6 text-muted-foreground">
        <h2 className="font-heading text-2xl text-foreground">会员卡用户协议</h2>
        <p className="mt-2">
          超猫卡是储值余额，不是期限卡。余额用于按次支付团课，以及按小时支付自助健身舱。首次充值可选 ¥288；¥2000 赠送 ¥100，¥5000 赠送 ¥250，赠送金额计入余额。持卡预约团课享 95 折。两人及以上报名团课或私教，仍按 9 折，可与持卡折扣同时计算。
        </p>
        <p className="mt-2">
          积分只在持卡上课后增加。团课 10 分/节，私教 20 分/节，公开课 5 分/节，自助健身 8 分/小时。取消预约后，这次加上的积分会扣回。余额和积分保存在当前浏览器里。
        </p>
      </section>

      <MembershipJoin />
    </main>
  );
}
