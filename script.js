const scene = document.getElementById("scene");
const btn = document.getElementById("enterBtn");
const panelLeft = document.getElementById("panel-left");
const panelRight = document.getElementById("panel-right");

const hasDoorScene = Boolean(scene && panelLeft && panelRight && btn);
const body = document.body;

const MAX_SCROLL = 2200;
const EASE = 0.05;

let targetProgress = 0;
let currentProgress = 0;
let isAnimating = false;
let isRedirecting = false;
let autoMode = false;

if (hasDoorScene) {
  btn.addEventListener("click", startAuto);

  window.addEventListener(
    "wheel",
    (event) => {
      if (isRedirecting || autoMode || body.classList.contains("doors-open")) return;

      const delta = Math.abs(event.deltaY) < 50 ? event.deltaY * 3 : event.deltaY;
      targetProgress += delta;

      if (targetProgress < 0) targetProgress = 0;
      if (targetProgress > MAX_SCROLL) targetProgress = MAX_SCROLL;

      if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );

  // Touch support (swipe up to open)
  let touchStartY = 0;
  window.addEventListener("touchstart", (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    if (isRedirecting || autoMode || body.classList.contains("doors-open")) return;
    const delta = (touchStartY - e.touches[0].clientY) * 4;
    if (delta < 0) return;
    targetProgress += delta;
    touchStartY = e.touches[0].clientY;
    if (targetProgress > MAX_SCROLL) targetProgress = MAX_SCROLL;
    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
} else {
  body.classList.add("projects-only");
}

function update() {
  if (autoMode || !hasDoorScene) return;

  currentProgress += (targetProgress - currentProgress) * EASE;

  if (Math.abs(targetProgress - currentProgress) < 0.5) {
    currentProgress = targetProgress;
  }

  const ratio = currentProgress / MAX_SCROLL;

  scene.style.transition = "none";
  panelLeft.style.transition = "none";
  panelRight.style.transition = "none";

  applyVisuals(ratio);

  if (ratio >= 0.92) {
    openProjects();
  } else if (currentProgress !== targetProgress) {
    requestAnimationFrame(update);
  } else {
    isAnimating = false;
  }
}

function startAuto() {
  if (autoMode || isRedirecting || !hasDoorScene) return;

  autoMode = true;
  scene.style.transition = "transform 1.6s ease-in-out";
  panelLeft.style.transition = "transform 1.5s ease-in-out";
  panelRight.style.transition = "transform 1.5s ease-in-out";

  applyVisuals(1);
  setTimeout(openProjects, 900);
}

function applyVisuals(ratio) {
  if (!hasDoorScene) return;

  const clamped = Math.max(0, Math.min(1, ratio));
  const scale = 1 + clamped * 1.3;
  const offset = clamped * 100;

  scene.style.transform = `scale(${scale})`;
  panelLeft.style.transform = `translateX(-${offset}%)`;
  panelRight.style.transform = `translateX(${offset}%)`;
}

function openProjects() {
  if (isRedirecting) return;

  isRedirecting = true;
  body.classList.add("doors-open");
  body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

function initReveal() {
  const revealTargets = document.querySelectorAll("[data-reveal]");
  if (!revealTargets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealTargets.forEach((el) => observer.observe(el));
}

initReveal();

function initMetricCharts() {
  const charts = document.querySelectorAll(".metric__chart");
  if (!charts.length) return;

  charts.forEach((canvas) => {
    const raw = canvas.dataset.points || "";
    const values = raw
      .split(",")
      .map((v) => Number.parseFloat(v.trim()))
      .filter((v) => Number.isFinite(v));

    if (values.length < 2) return;

    drawMetricSparkline(canvas, values, canvas.dataset.color || "#ffb078");
  });
}

function drawMetricSparkline(canvas, values, color) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const width = canvas.clientWidth || 280;
  const height = canvas.clientHeight || 72;
  const pad = 8;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((value, index) => {
    const x = pad + (index / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return { x, y };
  });

  const duration = 900;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min(1, (now - start) / duration);
    const visibleCount = Math.max(2, Math.ceil(progress * points.length));

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.stroke();

    const visible = points.slice(0, visibleCount);
    if (visible.length > 1) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.3;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(visible[0].x, visible[0].y);
      for (let i = 1; i < visible.length; i += 1) {
        ctx.lineTo(visible[i].x, visible[i].y);
      }
      ctx.stroke();
    }

    const last = visible[visible.length - 1];
    if (last) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

initMetricCharts();

// Touch support — swipe up to open the doors
if (hasDoorScene) {
  const scrollHint = document.getElementById("scroll-hint");

  function hideHint() {
    if (scrollHint) scrollHint.style.opacity = "0";
  }

  let touchStartY = 0;
  window.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    if (isRedirecting || autoMode || body.classList.contains("doors-open")) return;
    const delta = (touchStartY - e.touches[0].clientY) * 5;
    if (delta <= 0) return;
    hideHint();
    touchStartY = e.touches[0].clientY;
    targetProgress += delta;
    if (targetProgress > MAX_SCROLL) targetProgress = MAX_SCROLL;
    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  window.addEventListener("wheel", hideHint, { once: true, passive: true });
}

// Hamburger nav toggle (all pages)
const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");
if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  // Close on link click
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}
