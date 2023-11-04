import WorkSkeleton from "@/components/skeletons/work-skeleton";
import WorksContainer from "@/components/works-container";

export default function Loading() {
  return (
    <WorksContainer>
      <WorkSkeleton />
      <WorkSkeleton />
    </WorksContainer>
  );
}
