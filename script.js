const scene = document.getElementById("scene");
const btn = document.getElementById("enterBtn");
const panelLeft = document.getElementById("panel-left");
const panelRight = document.getElementById("panel-right");

// Configuration
const MAX_SCROLL = 2200;  // Légèrement plus rapide
const EASE = 0.05;        // Fluidité accrue pour effet "lourd"

let targetProgress = 0;   
let currentProgress = 0;
let isAnimating = false;
let isRedirecting = false;
let autoMode = false;

btn.addEventListener("click", startAuto);

window.addEventListener("wheel", (e) => {
  if (isRedirecting || autoMode) return;
  
  // Ajoute le scroll (divisé par 2 sur trackpad pour éviter que ça file trop vite)
  const delta = Math.abs(e.deltaY) < 50 ? e.deltaY * 3 : e.deltaY; 
  targetProgress += delta;

  // On limite la cible
  if (targetProgress < 0) targetProgress = 0;
  if (targetProgress > MAX_SCROLL) targetProgress = MAX_SCROLL;

  if (!isAnimating) {
    isAnimating = true;
    requestAnimationFrame(update);
  }

}, { passive: false });

function update() {
  if (autoMode) return;

  // Lissage : on déplace currentProgress vers targetProgress petit à petit
  // C'est ce qui donne l'effet "normal" et fluide au lieu de saccadé
  currentProgress += (targetProgress - currentProgress) * EASE;

  // Arrondi pour éviter que ça tourne à l'infini quand c'est "presque" fini
  if (Math.abs(targetProgress - currentProgress) < 0.5) {
    currentProgress = targetProgress;
  }

  const ratio = currentProgress / MAX_SCROLL;

  // Applique le visuel SANS transition CSS (c'est le JS qui anime)
  scene.style.transition = "none";
  panelLeft.style.transition = "none";
  panelRight.style.transition = "none";

  applyVisuals(ratio);

  // Si on a atteint l'ouverture complète (ou presque)
  if (ratio >= 0.92) {
    openProjects();
  } else {
    // Si on n'est pas encore arrivé à la cible, on continue la boucle
    if (currentProgress !== targetProgress) {
        requestAnimationFrame(update);
    } else {
        isAnimating = false;
    }
  }
}

function startAuto(){
 if(autoMode || isRedirecting) return;
 autoMode = true;

 // En automatique (clic), on remet les transitions CSS pour l'effet "propre"
 scene.style.transition = "transform 1.6s ease-in-out";
 panelLeft.style.transition = "transform 1.5s ease-in-out";
 panelRight.style.transition = "transform 1.5s ease-in-out";

 // On force l'ouverture
 applyVisuals(1);

 // On attend exactement la fin de l'animation CSS pour révéler la page
 setTimeout(openProjects, 900); 
}

function applyVisuals(ratio) {
    // Clamp ratio 0..1
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;

    // Zoom : 1 -> 2.3
    const scale = 1 + (ratio * 1.3);
    scene.style.transform = `scale(${scale})`;

    // Panneaux qui s'écartent
    const offset = ratio * 100;
    panelLeft.style.transform = `translateX(-${offset}%)`;
    panelRight.style.transform = `translateX(${offset}%)`;
}

function openProjects() {
  if (isRedirecting) return;
  isRedirecting = true;
  document.body.classList.add("doors-open");
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

function initCarousels(scope = document) {
  const carousels = scope.querySelectorAll(".carousel");
  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel__track");
    const prev = carousel.querySelector("[data-dir='prev']");
    const next = carousel.querySelector("[data-dir='next']");
    if (!track || !prev || !next) return;

    const getAmount = () => Math.max(280, track.clientWidth * 0.9);

    prev.addEventListener("click", () => {
      track.scrollBy({ left: -getAmount(), behavior: "smooth" });
    });

    next.addEventListener("click", () => {
      track.scrollBy({ left: getAmount(), behavior: "smooth" });
    });
  });
}

initCarousels();

function initPresentationScroll() {
  const steps = document.querySelectorAll(".step");
  if (!steps.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.35 }
  );

  steps.forEach((step) => observer.observe(step));
}

initPresentationScroll();
