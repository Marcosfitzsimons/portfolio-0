"use client";

import { useEffect, useState } from "react";

type VisualViewportSource = Pick<VisualViewport, "height" | "offsetTop">;

export interface VisualViewportMetrics {
  height: number;
  offsetTop: number;
}

export function getVisualViewportMetrics(
  viewport: VisualViewportSource | null | undefined,
  fallbackHeight: number,
): VisualViewportMetrics {
  return {
    height: Math.round(viewport?.height ?? fallbackHeight),
    offsetTop: Math.round(viewport?.offsetTop ?? 0),
  };
}

export function useVisualViewport(): VisualViewportMetrics {
  const [metrics, setMetrics] = useState<VisualViewportMetrics>({
    height: 0,
    offsetTop: 0,
  });

  useEffect(() => {
    const viewport = window.visualViewport;
    const updateMetrics = () => {
      setMetrics(getVisualViewportMetrics(viewport, window.innerHeight));
    };

    updateMetrics();
    viewport?.addEventListener("resize", updateMetrics);
    viewport?.addEventListener("scroll", updateMetrics);
    window.addEventListener("resize", updateMetrics);

    return () => {
      viewport?.removeEventListener("resize", updateMetrics);
      viewport?.removeEventListener("scroll", updateMetrics);
      window.removeEventListener("resize", updateMetrics);
    };
  }, []);

  return metrics;
}
