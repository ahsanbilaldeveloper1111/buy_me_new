const staticPrinciples = [
  "Best for mostly static pages",
  "Generated at build time",
  "Fastest for read-heavy content"
];

export default function SsgPage() {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">SSG Example</h2>
      <p>This page is statically generated and ideal for docs/marketing pages.</p>
      <ul>
        {staticPrinciples.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
