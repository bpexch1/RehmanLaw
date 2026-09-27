import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MAX_PARTICLES = 300;

function useGlowTexture() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    grad.addColorStop(0, "rgba(185,194,255,1)");
    grad.addColorStop(1, "rgba(185,194,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

export default function AmbientParticles({ count = MAX_PARTICLES }) {
  const safeCount = Math.min(count, MAX_PARTICLES);
  const pointsRef = useRef();
  const texture = useGlowTexture();

  const positions = useMemo(() => {
    const arr = new Float32Array(safeCount * 3);
    for (let i = 0; i < safeCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [safeCount]);

  // Very slow idle drift. Since the canvas uses frameloop="demand", this
  // alone would not re-render — the parent CameraRig calls invalidate()
  // each frame while anything is animating, which keeps this drift visible
  // without forcing a permanent render loop.
  useFrame(() => {
    if (pointsRef.current) pointsRef.current.rotation.y += 0.0006;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={safeCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.1}
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
