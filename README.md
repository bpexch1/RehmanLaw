# Hero 3D — React Three Fiber rebuild

## Install

```bash
npm install three @react-three/fiber @react-three/drei
```

Then copy the Draco decoder files (only needed once you add a real GLB):
```bash
cp -r node_modules/three/examples/jsm/libs/draco public/draco
```

## Two things you need to supply

I couldn't produce these from this environment (no 3D authoring tool, no
network access to fetch or render binary assets):

1. **`public/models/scales.glb`** — a real Draco-compressed scales-of-justice
   model. Until you add one, the code automatically renders
   `<ProceduralScales />` — a real Three.js model built from primitives
   (cylinders, sphere, torus-like pans) in the same metallic gold (`#F2C94C`)
   + indigo (`#5B6EF5`) materials, so the hero works and looks right out of
   the box. Drop your real `.glb` in and it's picked up with no code changes
   — `ScalesOfJustice.jsx` tries the GLB first and only falls back if it
   404s or fails to decode (via a real React error boundary, not a
   try/catch — GLTF load failures surface through Suspense, which a
   synchronous try/catch cannot catch).

2. **`public/hero-fallback.jpg`** — the static image mobile visitors see
   instead of the 3D canvas. Easiest way to get a good one: open the
   desktop version, screenshot the hero at a flattering angle, export at
   ~1600px wide, compress (e.g. `squoosh.app`) to keep it lightweight on
   mobile data.

## Where each requirement lives

| Requirement | File | How |
|---|---|---|
| Real 3D scales model, gold + indigo | `ScalesOfJustice.jsx` | GLB loader with procedural fallback (see above) |
| Ambient particles, max 300 | `AmbientParticles.jsx` | `Math.min(count, 300)` hard cap; runtime-generated glow texture, no image asset |
| Mouse parallax (desktop) | `CameraRig.jsx` | `pointermove` listener eases camera x/y toward cursor |
| Scroll-linked camera movement | `CameraRig.jsx` | `scroll` listener drives a `progress` value that dollies/drifts the camera |
| Mobile → static image, no 3D | `Hero.jsx` + `useIsMobile.js` | Canvas is never mounted on mobile — not hidden with CSS, actually not in the tree, so zero GPU/bundle cost |
| Draco-compressed GLB | `ScalesOfJustice.jsx` | `useGLTF(path, "/draco/")` — second arg wires up `DRACOLoader` |
| On-demand rendering | `HeroScene.jsx` + `CameraRig.jsx` | `frameloop="demand"` on `<Canvas>`; `CameraRig` calls `invalidate()` each frame *only* while still easing, then stops — idle scene costs 0 GPU frames |
| DPR capped 1.5 on mobile | `HeroScene.jsx` | `dpr={isMobile ? 1.5 : Math.min(devicePixelRatio, 2)}`, adjusted further at runtime by `<PerformanceMonitor>` if frame time climbs |
| Unchanged text/buttons/theme | `Hero.jsx` | Same copy, same class names (`grad-text`, `btn-wa`, `btn-outline`, `pill`) as the current site — swap in your existing CSS/Tailwind config and it matches exactly |

## Usage

```jsx
import Hero from "./components/hero/Hero";

export default function Page() {
  return (
    <>
      <Hero />
      {/* ...rest of the page... */}
    </>
  );
}
