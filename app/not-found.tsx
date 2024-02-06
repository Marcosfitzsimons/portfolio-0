import SecondaryButton from "@/components/secondary-button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center pt-20">
      <h2 className="text-[90px] font-bold text-neutral-400/60 md:text-[130px]">
        404
      </h2>
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg font-medium lg:text-xl">
          Sorry, we could not find this page
        </p>
        <SecondaryButton
          href="/"
          icon={<Home className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.3} />}
        >
          Return home
        </SecondaryButton>
      </div>
    </div>
  );
}
