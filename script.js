/* =========================================================
   ЧистоБалт — интерактив сайта
   ========================================================= */

(function () {
  "use strict";

  var $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };
  var $$ = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  /* ---------- Год в подвале ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Мобильное меню ---------- */
  var burger = $("#burger");
  var nav = $("#nav");

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
    document.body.classList.remove("is-locked");
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
      burger.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
      document.body.classList.toggle("is-locked", isOpen);
    });

    $$("a", nav).forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------- Маска телефона ---------- */
  var phone = $("#leadPhone");

  if (phone) {
    phone.addEventListener("input", function () {
      var digits = phone.value.replace(/\D/g, "");

      if (!digits) {
        phone.value = "";
        return;
      }

      if (digits.charAt(0) === "8") digits = "7" + digits.slice(1);
      if (digits.charAt(0) !== "7") digits = "7" + digits;
      digits = digits.slice(0, 11);

      var out = "+7";
      if (digits.length > 1) out += " (" + digits.slice(1, 4);
      if (digits.length >= 5) out += ") " + digits.slice(4, 7);
      if (digits.length >= 8) out += "-" + digits.slice(7, 9);
      if (digits.length >= 10) out += "-" + digits.slice(9, 11);

      phone.value = out;
    });
  }

  /* ---------- Форма заявки ---------- */
  var leadForm = $("#leadForm");
  var formWrap = $("#formWrap");
  var formSuccess = $("#formSuccess");
  var formError = $("#formError");
  var consent = $("#leadConsent");
  var leadName = $("#leadName");
  var submitBtn = leadForm ? $('button[type="submit"]', leadForm) : null;

  function clearError() {
    if (formError) {
      formError.textContent = "";
      formError.classList.remove("is-visible");
    }
    $$(".field.is-invalid", leadForm || document).forEach(function (field) {
      field.classList.remove("is-invalid");
    });
  }

  function showError(message) {
    if (!formError) return;
    formError.textContent = message;
    formError.classList.add("is-visible");
  }

  if (leadForm) {
    $$("input, textarea", leadForm).forEach(function (control) {
      control.addEventListener("input", clearError);
      control.addEventListener("change", clearError);
    });

    leadForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearError();

      var name = leadName ? leadName.value.trim() : "";
      var digits = phone ? phone.value.replace(/\D/g, "") : "";

      if (name.length < 2) {
        if (leadName) leadName.closest(".field").classList.add("is-invalid");
        showError("Укажите имя — так удобнее общаться.");
        if (leadName) leadName.focus();
        return;
      }

      if (digits.length !== 11) {
        if (phone) phone.closest(".field").classList.add("is-invalid");
        showError("Введите телефон в формате +7 (___) ___-__-__.");
        if (phone) phone.focus();
        return;
      }

      if (consent && !consent.checked) {
        showError("Отметьте согласие на обработку персональных данных.");
        consent.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Отправляем…";
      }

      /* Здесь подключается ваш обработчик: CRM, почта или Telegram-бот. */
      window.setTimeout(function () {
        if (formWrap) formWrap.style.display = "none";
        if (formSuccess) formSuccess.classList.add("is-visible");
        leadForm.reset();
        if (phone) phone.value = "";
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Отправить заявку";
        }
      }, 650);
    });
  }

  var formReset = $("#formReset");
  if (formReset) {
    formReset.addEventListener("click", function () {
      if (formSuccess) formSuccess.classList.remove("is-visible");
      if (formWrap) formWrap.style.display = "";
      clearError();
      if (leadName) leadName.focus();
    });
  }

  /* ---------- Cookie-уведомление ---------- */
  var cookieBar = $("#cookieBar");
  var cookieAccept = $("#cookieAccept");
  var COOKIE_KEY = "chistobalt_cookie_accepted";

  function cookieAccepted() {
    try {
      return window.localStorage.getItem(COOKIE_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  if (cookieBar && !cookieAccepted()) {
    window.setTimeout(function () {
      cookieBar.classList.add("is-visible");
    }, 900);
  }

  if (cookieAccept && cookieBar) {
    cookieAccept.addEventListener("click", function () {
      cookieBar.classList.remove("is-visible");
      try {
        window.localStorage.setItem(COOKIE_KEY, "1");
      } catch (error) {
        /* localStorage может быть недоступен — уведомление просто скроется */
      }
    });
  }

  /* ---------- Переключение темы оформления ---------- */
  var themeToggle = $("#themeToggle");
  var htmlEl = document.documentElement;
  var THEME_KEY = "chistobalt_theme";

  function getTheme() {
    try {
      return window.localStorage.getItem(THEME_KEY);
    } catch (error) {
      return null;
    }
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      htmlEl.setAttribute("data-theme", "dark");
      if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", "true");
        themeToggle.textContent = "☀️";
      }
    } else {
      htmlEl.removeAttribute("data-theme");
      if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", "false");
        themeToggle.textContent = "🌙";
      }
    }
  }

  if (themeToggle) {
    var saved = getTheme();
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var initial = saved ? saved : prefersDark ? "dark" : "light";
    applyTheme(initial);

    themeToggle.addEventListener("click", function () {
      var isDark = htmlEl.getAttribute("data-theme") === "dark";
      var next = isDark ? "light" : "dark";
      applyTheme(next);
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch (error) {
        /* localStorage может быть недоступен */
      }
    });

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      if (!getTheme()) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
  }

})();
