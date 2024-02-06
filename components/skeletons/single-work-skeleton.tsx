import { Skeleton } from "../ui/skeleton";

const SingleWorkSkeleton = () => {
  return (
    <div className="flex flex-col items-center gap-5 py-5 sm:mx-auto sm:w-[80%]">
      <Skeleton className="aspect-video w-full rounded-2xl md:h-[251px]" />
      <Skeleton className="h-7 w-[80%] self-start sm:w-[60%]" />
      <Skeleton className="h-16 w-full self-start " />
      <div className="flex w-full flex-col gap-1">
        <Skeleton className="h-5 w-16 " />
        <Skeleton className="h-5 w-full " />
        <Skeleton className="h-5 w-16 " />
        <Skeleton className="h-5 w-full " />
      </div>
      <Skeleton className="aspect-video w-full rounded-2xl md:h-[251px]" />
    </div>
  );
};

export default SingleWorkSkeleton;
