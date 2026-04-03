"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

export type SuggestionProps = Omit<
  ComponentProps<typeof Button>,
  "onClick" | "style"
> & {
  suggestion: string;
  icon?: string;
  gradientColor?: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  icon,
  gradientColor,
  onClick,
  className,
  variant = "outline",
  size = "sm",
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = useCallback(() => {
    onClick?.(suggestion);
  }, [onClick, suggestion]);

  if (gradientColor) {
    return (
      <div
        className="rounded-full p-px"
        style={{
          background: `linear-gradient(135deg, ${gradientColor}, transparent)`,
        }}
      >
        <Button
          className={cn(
            "cursor-pointer rounded-full border-0 px-4 transition-colors",
            className
          )}
          onClick={handleClick}
          size={size}
          type="button"
          variant={variant}
          {...props}
        >
          {children || (
            <>
              {icon && <span className="mr-1">{icon}</span>}
              {suggestion}
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button
      className={cn(
        "cursor-pointer rounded-full px-4 transition-colors",
        className
      )}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children || (
        <>
          {icon && <span className="mr-1">{icon}</span>}
          {suggestion}
        </>
      )}
    </Button>
  );
};
