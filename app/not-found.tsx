import { Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center pt-20">
      <h2 className="text-[90px] font-bold text-neutral-400/60 md:text-[130px]">
        404
      </h2>
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg font-medium lg:text-xl">
          Sorry, we could not find this page
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#2d2d30] bg-[#171719] px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:border-[#b7c8ff]/50 hover:bg-[#1d1d20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6eadf]"
        >
          <Home className="size-4" strokeWidth={2.3} />
          Return home
        </Link>
      </div>
    </div>
  );
}
