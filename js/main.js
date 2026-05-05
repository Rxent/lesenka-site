/* Студия «Лесенка» — interactive bits
 * - Mobile menu toggle
 * - Sticky header shadow on scroll
 * - IntersectionObserver-based fade-in for `.reveal`
 * - Form validation with inline errors and success state
 * - Phone input mask
 * - Year in footer
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
      const target = e.target;
      if (target instanceof HTMLAnchorElement) closeMenu();
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

  /* ---------- Reveal on scroll («вверх по лесенке») ---------- */
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

  /* ---------- Scroll-ladder: лисёнок поднимается по ступеням ---------- */
  const ladder = document.querySelector(".scroll-ladder");
  if (ladder) {
    const fox = ladder.querySelector(".scroll-ladder__fox");
    const steps = Array.from(ladder.querySelectorAll(".scroll-ladder__step"));
    let ticking = false;

    const updateLadder = () => {
      ticking = false;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docH > 0 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
      // Лисёнок едет по лесенке от 0% до 96% (последняя ступень)
      if (fox) fox.style.top = (progress * 96) + "%";
      // Подсветка пройденных ступеней
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

  /* ---------- Phone input mask (light) ---------- */
  const phoneInput = document.getElementById("parent-phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
      let formatted = "";
      if (digits.length === 0) {
        formatted = "";
      } else {
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
      const errEl = form.querySelector(
        '[data-error-for="' + input.id + '"]'
      );
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
      form
        .querySelectorAll("input, button[type=submit]")
        .forEach((el) => (el.disabled = true));
    });

    ["parent-name", "parent-phone"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => setError(el, ""));
      }
    });
  }
})();
