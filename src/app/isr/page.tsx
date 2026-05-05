export const revalidate = 60;

async function getTimestamp() {
  return {
    generatedAt: new Date().toISOString()
  };
}

export default async function IsrPage() {
  const data = await getTimestamp();

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">ISR Example</h2>
      <p>This page is regenerated every 60 seconds.</p>
      <p>Last regenerated timestamp: {data.generatedAt}</p>
    </section>
  );
}
