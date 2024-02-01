"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex flex-col items-center gap-4 pt-20">
        <h2 className="text-3xl md:text-5xl">Something went wrong!</h2>
        <Button variant="secondary" onClick={() => reset()}>
          Try again
        </Button>
      </body>
    </html>
  );
}
