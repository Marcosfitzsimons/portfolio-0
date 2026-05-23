"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export type PrototypeVariant = {
  key: string;
  name: string;
};

type PrototypeVariantSwitcherProps = {
  variants: PrototypeVariant[];
  current: string;
};

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
};

export default function PrototypeVariantSwitcher({
  variants,
  current,
}: PrototypeVariantSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const safePathname = pathname ?? "/prototype/app-style";

  const currentIndex = Math.max(
    variants.findIndex((variant) => variant.key === current),
    0,
  );
  const activeVariant = variants[currentIndex] ?? variants[0];
  const previousVariant =
    variants[(currentIndex - 1 + variants.length) % variants.length];
  const nextVariant = variants[(currentIndex + 1) % variants.length];

  const getHref = (variant: PrototypeVariant) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    params.set("variant", variant.key);
    return `${safePathname}?${params.toString()}`;
  };

  const setVariant = useCallback(
    (nextIndex: number) => {
      const nextVariant =
        variants[(nextIndex + variants.length) % variants.length];
      const params = new URLSearchParams(searchParams?.toString() ?? "");

      params.set("variant", nextVariant.key);
      router.replace(`${safePathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, safePathname, searchParams, variants],
  );

  const previous = useCallback(
    () => setVariant(currentIndex - 1),
    [currentIndex, setVariant],
  );

  const next = useCallback(
    () => setVariant(currentIndex + 1),
    [currentIndex, setVariant],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, previous]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed right-4 top-4 z-50 hidden rounded-full border border-zinc-700 bg-zinc-950/95 p-1 shadow-2xl shadow-black/50 backdrop-blur-xl transition sm:block">
      <div className="flex items-center gap-2">
        <Button
          asChild
          aria-label="Previous prototype variant"
          size="icon-sm"
          variant="ghost"
          className="rounded-full text-white hover:bg-white/10 hover:text-white"
        >
          <Link href={getHref(previousVariant)} scroll={false}>
            <ChevronLeft />
          </Link>
        </Button>
        <div className="min-w-52 px-2 text-center text-xs font-medium text-white">
          <span className="text-zinc-400">Prototype</span>{" "}
          {activeVariant.key} - {activeVariant.name}
        </div>
        <Button
          asChild
          aria-label="Next prototype variant"
          size="icon-sm"
          variant="ghost"
          className="rounded-full text-white hover:bg-white/10 hover:text-white"
        >
          <Link href={getHref(nextVariant)} scroll={false}>
            <ChevronRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
