import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowUp, User } from "lucide-react";

const SecondaryButton = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: any;
}) => {
  return (
    <Button
      asChild
      variant="secondary"
      className="group relative inline-flex items-center overflow-hidden rounded-2xl pr-[1.1rem] pl-[2.45rem] outline-none transition duration-300 focus:ring-[0.1875rem] focus:ring-purple-400  lg:text-base lg:pl-[3rem] lg:pr-[1rem]"
    >
      <Link href="/about">
        <div className="absolute left-4 translate-y-0 opacity-100 transition duration-300 group-hover:-translate-y-full group-hover:opacity-0">
          {icon}
        </div>
        <div className="absolute left-4 translate-y-full opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUp className="w-4 h-4 lg:w-5 lg:h-5" />
        </div>
        <div className="translate-x-0 lg:-translate-x-1">{children}</div>
      </Link>
    </Button>
  );
};

export default SecondaryButton;
