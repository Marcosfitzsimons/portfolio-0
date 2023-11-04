import { Skeleton } from "../ui/skeleton";

const SingleWorkSkeleton = () => {
  return (
    <div className="flex flex-col items-center gap-5 py-5 sm:w-[80%] sm:mx-auto">
      <Skeleton className="w-full aspect-video rounded-2xl md:h-[250px]" />
      <Skeleton className="self-start h-7 w-[80%] sm:w-[60%]" />
      <Skeleton className="w-full self-start h-16 " />
      <div className="w-full flex flex-col gap-1">
        <Skeleton className="w-16 h-5 " />
        <Skeleton className="w-full h-5 " />
        <Skeleton className="w-16 h-5 " />
        <Skeleton className="w-full h-5 " />
      </div>
      <Skeleton className="w-full aspect-video rounded-2xl md:h-[250px]" />
    </div>
  );
};

export default SingleWorkSkeleton;
