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
          按次付费，没有年卡，也没有自动续费。超猫卡是储值余额，不是期限内不限次。每次预约团课仍按当场标价计算模拟应付，持卡再打 95 折。本页充值和预约金额都是模拟，不发生真实资金交易。
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="border border-border bg-card p-5">
          <h2 className="font-heading text-2xl">团课</h2>
          <p className="mt-3 font-heading text-4xl">¥{GROUP_FROM_PRICE} 起</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            这是当前课表里团课的最低原价，不是未排期的宣传价。每节仍按当场标价计算，城市和课程不同，价格就不同。
          </p>
        </article>
        <article className="border border-border bg-card p-5">
          <h2 className="font-heading text-2xl">自助健身舱</h2>
          <p className="mt-3 font-heading text-4xl">¥{GYM_HOUR_PRICE}/小时</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            24 小时无人值守。进舱 ¥{GYM_HOUR_PRICE}/小时，不足 1 小时按 1 小时计。本站没有自助舱预约入口。
          </p>
        </article>
        <article className="border border-border bg-card p-5">
          <h2 className="font-heading text-2xl">怎么预约</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            团课、私教和公开课只在本站课表预约。本站没有接入微信公众号或小程序，不能在那些渠道查看余额或改约。
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
          等级按香蕉累计，不是可花掉的余额。原来的 200、800、2000、5000 分，按团课 10 分换成 1 根，现在是 20、80、200、500 根。充值只增加模拟余额，不直接升级。预约时先显示待入账香蕉，场次结束且未取消后才计入等级。本站不能兑换下表里的券、小时、候补或换课，所以兑换不会扣香蕉，也不会因此降级。
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
          超猫卡是储值余额，不是期限卡。余额没有设定使用期限。持卡 95 折在这台浏览器的账户还在时有效，没有单独的折扣到期日，也没有自动续费。首次模拟充值可选 ¥288；¥2000 赠送 ¥100，¥5000 赠送 ¥250，赠送额和本金记在同一个余额里。本站不扣款，因此没有消费顺序、退卡和转让。
        </p>
        <p className="mt-2">
          折扣：团课先按持卡 95 折并四舍五入到元，同一订单 2 人或 3 人再打 9 折并再次四舍五入到元。私教只按 1 人标价，不打 95 折，也没有多人 9 折。公开课不使用这两档折扣。10 元香蕉券在折扣之后抵扣，最低到 0。例如团课 ¥89×3 人 = ¥267，95 折取整为 ¥254，再 9 折取整为 ¥229。燃脂搏击自带拳套按人减 ¥10，只在到店核销，不写入模拟应付，取消也不在线上返还。
        </p>
        <p className="mt-2">
          模拟充值只改这台浏览器里的余额数字。确认预约只记下模拟应付，不从余额扣款，也不发起支付。名额在确认时占用，没有未付款再保留一段时间的步骤。
        </p>
        <p className="mt-2">
          持卡预约会先记待入账香蕉：团课 1 根/人，私教 1.5 根/节，都记在本单手机号上，不拆给同行人。公开课不获得香蕉。自助健身按 0.5 根/小时，本站不能预约。场次结束且预约未取消后才变成已入账。取消未完成的预约会撤销待入账。本站没有签到。无忧换课仍受该课 6 小时或 24 小时取消时限约束，不处理差价。余额、香蕉和预约只保存在当前浏览器里，清掉网站数据或换设备后会消失。
        </p>
      </section>

      <MembershipJoin />
    </main>
  );
}
