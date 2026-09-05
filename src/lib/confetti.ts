type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  shape: "rect" | "circle" | "heart";
  life: number;
};

const COLORS = ["#e8b84b", "#f4a3c0", "#fff3d1", "#c084fc", "#fca5a5", "#fbbf24", "#a78bfa"];

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let pieces: Piece[] = [];
let raf = 0;

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
}

function resize() {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawHeart(c: CanvasRenderingContext2D, s: number) {
  c.beginPath();
  c.moveTo(0, s * 0.3);
  c.bezierCurveTo(0, -s * 0.2, -s, -s * 0.1, -s * 0.5, s * 0.4);
  c.bezierCurveTo(-s * 0.2, s * 0.7, 0, s * 0.9, 0, s);
  c.bezierCurveTo(0, s * 0.9, s * 0.2, s * 0.7, s * 0.5, s * 0.4);
  c.bezierCurveTo(s, -s * 0.1, 0, -s * 0.2, 0, s * 0.3);
  c.fill();
}

function loop() {
  if (!ctx || !canvas) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);

  pieces = pieces.filter((p) => p.life > 0 && p.y < h + 60);

  for (const p of pieces) {
    p.vy += 0.16;
    p.vx *= 0.995;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 1;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 60));
    ctx.fillStyle = p.color;
    if (p.shape === "rect") {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else if (p.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      drawHeart(ctx, p.size / 1.8);
    }
    ctx.restore();
  }

  if (pieces.length > 0) {
    raf = requestAnimationFrame(loop);
  } else {
    cancelAnimationFrame(raf);
    raf = 0;
    ctx.clearRect(0, 0, w, h);
  }
}

export function fireConfetti(x?: number, y?: number, amount = 90) {
  // respect users who ask for less motion
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  ensureCanvas();
  const mobile = window.innerWidth < 640;
  const count = Math.round(amount * (mobile ? 0.55 : 1)); // lighter load on phones
  const ox = x ?? window.innerWidth / 2;
  const oy = y ?? window.innerHeight / 2.4;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (3 + Math.random() * 11) * (mobile ? 0.8 : 1);
    pieces.push({
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (mobile ? 4 : 5),
      size: (mobile ? 5 : 6) + Math.random() * (mobile ? 8 : 12),
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      shape: (["rect", "circle", "heart"] as const)[(Math.random() * 3) | 0],
      life: 120 + Math.random() * 90,
    });
  }
  const cap = window.innerWidth < 640 ? 350 : 900;
  if (pieces.length > cap) pieces = pieces.slice(-cap);
  if (!raf) raf = requestAnimationFrame(loop);
}

export function celebrationBurst() {
  fireConfetti(window.innerWidth * 0.18, window.innerHeight * 0.55, 70);
  setTimeout(() => fireConfetti(window.innerWidth * 0.82, window.innerHeight * 0.55, 70), 180);
  setTimeout(() => fireConfetti(window.innerWidth * 0.5, window.innerHeight * 0.35, 100), 360);
}
