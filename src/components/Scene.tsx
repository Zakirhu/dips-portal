import React from "react";
import { CrossBeam } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export function Scene() {
  return (
    <div className="shader-frame">
      <CrossBeam
        variant="frame"
        speed={1.0}
        beamWidth={1.0}
        dither={0.11}
        glyphSize={4}
        glyphAmount={0.45}
        noiseScale={1.0}
        hue={0}
      />
    </div>
  );
}
