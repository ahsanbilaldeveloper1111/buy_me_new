import { notFound } from "next/navigation";

type Topic = "nextjs" | "react-query" | "prisma";

const topicContent: Record<Topic, { title: string; summary: string }> = {
  nextjs: {
    title: "Next.js Rendering",
    summary: "Use App Router data APIs for server rendering, caching, and incremental updates."
  },
  "react-query": {
    title: "React Query Client Caching",
    summary: "Use React Query in client components for mutation flows and stale-while-revalidate UX."
  },
  prisma: {
    title: "Prisma Data Layer",
    summary: "Use Prisma services in server routes/pages to keep data access typed and centralized."
  }
};

export function generateStaticParams() {
  return Object.keys(topicContent).map((topic) => ({ topic }));
}

export default async function TopicPage({
  params,
  searchParams
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ level?: string }>;
}) {
  const { topic } = await params;
  const { level = "all" } = await searchParams;

  if (!(topic in topicContent)) notFound();

  const item = topicContent[topic as Topic];

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Dynamic SSG Topic: {item.title}</h2>
      <p>{item.summary}</p>
      <p>
        <strong>Path param (params):</strong> {topic}
      </p>
      <p>
        <strong>Query param (searchParams):</strong> {level}
      </p>
      <p>This page was pre-rendered via generateStaticParams at build time.</p>
    </section>
  );
}
