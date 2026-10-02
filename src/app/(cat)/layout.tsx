import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "超级猫咪",
    template: "%s · 超级猫咪",
  },
  description:
    "按次预约的运动馆。首页看团课、私教、公开课，课程页写明教练、时间、地址、名额和价格。",
};

export default function CatLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
