import Link from "next/link";
import { monserrat } from "./fonts";

const Header = () => {
  return (
    <div
      className={`${monserrat.className} flex w-full items-center justify-center py-4`}
    >
      <Link
        href="/"
        className="group flex items-center gap-0.5 font-semibold transition-colors hover:text-white"
      >
        Marcos Fitzsimons
      </Link>
    </div>
  );
};

export default Header;
