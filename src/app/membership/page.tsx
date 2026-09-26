import type { Metadata } from "next";
import Link from "next/link";

import { MembershipJoin } from "@/components/membership-join";
import { EARLY_BIRD_OFF, earlyBirdPrice, plans } from "@/data/membership";

export const metadata: Metadata = {
  title: "会员",
  description: "超级猫咪月卡、季卡、半年卡和年卡。课程也可以按场次单独购买。",
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
          会员有月卡、季卡、半年卡和年卡。有效期内可以预约团课和公开课，每场仍受名额限制。私教不包含在会籍里。不想办卡的话，每一节课都可以单独购买。
        </p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <article key={plan.id} className="flex flex-col border border-border bg-card p-5">
            <h2 className="font-heading text-3xl">{plan.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{plan.days} 天</p>
            <p className="mt-4 text-sm text-muted-foreground line-through">标价 ¥{plan.price}</p>
            <p className="mt-1 font-heading text-4xl">¥{earlyBirdPrice(plan.price)}</p>
            <p className="mt-1 text-sm">新会员早鸟价，立减 ¥{EARLY_BIRD_OFF}</p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{plan.note}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 grid gap-6 border-t border-border pt-8 md:grid-cols-3">
        <div>
          <h2 className="font-heading text-2xl">单独买课</h2>
          <p className="mt-2 text-sm leading-6">
            团课、私教、公开课都可以不办卡，按场次付款。价格、教练和名额以课程页上的那一场为准。
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl">新会员早鸟</h2>
          <p className="mt-2 text-sm leading-6">
            这个手机号第一次办卡，在对应标价上减 ¥{EARLY_BIRD_OFF}。已经办过卡的手机号再办，按标价。
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl">两人及以上</h2>
          <p className="mt-2 text-sm leading-6">
            团课一次报名 2 人或 3 人，这一单打 9 折。私教注明一起报名 2 人及以上，这一节打 9 折；私教场次仍然只占 1 个名额。公开课和免费场次不参加这个折扣。
          </p>
        </div>
      </section>

      <MembershipJoin />
    </main>
  );
}
