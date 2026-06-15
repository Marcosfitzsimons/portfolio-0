import { notFound } from "next/navigation";

import PortfolioAgent from "@/components/portfolio-agent";

export default function ChatDialogTestPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-[160vh] bg-[#050505] px-4 py-24 text-white">
      <div className="mx-auto max-w-xl">
        <p className="mb-6 text-sm text-zinc-400">
          Mobile chat dialog development fixture
        </p>
        <PortfolioAgent />
        <div aria-hidden className="h-[100vh]" />
      </div>
    </main>
  );
}
