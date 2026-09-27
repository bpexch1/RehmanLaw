import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/**
 * Drives the camera with:
 *  - mouse parallax (desktop only — parent doesn't mount this on mobile)
 *  - a subtle scroll-linked drift, keyed off how far the hero section has
 *    scrolled past (0 = hero fully in view, 1 = fully scrolled past)
 *
 * Because the <Canvas> uses frameloop="demand" (see HeroScene.jsx), nothing
 * re-renders unless we explicitly call invalidate(). We call it on every
 * pointermove/scroll event AND once per frame while the camera is still
 * easing toward its target — then we stop, so the GPU goes idle the moment
 * the camera settles instead of rendering 60fps forever for a static shot.
 */
export default function CameraRig({ heroRef, baseTarget = [0.8, 0, 0] }) {
  const { camera, invalidate } = useThree();
  const target = useRef({ x: 0, y: 0, scroll: 0 });
  const current = useRef({ x: 0, y: 0, scroll: 0 });
  const settled = useRef(true);

  useEffect(() => {
    function onPointerMove(e) {
      target.current.x = e.clientX / window.innerWidth - 0.5;
      target.current.y = e.clientY / window.innerHeight - 0.5;
      settled.current = false;
      invalidate();
    }

    function onScroll() {
      const el = heroRef?.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
      target.current.scroll = progress;
      settled.current = false;
      invalidate();
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [heroRef, invalidate]);

  useFrame(() => {
    const c = current.current;
    const t = target.current;

    const dx = t.x - c.x;
    const dy = t.y - c.y;
    const ds = t.scroll - c.scroll;

    // Once close enough, snap and stop scheduling further frames.
    const EPS = 0.0005;
    if (Math.abs(dx) < EPS && Math.abs(dy) < EPS && Math.abs(ds) < EPS) {
      settled.current = true;
      return;
    }

    c.x += dx * 0.05;
    c.y += dy * 0.05;
    c.scroll += ds * 0.06;

    camera.position.x = baseTarget[0] * 0.4 + c.x * 0.9;
    camera.position.y = baseTarget[1] + -c.y * 0.6 - c.scroll * 1.4; // drift down as user scrolls past
    camera.position.z = 8 - c.scroll * 2.5; // subtle dolly-in on scroll
    camera.lookAt(baseTarget[0], baseTarget[1], 0);

    if (!settled.current) invalidate();
  });

  return null;
}
