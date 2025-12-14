import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import WhatWeDo from "./components/WhatWeDo";
import { useEffect, useRef, useState } from "react";
import "./index.css";
import CollaboratePopup from "./components/ColloaboRate";
import LiquidGlass from "./components/LiquidGlass/LiquidGlass";

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const buttonDebounceRef = useRef(false);
  const [triggerGlow, setTriggerGlow] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleLoad = () => setReady(true);

    if (document.readyState === "complete") {
      setReady(true);
    } else {
      window.addEventListener("load", handleLoad);
      const fallback = setTimeout(() => setReady(true), 3000);

      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(fallback);
      };
    }
  }, []);

  if (!ready) {
    return (
      <div className="Black-bg min-h-screen flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-t-[#BFBFBF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-t-transparent border-r-[#BFBFBF] border-b-transparent border-l-transparent rounded-full animate-spin animation-delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="Black-bg xl:min-h-screen overflow-hidden flex flex-col items-start justify-between">
      <Header />
      <HeroSection triggerGlow={triggerGlow} />
      <WhatWeDo setTriggerGlow={setTriggerGlow} />

      <div className="max-w-[1383px] CustmWidth footerMn lg:justify-start justify-between foot w-full mx-auto px-4 lg:pb-5 pb-4 lg:px-[30px] xl:px-[60px] flex Gray200 items-center BodySmall lg:gap-4 gap-2">
        <div className="flex items-center space-x-1 sm:mb-0">
          <span>© 2025 · 0110 · London, UK</span>
        </div>
        <span>hello@0110.sport</span>
      </div>

      <div
        id="mobile-bar"
        className="!z-[100] show-tab mobileNav navHead sm:hidden w-full gradient-border-nav mx-auto px-4 lg:px-[30px] xl:px-[60px] !bg-transparent"
        data-html2canvas-ignore
      >
        <div className="flex justify-between items-center w-full relative z-10">
          <div className="header-bar h-14 py-3">
            <a href="/">
              <img src="./Logo.svg" className="w-[90px] h-8" alt="Logo" />
            </a>
          </div>

          <div className="rounded-sm overflow-hidden w-full max-w-[162px]">
            <button
              className="bg-[#FAFAFA] h-8 cursor-pointer font-dm-Medium rounded-sm w-full text-base leading-6 flex items-center justify-center px-3 relative overflow-hidden group"
              onClick={() => {
                if (buttonDebounceRef.current) return; // debounce >400ms
                buttonDebounceRef.current = true;

                // restart shimmer cleanly
                setTriggerGlow(false);
                // requestAnimationFrame(() => setTriggerGlow(true));

                setTimeout(() => {
                  buttonDebounceRef.current = false;
                }, 420); // ~>400ms debounce

                setShowPopup(true);
              }}
              onMouseEnter={() => setTriggerGlow(true)}
              onMouseLeave={() => setTriggerGlow(false)}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: triggerGlow ? 1 : 0,
                  transform: triggerGlow ? "scale(1)" : "scale(0.97)",
                  transition: "all 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                  background: `linear-gradient(
          90deg,
          rgba(141,38,41,0.25) 0%,
          rgba(249,224,114,0.25) 7%,
          rgba(119,46,171,0.25) 14%,
          rgba(77,53,145,0.25) 21%,
          rgba(191,232,241,0.25) 28%,
          rgba(248,254,155,0.25) 35%,
          rgba(255,224,93,0.25) 42%,
          rgba(233,104,28,0.25) 49%,
          rgba(163,40,37,0.25) 56%,
          rgba(36,58,66,0.25) 63%,
          rgba(47,14,3,0.25) 70%,
          rgba(58,65,91,0.25) 77%,
          rgba(68,73,46,0.25) 84%,
          rgba(99,80,65,0.25) 91%,
          rgba(23,12,8,0.25) 96%,
          rgba(237,243,243,0.25) 100%
        )`,
                  boxShadow: `
          0 0 2px 1px rgba(255,255,255,0.05) inset,
          0 0 10px 4px rgba(255,255,255,0.08) inset,
          0px 4px 16px rgba(17,17,26,0.05),
          0px 8px 24px rgba(17,17,26,0.05),
          0px 16px 56px rgba(17,17,26,0.05)
        `,
                  filter:
                    "saturate(120%) brightness(1.15) contrast(1.1) drop-shadow(0 0 6px rgba(255,255,255,0.12))",
                  mixBlendMode: "screen",
                }}
              />

              <span
                className={`relative z-20 font-dm-Medium text-[#0E0E0E] ${
                  triggerGlow
                    ? "animate-gradient-flow text-transparent bg-clip-text"
                    : ""
                }`}
                style={{
                  backgroundImage: triggerGlow
                    ? `linear-gradient(
              90deg,
              #8D2629 0%,
              #F9E072 7%,
              #772EAB 14%,
              #4D3591 21%,
              #BFE8F1 28%,
              #F8FE9B 35%,
              #FFE05D 42%,
              #E9681C 49%,
              #A32825 56%,
              #243A42 63%,
              #2F0E03 70%,
              #3A415B 77%,
              #44492E 84%,
              #635041 91%,
              #170C08 96%,
              #EDF3F3 100%
            )`
                    : "none",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  backgroundSize: "250% 100%",
                  backgroundPosition: "0% 50%",
                  transition:
                    "background-position 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                Request the deck
              </span>
            </button>
          </div>
        </div>

        <div
          id="mobile-bar-background"
          className="absolute inset-0 backdrop-blur-[1px] bg-[#00000072]"
        >
          <img src="Rainbow.jpg" className="w-full h-full opacity-25" />
        </div>
      </div>

      <CollaboratePopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
      />

      <LiquidGlass />
    </div>
  );
}

export default App;
