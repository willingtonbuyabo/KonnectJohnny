import React, { useEffect, useRef, useState } from "react";

interface ConfettiCanvasProps {
  active: boolean;
  colorPalette?: string[];
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
}

const DEFAULT_PRIDE_COLORS = [
  "#ff3366", // Red-pink
  "#ff9933", // Orange
  "#D4AF37", // Gold
  "#33cc66", // Green
  "#3399ff", // Blue
  "#9933ff", // Violet
];

export default function ConfettiCanvas({ active, colorPalette = DEFAULT_PRIDE_COLORS }: ConfettiCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 1. Precise ResizeObserver configuration based on container dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;

      // Debounce resize updates to prevent layout thrashing and maintain animation performance
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({ width, height });
      }, 100);
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  // 2. Initialize and trigger confetti burst when active state changes
  useEffect(() => {
    if (!active || dimensions.width === 0 || dimensions.height === 0) {
      particlesRef.current = [];
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const particles: Particle[] = [];
    const count = 120; // Number of particles in a burst

    // Spawn from left and right bottom corners to create a beautiful celebratory arch
    for (let i = 0; i < count; i++) {
      const isLeft = i % 2 === 0;
      const x = isLeft ? 0 : dimensions.width;
      const y = dimensions.height * 0.75; // near lower part of screen

      // Velocity vectors pointing inwards and upwards
      const angle = isLeft 
        ? (Math.random() * 45 + 15) * (Math.PI / 180) // 15 to 60 degrees
        : (Math.random() * 45 + 105) * (Math.PI / 180); // 105 to 150 degrees
      
      const speed = Math.random() * 15 + 12;

      particles.push({
        x,
        y,
        size: Math.random() * 8 + 6,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        speedX: Math.cos(angle) * speed,
        speedY: -Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.15 + 0.05,
      });
    }

    particlesRef.current = particles;

    // Start animation loop
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gravity = 0.35;
    const drag = 0.98;

    const render = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const activeParticles = particlesRef.current;
      
      for (let i = activeParticles.length - 1; i >= 0; i--) {
        const p = activeParticles[i];

        // Apply physics
        p.speedX *= drag;
        p.speedY += gravity;
        p.speedY *= drag;
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        // Slow fade out near bottom or after velocity drops
        if (p.y > dimensions.height * 0.5) {
          p.opacity -= 0.01;
        }

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(Math.sin(p.wobble), 1);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);

        // Render rectangles and circles for variety
        if (i % 3 === 0) {
          // Circle
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (i % 3 === 1) {
          // Standard Confetti Strip
          ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 2);
        } else {
          // Diamond / Square
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();

        // Remove dead/offscreen particles
        if (p.opacity <= 0 || p.y > dimensions.height + 20) {
          activeParticles.splice(i, 1);
        }
      }

      if (activeParticles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(render);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, dimensions, colorPalette]);

  return (
    <div
      ref={containerRef}
      id="confetti-container"
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-40"
    >
      <canvas
        ref={canvasRef}
        id="confetti-canvas"
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full block bg-transparent"
      />
    </div>
  );
}
