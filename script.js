/* =========================================================
   Дыхание Балтики — интерактив сайта
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

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || burger.contains(event.target)) return;
      closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

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
  bindPhoneMask($("#quickPhone"));

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
      openOrderModal(collectOrderDetails("", submitBtn), submitBtn);
    });
  }

  /* ---------- Заказ: выбор платформы и готовое сообщение ---------- */
  var ORDER_PHONE = "+79062371517";
  var ORDER_PHONE_TEXT = "+7 (906) 237-15-17";
  var ORDER_ICON_TG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3 18.8 19c-.2 1-.8 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-1 .5l.4-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L7.1 13.1 2.6 11.7c-1-.3-1-1 .2-1.4l18-7c.8-.3 1.5.2 1.1 1z"/></svg>';
  var ORDER_ICON_WA = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.3.1-.4l.3-.4c.1-.1.1-.2.2-.4 0-.1 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2.9 2.4.1.2 1.6 2.4 3.8 3.3.5.2.9.4 1.3.5.5.1 1 .1 1.3.1.4-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1z"/></svg>';
  var ORDER_ICON_TEL = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>';

  var orderModal = null;
  var orderDetails = "";
  var orderTrigger = null;

  function orderSelectText(selector) {
    var el = $(selector);
    if (!el || el.selectedIndex < 0 || !el.options.length) return "";
    return el.options[el.selectedIndex].text.trim();
  }

  function orderPageService() {
    var h1 = $(".page-hero h1");
    if (!h1) return "";
    var title = h1.textContent.replace(/\s+в\s+Калининграде\s*$/i, "").trim();
    if (!/уборк|мыть|клининг|озонир/i.test(title)) return "";
    return title;
  }

  function orderSubject(service) {
    var s = (service || "").toLowerCase();
    if (s.indexOf("офис") >= 0) return "офис";
    if (s.indexOf("дом") >= 0 || s.indexOf("коттедж") >= 0) return "дом";
    return "квартира";
  }

  function orderSubjectMentioned(service) {
    return /офис|дом|коттедж|квартир|подъезд|балкон/i.test(service || "");
  }

  function orderCalcServiceName() {
    var sel = $("#calcService");
    if (!sel || sel.selectedIndex < 0 || !sel.options.length) return "";
    var opt = sel.options[sel.selectedIndex];
    return (opt.getAttribute("data-name") || opt.text || "").trim();
  }

  function orderContactLine(scope) {
    if (!scope) return "";
    var nameEl = scope.querySelector('input[name="name"]');
    var phoneEl = scope.querySelector('input[name="phone"]');
    var bits = [];
    if (nameEl && nameEl.value.trim()) bits.push(nameEl.value.trim());
    if (phoneEl && phoneEl.value.trim()) bits.push(phoneEl.value.trim());
    return bits.length ? " Контакты для связи: " + bits.join(", ") + "." : "";
  }

  function collectOrderDetails(extra, trigger) {
    var scope = trigger && trigger.closest ? trigger.closest("#calcQuickForm, #calcForm, #leadForm") : null;
    var quick = !!scope && scope.id === "calcQuickForm";
    var big = !!scope && scope.id === "calcForm";

    var service = quick ? orderSelectText("#quickType") : (big ? orderCalcServiceName() : orderPageService());

    var parts = [];
    if (service) {
      var clean = service.split(" · ")[0].split(" - ")[0].split(" — ")[0].trim();
      if (clean) parts.push(clean.charAt(0).toLowerCase() + clean.slice(1));
    }

    var rooms = quick ? orderSelectText("#quickRooms") : "";
    var area = "";
    if (big) {
      var areaEl = $("#calcArea");
      if (areaEl && areaEl.value) area = areaEl.value.trim();
    }

    if (service && !orderSubjectMentioned(service)) parts.push(orderSubject(service));
    if (rooms) parts.push(rooms);
    if (area) parts.push(area + " м²");

    var text = "Здравствуйте! Хочу заказать клининг";
    if (parts.length) text += ": " + parts.join(", ");
    text += ".";

    if (big && calcForm) {
      var extras = [];
      $$('input[type="checkbox"]', calcForm).forEach(function (box) {
        if (box.checked && box.getAttribute("data-name")) {
          extras.push(box.getAttribute("data-name"));
        }
      });
      if (extras.length) text += " Дополнительно: " + extras.join(", ") + ".";
      if (calcTotalEl && calcTotalEl.textContent) {
        text += " Ориентировочная стоимость: " + calcTotalEl.textContent.trim() + ".";
      }
    }

    text += orderContactLine(scope);
    if (extra) text += " " + extra;
    return text;
  }

  function buildOrderModal() {
    var wrap = document.createElement("div");
    wrap.className = "order-modal";
    wrap.hidden = true;
    wrap.innerHTML = [
      '<div class="order-modal__backdrop" data-order-close></div>',
      '<div class="order-modal__card" role="dialog" aria-modal="true" aria-label="Оформление заявки">',
      '  <button class="order-modal__close" type="button" data-order-close aria-label="Закрыть">',
      '    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
      '  </button>',
      '  <div class="order-modal__step" data-order-step="choose">',
      '    <p class="overline">Заявка</p>',
      '    <h2 class="order-modal__title">Куда удобнее написать?</h2>',
      '    <p class="order-modal__sub">Выберите мессенджер — покажем готовое сообщение, которое останется отправить.</p>',
      '    <div class="order-modal__platforms">',
      '      <button class="platform platform--tg" type="button" data-platform="telegram">' + ORDER_ICON_TG + '<span>Telegram</span></button>',
      '      <button class="platform platform--wa" type="button" data-platform="whatsapp">' + ORDER_ICON_WA + '<span>WhatsApp</span></button>',
      '      <a class="platform platform--call" href="tel:' + ORDER_PHONE + '">' + ORDER_ICON_TEL + '<span>Позвонить</span></a>',
      '    </div>',
      '    <p class="order-modal__hint">Телефон: <a href="tel:' + ORDER_PHONE + '">' + ORDER_PHONE_TEXT + '</a></p>',
      '  </div>',
      '  <div class="order-modal__step" data-order-step="message" hidden>',
      '    <p class="overline">Сообщение</p>',
      '    <h2 class="order-modal__title">Проверьте текст</h2>',
      '    <p class="order-modal__sub" id="orderPlatformNote"></p>',
      '    <div class="order-modal__text" id="orderText"></div>',
      '    <div class="order-modal__actions">',
      '      <a class="btn btn--primary" id="orderSend" href="#" target="_blank" rel="noopener">Открыть чат</a>',
      '      <button class="btn order-modal__copy" type="button" id="orderCopy">Скопировать текст</button>',
      '      <button class="btn order-modal__back" type="button" data-order-back>Назад</button>',
      '    </div>',
      '    <p class="order-modal__hint" id="orderCopyMsg" aria-live="polite"></p>',
      '  </div>',
      '</div>'
    ].join("\n");
    document.body.appendChild(wrap);
    return wrap;
  }

  function orderChooseStep() {
    if (!orderModal) return;
    var choose = $('[data-order-step="choose"]', orderModal);
    var message = $('[data-order-step="message"]', orderModal);
    if (choose) choose.hidden = false;
    if (message) message.hidden = true;
    var copyMsg = $("#orderCopyMsg", orderModal);
    if (copyMsg) copyMsg.textContent = "";
  }

  function openOrderModal(details, trigger) {
    if (!orderModal) orderModal = buildOrderModal();
    orderDetails = details || collectOrderDetails("");
    orderTrigger = trigger || null;
    orderChooseStep();
    orderModal.hidden = false;
    document.documentElement.classList.add("is-modal-open");
    var first = $(".platform", orderModal);
    if (first) first.focus();
  }

  function closeOrderModal() {
    if (!orderModal || orderModal.hidden) return;
    orderModal.hidden = true;
    document.documentElement.classList.remove("is-modal-open");
    if (orderTrigger && orderTrigger.focus) orderTrigger.focus();
  }

  function copyOrderText() {
    var msg = $("#orderCopyMsg", orderModal);

    function done(ok) {
      if (!msg) return;
      msg.textContent = ok ? "Текст скопирован — вставьте его в чат." : "Не удалось скопировать автоматически. Выделите текст и скопируйте вручную.";
      msg.style.color = ok ? "var(--green-dark)" : "var(--danger)";
    }

    function fallback() {
      var area = document.createElement("textarea");
      area.value = orderDetails;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-1000px";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (error) { ok = false; }
      document.body.removeChild(area);
      done(ok);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(orderDetails).then(function () { done(true); }, fallback);
    } else {
      fallback();
    }
  }

  function showOrderMessage(platform) {
    var textEl = $("#orderText", orderModal);
    var send = $("#orderSend", orderModal);
    var note = $("#orderPlatformNote", orderModal);

    if (textEl) textEl.textContent = orderDetails;

    if (send) {
      if (platform === "whatsapp") {
        send.href = "https://wa.me/79062371517?text=" + encodeURIComponent(orderDetails);
        send.textContent = "Открыть WhatsApp";
      } else {
        send.href = "https://t.me/+79062371517";
        send.textContent = "Открыть Telegram";
      }
    }

    if (note) {
      note.textContent = platform === "whatsapp"
        ? "В WhatsApp откроется чат с уже заполненным сообщением — останется нажать «Отправить»."
        : "Откроется чат в Telegram: ссылка не подставляет текст сама, поэтому вставьте сообщение из блока ниже.";
    }

    var choose = $('[data-order-step="choose"]', orderModal);
    var message = $('[data-order-step="message"]', orderModal);
    if (choose) choose.hidden = true;
    if (message) message.hidden = false;

    if (platform === "telegram") copyOrderText();

    var sendBtn = $("#orderSend", orderModal);
    if (sendBtn) sendBtn.focus();
  }

  if (document.body) {
    document.addEventListener("click", function (event) {
      if (!orderModal || orderModal.hidden) return;

      if (event.target.closest("[data-order-close]")) {
        closeOrderModal();
        return;
      }

      if (event.target.closest("[data-order-back]")) {
        orderChooseStep();
        var firstPlatform = $(".platform", orderModal);
        if (firstPlatform) firstPlatform.focus();
        return;
      }

      var platformBtn = event.target.closest("[data-platform]");
      if (platformBtn) {
        showOrderMessage(platformBtn.getAttribute("data-platform"));
        return;
      }

      if (event.target.id === "orderCopy") {
        copyOrderText();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeOrderModal();
    });
  }

  $$('a[href$="contacts.html#form"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      openOrderModal(collectOrderDetails("", link), link);
    });
  });

  /* ---------- Форма заявки ---------- */
  var leadForm = $("#leadForm");
  var formWrap = $("#formWrap");
  var formSuccess = $("#formSuccess");
  var formError = $("#formError");
  var consent = $("#leadConsent");
  var leadName = $("#leadName");
  var phone = $("#leadPhone");
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

      var extra = "";
      var comment = $("#leadComment");
      if (comment && comment.value.trim()) {
        extra = "Комментарий: " + comment.value.trim() + ".";
      }
      openOrderModal(collectOrderDetails(extra, submitBtn), submitBtn);
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


  /* ---------- Быстрый калькулятор на главной ---------- */
  var quickForm = $("#calcQuickForm");
  var quickMsg = $("#calcQuickMsg");
  if (quickForm) {
    quickForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (quickMsg) quickMsg.textContent = "";
      var typeSel = $("#quickType");
      var roomsSel = $("#quickRooms");
      var phoneEl = $("#quickPhone");
      var consentEl = $("#quickConsent");
      var digits = phoneEl ? phoneEl.value.replace(/\D/g, "") : "";
      if (!typeSel || !roomsSel || !phoneEl) return;
      if (digits.length !== 11) {
        if (quickMsg) quickMsg.textContent = "Укажите, пожалуйста, номер телефона в формате +7 (___) ___-__-__.";
        phoneEl.focus();
        return;
      }
      if (consentEl && !consentEl.checked) {
        if (quickMsg) quickMsg.textContent = "Отметьте согласие на обработку персональных данных.";
        consentEl.focus();
        return;
      }
      var btn = $("button[type='submit']", quickForm);
      openOrderModal(collectOrderDetails("", btn), btn);
    });
  }

  /* ---------- Виджеты «Что входит в наши уборки» ---------- */
  $$(".clean-widget").forEach(function (widget) {
    widget.addEventListener("click", function () {
      widget.classList.toggle("open");
    });
  });
})();
