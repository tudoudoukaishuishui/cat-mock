"use client";

export default function FamilyError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="font-heading text-5xl">计划没有加载出来</h1>
      <p className="mt-4 leading-7">这页暂时打不开。可以重试。</p>
      <button type="button" onClick={reset} className="mt-6 h-10 rounded-lg bg-primary px-4 text-sm text-primary-foreground">
        重试
      </button>
    </main>
  );
}
