import type React from "react";

interface WorksContainerProps {
  children: React.ReactNode;
}

const WorksContainer = ({ children }: WorksContainerProps) => {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
      {children}
    </div>
  );
};

export default WorksContainer;
