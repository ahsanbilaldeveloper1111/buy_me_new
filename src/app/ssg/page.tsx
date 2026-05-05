import Link from "next/link";

const staticPrinciples = [
  "Best for mostly static pages",
  "Generated at build time",
  "Fastest for read-heavy content"
];

const topics = ["nextjs", "react-query", "prisma"] as const;

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
      <p className="pt-2">Modern App Router replacement for getStaticPaths/getStaticProps:</p>
      <ul>
        {topics.map((topic) => (
          <li key={topic}>
            <Link href={`/ssg/${topic}?level=beginner`}>/ssg/{topic}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
