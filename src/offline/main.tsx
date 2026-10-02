import { use, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

import BookingsPage from "@/app/bookings/page";
import CoursePage from "@/app/courses/[id]/page";
import HomePage from "@/app/page";
import MembershipPage from "@/app/membership/page";
import SectionPage from "@/app/sections/[slug]/page";
import { MissingPage } from "@/components/missing-page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { currentAnchor, usePathname } from "@/offline/shims/navigation";

const cache = new Map<string, Promise<ReactNode>>();

function cached(key: string, load: () => Promise<ReactNode>) {
  const existing = cache.get(key);
  if (existing) return existing;
  const next = load();
  cache.set(key, next);
  return next;
}

function SectionRoute({ slug }: { slug: string }) {
  return use(cached(`section:${slug}`, () => SectionPage({ params: Promise.resolve({ slug }) })));
}

function CourseRoute({ id }: { id: string }) {
  const node = use(cached(`course:${id}`, () => CoursePage({ params: Promise.resolve({ id }) })));
  useEffect(() => {
    const anchor = currentAnchor();
    if (anchor) document.getElementById(anchor)?.scrollIntoView();
  }, [id]);
  return node;
}

function Page() {
  const path = usePathname();
  if (path === "/") return <HomePage />;
  if (path === "/membership") return <MembershipPage />;
  if (path === "/bookings") return <BookingsPage />;
  const section = /^\/sections\/([^/]+)$/.exec(path);
  if (section) return <SectionRoute slug={section[1]} />;
  const course = /^\/courses\/([^/]+)$/.exec(path);
  if (course) return <CourseRoute id={course[1]} />;
  return <MissingPage title="没有这一页" body="回首页看团课、私教和公开课。" />;
}

function App() {
  const path = usePathname();
  useEffect(() => {
    const anchor = currentAnchor();
    if (anchor) {
      document.getElementById(anchor)?.scrollIntoView();
      return;
    }
    window.scrollTo(0, 0);
  }, [path]);
  useEffect(() => {
    const onSubmit = (event: SubmitEvent) => {
      if (event.defaultPrevented) return;
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.querySelector('input[name="phone"]')) return;
      event.preventDefault();
      const phone = String(new FormData(form).get("phone") ?? "").trim();
      window.location.hash = phone ? `/bookings?phone=${encodeURIComponent(phone)}` : "/bookings";
    };
    document.addEventListener("submit", onSubmit);
    return () => document.removeEventListener("submit", onSubmit);
  }, []);
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <Page />
      </div>
      <SiteFooter />
    </>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
