"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  icon?: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  icon,
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
