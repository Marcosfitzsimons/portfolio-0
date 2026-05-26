"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function WorksPage() {
  useEffect(() => {
    window.location.replace("/#works");
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
      <Link
        href="/#works"
        className="rounded-full border border-[#2d2d30] bg-[#171719] px-4 py-2 text-sm text-zinc-100"
      >
        Go to works
      </Link>
    </main>
  );
}
