"use client";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="duration-300 ease-in animate-in fade-in slide-in-from-bottom-8">
      {children}
    </div>
  );
}
