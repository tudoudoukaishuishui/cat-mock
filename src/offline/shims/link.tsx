import type { AnchorHTMLAttributes } from "react";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export default function Link({ href, ...props }: LinkProps) {
  const path = href.startsWith("#") ? href.slice(1) : href;
  const hash = path.startsWith("/") ? path : `/${path}`;
  return <a href={`#${hash}`} {...props} />;
}
