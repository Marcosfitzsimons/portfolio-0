"use client";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in ease-in fade-in slide-in-from-bottom-8 duration-300">
      {children}
    </div>
  );
}
