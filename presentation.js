const steps = document.querySelectorAll(".step");

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
