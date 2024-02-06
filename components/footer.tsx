"use client";

import { navLinks } from "@/lib/nav-source";
import { isPathMatching } from "@/lib/utils/isPathMatching";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();
  return (
    <footer className="fixed bottom-10 flex w-[min(95%,650px)] items-center justify-center lg:bottom-16">
      <div className="relative transition-colors after:pointer-events-none after:absolute after:inset-px after:rounded-full after:shadow-highlight after:shadow-gray-300/20 after:transition-colors">
        <nav className="flex items-center justify-center overflow-hidden rounded-full border bg-background px-8 py-3">
          <ul className="flex items-center gap-8">
            {navLinks.map((navLink) => (
              <li className="flex-1" key={navLink.name}>
                <Link
                  href={navLink.href}
                  className="group relative flex flex-col items-center justify-center"
                >
                  <div
                    className={`${
                      (navLink.name === "Home" && pathname === "/") ||
                      (navLink.name !== "Home" &&
                        isPathMatching(pathname, navLink.href))
                        ? "-translate-y-2 text-white"
                        : "translate-y-0 text-muted-foreground"
                    } transition duration-300 group-hover:-translate-y-2 group-hover:text-white`}
                  >
                    {navLink.icon}
                  </div>
                  <div
                    className={`${
                      (navLink.name === "Home" && pathname === "/") ||
                      (navLink.name !== "Home" &&
                        isPathMatching(pathname, navLink.href))
                        ? "translate-y-0 text-white opacity-100"
                        : "translate-y-full text-muted-foreground opacity-0"
                    } absolute -bottom-2 text-xs transition duration-300 group-hover:translate-y-0 group-hover:text-white group-hover:opacity-100`}
                  >
                    {navLink.name}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
