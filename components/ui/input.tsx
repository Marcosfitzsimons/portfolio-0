import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="flex flex-1 items-center">
        <div
          className="w-full relative before:pointer-events-none focus-within:before:opacity-100 before:opacity-0 before:absolute before:-inset-1 before:rounded-[20px] before:border before:border-purple-500/70 before:ring-2 before:ring-purple-500/10 before:transition
      after:pointer-events-none after:absolute after:inset-px after:rounded-[15px] after:shadow-highlight after:shadow-gray-300/20 focus-within:after:shadow-purple-500 after:transition"
        >
          <input
            type={type}
            className={cn(
              "relative text-sm bg-background h-10 px-3.5 py-2 rounded-lg border shadow-input shadow-black/90 placeholder:text-muted-foreground !outline-none",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
