import Link from "next/link";
import { monserrat } from "./fonts";

const Header = () => {
  return (
    <div
      className={`${monserrat.className} flex w-full items-center justify-center py-4`}
    ></div>
  );
};

export default Header;
