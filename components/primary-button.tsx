import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, FolderOpenDot } from "lucide-react";

const PrimaryButton = () => {
  return (
    <Button
      asChild
      className="group relative inline-flex items-center overflow-hidden rounded-2xl pr-[1.1rem] pl-[2.45rem] outline-none transition duration-300 focus:ring-[0.1875rem] focus:ring-purple-400 lg:text-base lg:pl-[3rem] lg:pr-[0.9rem]"
    >
      <Link href="/works">
        <div className="absolute left-4 translate-x-0 opacity-100 transition duration-300 group-hover:-translate-x-full group-hover:opacity-0">
          <FolderOpenDot className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2.3} />
        </div>
        <div className="translate-x-0 transition duration-300 group-hover:-translate-x-5 lg:-translate-x-1 lg:group-hover:-translate-x-8">
          Works
        </div>
        <div className="absolute right-3 translate-x-full opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
        </div>
      </Link>
    </Button>
  );
};

export default PrimaryButton;
