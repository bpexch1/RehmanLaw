import { useRef, useMemo, Suspense, Component } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * GLB PATH
 * --------
 * Point this at your own Draco-compressed export, e.g. from Blender:
 *   File > Export > glTF 2.0 > enable "Draco compression"
 * Put the file at /public/models/scales.glb (or edit the path below).
 *
 * We could not generate an actual binary .glb asset in this environment
 * (no 3D authoring tool / no network access to fetch one), so this file
 * ships with a procedural fallback (<ProceduralScales />) built from
 * primitive geometry — same metallic gold + indigo look, real 3D, zero
 * external assets. It renders automatically if /models/scales.glb 404s.
 * Swap in your real model any time; no other code needs to change.
 */
const GLB_PATH = "/models/scales.glb";

const GOLD = new THREE.MeshStandardMaterial({
  color: "#F2C94C",
  metalness: 1,
  roughness: 0.28,
});
const INDIGO = new THREE.MeshStandardMaterial({
  color: "#5B6EF5",
  metalness: 0.9,
  roughness: 0.35,
});

function ProceduralScales(props) {
  const group = useRef();
  const panL = useRef();
  const panR = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.3) * 0.3 + 0.15;
    }
    if (panL.current) panL.current.rotation.z = Math.sin(t * 0.8) * 0.05;
    if (panR.current) panR.current.rotation.z = -Math.sin(t * 0.8) * 0.05;
  });

  const chainPoints = useMemo(
    () => [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -0.62, 0),
    ],
    []
  );

  function Pan({ x }) {
    const ref = x < 0 ? panL : panR;
    return (
      <group ref={ref} position={[x, 1.42, 0]}>
        {[-0.34, 0.34].map((dx) => (
          <line key={dx} position={[dx, 0, 0]}>
            <bufferGeometry
              attach="geometry"
              onUpdate={(geo) =>
                geo.setFromPoints([
                  new THREE.Vector3(0, 0, 0),
                  new THREE.Vector3(-dx * 0.75, -0.62, 0),
                ])
              }
            />
            <lineBasicMaterial attach="material" color="#B9C2FF" />
          </line>
        ))}
        <mesh position={[0, -0.66, 0]} material={GOLD}>
          <cylinderGeometry args={[0.42, 0.3, 0.09, 32, 1, true]} />
        </mesh>
        <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]} material={GOLD}>
          <circleGeometry args={[0.3, 32]} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={group} {...props} dispose={null}>
      {/* pole */}
      <mesh position={[0, 0.2, 0]} material={INDIGO}>
        <cylinderGeometry args={[0.05, 0.07, 2.6, 20]} />
      </mesh>
      {/* base */}
      <mesh position={[0, -1.1, 0]} material={GOLD}>
        <cylinderGeometry args={[0.55, 0.65, 0.14, 32]} />
      </mesh>
      {/* finial */}
      <mesh position={[0, 1.55, 0]} material={GOLD}>
        <sphereGeometry args={[0.13, 16, 16]} />
      </mesh>
      {/* beam */}
      <mesh position={[0, 1.42, 0]} rotation={[0, 0, Math.PI / 2]} material={GOLD}>
        <cylinderGeometry args={[0.045, 0.045, 2.6, 16]} />
      </mesh>
      <Pan x={-1.3} />
      <Pan x={1.3} />
    </group>
  );
}

function GLBScales(props) {
  // Suspends until loaded; DRACOLoader is wired up in useGLTF.preload below.
  const { scene } = useGLTF(GLB_PATH, "/draco/"); // 2nd arg = draco decoder path
  const cloned = useMemo(() => scene.clone(), [scene]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    cloned.rotation.y = Math.sin(t * 0.3) * 0.3 + 0.15;
  });

  return <primitive object={cloned} {...props} />;
}

// Only preload if you actually have the file — comment out otherwise.
// useGLTF.preload(GLB_PATH, "/draco/");

// Real React error boundary: catches a failed/missing GLTF fetch (404, bad
// path, decode error) and renders the procedural model instead of crashing
// the scene. A try/catch in a function component cannot catch this because
// the error surfaces asynchronously via Suspense/render, not synchronously.
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.warn("[ScalesOfJustice] GLB failed to load, using procedural fallback:", error?.message || error);
  }
  render() {
    if (this.state.failed) return <ProceduralScales {...this.props.fallbackProps} />;
    return this.props.children;
  }
}

/**
 * Public component: tries the real GLB first, falls back to the procedural
 * model if the file is missing/fails to decode. Once you add a real
 * /public/models/scales.glb (+ Draco decoder files under /public/draco/),
 * this picks it up automatically — no other code needs to change.
 */
export default function ScalesOfJustice(props) {
  return (
    <ModelErrorBoundary fallbackProps={props}>
      <Suspense fallback={<ProceduralScales {...props} />}>
        <GLBScales {...props} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
