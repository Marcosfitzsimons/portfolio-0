"use client";

import dynamic from "next/dynamic";

const SoftAurora = dynamic(() => import("@/components/SoftAurora"), {
  ssr: false,
});

export const CommandBackground = () => (
  <div className="absolute inset-0 overflow-hidden bg-[#050505]">
    <div className="absolute inset-0 opacity-75">
      <SoftAurora
        speed={0.34}
        scale={1.25}
        brightness={0.72}
        color1="#d6eadf"
        color2="#d8c7ff"
        noiseFrequency={2.1}
        noiseAmplitude={0.82}
        bandHeight={0.48}
        bandSpread={0.62}
        octaveDecay={0.18}
        layerOffset={0.45}
        colorSpeed={0.45}
        enableMouseInteraction={false}
        mouseInfluence={0.08}
      />
    </div>
    <div className="absolute inset-0 bg-[#050505]/78 backdrop-blur-[1px]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent_0%,rgba(5,5,5,0.35)_38%,#050505_82%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(215,200,255,0.025)_1px,transparent_1px),linear-gradient(rgba(214,234,223,0.02)_1px,transparent_1px)] bg-[size:96px_96px]" />
  </div>
);
