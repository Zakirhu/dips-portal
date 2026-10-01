// @ts-nocheck
import React, { useEffect, useRef } from "react";

const we=`#version 300 es
precision highp float;

out vec2 vUv;

void main() {
  // Full-screen triangle; vUv is 0 at the bottom-left, matching the source scene.
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`,V=`#version 300 es
precision highp float;
precision highp int;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

in vec2 vUv;
out vec4 fragColor;

uvec2 pcg2d(uvec2 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.y * 1664525u + 1013904223u;
  v.y += v.x * v.x * 1664525u + 1013904223u;
  v ^= v >> 16;
  v.x += v.y * v.y * 1664525u + 1013904223u;
  v.y += v.x * v.x * 1664525u + 1013904223u;
  return v;
}

float randFibo(vec2 p) {
  uvec2 v = floatBitsToUint(p);
  v = pcg2d(v);
  uint r = v.x ^ v.y;
  return float(r) / float(0xffffffffu);
}

// Stand-in for the 8-bit render target each stage used to write into.
vec3 quantize(vec3 c) {
  return floor(clamp(c, 0.0, 1.0) * 255.0 + 0.5) / 255.0;
}

// --- Pointer interaction -------------------------------------------------
// Two separate pointer behaviours:
//
//   rippleDisplace() — click only. A wave packet expands from the press point
//   and bends whatever coordinate is fed through it. A pattern drawn at
//   coordinate c lands on screen where warp(uv) == c, so pushing the lookup
//   outward is what makes the pattern appear to bow away from the impact.
//
//   pointerChaos() — hover only. Returns a 0..1 bump under the cursor that
//   layers use to *destabilise* themselves rather than move: coarser dither,
//   flickering dot sizes, scrambled wisps. Nothing is displaced toward the
//   cursor, so the composition stays where the eye left it.
#define MAX_RIPPLES 4

uniform vec2 uAspect;      // vec2(width / height, 1.0)
uniform vec2 uPointer;     // uv space, smoothed
uniform float uPointerAmount;
uniform float uChaosTime;  // seconds; steps the churn
uniform vec3 uRipples[MAX_RIPPLES]; // xy = origin (uv), z = age in seconds, <0 idle

const float CHAOS_RADIUS = 0.16;
const float CHAOS_RATE = 2.0; // churn steps per second
const float RIPPLE_SPEED = 0.62;
const float RIPPLE_WIDTH = 0.1;
const float RIPPLE_FREQ = 26.0;
const float RIPPLE_AMP = 0.05;
const float RIPPLE_DECAY = 1.15;

float pointerChaos(vec2 uv) {
  if (uPointerAmount <= 0.001) return 0.0;
  // Aspect-corrected so the patch is round, not oval on a wide viewport.
  vec2 toPointer = (uv - uPointer) * uAspect;
  float dist = length(toPointer);
  return exp(-(dist * dist) / (CHAOS_RADIUS * CHAOS_RADIUS)) * uPointerAmount;
}

// Stepped so the churn reads as discrete frames of noise rather than a smear.
float chaosSeed() {
  return floor(uChaosTime * CHAOS_RATE);
}

// Re-roll a value for the same cell on each churn step.
//
// The obvious randFibo(id + seed) is wrong: the step is added to *both*
// components, so value(x, y, s) == value(x + 1, y + 1, s - 1) and the whole
// field slides one cell down-left every step instead of changing in place.
// Hashing the id to a scalar first breaks that coupling — position picks the
// sequence, the step picks the frame, and nothing translates.
float churnRand(vec2 id, float seed) {
  return randFibo(vec2(randFibo(id), seed));
}

vec2 rippleDisplace(vec2 uv) {
  vec2 offset = vec2(0.0);

  for (int i = 0; i < MAX_RIPPLES; i++) {
    float age = uRipples[i].z;
    if (age < 0.0) continue;
    vec2 fromCenter = (uv - uRipples[i].xy) * uAspect;
    float dist = length(fromCenter);
    // A wave packet riding an expanding front, fading as it travels.
    float band = dist - age * RIPPLE_SPEED;
    float envelope = exp(-(band * band) / (RIPPLE_WIDTH * RIPPLE_WIDTH)) * exp(-age * RIPPLE_DECAY);
    offset += normalize(fromCenter + 1e-6) * sin(band * RIPPLE_FREQ) * envelope * RIPPLE_AMP;
  }

  return uv + offset / uAspect;
}
`,Re=`${V}
uniform vec3 uThickness;
uniform float uTime;
uniform int uShape;

#define SHAPE_CROSS 0
#define SHAPE_RING 1
#define SHAPE_FRAME 2
#define SHAPE_X 3

const vec3 BEAM_A = vec3(0.12156862745098039, 0.09803921568627451, 0.30980392156862746);
const vec3 BEAM_B = vec3(0.1568627450980392, 0.16862745098039217, 0.3333333333333333);
const vec3 BEAM_C = vec3(0.2, 0.21568627450980393, 0.45098039215686275);

vec3 tonemapTanh(vec3 x) {
  x = clamp(x, -40.0, 40.0);
  return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
}

float drawLine(vec2 uv, vec2 center, float scale, float angle, float thickness, float phaseOffset, float time) {
  float radAngle = -angle * TWO_PI;
  float phase = fract(time * 0.01 + phaseOffset) * (3.0 * max(1.0, scale)) - (1.5 * max(1.0, scale));
  vec2 direction = vec2(cos(radAngle), sin(radAngle));
  vec2 centerToPoint = uv - center;
  float projection = dot(centerToPoint, direction);
  float distToLine = length(centerToPoint - projection * direction);
  float lineRadius = thickness * 0.25;
  float brightness = lineRadius / max(0.0001, 1.0 - smoothstep(0.4, 0.0, distToLine + 0.02));
  float glow = smoothstep(scale, 0.0, abs(projection - phase));
  return brightness * (1.0 - distToLine) * (1.0 - distToLine) * glow;
}

// --- Shapes --------------------------------------------------------------
// Each shape answers the same three-layer contract the cross does: a wide
// static wash, a static core, and a third copy of that core whose glow slides
// along it. Holding the layer count and the quantize() between them fixed is
// what lets the diffuse, dither, and halftone stages downstream stay identical
// across every shape.
//
// The cross keeps drawing in raw uv, exactly as it shipped. The shapes that
// need an even edge or a true diagonal measure themselves in *square space*
// instead — so a ring stays round, a frame's four sides carry the same width,
// and an X holds 45° however wide the viewport gets.

// One unit is the shorter side of the viewport. On a landscape frame that is
// the height, which is what the cross already measures in. On a portrait one it
// becomes the width, so a border or a ring keeps its proportion instead of
// swelling to a quarter of the screen — or, for the ring, growing wider than
// the frame it sits in.
vec2 squareSpace(vec2 uv, vec2 center) {
  return (uv - center) * uAspect / min(uAspect.x, 1.0);
}

// Shared falloff. drawLine's raw (1 - dist)^2 turns back upward past dist = 1,
// which square space reaches on a wide viewport where uv never did.
float beamFalloff(float dist) {
  float edge = max(0.0, 1.0 - dist);
  return edge * edge;
}

// The spread is how far the halo carries; drawLine's fixed 0.4 is the cross's
// value. Pulling it in tightens the figure *and* dims it, because the core term
// only runs away once that smoothstep is close to 1.
float beamCore(float dist, float thickness, float spread) {
  return (thickness * 0.25) / max(0.0001, 1.0 - smoothstep(spread, 0.0, dist + 0.02));
}

float drawLineSquare(vec2 uv, vec2 center, float scale, float angle, float thickness, float spread, float phaseOffset, float time) {
  float radAngle = -angle * TWO_PI;
  float phase = fract(time * 0.01 + phaseOffset) * (3.0 * max(1.0, scale)) - (1.5 * max(1.0, scale));
  vec2 direction = vec2(cos(radAngle), sin(radAngle));
  vec2 centerToPoint = squareSpace(uv, center);
  float projection = dot(centerToPoint, direction);
  float distToLine = length(centerToPoint - projection * direction);
  float glow = smoothstep(scale, 0.0, abs(projection - phase));
  return beamCore(distToLine, thickness, spread) * beamFalloff(distToLine) * glow;
}

// The straight beam bent into a circle: radial distance from the ring stands in
// for distance to the line, and the turn angle stands in for the projection, so
// the travelling glow sweeps the circumference instead of sliding along a shaft.
float drawRing(vec2 uv, vec2 center, float radius, float arc, float thickness, float spread, float phaseOffset, float time) {
  vec2 toPoint = squareSpace(uv, center);
  float distToRing = abs(length(toPoint) - radius);
  float around = atan(toPoint.y, toPoint.x) / TWO_PI;
  float phase = fract(time * 0.01 + phaseOffset);
  // Shortest way round, so the glow wraps through the seam instead of snapping.
  float delta = abs(fract(around - phase + 0.5) - 0.5);
  float glow = smoothstep(arc, 0.0, delta);
  return beamCore(distToRing, thickness, spread) * beamFalloff(distToRing) * glow;
}

// Arc length of the nearest point on the rectangle, clockwise from the
// top-left corner and normalised to 0..1. Measuring real perimeter rather than
// sweeping an angle is what keeps the travelling highlight at an even pace: an
// angular sweep races the long sides and stalls on the short ones.
float framePerimeter(vec2 p, vec2 bounds) {
  float total = 4.0 * (bounds.x + bounds.y);
  bool onSide = abs(p.x) * bounds.y > abs(p.y) * bounds.x;
  float travelled;
  if (!onSide && p.y >= 0.0) {
    travelled = p.x + bounds.x;                                        // top, left to right
  } else if (onSide && p.x >= 0.0) {
    travelled = 2.0 * bounds.x + (bounds.y - p.y);                     // right, top to bottom
  } else if (!onSide) {
    travelled = 2.0 * bounds.x + 2.0 * bounds.y + (bounds.x - p.x);    // bottom, right to left
  } else {
    travelled = 4.0 * bounds.x + 2.0 * bounds.y + (p.y + bounds.y);    // left, bottom to top
  }
  return travelled / total;
}

float drawFrame(vec2 uv, vec2 bounds, float arc, float thickness, float spread, float phaseOffset, float time) {
  vec2 p = squareSpace(uv, vec2(0.5));
  vec2 q = abs(p) - bounds;
  // Signed box distance; the outline is where it crosses zero, inside or out.
  float distToEdge = abs(length(max(q, 0.0)) + min(max(q.x, q.y), 0.0));
  float phase = fract(time * 0.01 + phaseOffset);
  float delta = abs(fract(framePerimeter(p, bounds) - phase + 0.5) - 0.5);
  float glow = smoothstep(arc, 0.0, delta);
  return beamCore(distToEdge, thickness, spread) * beamFalloff(distToEdge) * glow;
}

// Inset from the viewport edge, in square space. Small enough that the frame
// hugs the border; its halo is tightened to match so nothing washes inward.
// Clamped so a very tall or very wide viewport still encloses something rather
// than inverting.
vec2 frameBounds() {
  return max(vec2(0.05), uAspect * 0.5 / min(uAspect.x, 1.0) - vec2(0.035));
}

const vec2 X_CENTER = vec2(0.5, 0.5);
const float X_WASH_ANGLE = 0.1251;
const float X_CORE_ANGLE = 0.3751;

void shapeLayers(vec2 uv, float time, out float wash, out float core, out float runner) {
  if (uShape == SHAPE_RING) {
    // The static layers still light the whole circle, but they fall off around
    // it instead of holding one saturated level — that gradient is what the
    // travelling arc reads against. The wash sits a touch outside the core, and
    // their offset phases put the two bright sides in different places rather
    // than stacking into one hotspot.
    wash = drawRing(uv, vec2(0.5, 0.5), 0.29, 0.80, uThickness.x * 0.45, 0.36, 0.62, 0.0);
    core = drawRing(uv, vec2(0.5, 0.5), 0.27, 0.66, uThickness.y * 0.80, 0.33, 0.40, 0.0);
    runner = drawRing(uv, vec2(0.5, 0.5), 0.27, 0.15, uThickness.z, 0.33, 0.53, time);
    return;
  }

  if (uShape == SHAPE_FRAME) {
    // A thin wash keeps the border a border: at this inset the cross's full
    // 0.28 would flood well into the composition. The static layers fall off
    // around the perimeter so the runner has somewhere dimmer to arrive.
    vec2 bounds = frameBounds();
    wash = drawFrame(uv, bounds, 0.85, uThickness.x * 0.40, 0.36, 0.66, 0.0);
    core = drawFrame(uv, bounds, 0.70, uThickness.y * 0.75, 0.32, 0.42, 0.0);
    runner = drawFrame(uv, bounds, 0.12, uThickness.z, 0.32, 0.53, time);
    return;
  }

  if (uShape == SHAPE_X) {
    // Both arms carry every layer, which doubles up over the crossing — hence
    // the trimmed thickness. phaseOffset 0.5 parks a static glow exactly on the
    // centre; the cross's 0.53 would bias both arms the same way and unbalance
    // the figure. The two runners sit half a cycle apart, so the arms take
    // turns lighting rather than flaring together.
    wash = drawLineSquare(uv, X_CENTER, 0.62, X_WASH_ANGLE, uThickness.x * 0.60, 0.34, 0.5, 0.0)
         + drawLineSquare(uv, X_CENTER, 0.62, X_CORE_ANGLE, uThickness.x * 0.60, 0.34, 0.5, 0.0);
    core = drawLineSquare(uv, X_CENTER, 0.82, X_WASH_ANGLE, uThickness.y * 0.60, 0.30, 0.5, 0.0)
         + drawLineSquare(uv, X_CENTER, 0.82, X_CORE_ANGLE, uThickness.y * 0.60, 0.30, 0.5, 0.0);
    runner = drawLineSquare(uv, X_CENTER, 0.90, X_WASH_ANGLE, uThickness.z * 0.85, 0.32, 0.53, time)
           + drawLineSquare(uv, X_CENTER, 0.90, X_CORE_ANGLE, uThickness.z * 0.85, 0.32, 0.03, time);
    return;
  }

  // Cross — the original composition, drawn in raw uv exactly as it shipped.
  wash = drawLine(uv, vec2(0.5, 0.35), 0.53, 0.0, uThickness.x, 0.5, 0.0);
  core = drawLine(uv, vec2(0.5, 0.15), 1.0, 0.2511, uThickness.y, 0.53, 0.0);
  runner = drawLine(uv, vec2(0.5, 0.15), 1.0, 0.2511, uThickness.z, 0.53, time);
}

void main() {
  // Beams only answer to clicks — they buckle as a ripple front passes.
  vec2 uv = rippleDisplace(vUv);
  // Every beam layer added the same per-pixel dither to break 8-bit banding.
  float dither = (randFibo(gl_FragCoord.xy) - 0.5) / 255.0;
  vec3 col = vec3(0.0);

  float wash, core, runner;
  shapeLayers(uv, uTime, wash, core, runner);

  // Wide static wash.
  col = quantize(col + 0.77 * tonemapTanh(BEAM_A * wash) + dither);

  // Static core.
  col = quantize(col + 0.75 * tonemapTanh(BEAM_B * core) + dither);

  // The same core again, but its glow slides along it over ~6.7s.
  col = quantize(col + 0.75 * tonemapTanh(BEAM_C * runner) + dither);

  fragColor = vec4(col, 1.0);
}
`,_e=`${V}
uniform sampler2D uScene;
uniform sampler2D uBlueNoise;
uniform vec2 uResolution;
uniform float uTime;
uniform float uNoiseScale;
uniform float uDitherStep;

const float MAX_ITERATIONS = 24.0;
const float WISP_SCALE = 4.56;
const float CHAOS_DITHER_COARSEN = 3.4;  // fewer dither levels under the cursor
const float CHAOS_DITHER_SCRAMBLE = 0.9; // blue noise -> white noise, per step
const float CHAOS_WISP_SCATTER = 0.012;  // uv jitter applied to the star lookup
const float CHAOS_WISP_GAIN = 0.9;       // stars flare as they scatter

// uNoiseScale is how many device pixels one noise texel covers. 1.0 gives a
// per-pixel dither; larger values coarsen the grain.
float blueNoise(vec2 st) {
  ivec2 texSize = textureSize(uBlueNoise, 0);
  vec2 scaled = st * (uResolution / uNoiseScale) / vec2(texSize) * vec2(float(texSize.x) / float(texSize.y), 1.0);
  vec4 n = texelFetch(uBlueNoise, ivec2(fract(scaled) * vec2(texSize)) % texSize, 0);
  return mod((n.r - 0.5) * TWO_PI, TWO_PI) / TWO_PI - 0.005;
}

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// Additive voronoi: every cell contributes an inverse-distance falloff, so the
// field reads as overlapping soft stars rather than hard cell boundaries.
float voronoiAdditive(vec2 st, float radius) {
  vec2 i_st = floor(st);
  float total = 0.0;
  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 cellId = i_st + vec2(float(x), float(y));
      vec2 h = hash(cellId);
      vec2 point = 0.5 + 0.5 * sin(5.0 + 6.2831 * h);
      float dist = length((cellId + point) - st);
      float contribution = radius / max(dist, radius * 0.1);
      float shimmerPhase = dot(point, vec2(1.0)) * 10.0 + h.x * 5.0 + uTime * 0.5;
      contribution *= mix(1.0, sin(shimmerPhase) + 1.0, 0.44);
      total += mix(contribution * contribution, contribution * 2.0, 0.25);
    }
  }
  return total;
}

void main() {
  vec2 uv = vUv;
  float aspectRatio = uResolution.x / uResolution.y;
  vec2 aspect = vec2(aspectRatio, 1.0);

  // --- Randomised directional blur, strongest at the centre of the frame.
  float falloff = max(0.0, 1.0 - distance(uv * aspect, vec2(0.5) * aspect) * 4.0 * (1.0 - 0.65));
  float amount = 0.18 * 2.0 * falloff;
  vec3 col;
  if (amount <= 0.001) {
    col = texture(uScene, uv).rgb;
  } else {
    vec3 result = vec3(0.0);
    float threshold = max(1.0 - 0.04, 2.0 / MAX_ITERATIONS);
    vec2 dir = vec2(0.2 / aspectRatio, 1.0 - 0.2) * amount * 0.4;
    float iterations = 0.0;
    for (float i = 1.0; i <= MAX_ITERATIONS; i++) {
      float th = i * (1.0 / MAX_ITERATIONS);
      if (th > threshold) break;
      float r1 = randFibo(uv + th);
      float r2 = randFibo(uv + th * 2.0);
      float r3 = randFibo(uv + th * 3.0);
      vec2 ranPoint = vec2(r1 * 2.0 - 1.0, r2 * 2.0 - 1.0) * mix(1.0, r3, 0.8);
      result += texture(uScene, uv + ranPoint * dir).rgb;
      iterations += 1.0;
    }
    col = result / max(1.0, iterations);
  }
  col = quantize(col);

  float chaos = pointerChaos(uv);
  float seed = chaosSeed();

  // --- Ordered dither. Under the cursor the ladder gets coarser and the
  // threshold jumps around every churn step, so the patch boils into unstable
  // banding instead of settling into the usual even grain.
  float levels = 1.0 / mix(uDitherStep, uDitherStep * CHAOS_DITHER_COARSEN, chaos);
  float threshold = blueNoise(uv);
  threshold = mix(threshold, churnRand(gl_FragCoord.xy, seed), chaos * CHAOS_DITHER_SCRAMBLE);
  col = quantize(mix(col, floor(col * levels + threshold) / levels, 0.5));

  // --- Drifting star field, tinted by whatever it sits on. Its lookup is
  // jittered per churn step near the cursor, which scatters the stars rather
  // than sliding them anywhere. The blur and the dither keep the true uv:
  // warping those would smear the glow instead of disturbing anything.
  vec2 wispUv = rippleDisplace(uv);
  if (chaos > 0.001) {
    vec2 jitter = vec2(
      churnRand(floor(uv * uResolution), seed),
      churnRand(floor(uv * uResolution), seed + 37.0)
    ) - 0.5;
    wispUv += jitter * chaos * CHAOS_WISP_SCATTER;
  }
  vec2 p = (wispUv - 0.5) * aspect;
  p = -p;                              // rot(PI)
  p *= 40.0 * WISP_SCALE;
  p *= vec2(1.0, 0.03);                // squashed to near-vertical streaks
  p /= aspect;
  p += vec2(0.0, uTime * 0.35 * -0.05);
  float radius = 0.5 * 0.54;
  float wisps = voronoiAdditive(p * aspect, radius) * 0.02
              + voronoiAdditive(p * aspect + vec2(10.0), radius) * 0.04;
  wisps *= 1.0 + chaos * CHAOS_WISP_GAIN;
  vec3 dust = clamp(vec3(wisps) * mix(1.0, col.r, 1.15), 0.0, 1.0);

  fragColor = vec4(clamp(col + dust, 0.0, 1.0), 1.0);
}
`,xe=`${V}
uniform sampler2D uScene;
uniform vec2 uResolution;
uniform float uGridSize;
uniform float uGlyphAmount;

// Nine dot sizes, matching the source atlas: glyph i is a circle of radius
// 2*i px inside a 40px cell, i.e. i/20 of the cell.
const float GLYPH_STEPS = 9.0;
const float GLYPH_RADIUS_STEP = 0.041; // dot radius per level, as a share of the cell

// Chaos reads as braille rather than static. Cells are grouped into 2x3 blocks
// — a braille cell — and the whole block draws one 6-bit pattern per step. That
// coordination is the difference between marks and noise: six dots deciding
// together look written, six deciding independently look like interference.
const vec2 BRAILLE_BLOCK = vec2(2.0, 3.0);
const float BRAILLE_ACTIVE = 0.62;     // share of blocks carrying a glyph
const float CHAOS_LIT_LEVEL = 7.0;     // size of the strongest lit cell
const float CHAOS_DIM = 0.3;           // unlit cells shrink to this much of theirs
const float CHAOS_INK_LIFT = 0.9;      // how far the strongest ones burn to white
const float CHAOS_CELL_JITTER = 0.05;  // barely any wander — braille sits on its grid
// Each lit dot also draws its own weight, so a glyph is a mix of firm marks and
// faint ones rather than six identical pips.
const float CHAOS_SIZE_SPREAD = 0.5;   // faintest lit dots are this share of full size
const float CHAOS_FADE_MIN = 0.28;     // and this share of full opacity

void main() {
  vec2 uv = vUv;
  // The lattice only answers to clicks. The glow it sits on is sampled at the
  // true uv, so the light stays put while the dots bow around the impact.
  vec2 dotUv = rippleDisplace(uv);
  vec2 pos = vec2(0.5);
  float aspectRatio = uResolution.x / uResolution.y;

  // uGridSize is a fraction of the frame height; dividing x by the aspect keeps
  // cells square in device pixels at every viewport shape.
  vec2 cellSize = vec2(uGridSize / aspectRatio, uGridSize);
  vec2 cellUv = (dotUv - pos) / cellSize;
  vec2 cellId = floor(cellUv);
  vec2 pixelatedCoord = (cellId + 0.5) * cellSize + pos;
  vec4 bg = texture(uScene, uv);
  vec4 color = texture(uScene, pixelatedCoord);
  float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
  float gamma = pow(mix(0.2, 2.2, 0.8), 2.2);

  // Halftone: brighter cells get a fatter dot. Drawn analytically rather than
  // sampled from an atlas, so the edge stays clean at any cell size.
  float level = clamp(floor(luminance * GLYPH_STEPS * gamma), 0.0, GLYPH_STEPS - 1.0);

  // Under the cursor the lattice reads as shifting braille: each 2x3 block
  // rolls one 6-bit glyph per churn step and its six dots light together.
  float chaos = pointerChaos(uv);
  vec2 dotCentre = vec2(0.5);
  float lit = 0.0;
  float shade = 1.0; // per-dot weight: 0 faint and small, 1 firm and bright
  if (chaos > 0.001) {
    vec2 block = floor(cellId / BRAILLE_BLOCK);
    vec2 slot = cellId - block * BRAILLE_BLOCK;
    // Blocks re-roll on their own offset within the step, so the field updates
    // as scattered glyphs rather than every dot blinking on the same tick.
    float seed = floor(uChaosTime * CHAOS_RATE + churnRand(block, 7.0));
    float glyphBits = floor(churnRand(block, seed) * 64.0);
    float bit = mod(floor(glyphBits / exp2(slot.x * 3.0 + slot.y)), 2.0);
    // 'active' is a reserved word in GLSL ES — do not name it that.
    float blockOn = step(1.0 - chaos * BRAILLE_ACTIVE, churnRand(block, seed + 5.0));

    lit = blockOn * bit * chaos;
    shade = churnRand(cellId, seed + 31.0);
    float litLevel = mix(CHAOS_LIT_LEVEL * CHAOS_SIZE_SPREAD, CHAOS_LIT_LEVEL, shade);
    level = mix(level, mix(level * CHAOS_DIM, litLevel, lit), chaos);
    dotCentre += (vec2(churnRand(cellId, seed + 11.0), churnRand(cellId, seed + 23.0)) - 0.5)
      * chaos * CHAOS_CELL_JITTER;
  }

  float radius = level * GLYPH_RADIUS_STEP;
  float dist = length(fract(cellUv) - dotCentre);
  // One device pixel expressed in cell units, so the dot edge antialiases
  // instead of stair-stepping. fract() would blow up fwidth() at cell seams.
  float aa = 0.7 / max(1.0, uGridSize * uResolution.y);
  float alpha = smoothstep(0.0, 1.0, 1.0 - smoothstep(radius - aa, radius + aa, dist));

  // Lit cells burn brighter than the field's 0.49 ink so they read as marks
  // struck onto the grid rather than just slightly larger dots — and each one
  // carries its own weight, so a glyph has firm dots and faint ones in it.
  vec3 ink = mix(vec3(0.49019607843137253), vec3(1.0), lit * CHAOS_INK_LIFT * shade);
  vec3 glyph = ink * alpha * mix(1.0, mix(CHAOS_FADE_MIN, 1.0, shade), lit);
  fragColor = vec4(mix(bg.rgb, glyph + bg.rgb, uGlyphAmount), color.a);
}
`,ye=new URL("/blue-noise-128.png",import.meta.url).href,Le=.25*60,Pe=.56*60,de=1e3,Y=[.28,.16,.16],Ie=4,Ce=1,Ue=.11,ke=.45,F=4,Oe=2.6,M=120,fe=Object.freeze({cross:0,ring:1,frame:2,x:3}),c=Object.freeze({variant:"cross",speed:1,beamWidth:1,dither:Ue,glyphSize:Ie,glyphAmount:ke,noiseScale:Ce,hue:0}),S=(t,v,h,l)=>{const d=Number(t);return Number.isFinite(d)?Math.min(h,Math.max(v,d)):l},De=t=>t<.5?8*t*t*t*t:1-8*(1-t)**4;function pe(t,v,h){const l=t.createShader(v);if(t.shaderSource(l,h),t.compileShader(l),!t.getShaderParameter(l,t.COMPILE_STATUS)){const d=t.getShaderInfoLog(l);throw t.deleteShader(l),new Error(`Hero beam shader failed to compile: ${d}`)}return l}function j(t,v){const h=t.createProgram(),l=pe(t,t.VERTEX_SHADER,we),d=pe(t,t.FRAGMENT_SHADER,v);if(t.attachShader(h,l),t.attachShader(h,d),t.linkProgram(h),t.deleteShader(l),t.deleteShader(d),!t.getProgramParameter(h,t.LINK_STATUS)){const H=t.getProgramInfoLog(h);throw t.deleteProgram(h),new Error(`Hero beam program failed to link: ${H}`)}return h}function me(t,v,h){const l=t.createTexture();t.bindTexture(t.TEXTURE_2D,l),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8,v,h,0,t.RGBA,t.UNSIGNED_BYTE,null),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE);const d=t.createFramebuffer();return t.bindFramebuffer(t.FRAMEBUFFER,d),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,l,0),t.bindFramebuffer(t.FRAMEBUFFER,null),{texture:l,framebuffer:d}}const Me=({variant:t=c.variant,speed:v=c.speed,beamWidth:h=c.beamWidth,dither:l=c.dither,glyphSize:d=c.glyphSize,glyphAmount:H=c.glyphAmount,noiseScale:ve=c.noiseScale,hue:ge=c.hue,className:Ee=""})=>{const K=useRef(null),$=useRef(null),X=useRef(c);return X.current={shape:fe[t]??fe[c.variant],speed:S(v,0,2,c.speed),beamWidth:S(h,.4,2,c.beamWidth),dither:S(l,.03,.25,c.dither),glyphSize:S(d,2,8,c.glyphSize),glyphAmount:S(H,0,1,c.glyphAmount),noiseScale:S(ve,.5,4,c.noiseScale),hue:S(ge,-180,180,c.hue)},useEffect(()=>{const f=K.current,g=$.current;if(!f||!g||typeof window>"u")return;const e=g.getContext("webgl2",{alpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"low-power",preserveDrawingBuffer:!1});if(!e){f.dataset.webglState="unavailable";return}const L=window.matchMedia("(prefers-reduced-motion: reduce)"),Q=window.matchMedia("(pointer: coarse)").matches,Te=window.devicePixelRatio||1;let A=Math.min(Te,Q?1.25:1.5);const J=1e3/(Q?24:30);let s=null,E=[],w=null,U=null,p=0,m=0,T=0,B=!1,P=!1,G=0,R=0,k=0,I=0,Z=0;const n={targetX:.5,targetY:.5,x:.5,y:.5,targetAmount:0,amount:0},b=[],_=new Float32Array(F*3);for(let o=0;o<F;o+=1)_[o*3+2]=-1;const O=o=>{g.dataset.animationActive=o?"true":"false"};try{s={beam:j(e,Re),atmosphere:j(e,_e),glyph:j(e,xe)}}catch{f.dataset.webglState="error";return}const u={beam:{thickness:e.getUniformLocation(s.beam,"uThickness"),time:e.getUniformLocation(s.beam,"uTime"),shape:e.getUniformLocation(s.beam,"uShape")},atmosphere:{scene:e.getUniformLocation(s.atmosphere,"uScene"),blueNoise:e.getUniformLocation(s.atmosphere,"uBlueNoise"),resolution:e.getUniformLocation(s.atmosphere,"uResolution"),time:e.getUniformLocation(s.atmosphere,"uTime"),noiseScale:e.getUniformLocation(s.atmosphere,"uNoiseScale"),ditherStep:e.getUniformLocation(s.atmosphere,"uDitherStep")},glyph:{scene:e.getUniformLocation(s.glyph,"uScene"),resolution:e.getUniformLocation(s.glyph,"uResolution"),gridSize:e.getUniformLocation(s.glyph,"uGridSize"),glyphAmount:e.getUniformLocation(s.glyph,"uGlyphAmount")}},be=Object.fromEntries(Object.entries(s).map(([o,a])=>[o,{aspect:e.getUniformLocation(a,"uAspect"),pointer:e.getUniformLocation(a,"uPointer"),pointerAmount:e.getUniformLocation(a,"uPointerAmount"),chaosTime:e.getUniformLocation(a,"uChaosTime"),ripples:e.getUniformLocation(a,"uRipples[0]")}]));U=e.createVertexArray(),e.disable(e.BLEND),e.disable(e.DEPTH_TEST),w=e.createTexture(),e.bindTexture(e.TEXTURE_2D,w),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([128,128,128,255])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.REPEAT);const C=new Image;C.decoding="async",C.onload=()=>{P||e.isContextLost()||(e.bindTexture(e.TEXTURE_2D,w),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE,C),T||q())},C.src=ye;const z=()=>{const o=f.getBoundingClientRect(),a=Math.max(1,Math.round(o.width*A)),i=Math.max(1,Math.round(o.height*A));return a===p&&i===m?!1:(p=a,m=i,g.width=p,g.height=m,E.forEach(r=>{e.deleteTexture(r.texture),e.deleteFramebuffer(r.framebuffer)}),E=[me(e,p,m),me(e,p,m)],!0)},Se=(o,a)=>{const i=1-Math.exp(-9*o);n.x+=(n.targetX-n.x)*i,n.y+=(n.targetY-n.y)*i,n.amount+=(n.targetAmount-n.amount)*(1-Math.exp(-5*o));for(let r=b.length-1;r>=0;r-=1)(a-b[r].bornMs)/1e3>Oe&&b.splice(r,1);_.fill(0);for(let r=0;r<F;r+=1){const y=b[r];_[r*3]=y?y.x:0,_[r*3+1]=y?y.y:0,_[r*3+2]=y?(a-y.bornMs)/1e3:-1}},W=(o,a)=>{const i=be[o];i.aspect&&e.uniform2f(i.aspect,p/m,1),i.pointer&&e.uniform2f(i.pointer,n.x,n.y),i.pointerAmount&&e.uniform1f(i.pointerAmount,n.amount),i.chaosTime&&e.uniform1f(i.chaosTime,a),i.ripples&&e.uniform3fv(i.ripples,_)},ee=o=>{if(!E.length)return;const a=De(Math.min(1,o/de)),i=o/1e3,r=X.current;e.bindVertexArray(U),e.viewport(0,0,p,m),e.useProgram(s.beam),W("beam",i*r.speed),e.uniform3f(u.beam.thickness,Y[0]*a*r.beamWidth,Y[1]*a*r.beamWidth,Y[2]*a*r.beamWidth),e.uniform1f(u.beam.time,i*Le*r.speed),e.uniform1i(u.beam.shape,r.shape),e.bindFramebuffer(e.FRAMEBUFFER,E[0].framebuffer),e.drawArrays(e.TRIANGLES,0,3),e.useProgram(s.atmosphere),W("atmosphere",i*r.speed),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,E[0].texture),e.uniform1i(u.atmosphere.scene,0),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,w),e.uniform1i(u.atmosphere.blueNoise,1),e.uniform2f(u.atmosphere.resolution,p,m),e.uniform1f(u.atmosphere.time,i*Pe*r.speed),e.uniform1f(u.atmosphere.noiseScale,r.noiseScale*A),e.uniform1f(u.atmosphere.ditherStep,r.dither),e.bindFramebuffer(e.FRAMEBUFFER,E[1].framebuffer),e.drawArrays(e.TRIANGLES,0,3),e.useProgram(s.glyph),W("glyph",i*r.speed),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,E[1].texture),e.uniform1i(u.glyph.scene,0),e.uniform2f(u.glyph.resolution,p,m),e.uniform1f(u.glyph.gridSize,r.glyphSize*A/m),e.uniform1f(u.glyph.glyphAmount,r.glyphAmount),e.bindFramebuffer(e.FRAMEBUFFER,null),e.drawArrays(e.TRIANGLES,0,3)},Ae=o=>{A<=1||I<0||o-G<2e3||(I+=1,o-R>J*1.8&&(Z+=1),!(I<45)&&(Z>I*.4&&(A=1,p=0,z()),I=-1))},te=o=>{if(P||(T=window.requestAnimationFrame(te),o-R<J))return;Ae(o);const a=R?Math.min((o-R)/1e3,.1):1/60;R=o,k=o-G,Se(a,o),ee(k)},D=()=>{T&&(window.cancelAnimationFrame(T),T=0,O(!1))},q=()=>{P||e.isContextLost()||(ee(Math.max(k,de)),O(!1))},x=()=>{if(!(!P&&B&&!document.hidden&&!e.isContextLost())){D();return}if(L.matches){D(),q();return}T||(G=performance.now()-k,R=0,O(!0),T=window.requestAnimationFrame(te))},oe=()=>x(),ae=o=>{o.preventDefault(),D(),f.dataset.webglState="lost"},re=o=>{const a=f.getBoundingClientRect();return!a.width||!a.height?null:{x:(o.clientX-a.left)/a.width,y:1-(o.clientY-a.top)/a.height,near:o.clientX>=a.left-M&&o.clientX<=a.right+M&&o.clientY>=a.top-M&&o.clientY<=a.bottom+M}},ie=o=>{if(o.pointerType==="touch"||L.matches)return;const a=re(o);a&&(n.targetX=a.x,n.targetY=a.y,n.targetAmount=a.near?1:0)},se=()=>{n.targetAmount=0},ne=o=>{if(L.matches)return;const a=re(o);!a||!a.near||(n.targetX=a.x,n.targetY=a.y,o.pointerType!=="touch"&&(n.targetAmount=1),b.push({x:a.x,y:a.y,bornMs:performance.now()}),b.length>F&&b.shift(),x())},le=new IntersectionObserver(o=>{B=o.some(a=>a.isIntersecting),x()},{threshold:.01}),ce=new ResizeObserver(()=>{z()&&!T&&q()});z();const he=f.getBoundingClientRect();return B=he.bottom>0&&he.top<window.innerHeight,le.observe(f),ce.observe(f),document.addEventListener("visibilitychange",oe),L.addEventListener?.("change",x),g.addEventListener("webglcontextlost",ae),window.addEventListener("pointermove",ie,{passive:!0}),window.addEventListener("pointerdown",ne,{passive:!0}),document.addEventListener("pointerleave",se),O(!1),x(),()=>{P=!0,D(),le.disconnect(),ce.disconnect(),document.removeEventListener("visibilitychange",oe),L.removeEventListener?.("change",x),g.removeEventListener("webglcontextlost",ae),window.removeEventListener("pointermove",ie),window.removeEventListener("pointerdown",ne),document.removeEventListener("pointerleave",se),C.onload=null,E.forEach(o=>{e.deleteTexture(o.texture),e.deleteFramebuffer(o.framebuffer)}),w&&e.deleteTexture(w),U&&e.deleteVertexArray(U),Object.values(s).forEach(o=>e.deleteProgram(o)),delete g.dataset.animationActive,delete f.dataset.webglState}},[]),React.createElement("div",{ref:K,className:`threeui-mount ${Ee}`.trim(),"aria-hidden":"true",children:React.createElement("canvas",{ref:$,className:"cross-beam-canvas",style:{filter:`hue-rotate(${X.current.hue}deg)`}})})};export{c as CROSS_BEAM_DEFAULTS,fe as CROSS_BEAM_SHAPES,Me as default};
