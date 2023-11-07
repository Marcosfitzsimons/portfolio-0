import { Shell, Tent, Slash } from "lucide-react";
import Link from "next/link";
import { Montserrat } from "next/font/google";

const fira = Montserrat({ subsets: ["latin"], weight: ["600"] });

const Header = () => {
  return (
    <div
      className={`${fira.className} w-full py-4 flex items-center justify-center`}
    >
      <Link href="/" className="group font-semibold flex items-center gap-0.5">
        <Shell className="w-5 h-5 group-hover:rotate-180 transition-transform" />
        Marcos Fitzsimons
      </Link>
    </div>
  );
};

export default Header;
