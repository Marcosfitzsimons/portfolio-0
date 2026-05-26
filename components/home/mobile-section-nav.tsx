import { ArrowUpRight, FolderOpenDot, Layers3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const sectionLinks = [
  { label: "Ask", href: "#ask", icon: <Sparkles className="size-4" /> },
  {
    label: "Works",
    href: "#works",
    icon: <FolderOpenDot className="size-4" />,
  },
  { label: "Skills", href: "#skills", icon: <Layers3 className="size-4" /> },
];

const SectionNavigation = ({ compact = false }: { compact?: boolean }) => (
  <nav
    aria-label="Page sections"
    className={cn(compact ? "grid grid-cols-3 gap-2" : "flex flex-col gap-2")}
  >
    {sectionLinks.map((sectionLink) => (
      <a
        key={sectionLink.href}
        href={sectionLink.href}
        className={cn(
          "flex items-center justify-between rounded-xl border border-[#303030] bg-[#171719] font-medium text-zinc-100 transition-colors hover:border-[#b7c8ff]/50 hover:bg-[#1d1d20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6eadf]",
          compact ? "px-3 py-2 text-xs" : "px-3 py-2 text-sm",
        )}
      >
        <span className="flex items-center gap-2">
          {sectionLink.icon}
          {sectionLink.label}
        </span>
        {!compact && <ArrowUpRight className="size-3.5" />}
      </a>
    ))}
  </nav>
);

export const MobileSectionNav = () => (
  <div className="sticky top-3 z-30 lg:hidden">
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#101010]/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <SectionNavigation compact />
    </div>
  </div>
);
