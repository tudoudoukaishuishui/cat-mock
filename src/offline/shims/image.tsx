import type { ImgHTMLAttributes } from "react";

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

export default function Image({ src, alt, fill, className, priority: _priority, sizes: _sizes, ...props }: ImageProps) {
  return (
    <img
      src={typeof src === "string" ? src : ""}
      alt={alt ?? ""}
      decoding="async"
      className={className}
      style={
        fill
          ? { position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0, color: "transparent" }
          : undefined
      }
      {...props}
    />
  );
}
