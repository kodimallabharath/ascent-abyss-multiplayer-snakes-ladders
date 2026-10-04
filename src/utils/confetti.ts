// Standalone lightweight particle confetti engine for win celebrations

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vRot: number;
  shape: 'rect' | 'circle' | 'strip';
  opacity: number;
}

export function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const resize = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  };
  resize();

  const colors = [
    '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6',
    '#ec4899', '#f97316', '#eab308', '#06b6d4', '#ffffff'
  ];

  const particles: Particle[] = [];
  const count = 160;

  for (let i = 0; i < count; i++) {
    // Blast from both sides or center
    const side = i % 2 === 0 ? 0.2 : 0.8;
    particles.push({
      x: window.innerWidth * side + (Math.random() * 80 - 40),
      y: window.innerHeight * 0.7,
      vx: (side === 0.2 ? 1 : -1) * (Math.random() * 12 + 6) + (Math.random() * 6 - 3),
      vy: -(Math.random() * 18 + 14),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'strip'),
      opacity: 1,
    });
  }

  let animationFrameId: number;
  const gravity = 0.42;
  const drag = 0.97;
  const startTime = Date.now();
  const maxDuration = 4500; // ms

  function render() {
    const elapsed = Date.now() - startTime;
    if (elapsed > maxDuration || particles.length === 0) {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
      return;
    }

    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.vy += gravity;
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;

      if (elapsed > 2500) {
        p.opacity = Math.max(0, 1 - (elapsed - 2500) / 2000);
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 4, -p.size, p.size / 2, p.size * 2);
      }

      ctx.restore();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  animationFrameId = requestAnimationFrame(render);
}
