import "./globals.scss";

import type { Metadata, Route } from "next";
import Link from "next/link";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Advanced Next.js Data Strategies",
  description: "ISR SSR SSG CSR + PostgreSQL CRUD + React Query"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <main className="mx-auto max-w-5xl p-6">
            <header className="mb-6">
              <h1 className="text-2xl font-bold">Next.js Rendering Strategies + CRUD</h1>
              <nav className="mt-2 flex flex-wrap gap-3 text-sm">
                <Link href="/">Home</Link>
                <Link href="/csr">CSR</Link>
                <Link href="/ssg">SSG</Link>
                <Link href="/ssg/nextjs?level=beginner">SSG Params</Link>
                <Link href="/isr">ISR</Link>
                <Link href="/ssr">SSR</Link>
                <Link href={"/realtime" as Route}>Realtime</Link>
                <Link href="/auth">Auth</Link>
              </nav>
            </header>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
