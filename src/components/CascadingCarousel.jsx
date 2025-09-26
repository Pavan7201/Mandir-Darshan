import React, { useState, useRef, useEffect, useCallback } from "react";
import "../css/CascadingCarousel.css";

const CascadingCarousel = ({
  items = [],
  renderItem,
  visibleCount = 2,
  loop = true,
  activeCardWidth = 280,
  activeCardHeight = 370,
  activeCardWidthMobile = 250,
  activeCardHeightMobile = 300,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [cardWidthState, setCardWidthState] = useState(activeCardWidth);
  const [cardHeightState, setCardHeightState] = useState(activeCardHeight);
  const [isScrolling, setIsScrolling] = useState(false);
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
  }, [activeCardWidth, activeCardHeight, activeCardWidthMobile, activeCardHeightMobile]);

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

  const prev = useCallback(() => {
    setIsScrolling(true);
    setActiveIndex((i) => clampIndex(i - 1));
  }, [clampIndex]);

  const next = useCallback(() => {
    setIsScrolling(true);
    setActiveIndex((i) => clampIndex(i + 1));
  }, [clampIndex]);

  useEffect(() => {
  const el = containerRef.current;
  if (!el) return;

  let cooldown = false;
  const COOLDOWN_MS = 300;

  const onWheel = (e) => {
    
    const isMouseWheel = e.deltaX === 0 && Math.abs(e.deltaY) >= 50;

    const isTouchpadHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);

    if (isTouchpadHorizontal) {
      
      const delta = e.deltaX;
      if (Math.abs(delta) < 20) return;
      e.preventDefault();
      if (cooldown) return;

      if (delta > 0) {
        next(); 
      } else {
        prev(); 
      }

      cooldown = true;
      setTimeout(() => (cooldown = false), COOLDOWN_MS);
    } else if (isMouseWheel) {
    
      const delta = e.deltaY;
      e.preventDefault();
      if (cooldown) return;

      if (delta > 0) {
        next();
      } else {
        prev(); 
      }

      cooldown = true;
      setTimeout(() => (cooldown = false), COOLDOWN_MS);
    }
  };

  el.addEventListener("wheel", onWheel, { passive: false });
  return () => {
    el.removeEventListener("wheel", onWheel);
  };
}, [prev, next]);


  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startX = 0;
    let endX = 0;

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
      setIsScrolling(true);
    };

    const onTouchMove = (e) => {
      endX = e.touches[0].clientX;
    };

    const onTouchEnd = () => {
      const diff = startX - endX;
      const THRESHOLD = 30;
      if (diff > THRESHOLD) next();
      else if (diff < -THRESHOLD) prev();

      setTimeout(() => setIsScrolling(false), 800);
    };

    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchmove", onTouchMove);
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [next, prev]);

  const getOffset = (index) => {
    if (!loop) return index - activeIndex;
    const n = items.length;
    const raw = index - activeIndex;
    const alt = raw > 0 ? raw - n : raw + n;
    return Math.abs(raw) < Math.abs(alt) ? raw : alt;
  };

  return (
    <div className="cascade-carousel-wrapper">
      <div className="cascade-carousel" ref={containerRef} style={{ overflow: "visible" }}>
        <div className="cascade-inner" style={{ position: "relative", height: "100%", width: "100%" }}>
          {items.map((item, index) => {
            const offset = getOffset(index);
            const absOffset = Math.abs(offset);
            const isVisible = absOffset <= visibleCount;

            let transform = "";
            let opacity = 0;
            let zIndex = 1000 - absOffset;
            let cardW = cardWidthState;
            let cardH = cardHeightState;

            if (!isScrolling) {
              if (isMobile) {
                if (offset === 0) {
                  transform = `translateX(-50%) translateY(0)`;
                  opacity = 1;
                  zIndex = 1000;
                } else {
                  opacity = 0;
                  zIndex = 0;
                }
              } else {
                const stackSpacingY = 20;
                if (offset === 0) {
                  transform = `translateX(-50%) translateY(0)`;
                  opacity = 1;
                } else if (offset === 1) {
                  cardW = Math.round(cardWidthState * 0.9);
                  cardH = Math.round(cardHeightState * 0.9);
                  transform = `translateX(-50%) translateY(-${stackSpacingY}px)`;
                  opacity = 0.85;
                } else if (offset === -1) {
                  cardW = Math.round(cardWidthState * 0.9);
                  cardH = Math.round(cardHeightState * 0.9);
                  transform = `translateX(-50%) translateY(-${stackSpacingY}px)`;
                  opacity = 0.85;
                } else if (absOffset <= visibleCount) {
                  const factor = 0.9 - (absOffset - 1) * 0.05;
                  cardW = Math.round(cardWidthState * factor);
                  cardH = Math.round(cardHeightState * factor);
                  transform = `translateX(-50%) translateY(-${stackSpacingY * absOffset}px)`;
                  opacity = 0.7 - (absOffset - 2) * 0.1;
                } else {
                  opacity = 0;
                  zIndex = 0;
                }
              }
            } else {
              const spacing = isMobile ? Math.round(cardW * 1) : Math.round(cardW * 0.95);
              const baseTranslate = offset * spacing;
              const translateYMap = { "-2": 200, "-1": 90, "0": 20, "1": 90, "2": 200 };
              const rotateMap = { "-2": -30, "-1": -30, "0": 0, "1": 30, "2": 30 };
              const scaleMap = { "0": 1, "-1": 0.85, "1": 0.85, "-2": 0.75, "2": 0.75 };

              const translateY = translateYMap[offset] ?? 80;
              const rotate = rotateMap[offset] ?? 0;
              const scale = scaleMap[offset] ?? 0;

              transform = `translateX(calc(-50% + ${baseTranslate}px)) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`;
              opacity = offset === 0 ? 1 : absOffset === 1 ? 0.85 : 0.5;
            }

            return (
              <div
                key={index}
                className={`cascade-item ${offset === 0 ? "active" : absOffset === 1 ? "near" : "corner"}`}
                style={{
                  transform,
                  width: cardW,
                  height: cardH,
                  zIndex,
                  opacity,
                  pointerEvents: isVisible ? "auto" : "none",
                }}
              >
                {renderItem(item, index, offset === 0)}
              </div>
            );
          })}
        </div>
        {/* Uncomment below for dots navigation if needed */}
        {/* <div className="cascade-dots">
          {items
            .map((item, idx) => ({ idx, offset: getOffset(idx) }))
            .filter(({ offset }) => Math.abs(offset) <= visibleCount)
            .map(({ idx }) => (
              <span
                key={idx}
                className={`dot ${idx === activeIndex ? "active" : ""}`}
                onClick={() => setActiveIndex(idx)}
              />
            ))}
        </div> */}
      </div>
    </div>
  );
};

export default CascadingCarousel;
