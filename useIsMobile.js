import { useEffect, useState } from "react";

/**
 * Returns true for phones/small tablets (<= 768px) OR devices that
 * report a coarse pointer (touch). We check both because some tablets
 * report a wide viewport but are still touch-first, and some desktop
 * users resize below 768px.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    return window.innerWidth <= breakpoint || coarse;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const coarseMq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsMobile(mq.matches || coarseMq.matches);
    update();
    mq.addEventListener("change", update);
    coarseMq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      coarseMq.removeEventListener("change", update);
    };
  }, [breakpoint]);

  return isMobile;
}
