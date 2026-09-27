import { useRef, Suspense } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import HeroScene from "./HeroScene";

/**
 * Drop-in replacement for the existing hero section. Same copy, same
 * buttons, same dark theme (colors below match the site's existing
 * tokens — adjust the CSS vars to your real design system / Tailwind
 * config, they're inlined here just so this file is self-contained).
 *
 * Mobile / touch devices never mount the WebGL canvas at all — they get
 * a static image instead, so there's no GPU cost, no bundle-loading a
 * GLB on a metered connection, and no battery drain on a phone.
 *
 * NOTE: /public/hero-fallback.jpg is a placeholder path. Generate a real
 * one by screenshotting the desktop 3D scene at a nice angle (or render
 * one from your Blender file) and drop it in at that path — we can't
 * produce an actual photographic/rendered image asset from here.
 */
export default function Hero() {
  const heroRef = useRef(null);
  const isMobile = useIsMobile();

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100svh] overflow-hidden flex items-center pt-20"
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 25% 30%, rgba(91,110,245,.16), transparent 65%), linear-gradient(180deg, #05070d, #0b0f1a)",
      }}
    >
      {/* ---- Background layer: 3D on desktop, static image on mobile ---- */}
      {isMobile ? (
        <img
          src="/hero-fallback.jpg"
          alt=""
          role="presentation"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
          loading="eager"
          fetchpriority="high"
        />
      ) : (
        <Suspense fallback={null}>
          <HeroScene heroRef={heroRef} isMobile={false} />
        </Suspense>
      )}

      {/* ---- Foreground: unchanged copy + buttons ---- */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 py-16">
        <div className="pill mb-6">✨ Advocate-Led Tax &amp; Corporate Practice</div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.12] max-w-3xl mb-6">
          <span className="grad-text">
            Income Tax | Sales Tax | NTN | SECP | Trademark | Company Registration
          </span>
        </h1>

        <div className="space-y-1 text-lg sm:text-xl font-semibold text-white max-w-xl mb-8">
          <p>Expert Legal &amp; Tax Solutions</p>
          <p>FBR Compliance &amp; Tax Planning</p>
          <p>Appeals &amp; Corporate Advisory</p>
          <p className="text-gray-400 font-normal text-base">
            Professional guidance for individuals &amp; businesses, Pakistan-wide.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <a
            href="https://wa.me/923128891288"
            target="_blank"
            rel="noopener"
            className="btn-wa px-7 py-4 text-sm"
          >
            💬 Chat on WhatsApp
          </a>
          <a href="#services" className="btn-outline px-7 py-4 text-sm">
            Explore Services ↗
          </a>
        </div>
      </div>
    </section>
  );
}
