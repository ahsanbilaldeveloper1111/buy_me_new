export default function HomePage() {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Project overview</h2>
      <p>This project demonstrates CSR, SSG, ISR, and SSR in one Next.js app.</p>
      <ul>
        <li>CSR page: React Query + live CRUD UI.</li>
        <li>SSG page: Static content generated at build time.</li>
        <li>ISR page: Cached page regenerated every 60 seconds.</li>
        <li>SSR page: Fresh request-time data from PostgreSQL.</li>
      </ul>
    </section>
  );
}
