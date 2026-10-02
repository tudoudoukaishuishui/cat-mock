import type { Metadata } from "next";
import Link from "next/link";

import { MembershipJoin } from "@/components/membership-join";
import { hotCourseNames } from "@/data/bananas";
import { GROUP_FROM_PRICE, GYM_HOUR_PRICE, bananaRates, tiers } from "@/data/membership";

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
          按次付费，没有年卡，也没有自动续费。超猫卡按余额储值。预约团课按当场标价计算应付金额，持卡再打 95 折。
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="border border-border bg-card p-5">
          <h2 className="font-heading text-2xl">团课</h2>
          <p className="mt-3 font-heading text-4xl">¥{GROUP_FROM_PRICE} 起</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            当前课表团课的最低价。每节按当场标价计算，城市和课程不同，价格不同。
          </p>
        </article>
        <article className="border border-border bg-card p-5">
          <h2 className="font-heading text-2xl">自助健身舱</h2>
          <p className="mt-3 font-heading text-4xl">¥{GYM_HOUR_PRICE}/小时</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            24 小时无人值守。进舱 ¥{GYM_HOUR_PRICE}/小时，不足 1 小时按 1 小时计。到店进舱，不在课表预约。
          </p>
        </article>
        <article className="border border-border bg-card p-5">
          <h2 className="font-heading text-2xl">怎么预约</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            在课表预约团课、私教和公开课。充值后可在本页查看余额。
          </p>
        </article>
      </section>

      <section className="mt-10" data-banana-rules>
        <h2 className="font-heading text-3xl">香蕉规则</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="border border-border bg-card p-5">
            <h3 className="font-heading text-2xl">香蕉获取</h3>
            <p className="mt-3 text-sm leading-6">
              团课完课 1 根香蕉。私教完课 1.5 根香蕉。公开课不获得香蕉。自助健身 0.5 根香蕉/小时。
            </p>
          </article>
          <article className="border border-border bg-card p-5">
            <h3 className="font-heading text-2xl">香蕉兑换</h3>
            <p className="mt-3 text-sm leading-6">累计 8 根香蕉，可兑换 1 张 10 元课程优惠券。</p>
          </article>
          <article className="border border-border bg-card p-5">
            <h3 className="font-heading text-2xl">优惠券使用</h3>
            <p className="mt-3 text-sm leading-6">
              使用兑换的优惠券购买参与活动的课程，可抵扣 10 元课程费用。
            </p>
          </article>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
          团课按上课人数计算，热门团课完课也是 1 根，但不能使用优惠券：{hotCourseNames.join("、")}。私教固定 1.5 根，可以使用优惠券。公开课完课没有香蕉。课程卡片上会标明能不能用券。
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-3xl">会员等级</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          等级按累计香蕉计算。充值增加余额，不直接升级。预约后先记待入账，场次结束且未取消后计入等级。用香蕉兑换优惠券不降低等级。
        </p>
        <div className="mt-4 overflow-x-auto border border-border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-card text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">等级</th>
                <th className="px-4 py-3 font-medium">香蕉</th>
                <th className="px-4 py-3 font-medium">可兑换</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.name} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{tier.name}</td>
                  <td className="px-4 py-3">{tier.points === 0 ? "开始累计" : `${tier.points} 根起`}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tier.perk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {bananaRates.map((item) => (
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
          超猫卡按余额储值，余额没有使用期限。持卡预约团课享 95 折，折扣没有单独到期日，也没有自动续费。首次充值可选 ¥288；¥2000 赠送 ¥100，¥5000 赠送 ¥250，赠送额和本金记在同一个余额里。
        </p>
        <p className="mt-2">
          折扣：团课先按持卡 95 折并四舍五入到元，同一订单 2 人或 3 人再打 9 折并再次四舍五入到元。私教按 1 人标价结算，不打 95 折，也没有多人折扣。公开课不使用这两档折扣。10 元香蕉券在折扣之后抵扣，最低到 0。团课 ¥89×3 人 = ¥267，95 折取整为 ¥254，再 9 折取整为 ¥229。燃脂搏击自带拳套按人减 ¥10，到店签到核销，不计入预约应付；取消预约不在线上返还这 10 元。
        </p>
        <p className="mt-2">
          充值计入超猫卡余额。确认预约后立即占用名额，应付金额不从余额扣除。
        </p>
        <p className="mt-2">
          持卡预约先记待入账香蕉：团课 1 根/人，私教 1.5 根/节，记在本单手机号上。公开课不获得香蕉。自助健身 0.5 根/小时，到店进舱。场次结束且预约未取消后入账。取消未结束的预约会撤销待入账。换课仍受该课 6 小时或 24 小时取消时限约束，不补差价。
        </p>
      </section>

      <MembershipJoin />
    </main>
  );
}
