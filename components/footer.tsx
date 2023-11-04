"use client";

import { navLinks } from "@/lib/nav-source";
import { isPathMatching } from "@/lib/utils/isPathMatching";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();
  return (
    <footer className="flex items-center justify-center w-[min(95%,650px)] fixed bottom-10 lg:bottom-16">
      <div className="relative transition-colors after:absolute after:pointer-events-none after:inset-px after:rounded-full after:shadow-highlight after:transition-colors after:shadow-gray-300/20">
        <nav className="flex items-center justify-center bg-background border rounded-full py-3 px-8 overflow-hidden">
          <ul className="flex items-center gap-8">
            {navLinks.map((navLink) => (
              <li className="flex-1" key={navLink.name}>
                <Link
                  href={navLink.href}
                  className="relative group flex flex-col items-center justify-center"
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
                        ? "translate-y-0 opacity-100 text-white"
                        : "opacity-0 translate-y-full text-muted-foreground"
                    } text-xs absolute -bottom-2 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-hover:text-white`}
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
