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

  /* ---------- Вкладки «Что входит в уборку» ---------- */
  $$(".included__tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var root = tab.closest(".included");
      if (!root) return;

      $$(".included__tab", root).forEach(function (t) {
        var isActive = t === tab;
        t.classList.toggle("is-active", isActive);
        t.setAttribute("aria-selected", String(isActive));
      });

      $$(".included__panel", root).forEach(function (panel) {
        var show = panel.id === tab.getAttribute("data-panel");
        panel.classList.toggle("is-active", show);
        if (show) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "");
        }
      });
    });
  });

  /* ---------- Маска телефона (форма на контактах + калькулятор) ---------- */
  function bindPhoneMask(input) {
    if (!input) return;
    input.addEventListener("input", function () {
      var digits = input.value.replace(/\D/g, "");

      if (!digits) {
        input.value = "";
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

      input.value = out;
    });
  }

  bindPhoneMask($("#leadPhone"));
  bindPhoneMask($("#calcPhone"));

  /* ---------- Калькулятор на главной ---------- */
  var calcForm = $("#calcForm");
  var calcService = $("#calcService");
  var calcArea = $("#calcArea");
  var calcAreaWrap = $("#calcAreaWrap");
  var calcFloors = $("#calcFloors");
  var calcFloorsWrap = $("#calcFloorsWrap");
  var calcTotalEl = $("#calcTotal");
  var calcNegotiable = $("#calcNegotiable");
  var calcError = $("#calcError");
  var calcSuccess = $("#calcSuccess");
  var calcName = $("#calcName");
  var calcPhoneEl = $("#calcPhone");
  var calcConsent = $("#calcConsent");
  var calcSummaryText = "";

  function ruFmt(number) {
    return number.toLocaleString("ru-RU");
  }

  function calcUpdate() {
    if (!calcForm || !calcService || !calcService.options.length) return;

    var opt = calcService.options[calcService.selectedIndex];
    var rate = parseInt(opt.getAttribute("data-price"), 10) || 0;
    var unit = opt.getAttribute("data-base");
    var baseName = opt.getAttribute("data-name");
    var total = rate;

    if (calcAreaWrap) calcAreaWrap.hidden = unit !== "m2";
    if (calcFloorsWrap) calcFloorsWrap.hidden = unit !== "floor";

    var summaryName = baseName;

    if (unit === "m2") {
      var area = Math.max(parseInt(calcArea && calcArea.value, 10) || 0, 0);
      total = rate * area;
      summaryName = baseName + ", " + area + " м²";
    } else if (unit === "floor") {
      var floors = Math.max(parseInt(calcFloors && calcFloors.value, 10) || 1, 1);
      total = rate * floors;
      summaryName = baseName + ", " + floors + " эт.";
    }

    var extrasSum = 0;
    var hasNegotiable = false;
    var extrasNames = [];

    $$('input[type="checkbox"]', calcForm).forEach(function (box) {
      if (!box.checked) return;
      if (box.hasAttribute("data-negotiable")) {
        hasNegotiable = true;
        extrasNames.push(box.getAttribute("data-name"));
      } else if (box.getAttribute("data-price")) {
        extrasSum += parseInt(box.getAttribute("data-price"), 10) || 0;
        extrasNames.push(box.getAttribute("data-name"));
      }
    });

    total = total + extrasSum;
    calcSummaryText = summaryName + (extrasNames.length ? "; дополнительно: " + extrasNames.join(", ") : "") + " — ориентировочно от " + ruFmt(total) + " ₽";

    if (calcTotalEl) calcTotalEl.textContent = "от " + ruFmt(total) + " ₽";
    if (calcNegotiable) calcNegotiable.hidden = !hasNegotiable;
  }

  if (calcForm && calcService) {
    calcService.addEventListener("change", calcUpdate);
    calcService.addEventListener("input", calcUpdate);

    if (calcArea) {
      calcArea.addEventListener("input", calcUpdate);
      calcArea.addEventListener("change", calcUpdate);
    }
    if (calcFloors) {
      calcFloors.addEventListener("input", calcUpdate);
      calcFloors.addEventListener("change", calcUpdate);
    }

    $$('input[type="checkbox"]', calcForm).forEach(function (box) {
      box.addEventListener("change", calcUpdate);
    });

    calcUpdate();

    $$("input, select", calcForm).forEach(function (control) {
      control.addEventListener("input", function () {
        if (calcError) calcError.textContent = "";
      });
    });

    calcForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (calcError) calcError.textContent = "";

      var nameVal = calcName ? calcName.value.trim() : "";
      var digits = calcPhoneEl ? calcPhoneEl.value.replace(/\D/g, "") : "";

      if (nameVal.length < 2) {
        if (calcError) calcError.textContent = "Укажите имя — так удобнее общаться.";
        if (calcName) calcName.focus();
        return;
      }

      if (digits.length !== 11) {
        if (calcError) calcError.textContent = "Введите телефон в формате +7 (___) ___-__-__.";
        if (calcPhoneEl) calcPhoneEl.focus();
        return;
      }

      if (calcConsent && !calcConsent.checked) {
        if (calcError) calcError.textContent = "Отметьте согласие на обработку персональных данных.";
        calcConsent.focus();
        return;
      }

      var submitBtn = $('button[type="submit"]', calcForm);
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Отправляем…";
      }

      /* Здесь подключается ваш обработчик: CRM, почта или Telegram-бот. */
      window.setTimeout(function () {
        var summary = $("#calcSuccessSummary");
        if (summary) summary.textContent = calcSummaryText;
        if (calcSuccess) {
          calcSuccess.hidden = false;
          calcSuccess.focus();
        }
        calcForm.hidden = true;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Заказать";
        }
      }, 500);
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
      }
    } else {
      htmlEl.removeAttribute("data-theme");
      if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", "false");
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


  /* ---------- Р‘С‹СЃС‚СЂС‹Р№ РєР°Р»СЊРєСѓР»СЏС‚РѕСЂ РЅР° РіР»Р°РІРЅРѕР№ ---------- */
  var quickForm = $("#calcQuickForm");
  var quickMsg = $("#calcQuickMsg");
  if (quickForm) {
    quickForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (quickMsg) quickMsg.textContent = "";
      var typeSel = $("#quickType");
      var roomsSel = $("#quickRooms");
      var phoneEl = $("#quickPhone");
      var digits = phoneEl ? phoneEl.value.replace(/\D/g, "") : "";
      if (!typeSel || !roomsSel || !phoneEl) return;
      if (digits.length !== 11) {
        if (quickMsg) quickMsg.textContent = "РЈРєР°Р¶РёС‚Рµ, РїРѕР¶Р°Р»СѓР№СЃС‚Р°, РЅРѕРјРµСЂ С‚РµР»РµС„РѕРЅР° РІ С„РѕСЂРјР°С‚Рµ +7 (___) ___-__-__.";
        phoneEl.focus();
        return;
      }
      var btn = $("button[type='submit']", quickForm);
      if (btn) { btn.disabled = true; btn.textContent = "РћС‚РїСЂР°РІР»СЏРµРјвЂ¦"; }
      window.setTimeout(function () {
        if (quickMsg) {
          quickMsg.style.color = "var(--green-dark)";
          quickMsg.textContent = "Р—Р°СЏРІРєР° РїСЂРёРЅСЏС‚Р°: " + typeSel.options[typeSel.selectedIndex].text + ", " + roomsSel.options[roomsSel.selectedIndex].text + ". РњС‹ РїРµСЂРµР·РІРѕРЅРёРј РЅР° " + phoneEl.value + ".";
        }
        if (btn) { btn.disabled = false; btn.textContent = "РћС‚РїСЂР°РІРёС‚СЊ Р·Р°СЏРІРєСѓ"; }
        quickForm.reset();
      }, 600);
    });
  }

  /* ---------- Р’РёРґР¶РµС‚С‹ В«Р§С‚Рѕ РІС…РѕРґРёС‚ РІ РЅР°С€Рё СѓР±РѕСЂРєРёВ» ---------- */
  $$(".clean-widget").forEach(function (widget) {
    widget.addEventListener("click", function () {
      var isOpen = widget.classList.toggle("open");
    });
  });
});
