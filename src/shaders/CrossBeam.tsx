import React from "react";
import CrossBeamBackground, {
  CROSS_BEAM_DEFAULTS,
  CROSS_BEAM_SHAPES,
} from "./CrossBeamBackground";

export interface CrossBeamProps {
  variant?: "frame" | "cross" | "ring" | "x";
  speed?: number;
  beamWidth?: number;
  dither?: number;
  glyphSize?: number;
  glyphAmount?: number;
  noiseScale?: number;
  hue?: number;
  className?: string;
}

export function CrossBeam({
  variant = "frame",
  speed = 1.0,
  beamWidth = 1.0,
  dither = 0.11,
  glyphSize = 4,
  glyphAmount = 0.45,
  noiseScale = 1.0,
  hue = 0,
  className = "",
}: CrossBeamProps) {
  return (
    <CrossBeamBackground
      {...({
        variant,
        speed,
        beamWidth,
        dither,
        glyphSize,
        glyphAmount,
        noiseScale,
        hue,
        className,
      } as any)}
    />
  );
}

export { CROSS_BEAM_DEFAULTS, CROSS_BEAM_SHAPES, CrossBeamBackground };
