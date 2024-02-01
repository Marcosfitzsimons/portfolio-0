import SecondaryButton from "@/components/secondary-button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center pt-20">
      <h2 className="text-[90px] text-neutral-400/60 font-bold md:text-[130px]">
        404
      </h2>
      <div className="flex flex-col items-center gap-4">
        <p className="font-medium text-lg lg:text-xl">
          Sorry, we could not find this page
        </p>
        <SecondaryButton
          icon={<Home className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.3} />}
        >
          Return home
        </SecondaryButton>
      </div>
    </div>
  );
}
