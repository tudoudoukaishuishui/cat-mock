import Link from "next/link";

export function MissingPage({
  title,
  body,
  href = "/",
  linkLabel = "回首页",
}: {
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="font-heading text-5xl">{title}</h1>
      <p className="mt-4 leading-7">{body}</p>
      <Link href={href} className="mt-6 inline-flex h-10 items-center text-persimmon">
        {linkLabel}
      </Link>
    </main>
  );
}
