import type { Metadata } from "next";

import { ParentFooter } from "@/components/parent-footer";
import { ParentHeader } from "@/components/parent-header";

export const metadata: Metadata = {
  title: {
    default: "超级家长",
    template: "%s · 超级家长",
  },
  description: "按孩子年龄和预算选周末活动，排好路线。下雨有备选。出门之后可以记照片和体验。",
};

export default function FamilyLayout({ children }: LayoutProps<"/family">) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <ParentHeader />
      <div className="flex-1">{children}</div>
      <ParentFooter />
    </div>
  );
}
