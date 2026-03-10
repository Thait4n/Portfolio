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
