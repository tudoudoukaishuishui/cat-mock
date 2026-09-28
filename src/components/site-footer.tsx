import { studios } from "@/data/catalog";

import { SiteFooterGate } from "@/components/site-footer-gate";

export function SiteFooter() {
  const shops = studios
    .filter((studio) => studio.kind === "门店")
    .map((studio) => ({ id: studio.id, short: studio.short, address: studio.address }));

  return <SiteFooterGate shops={shops} />;
}
