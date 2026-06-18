const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const year = document.querySelector("[data-year]");
const form = document.querySelector("[data-contact-form]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const galleryButtons = document.querySelectorAll("[data-gallery-scroll]");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navLinks.length) {
  const current = window.location.pathname.split("/").pop() || "index.html";

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (href === current || (current === "" && href === "index.html")) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
}

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }
  });
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = data.get("name") || "";
    const email = data.get("email") || "";
    const message = data.get("message") || "";
    const subject = encodeURIComponent("Richiesta preventivo dal sito");
    const body = encodeURIComponent(
      `Nome: ${name}\nEmail: ${email}\n\nMessaggio:\n${message}`
    );

    window.location.href = `mailto:info@facciolidraulico.it?subject=${subject}&body=${body}`;
  });
}

if (galleryButtons.length) {
  const galleries = new Set();
  const scrollAnimations = new WeakMap();

  const updateGalleryButtons = (gallery) => {
    const frame = gallery.closest(".scroll-gallery-frame");
    const prev = frame ? frame.querySelector('[data-gallery-scroll="prev"]') : null;
    const next = frame ? frame.querySelector('[data-gallery-scroll="next"]') : null;
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;

    if (!prev || !next) {
      return;
    }

    prev.disabled = gallery.scrollLeft <= 1;
    next.disabled = gallery.scrollLeft >= maxScroll - 1;
  };

  const animateGalleryScroll = (gallery, target) => {
    const currentAnimation = scrollAnimations.get(gallery);

    if (currentAnimation) {
      cancelAnimationFrame(currentAnimation);
    }

    const start = gallery.scrollLeft;
    const distance = target - start;
    const duration = 420;
    const startTime = performance.now();

    const easeInOutCubic = (time) =>
      time < 0.5 ? 4 * time * time * time : 1 - Math.pow(-2 * time + 2, 3) / 2;

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      gallery.scrollLeft = start + distance * easeInOutCubic(progress);

      if (progress < 1) {
        scrollAnimations.set(gallery, requestAnimationFrame(step));
      } else {
        scrollAnimations.delete(gallery);
        updateGalleryButtons(gallery);
      }
    };

    scrollAnimations.set(gallery, requestAnimationFrame(step));
  };

  galleryButtons.forEach((button) => {
    const frame = button.closest(".scroll-gallery-frame");
    const gallery = frame ? frame.querySelector("[data-gallery]") : null;

    if (!gallery) {
      return;
    }

    updateGalleryButtons(gallery);
    galleries.add(gallery);

    button.addEventListener("click", () => {
      const direction = button.dataset.galleryScroll === "next" ? 1 : -1;
      const amount = Math.max(gallery.clientWidth * 0.82, 260);
      const maxScroll = gallery.scrollWidth - gallery.clientWidth;
      const target = Math.max(0, Math.min(gallery.scrollLeft + amount * direction, maxScroll));

      animateGalleryScroll(gallery, target);
    });
  });

  galleries.forEach((gallery) => {
    gallery.addEventListener("scroll", () => updateGalleryButtons(gallery), { passive: true });
    window.addEventListener("resize", () => updateGalleryButtons(gallery));
  });
}
