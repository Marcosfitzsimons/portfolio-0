import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="flex flex-1 items-center">
        <div
          className="relative w-full before:pointer-events-none before:absolute before:-inset-1 before:rounded-[20px] before:border before:border-purple-500/70 before:opacity-0 before:ring-2 before:ring-purple-500/10 before:transition after:pointer-events-none
      after:absolute after:inset-px after:rounded-[15px] after:shadow-highlight after:shadow-gray-300/20 after:transition focus-within:before:opacity-100 focus-within:after:shadow-purple-500"
        >
          <input
            type={type}
            className={cn(
              "relative h-10 rounded-lg border bg-background px-3.5 py-2 text-sm shadow-input shadow-black/90 !outline-none placeholder:text-muted-foreground",
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
