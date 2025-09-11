import React, { useState, useRef, useEffect, useCallback } from "react";
import "../css/CascadingCarousel.css";

const CascadingCarousel = ({
  items = [],
  renderItem,
  visibleCount = 2,
  loop = true,
  activeCardWidth = 280,
  activeCardHeight = 370,
  nearCardWidth = 280,
  nearCardHeight = 360,
  cornerCardWidth = 280,
  cornerCardHeight = 360,
  activeCardWidthMobile = 250,
  activeCardHeightMobile = 300,
  nearCardWidthMobile = 230,
  nearCardHeightMobile = 280,
  cornerCardWidthMobile = 180,
  cornerCardHeightMobile = 240,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [cardWidthState, setCardWidthState] = useState(activeCardWidth);
  const [cardHeightState, setCardHeightState] = useState(activeCardHeight);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setCardWidthState(activeCardWidthMobile);
        setCardHeightState(activeCardHeightMobile);
        setIsMobile(true);
      } else {
        setCardWidthState(activeCardWidth);
        setCardHeightState(activeCardHeight);
        setIsMobile(false);
      }
    };
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [
    activeCardWidth,
    activeCardHeight,
    activeCardWidthMobile,
    activeCardHeightMobile,
  ]);

  const spacing = isMobile
    ? Math.round(cardWidthState * 1)
    : Math.round(cardWidthState * 0.95);

  const clampIndex = useCallback(
    (idx) => {
      if (loop) {
        const n = items.length || 1;
        return ((idx % n) + n) % n;
      } else {
        return Math.max(0, Math.min(idx, Math.max(0, items.length - 1)));
      }
    },
    [items.length, loop]
  );

  const prev = useCallback(() => setActiveIndex((i) => clampIndex(i - 1)), [
    clampIndex,
  ]);
  const next = useCallback(() => setActiveIndex((i) => clampIndex(i + 1)), [
    clampIndex,
  ]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const wheelRef = { accum: 0, cooldown: false, cooldownTimer: null };
    const WHEEL_THRESHOLD = 80;
    const WHEEL_COOLDOWN_MS = 350;

    const onWheel = (e) => {
      if (Math.abs(e.deltaX) < 1) return;
      e.preventDefault();
      if (wheelRef.cooldown) return;

      const value = e.deltaX;

      if (wheelRef.accum !== 0 && Math.sign(wheelRef.accum) !== Math.sign(value)) {
        wheelRef.accum = value;
      } else {
        wheelRef.accum += value;
      }

      if (Math.abs(wheelRef.accum) >= WHEEL_THRESHOLD) {
        if (wheelRef.accum > 0) next();
        else prev();
        wheelRef.accum = 0;
        wheelRef.cooldown = true;
        if (wheelRef.cooldownTimer) clearTimeout(wheelRef.cooldownTimer);
        wheelRef.cooldownTimer = setTimeout(() => {
          wheelRef.cooldown = false;
        }, WHEEL_COOLDOWN_MS);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelRef.cooldownTimer) clearTimeout(wheelRef.cooldownTimer);
    };
  }, [next, prev]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const getOffset = (index) => {
    if (!loop) return index - activeIndex;
    const n = items.length;
    const raw = index - activeIndex;
    const alt = raw > 0 ? raw - n : raw + n;
    return Math.abs(raw) < Math.abs(alt) ? raw : alt;
  };

  return (
    <div className="cascade-carousel-wrapper">
      <button
        aria-label="Previous"
        className="cascade-nav left"
        onClick={() => setActiveIndex((i) => clampIndex(i - 1))}
        type="button"
        disabled={!loop && activeIndex === 0}
      >
        ‹
      </button>

      <div className="cascade-carousel" ref={containerRef} style={{ overflow: "visible" }}>
        <div className="cascade-inner" style={{ position: "relative", height: "100%", width: "100%" }}>
          {items.map((item, index) => {
            const offset = getOffset(index);
            const absOffset = Math.abs(offset);
            const isVisible = absOffset <= visibleCount;
            const baseTranslate = offset * spacing;

            let transform, opacity, width, height;

            if (isMobile) {
              width =
                offset === 0
                  ? activeCardWidthMobile
                  : offset === visibleCount
                    ? cornerCardWidthMobile
                    : nearCardWidthMobile;
              height =
                offset === 0
                  ? activeCardHeightMobile
                  : offset === visibleCount
                    ? cornerCardHeightMobile
                    : nearCardHeightMobile;
              transform = `translateX(calc(-50% + ${baseTranslate}px)) translateY(0)`;
              opacity = offset === 0 ? 1 : absOffset === 1 ? 0.85 : 0.7;
            } else {
              width =
                offset === 0
                  ? activeCardWidth
                  : absOffset === visibleCount
                    ? cornerCardWidth
                    : nearCardWidth;
              height =
                offset === 0
                  ? activeCardHeight
                  : absOffset === visibleCount
                    ? cornerCardHeight
                    : nearCardHeight;

              const translateYMap = {
                "-2": 110,
                "-1": 40,
                "0": 10,
                "1": 40,
                "2": 110,
              };
              const translateY = translateYMap[offset] ?? 80;

              const rotateMap = {
                "-2": -15,
                "-1": -15,
                "0": 0,
                "1": 15,
                "2": 15,
              };
              const rotate = rotateMap[offset] ?? 0;

              const scaleMap = {
                "0": 1,
                "-1": 0.85,
                "1": 0.85,
                "-2": 0.7,
                "2": 0.7,
              };
              const scale = scaleMap[offset] ?? 0;

              opacity = offset === 0 ? 1 : absOffset === 1 ? 0.85 : 0.5;
              transform = `translateX(calc(-50% + ${baseTranslate}px)) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`;
            }

            const zIndex = 1000 - absOffset;

            return (
              <div
                key={index}
                className={`cascade-item ${offset === 0 ? "active" : absOffset === 1 ? "near" : absOffset === visibleCount ? "corner" : ""
                  }`}
                style={{
                  transform,
                  zIndex,
                  opacity,
                  width,
                  height,
                  pointerEvents: isVisible ? "auto" : "none",
                  ...(isMobile && offset === 0 && { left: "50%" }),
                }}
              >
                {renderItem(item, index, offset === 0)}
              </div>
            );
          })}
        </div>
      </div>

      <button
        aria-label="Next"
        className="cascade-nav right"
        onClick={() => setActiveIndex((i) => clampIndex(i + 1))}
        type="button"
        disabled={!loop && activeIndex === items.length - 1}
      >
        ›
      </button>
    </div>
  );
};

export default CascadingCarousel;
