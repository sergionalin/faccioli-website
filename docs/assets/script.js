document.documentElement.classList.add("js");

const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const year = document.querySelector("[data-year]");
const form = document.querySelector("[data-contact-form]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };
  setMenu(false);

  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (toggle.getAttribute("aria-expanded") !== "true") return;
    if (event.key === "Escape") {
      setMenu(false);
      toggle.focus();
    }
    if (event.key === "Tab") {
      const last = nav.querySelector("a:last-child");
      if (event.shiftKey && document.activeElement === toggle) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        toggle.focus();
      }
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) setMenu(false);
  });
  window.matchMedia("(max-width: 1080px)").addEventListener("change", () => setMenu(false));
}

function createEmailUrl(name, email, message) {
  const subject = encodeURIComponent("Richiesta preventivo dal sito");
  const body = encodeURIComponent(`Nome: ${name.trim()}\nEmail: ${email.trim()}\n\nMessaggio:\n${message.trim()}`);
  return `mailto:info@facciolidraulico.it?subject=${subject}&body=${body}`;
}

if (form) {
  form.querySelector("[data-email-submit]").hidden = false;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = data.get("name") || "";
    const email = data.get("email") || "";
    const message = data.get("message") || "";
    form.querySelector("[data-form-status]").textContent = "Messaggio preparato. Completa l'invio nella tua applicazione email.";
    window.location.href = createEmailUrl(name, email, message);
  });
}

document.querySelectorAll("[data-gallery]").forEach((gallery, index) => {
  const frame = gallery.closest(".scroll-gallery-frame");
  const prev = frame.querySelector('[data-gallery-scroll="prev"]');
  const next = frame.querySelector('[data-gallery-scroll="next"]');
  const items = [...gallery.children];
  const position = document.createElement("span");
  position.className = "gallery-position";
  position.setAttribute("aria-live", "polite");
  frame.append(position);
  gallery.id = `gallery-${index + 1}`;
  gallery.setAttribute("role", "region");
  [prev, next].forEach(button => {
    button.setAttribute("aria-controls", gallery.id);
    button.title = button.getAttribute("aria-label");
  });

  const offsets = () => items.map(item => item.offsetLeft - items[0].offsetLeft);
  const currentIndex = () => {
    if (gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 2) return items.length - 1;
    const points = offsets();
    return points.reduce((best, x, i) => Math.abs(x - gallery.scrollLeft) < Math.abs(points[best] - gallery.scrollLeft) ? i : best, 0);
  };
  const update = () => {
    prev.disabled = gallery.scrollLeft <= 2;
    next.disabled = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 2;
    const current = next.disabled ? items.length : currentIndex() + 1;
    position.textContent = `${current} / ${items.length}`;
    position.setAttribute("aria-label", `Immagine ${current} di ${items.length}`);
  };
  const goTo = (index) => gallery.scrollTo({
    left: offsets()[Math.max(0, Math.min(index, items.length - 1))],
    behavior: reducedMotion.matches ? "instant" : "smooth"
  });
  prev.addEventListener("click", () => goTo(currentIndex() - 1));
  next.addEventListener("click", () => goTo(currentIndex() + 1));
  gallery.addEventListener("keydown", event => {
    const targets = { ArrowLeft: currentIndex() - 1, ArrowRight: currentIndex() + 1, Home: 0, End: items.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    goTo(targets[event.key]);
  });
  gallery.addEventListener("scroll", update, { passive: true });
  new ResizeObserver(update).observe(gallery);
  update();
});

const imageLinks = document.querySelectorAll("[data-image-link]");
if (imageLinks.length) {
  const dialog = document.createElement("dialog");
  dialog.className = "image-dialog";
  dialog.setAttribute("aria-label", "Dettaglio immagine");
  dialog.innerHTML = '<form method="dialog"><button class="button secondary-dark" aria-label="Chiudi immagine">Chiudi</button></form><img alt=""><p></p>';
  document.body.append(dialog);
  const detail = dialog.querySelector("img");
  const caption = dialog.querySelector("p");
  imageLinks.forEach(link => link.addEventListener("click", event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const thumbnail = link.querySelector("img");
    detail.src = link.href;
    detail.alt = thumbnail.alt;
    caption.textContent = thumbnail.alt;
    dialog.showModal();
  }));
  dialog.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
}
