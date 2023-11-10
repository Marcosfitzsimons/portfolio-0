import WorkSkeleton from "@/components/skeletons/work-skeleton";
import WorksContainer from "@/components/works-container";

export default function WorksSkeleton() {
  return (
    <WorksContainer>
      <WorkSkeleton />
      <WorkSkeleton />
    </WorksContainer>
  );
}
