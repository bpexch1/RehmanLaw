import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { useState } from "react";
import ScalesOfJustice from "./ScalesOfJustice";
import AmbientParticles from "./AmbientParticles";
import CameraRig from "./CameraRig";

/**
 * frameloop="demand": R3F only renders when something calls invalidate()
 * (from CameraRig, drei controls, etc.) instead of running a 60fps loop
 * forever — the single biggest win for a mostly-static hero scene.
 *
 * dpr capped at 1.5 on mobile / touch devices, 2 on desktop. Devices with
 * devicePixelRatio 3 (most modern phones) would otherwise render 9x the
 * pixels of a 1x screen for zero visible benefit in a WebGL canvas.
 */
export default function HeroScene({ heroRef, isMobile }) {
  const [dpr, setDpr] = useState(isMobile ? 1.5 : Math.min(window.devicePixelRatio, 2));

  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0.5, 0.3, 8], fov: 50 }}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* Drops resolution automatically under sustained frame-time pressure,
          then restores it once things are cheap again. Cheap insurance on
          low-end Android GPUs. */}
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, d - 0.5))}
        onIncline={() => setDpr((d) => Math.min(isMobile ? 1.5 : 2, d + 0.25))}
      />
      <AdaptiveDpr pixelated={false} />

      <ambientLight intensity={1.2} color="#445" />
      <directionalLight position={[4, 6, 5]} intensity={2} color="#B9C2FF" />
      <pointLight position={[-3, 1, 4]} intensity={3} distance={22} color="#F2C94C" />
      <pointLight position={[3, -2, 3]} intensity={2.4} distance={22} color="#9B6BFF" />

      <ScalesOfJustice position={[2.5, -0.4, -0.5]} scale={1.05} />
      <AmbientParticles count={300} />
      <CameraRig heroRef={heroRef} baseTarget={[0.8, 0, 0]} />
    </Canvas>
  );
}
