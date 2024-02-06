import { Skeleton } from "../ui/skeleton";

const WorkSkeleton = () => {
  return (
    <div className="w-full max-w-sm text-center">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-[13rem] w-full rounded-2xl sm:h-[10rem] " />
        <Skeleton className="h-4 w-[144px]" />
        <Skeleton className="h-12 w-[90%] sm:h-20" />
      </div>
    </div>
  );
};

export default WorkSkeleton;
