import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowUp, User } from "lucide-react";

const SecondaryButton = ({
  children,
  icon,
  href,
}: {
  href: string;
  children: React.ReactNode;
  icon: any;
}) => {
  return (
    <Button
      asChild
      variant="secondary"
      className="group relative inline-flex items-center overflow-hidden rounded-2xl pl-[2.45rem] pr-[1.1rem] outline-none transition duration-300 focus:ring-[0.1875rem] focus:ring-purple-400  lg:pl-[3rem] lg:pr-[1rem] lg:text-base"
    >
      <Link href={href}>
        <div className="absolute left-4 translate-y-0 opacity-100 transition duration-300 group-hover:-translate-y-full group-hover:opacity-0">
          {icon}
        </div>
        <div className="absolute left-4 translate-y-full opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUp className="h-4 w-4 lg:h-5 lg:w-5" />
        </div>
        <div className="translate-x-0 lg:-translate-x-1">{children}</div>
      </Link>
    </Button>
  );
};

export default SecondaryButton;
