"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="font-heading text-5xl">课表没有加载出来</h1>
      <p className="mt-4 leading-7">请重试。如果仍然打不开，稍后再来。</p>
      <button type="button" onClick={reset} className="mt-6 h-10 rounded-lg bg-primary px-4 text-sm text-primary-foreground">
        重试
      </button>
    </main>
  );
}
