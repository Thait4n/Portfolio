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
