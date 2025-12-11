"use client";

import { useState, useRef, useEffect } from "react";
import CollaboratePopup from "./ColloaboRate";

interface HeroSectionProps {
  triggerGlow: boolean;
}

export default function HeroSection({ triggerGlow }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = () => {
    setTimeout(() => {
      setShowPopup(true);
    }, 0);
  };

  useEffect(() => {}, []);

  return (
    <section className="max-w-[1383px] CustmWidth heroSec w-full pt-20 pb-8 px-4 lg:px-[30px] xl:px-[60px] flex items-center mx-auto justify-between sm:py-10">
      <div className="Gray50">
        <h1 className="cusm-heads Heading1 font-dm-Medium mb-6 max-w-[500px] lg:max-w-[700px]">
          Simple, efficient digital solutions for sport brands.
        </h1>
        <p className="BodyLarge custmP font-dm-Regular font-medium max-w-[387px] md:mb-6">
          We design and build digital products for sport. From race platforms to
          watch faces, our work helps athletes perform with clarity and focus.
        </p>

        <div className="rounded-sm hidden sm:inline-block hide-tab w-full overflow-hidden mb-6 xl:mb-10">
          <button
            className="gradient-border-btn relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] backdrop-blur-[2px] bg-white/5 focus:bg-white/10 active:bg-white/10"
            onClick={handleClick}
            data-active={triggerGlow || undefined}
          >
            <div
              className={`
    absolute inset-0 opacity-0 transition-all duration-100 ease-[cubic-bezier(0.22,1,0.36,1)] blur-[2px]
    ${
      triggerGlow
        ? "opacity-[0.3]!"
        : "group-focus:opacity-[0.2]! group-focus:scale-100 group-active:opacity-[0.2]! group-active:scale-100"
    }
  `}
              style={{
                animation: triggerGlow ? "" : "none",
                background: `linear-gradient(90deg,
      #8D2629 0%,
      #F9E072 8%,
      #772EAB 16%,
      #4D3591 24%,
      #BFE8F1 32%,
      #F8FE9B 40%,
      #FFE05D 48%,
      #E9681C 56%,
      #A32825 64%,
      #243A42 72%,
      #2F0E03 80%,
      #3A415B 86%,
      #44492E 92%,
      #635041 96%,
      #170C08 100%)`,
                boxShadow: `
      0 0 2px 1px rgba(255,255,255,0.05) inset,
      0 0 10px 4px rgba(255,255,255,0.08) inset,
      0px 4px 16px rgba(17,17,26,0.05),
      0px 8px 24px rgba(17,17,26,0.05),
      0px 16px 56px rgba(17,17,26,0.05)
    `,
                filter:
                  "brightness(1.1) contrast(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.2))",
                mixBlendMode: "screen",
              }}
            />
            <span className="relative z-10 font-dm-Regular tracking-wide">
              Request the deck
            </span>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative hidden sm:block deskMn hide-tab"
      >
        <img
          id="hero-section-logo"
          src="./Logo.svg"
          alt="0110 Logo"
          className="w-[370px] object-contain opacity-[0.3]"
        />

        <div
          id="hero-section-logo-overlay"
          className="z-50 absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-[#0e0e0e]"
          data-html2canvas-ignore
        >
          <div
            id="capsule-placeholder"
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
          >
            <img src="placeholder.png" className="w-full" />
          </div>
        </div>

        <img
          id="hero-section-rainbow"
          src="Rainbow.jpg"
          className="absolute top-[calc(100%+1rem)] w-full left-0 scale-x-125 h-24 opacity-0 hidden"
        />
      </div>

      <div
        id="hero-section-logo-overlay-border"
        className="absolute w-48 h-48 top-0 left-0 -translate-x-1/2 translate-y-0 bg-transparent z-[100] pointer-events-none hidden border-8 border-[#0e0e0e] border-t-0"
        data-html2canvas-ignore
      ></div>

      <CollaboratePopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
      />
    </section>
  );
}
