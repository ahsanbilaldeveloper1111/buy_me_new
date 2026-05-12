import type { Route } from "next";
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Project overview</h2>
      <p>This project demonstrates modern App Router patterns for CSR, SSG, ISR, SSR, params, and API statuses.</p>
      <ul>
        <li>CSR page: React Query + live CRUD UI.</li>
        <li>SSG page: Static content generated at build time.</li>
        <li>Dynamic SSG route: generateStaticParams + params + searchParams.</li>
        <li>ISR page: Cached page regenerated every 60 seconds.</li>
        <li>SSR page: Fresh request-time data from PostgreSQL.</li>
        <li>API routes: explicit status handling (401/400/404/201/204).</li>
        <li>
          Realtime: Redis cache + pub/sub, SSE stream, Socket.IO gateway, server actions (
          <Link className="underline" href={"/realtime" as Route}>
            /realtime
          </Link>
          ).
        </li>
      </ul>
    </section>
  );
}
