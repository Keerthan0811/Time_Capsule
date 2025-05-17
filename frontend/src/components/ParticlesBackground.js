import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

const COLORS_LIGHT = ["#eebbc3", "#b8c1ec", "#232946", "#f4f4f4"];
const COLORS_DARK = ["#eebbc3", "#b8c1ec", "#232946", "#181a20"];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

const ParticlesBackground = forwardRef(({ theme }, ref) => {
  const canvasRef = useRef();
  const particles = useRef([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const blastActive = useRef(false);
  const blastOrigin = useRef({ x: null, y: null });
  const blastFrame = useRef(0);

  useImperativeHandle(ref, () => ({
    blast: (origin) => {
      blastActive.current = true;
      blastOrigin.current = origin || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      blastFrame.current = 0;
      setTimeout(() => {
        blastActive.current = false;
        blastOrigin.current = { x: null, y: null };
      }, 800); // blast duration
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    const PARTICLE_COUNT = Math.floor((width * height) / 1800);
    particles.current = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = randomBetween(0.7, 1.5); // base speed for drifting
      const baseDx = Math.cos(angle) * speed;
      const baseDy = Math.sin(angle) * speed;
      particles.current.push({
        x: randomBetween(0, width),
        y: randomBetween(0, height),
        r: randomBetween(2, 7),
        color: (theme === "dark" ? COLORS_DARK : COLORS_LIGHT)[Math.floor(Math.random() * 4)],
        dx: baseDx,
        dy: baseDy,
        baseDx, // store base velocity
        baseDy,
        hue: randomBetween(0, 360),
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (let p of particles.current) {
        // Blast effect
        if (blastActive.current && blastOrigin.current.x !== null && blastOrigin.current.y !== null) {
          let angle = Math.atan2(p.y - blastOrigin.current.y, p.x - blastOrigin.current.x);
          if (blastFrame.current < 10) {
            p.dx += Math.cos(angle) * 1.2;
            p.dy += Math.sin(angle) * 1.2;
          }
        }
        // Gradually slow down after blast, but keep base velocity
        if (!blastActive.current) {
          // Only slow the "extra" velocity, not the base drift
          p.dx = p.baseDx + (p.dx - p.baseDx) * 0.96;
          p.dy = p.baseDy + (p.dy - p.baseDy) * 0.96;
        }
        // Mouse interaction (only when not blasting)
        let dist = Math.hypot(p.x - mouse.current.x, p.y - mouse.current.y);
        if (dist < 120 && !blastActive.current) {
          let angle = Math.atan2(mouse.current.y - p.y, mouse.current.x - p.x);
          p.dx += Math.cos(angle) * 0.04;
          p.dy += Math.sin(angle) * 0.04;
        }
        // Always move
        p.x += p.dx;
        p.y += p.dy;
        p.hue += 0.5;
        // Wrap around edges instead of bouncing
        if (p.x - p.r > width) {
          p.x = -p.r;
        }
        if (p.x + p.r < 0) {
          p.x = width + p.r;
        }
        if (p.y - p.r > height) {
          p.y = -p.r;
        }
        if (p.y + p.r < 0) {
          p.y = height + p.r;
        }
        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${p.hue}, 70%, ${theme === "dark" ? "60%" : "50%"})`;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      if (blastActive.current) blastFrame.current++;
      animationId = requestAnimationFrame(draw);
    }
    draw();

    // Mouse move
    function onMouseMove(e) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    }
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationId);
    };
    // eslint-disable-next-line
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        zIndex: 0,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        background: theme === "dark"
          ? "linear-gradient(120deg, #181a20 0%, #232946 100%)"
          : "linear-gradient(120deg, #f4f4f4 0%, #b8c1ec 100%)"
      }}
      width={window.innerWidth}
      height={window.innerHeight}
      aria-hidden="true"
    />
  );
});

export default ParticlesBackground;