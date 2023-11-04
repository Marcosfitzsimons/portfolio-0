import React from "react";

const WorksContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center gap-10 sm:grid sm:grid-cols-2 sm:items-start">
      {children}
    </div>
  );
};

export default WorksContainer;
