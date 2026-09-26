import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="font-heading text-5xl">没有这一页</h1>
      <p className="mt-4 leading-7">课程或板块不存在。回首页看团课、私教和公开课。</p>
      <Link href="/" className="mt-6 inline-flex h-10 items-center text-persimmon">
        回首页
      </Link>
    </main>
  );
}
