/* Студия «Лесенка» — interactive bits
 * - Year in footer
 * - Mobile menu toggle
 * - Sticky header shadow on scroll
 * - IntersectionObserver-based reveal animations
 * - Scroll-ladder indicator (лисёнок поднимается по ступеням)
 * - Phone input mask
 * - Form validation (form-stub, no real submit)
 * - Active nav section highlighting on scroll
 * - Photo gallery carousel (слайдер) with prev/next и dots
 * - Photo gallery lightbox with keyboard navigation
 */
(function () {
  "use strict";

  /* ---------- Year in footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Mobile menu ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.getElementById("primary-nav");

  if (navToggle && primaryNav) {
    const closeMenu = () => {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Открыть меню");
      primaryNav.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    const openMenu = () => {
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Закрыть меню");
      primaryNav.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    primaryNav.addEventListener("click", (e) => {
      if (e.target instanceof HTMLAnchorElement) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    const mql = window.matchMedia("(min-width: 881px)");
    mql.addEventListener("change", (ev) => {
      if (ev.matches) closeMenu();
    });
  }

  /* ---------- Sticky header shadow ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal, .stagger-up");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Scroll-ladder ---------- */
  const ladder = document.querySelector(".scroll-ladder");
  if (ladder) {
    const fox = ladder.querySelector(".scroll-ladder__fox");
    const steps = Array.from(ladder.querySelectorAll(".scroll-ladder__step"));
    let ticking = false;

    const updateLadder = () => {
      ticking = false;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docH > 0 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
      if (fox) fox.style.top = progress * 96 + "%";
      steps.forEach((step, idx) => {
        const stepProgress = idx / (steps.length - 1);
        step.classList.toggle("is-active", progress >= stepProgress - 0.04);
      });
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateLadder);
        ticking = true;
      }
    };

    updateLadder();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  /* ---------- Phone input mask ---------- */
  const phoneInput = document.getElementById("parent-phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
      let formatted = "";
      if (digits.length > 0) {
        const d = digits.startsWith("8") ? "7" + digits.slice(1) : digits;
        formatted = "+7";
        if (d.length > 1) formatted += " (" + d.slice(1, 4);
        if (d.length >= 4) formatted += ") " + d.slice(4, 7);
        if (d.length >= 7) formatted += "-" + d.slice(7, 9);
        if (d.length >= 9) formatted += "-" + d.slice(9, 11);
      }
      phoneInput.value = formatted;
    });
  }

  /* ---------- Form validation ---------- */
  const form = document.getElementById("contact-form");
  if (form) {
    const setError = (input, message) => {
      const errEl = form.querySelector('[data-error-for="' + input.id + '"]');
      if (errEl) errEl.textContent = message || "";
      input.setAttribute("aria-invalid", message ? "true" : "false");
    };

    const validateName = (value) => {
      if (!value || value.trim().length < 2)
        return "Пожалуйста, укажите имя (минимум 2 символа)";
      return "";
    };

    const validatePhone = (value) => {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 10) return "Укажите телефон полностью";
      return "";
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.elements.namedItem("name");
      const phone = form.elements.namedItem("phone");
      const consent = form.elements.namedItem("consent");

      let ok = true;
      if (name instanceof HTMLInputElement) {
        const msg = validateName(name.value);
        setError(name, msg);
        if (msg) ok = false;
      }
      if (phone instanceof HTMLInputElement) {
        const msg = validatePhone(phone.value);
        setError(phone, msg);
        if (msg) ok = false;
      }
      if (consent instanceof HTMLInputElement && !consent.checked) {
        alert("Пожалуйста, подтвердите согласие на обработку данных.");
        ok = false;
      }

      if (!ok) return;

      const success = form.querySelector(".contact__form-success");
      if (success) success.hidden = false;
      form.querySelectorAll("input, button[type=submit]").forEach((el) => {
        el.disabled = true;
      });
    });

    ["parent-name", "parent-phone"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => setError(el, ""));
      }
    });
  }

  /* ---------- Gallery carousel ---------- */
  const carousel = document.querySelector(".carousel");
  if (carousel) {
    const track = carousel.querySelector(".carousel__track");
    const slides = Array.from(carousel.querySelectorAll(".carousel__slide"));
    const btnPrev = carousel.querySelector(".carousel__arrow--prev");
    const btnNext = carousel.querySelector(".carousel__arrow--next");
    const dotsHost = carousel.querySelector(".carousel__dots");
    let index = 0;

    const perView = () => {
      if (window.matchMedia("(min-width: 900px)").matches) return 3;
      if (window.matchMedia("(min-width: 600px)").matches) return 2;
      return 1;
    };

    const maxIndex = () => Math.max(0, slides.length - perView());

    if (dotsHost) {
      dotsHost.innerHTML = "";
      slides.forEach((_s, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel__dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", `Перейти к фото ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        dotsHost.appendChild(dot);
      });
    }
    const dots = dotsHost ? Array.from(dotsHost.children) : [];

    const update = () => {
      const slide = slides[0];
      if (!slide || !track) return;
      const rect = slide.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0");
      const step = rect.width + gap;
      track.style.transform = `translateX(${-index * step}px)`;

      if (btnPrev) btnPrev.disabled = index <= 0;
      if (btnNext) btnNext.disabled = index >= maxIndex();

      dots.forEach((d, i) => {
        d.classList.toggle("is-active", i === index);
        d.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    };

    const goTo = (i) => {
      index = Math.min(maxIndex(), Math.max(0, i));
      update();
    };

    if (btnPrev) btnPrev.addEventListener("click", () => goTo(index - 1));
    if (btnNext) btnNext.addEventListener("click", () => goTo(index + 1));

    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { goTo(index - 1); e.preventDefault(); }
      if (e.key === "ArrowRight") { goTo(index + 1); e.preventDefault(); }
    });

    // Touch swipe
    let touchStartX = 0;
    let touchDeltaX = 0;
    carousel.addEventListener(
      "touchstart",
      (e) => { touchStartX = e.changedTouches[0].clientX; touchDeltaX = 0; },
      { passive: true }
    );
    carousel.addEventListener(
      "touchmove",
      (e) => { touchDeltaX = e.changedTouches[0].clientX - touchStartX; },
      { passive: true }
    );
    carousel.addEventListener(
      "touchend",
      () => {
        if (Math.abs(touchDeltaX) > 40) goTo(index + (touchDeltaX < 0 ? 1 : -1));
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      goTo(Math.min(index, maxIndex()));
    });

    // Обновляем после загрузки картинок, чтобы верно взять размеры
    if (document.readyState === "complete") {
      update();
    } else {
      window.addEventListener("load", update, { once: true });
      update();
    }
  }

  /* ---------- Active nav section highlighting ---------- */
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const sectionMap = new Map();
  navLinks.forEach((a) => {
    const id = a.getAttribute("href");
    if (id && id.startsWith("#")) {
      const sec = document.querySelector(id);
      if (sec) sectionMap.set(sec, a);
    }
  });

  if (sectionMap.size && "IntersectionObserver" in window) {
    const sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = sectionMap.get(entry.target);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sectionMap.forEach((_link, sec) => sectionObs.observe(sec));
  }

  /* ---------- Gallery lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const galleryItems = Array.from(document.querySelectorAll(".gallery__item"));

  if (lightbox && galleryItems.length) {
    const imgEl = lightbox.querySelector(".lightbox__img");
    const captionEl = lightbox.querySelector(".lightbox__caption");
    const btnClose = lightbox.querySelector(".lightbox__close");
    const btnPrev = lightbox.querySelector(".lightbox__prev");
    const btnNext = lightbox.querySelector(".lightbox__next");
    let currentIdx = -1;
    let lastFocused = null;

    const sources = galleryItems.map((b, i) => ({
      full: b.dataset.full || "",
      alt: b.querySelector("img")?.alt || "",
      index: i,
    }));

    const open = (idx) => {
      const item = sources[idx];
      if (!item) return;
      currentIdx = idx;
      imgEl.src = item.full;
      imgEl.alt = item.alt;
      captionEl.textContent = `${idx + 1} / ${sources.length} · ${item.alt}`;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      lastFocused = document.activeElement;
      btnClose.focus({ preventScroll: true });
    };

    const close = () => {
      lightbox.hidden = true;
      imgEl.src = "";
      document.body.style.overflow = "";
      currentIdx = -1;
      if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
    };

    const go = (delta) => {
      if (currentIdx < 0) return;
      const next = (currentIdx + delta + sources.length) % sources.length;
      open(next);
    };

    galleryItems.forEach((btn, idx) => {
      btn.addEventListener("click", () => open(idx));
    });
    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", () => go(-1));
    btnNext.addEventListener("click", () => go(1));

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    });

    // Простой свайп для тач-устройств
    let touchStartX = 0;
    lightbox.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );
    lightbox.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) go(dx > 0 ? -1 : 1);
      },
      { passive: true }
    );
  }
})();
