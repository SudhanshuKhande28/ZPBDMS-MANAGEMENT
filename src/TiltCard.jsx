import React, { useState, useRef, useCallback } from "react";

export default function TiltCard({
  children,
  className = "",
  style = {},
  maxTilt = 6,
  glare = true,
  glowColor = "rgba(255, 51, 75, 0.15)",
  hudBrackets = false,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, isHovered: false });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback(
    (e) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = -((y - centerY) / centerY) * maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      setTilt({ rotateX, rotateY, isHovered: true });
      if (glare) {
        setGlarePos({
          x: (x / rect.width) * 100,
          y: (y / rect.height) * 100,
          opacity: 1,
        });
      }
    },
    [maxTilt, glare]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, isHovered: false });
    if (glare) {
      setGlarePos((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [glare]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`tilt-card-container ${className}`}
      style={{
        perspective: 1000,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      {...props}
    >
      <div
        className="tilt-card-inner"
        style={{
          transform: tilt.isHovered
            ? `rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) translateZ(6px)`
            : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
          transition: tilt.isHovered
            ? "transform 0.08s ease-out, box-shadow 0.2s ease"
            : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease",
          transformStyle: "preserve-3d",
          width: "100%",
          height: "100%",
          position: "relative",
          borderRadius: "inherit",
        }}
      >
        {children}

        {/* Specular Glare Overlayer */}
        {glare && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              pointerEvents: "none",
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.16) 0%, transparent 60%)`,
              opacity: glarePos.opacity,
              transition: "opacity 0.25s ease",
              mixBlendMode: "overlay",
              zIndex: 5,
            }}
          />
        )}

        {/* Optional Cyber HUD Corner Brackets */}
        {hudBrackets && (
          <>
            <div className="hud-corner-tl" />
            <div className="hud-corner-br" />
          </>
        )}
      </div>
    </div>
  );
}
