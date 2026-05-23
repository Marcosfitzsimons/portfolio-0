"use client";

import { usePathname } from "next/navigation";
import SocialLinks from "@/components/social-links";

const Footer = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isPrototype = pathname?.startsWith("/prototype") ?? false;

  if (isPrototype) return null;

  return (
    <div className={`fixed bottom-2 left-1/2 z-10 -translate-x-1/2 ${isHome ? "" : "after:pointer-events-none after:absolute after:inset-px after:rounded-2xl after:shadow-highlight after:shadow-gray-300/20 after:transition-colors md:after:shadow-none"}`}>
      <div className={`flex flex-col items-center gap-5 ${isHome ? "" : "rounded-2xl border border-white/10 bg-background/60 px-5 py-3 backdrop-blur-md md:border-transparent md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none"}`}>
        <SocialLinks />
        <span className="group text-xs text-muted-foreground transition-colors hover:text-white">
          Made w. <span className="group-hover:animate-pulse">🤍</span> by
          Marcos Fitzsimons
        </span>
      </div>
    </div>
  );
};

export default Footer;
