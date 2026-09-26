import React, { useEffect, useRef } from "react";

export default function CyberAtmosphereCanvas({ isLight = false, mode = "nebula" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const mouse = { x: -1000, y: -1000, active: false };

    // Particle nodes
    const PARTICLE_COUNT = 48;
    const particles = [];

    const colors = isLight
      ? ["#ef4444", "#f59e0b", "#0284c7", "#6366f1"]
      : ["#ff334b", "#f59e0b", "#38bdf8", "#ec4899", "#8b5cf6"];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const layer = Math.random() > 0.4 ? 1 : 0.5; // Foreground vs background parallax
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (0.45 * layer),
          vy: (Math.random() - 0.5) * (0.45 * layer),
          radius: (Math.random() * 2.2 + 1.2) * layer,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.3,
          layer,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    resize();
    initParticles();

    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    let lastTime = performance.now();

    function render(currentTime) {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle atmospheric gradient orbs
      const gradOrb1 = ctx.createRadialGradient(
        width * 0.15,
        height * 0.15,
        0,
        width * 0.15,
        height * 0.15,
        width * 0.45
      );
      gradOrb1.addColorStop(0, isLight ? "rgba(239, 68, 68, 0.04)" : "rgba(255, 51, 75, 0.07)");
      gradOrb1.addColorStop(1, "transparent");
      ctx.fillStyle = gradOrb1;
      ctx.fillRect(0, 0, width, height);

      const gradOrb2 = ctx.createRadialGradient(
        width * 0.85,
        height * 0.25,
        0,
        width * 0.85,
        height * 0.25,
        width * 0.5
      );
      gradOrb2.addColorStop(0, isLight ? "rgba(245, 158, 11, 0.03)" : "rgba(245, 158, 11, 0.05)");
      gradOrb2.addColorStop(1, "transparent");
      ctx.fillStyle = gradOrb2;
      ctx.fillRect(0, 0, width, height);

      // Connect filaments between close nodes
      const maxDistance = 140;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * (isLight ? 0.08 : 0.15);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isLight
              ? `rgba(100, 116, 139, ${lineAlpha})`
              : `rgba(255, 51, 75, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update & Draw Nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off bounds
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse interactive gravity repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxRepel = 160;
          if (dist < maxRepel && dist > 0) {
            const force = (1 - dist / maxRepel) * 2.2;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Pulse
        p.pulse += delta * 2;
        const currentRadius = p.radius + Math.sin(p.pulse) * 0.4;

        // Glowing outer halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = isLight ? 0.07 : 0.14;
        ctx.fill();

        // Solid core
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = isLight ? 0.65 : 0.85;
        ctx.fill();

        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLight, mode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: isLight ? 0.8 : 0.95,
      }}
    />
  );
}
