import React, { useRef, useEffect } from "react";

const COLORS_LIGHT = ["#eebbc3", "#b8c1ec", "#232946", "#f4f4f4"];
const COLORS_DARK = ["#eebbc3", "#b8c1ec", "#232946", "#181a20"];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

const ParticlesBackground = ({ theme }) => {
  const canvasRef = useRef();
  const particles = useRef([]);
  const mouse = useRef({ x: -1000, y: -1000 });

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
      particles.current.push({
        x: randomBetween(0, width),
        y: randomBetween(0, height),
        r: randomBetween(2, 7),
        color: (theme === "dark" ? COLORS_DARK : COLORS_LIGHT)[Math.floor(Math.random() * 4)],
        dx: randomBetween(-0.6, 0.6),
        dy: randomBetween(-0.6, 0.6),
        hue: randomBetween(0, 360),
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (let p of particles.current) {
        // Mouse interaction: particles are attracted to mouse
        let dist = Math.hypot(p.x - mouse.current.x, p.y - mouse.current.y);
        if (dist < 120) {
          let angle = Math.atan2(mouse.current.y - p.y, mouse.current.x - p.x);
          p.dx += Math.cos(angle) * 0.04;
          p.dy += Math.sin(angle) * 0.04;
        }
        // Move
        p.x += p.dx;
        p.y += p.dy;
        // Gradually shift color
        p.hue += 0.5;
        // Bounce off edges
        if (p.x < 0 || p.x > width) p.dx *= -1;
        if (p.y < 0 || p.y > height) p.dy *= -1;
        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${p.hue}, 70%, ${theme === "dark" ? "60%" : "50%"})`;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
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
};

export default ParticlesBackground;