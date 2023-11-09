import Link from "next/link";
import { monserrat } from "./fonts";

const Header = () => {
  return (
    <div
      className={`${monserrat.className} w-full py-4 flex items-center justify-center`}
    >
      <Link href="/" className="group font-semibold flex items-center gap-0.5">
        Marcos Fitzsimons
      </Link>
    </div>
  );
};

export default Header;
