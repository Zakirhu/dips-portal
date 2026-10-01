import React from "react";
import { EmeraldHorizonBackground } from "./emerald-horizon/EmeraldHorizonBackground";
import "./threeui.css";

export interface StructureFlowCollectionProps {
  variant?: "emerald-horizon" | string;
  speed?: number;
  waveScale?: number;
  variation?: number;
  hue?: number;
  glow?: number;
  vignette?: number;
  className?: string;
}

export function StructureFlowCollection({
  variant = "emerald-horizon",
  speed = 1.0,
  waveScale = 1.0,
  variation = 1.0,
  hue = 0,
  glow = 1.0,
  vignette = 1.0,
  className = "",
}: StructureFlowCollectionProps) {
  if (variant === "emerald-horizon") {
    return (
      <EmeraldHorizonBackground
        speed={speed}
        waveScale={waveScale}
        variation={variation}
        hue={hue}
        glow={glow}
        vignette={vignette}
        className={className}
      />
    );
  }

  return (
    <EmeraldHorizonBackground
      speed={speed}
      waveScale={waveScale}
      variation={variation}
      hue={hue}
      glow={glow}
      vignette={vignette}
      className={className}
    />
  );
}

export { EmeraldHorizonBackground };
export { CrossBeam, CrossBeamBackground } from "./CrossBeam";
export type { CrossBeamProps } from "./CrossBeam";
