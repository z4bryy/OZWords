let soundEnabled = localStorage.getItem("alpharound-sound") !== "off";
let audioCtx = null;
let bgAnimId = null;
let lastTickSecond = -1;

function getAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, duration, type = "sine", volume = 0.08) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem("alpharound-sound", soundEnabled ? "on" : "off");
  if (soundEnabled) playTone(660, 0.12);
  return soundEnabled;
}

function isSoundEnabled() {
  return soundEnabled;
}

function sfxJoin() {
  playTone(523, 0.1);
  setTimeout(() => playTone(659, 0.12), 80);
  setTimeout(() => playTone(784, 0.14), 160);
}

function sfxStop() {
  playTone(880, 0.08, "square", 0.06);
  setTimeout(() => playTone(660, 0.1, "triangle", 0.08), 50);
  setTimeout(() => playTone(440, 0.18, "sine", 0.07), 120);
}

function sfxSubmit() {
  playTone(740, 0.08);
  setTimeout(() => playTone(988, 0.1), 70);
}

function sfxWin() {
  [523, 659, 784, 988, 1175].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.16, "triangle", 0.07), i * 85);
  });
}

function sfxTick() {
  playTone(920, 0.05, "square", 0.04);
}

function sfxCountdownTick(remaining) {
  if (remaining === lastTickSecond) return;
  lastTickSecond = remaining;
  if (remaining <= 10 && remaining > 0) {
    sfxTick();
  }
}

function resetTickTracking() {
  lastTickSecond = -1;
}

function initFloatingLetters(lang) {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const letters = (lang === "cs"
    ? "ABCDEFGHIJKLMNOPQRSTUVWXYZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ"
    : "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  ).split("");

  const particles = Array.from({ length: 28 }, () => ({
    char: letters[Math.floor(Math.random() * letters.length)],
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 14 + Math.random() * 22,
    speed: 0.3 + Math.random() * 0.7,
    drift: -0.3 + Math.random() * 0.6,
    alpha: 0.06 + Math.random() * 0.1,
    hue: Math.floor(Math.random() * 60) + 220,
  }));

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -30) {
        p.y = canvas.height + 20;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -20) p.x = canvas.width + 20;
      if (p.x > canvas.width + 20) p.x = -20;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = `hsl(${p.hue}, 70%, 65%)`;
      ctx.font = `800 ${p.size}px "Segoe UI", sans-serif`;
      ctx.fillText(p.char, p.x, p.y);
      ctx.restore();
    }
    bgAnimId = requestAnimationFrame(draw);
  }

  if (bgAnimId) cancelAnimationFrame(bgAnimId);
  draw();
}

function showPhaseBanner(icon, text) {
  const overlay = document.getElementById("phaseOverlay");
  const iconEl = document.getElementById("phaseIcon");
  const textEl = document.getElementById("phaseText");
  if (!overlay) return;

  iconEl.textContent = icon;
  textEl.textContent = text;
  overlay.classList.remove("hidden");
  overlay.classList.add("show");

  setTimeout(() => {
    overlay.classList.remove("show");
    setTimeout(() => overlay.classList.add("hidden"), 350);
  }, 1200);
}

function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#3b82f6", "#f97316", "#a855f7"];
  const pieces = Array.from({ length: 160 }, () => ({
    x: canvas.width / 2 + (-80 + Math.random() * 160),
    y: canvas.height * 0.35,
    r: 5 + Math.random() * 7,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: -4 + Math.random() * 8,
    vy: -6 - Math.random() * 6,
    rot: Math.random() * Math.PI,
    vr: -0.3 + Math.random() * 0.6,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.55);
      ctx.restore();
    }
    frame += 1;
    if (frame < 140) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

function showToast(message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));

  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 350);
  }, 2800);
}

function sparkleAt(el) {
  if (!el) return;
  el.classList.add("sparkle");
  setTimeout(() => el.classList.remove("sparkle"), 600);
}
