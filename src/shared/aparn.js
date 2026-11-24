/* APARN prototypes: shared behaviour for both concepts (no dependencies).
   Everything here enhances content that is already in the HTML, so pages stay readable without JavaScript.
   Nothing is stored: no cookies, localStorage, analytics or network requests. */
(function () {
  "use strict";
  var d = document;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Concept C can override the device setting for a visit (classes set in its page head)
  function reduced() { var c = d.documentElement.classList; if (c.contains("anim")) return false; if (c.contains("motion-off")) return true; return reduceMotion.matches; }

  /* ---------------------------------------------------------------- menus */
  function initNav() {
    d.querySelectorAll("[data-nav-toggle]").forEach(function (btn) {
      var panel = d.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      var overlay = panel.hasAttribute("data-nav-overlay");
      function isOpen() { return btn.getAttribute("aria-expanded") === "true"; }
      function close(focus) {
        btn.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
        d.documentElement.classList.remove("nav-open");
        if (focus !== false) btn.focus();
      }
      function open() {
        btn.setAttribute("aria-expanded", "true");
        panel.classList.add("is-open");
        if (overlay) d.documentElement.classList.add("nav-open");
        var first = panel.querySelector("a, button");
        if (first) first.focus();
      }
      btn.addEventListener("click", function () { isOpen() ? close() : open(); });
      d.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen()) close(); });
      panel.querySelectorAll("[data-nav-close]").forEach(function (b) { b.addEventListener("click", function () { close(); }); });
      if (overlay) {
        panel.addEventListener("keydown", function (e) {
          if (e.key !== "Tab") return;
          var f = Array.prototype.filter.call(panel.querySelectorAll("a, button"), function (x) { return x.offsetParent !== null; });
          if (!f.length) return;
          if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && d.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        });
      } else {
        window.addEventListener("resize", function () { if (isOpen() && window.matchMedia("(min-width: 64em)").matches) close(false); });
      }
    });
  }

  /* ---------------------------------------------------------------- select groups (explorers, timelines, tabs) */
  function initSelect() {
    d.querySelectorAll("[data-select]").forEach(function (group) {
      var name = group.getAttribute("data-select");
      var buttons = function () { return Array.prototype.slice.call(group.querySelectorAll('[data-select-button][data-select-group="' + name + '"]')); };
      var panels = Array.prototype.slice.call(group.querySelectorAll('[data-select-panel][data-select-group="' + name + '"]'));
      var live = group.querySelector('[data-select-live="' + name + '"]');
      function select(id, opts) {
        opts = opts || {};
        var btn = null;
        buttons().forEach(function (b) {
          var on = b.getAttribute("data-select-button") === id;
          if (on) btn = b;
          b.setAttribute("aria-pressed", on ? "true" : "false");
          b.classList.toggle("is-selected", on);
        });
        panels.forEach(function (p) { p.hidden = p.getAttribute("data-select-panel") !== id; });
        var related = btn && btn.getAttribute("data-links") ? btn.getAttribute("data-links").split(" ") : [];
        group.classList.toggle("has-selection", !!btn);
        buttons().forEach(function (b) { b.classList.toggle("is-related", related.indexOf(b.getAttribute("data-select-button")) !== -1); });
        if (live && btn && opts.announce !== false) {
          live.textContent = "Showing " + (btn.getAttribute("data-label") || btn.textContent.trim()) + (related.length ? ", with " + related.length + " connections" : "");
        }
        group.dispatchEvent(new CustomEvent("aparn:select", { detail: { name: name, id: id } }));
        if (opts.focusPanel) {
          var p = panels.filter(function (x) { return x.getAttribute("data-select-panel") === id; })[0];
          if (p) { p.focus({ preventScroll: true }); p.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" }); }
        }
      }
      group.addEventListener("click", function (e) {
        var b = e.target.closest('[data-select-button][data-select-group="' + name + '"]');
        if (!b) return;
        e.preventDefault();
        var narrow = window.matchMedia("(max-width: 47.99em)").matches;
        select(b.getAttribute("data-select-button"), { focusPanel: group.hasAttribute("data-select-focus") && narrow });
      });
      group.addEventListener("keydown", function (e) {
        var b = e.target.closest('[data-select-button][data-select-group="' + name + '"]');
        var keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
        if (!b || keys.indexOf(e.key) === -1) return;
        var scope = b.closest("[data-select-list]") || group;
        var list = Array.prototype.filter.call(scope.querySelectorAll('[data-select-button][data-select-group="' + name + '"]'), function (x) { return x.offsetParent !== null; });
        var i = list.indexOf(b);
        if (e.key === "Home") i = 0;
        else if (e.key === "End") i = list.length - 1;
        else i = (i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
        list[i].focus();
        e.preventDefault();
      });
      group.classList.add("is-enhanced");
      var initial = group.getAttribute("data-select-initial") || (buttons()[0] && buttons()[0].getAttribute("data-select-button"));
      if (initial) select(initial, { announce: false });
    });
  }

  /* ---------------------------------------------------------------- connection lines for the Living Network board */
  function initBoard() {
    d.querySelectorAll("[data-board]").forEach(function (board) {
      var svg = board.querySelector("[data-board-lines]");
      var grid = board.querySelector("[data-board-grid]");
      if (!svg || !grid) return;
      var NS = "http://www.w3.org/2000/svg";
      function draw() {
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        if (window.getComputedStyle(svg).display === "none") return;
        var sel = board.querySelector('[data-select-button][aria-pressed="true"]');
        if (!sel || sel.offsetParent === null) return;
        var box = grid.getBoundingClientRect();
        svg.setAttribute("viewBox", "0 0 " + Math.round(box.width) + " " + Math.round(box.height));
        svg.setAttribute("width", Math.round(box.width));
        svg.setAttribute("height", Math.round(box.height));
        var a = sel.getBoundingClientRect();
        board.querySelectorAll("[data-select-button].is-related").forEach(function (r) {
          if (r.offsetParent === null) return;
          var b = r.getBoundingClientRect();
          var x1, x2;
          if (b.left >= a.right) { x1 = a.right; x2 = b.left; }
          else if (b.right <= a.left) { x1 = a.left; x2 = b.right; }
          else { x1 = a.right; x2 = b.right; }
          var y1 = a.top + a.height / 2, y2 = b.top + b.height / 2;
          var X1 = x1 - box.left, X2 = x2 - box.left, Y1 = y1 - box.top, Y2 = y2 - box.top;
          var same = Math.abs(X1 - X2) < 2;
          var bend = same ? X1 + 36 : (X1 + X2) / 2;
          var p = d.createElementNS(NS, "path");
          p.setAttribute("d", "M" + X1 + " " + Y1 + " C " + bend + " " + Y1 + ", " + bend + " " + Y2 + ", " + X2 + " " + Y2);
          svg.appendChild(p);
        });
      }
      board.addEventListener("aparn:select", function () { window.requestAnimationFrame(draw); });
      window.addEventListener("resize", function () { window.requestAnimationFrame(draw); });
      if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { window.requestAnimationFrame(draw); });
      board.querySelectorAll("[data-board-type]").forEach(function (chip) {
        chip.addEventListener("click", function () {
          var on = chip.getAttribute("aria-pressed") !== "true";
          chip.setAttribute("aria-pressed", on ? "true" : "false");
          var col = board.querySelector('[data-board-col="' + chip.getAttribute("data-board-type") + '"]');
          if (col) col.hidden = !on;
          window.requestAnimationFrame(draw);
        });
      });
    });
  }

  /* ---------------------------------------------------------------- filters (contributions, archive) */
  function initFilters() {
    d.querySelectorAll("[data-filter]").forEach(function (root) {
      var items = Array.prototype.slice.call(root.querySelectorAll("[data-filter-item]"));
      var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-filter-value]"));
      var search = root.querySelector("[data-filter-search]");
      var count = root.querySelector("[data-filter-count]");
      var empty = root.querySelector("[data-filter-empty]");
      var one = root.getAttribute("data-unit-one") || "piece", many = root.getAttribute("data-unit-many") || "pieces";
      var value = "all";
      function apply() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var n = 0;
        items.forEach(function (it) {
          var tags = (it.getAttribute("data-tags") || "").split(" ");
          var text = it.getAttribute("data-text") || it.textContent.toLowerCase();
          var ok = (value === "all" || tags.indexOf(value) !== -1) && (!q || text.indexOf(q) !== -1);
          it.hidden = !ok;
          if (ok) n++;
        });
        if (count) count.textContent = n + " " + (n === 1 ? one : many);
        if (empty) empty.hidden = n !== 0;
      }
      buttons.forEach(function (b) {
        b.addEventListener("click", function () {
          value = b.getAttribute("data-filter-value");
          buttons.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          apply();
        });
      });
      if (search) search.addEventListener("input", apply);
      root.querySelectorAll("[data-filter-reset]").forEach(function (r) {
        r.addEventListener("click", function () {
          value = "all";
          buttons.forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-filter-value") === "all" ? "true" : "false"); });
          if (search) { search.value = ""; search.focus(); }
          apply();
        });
      });
      apply();
    });
  }

  /* ---------------------------------------------------------------- horizontal strips (Living Network) */
  function initStrips() {
    d.querySelectorAll("[data-strip]").forEach(function (strip) {
      var track = strip.querySelector("[data-strip-track]");
      if (!track) return;
      strip.querySelectorAll("[data-strip-move]").forEach(function (b) {
        b.addEventListener("click", function () {
          var dir = Number(b.getAttribute("data-strip-move"));
          track.scrollBy({ left: dir * Math.max(240, track.clientWidth * 0.8), behavior: reduced() ? "auto" : "smooth" });
        });
      });
    });
  }

  /* ---------------------------------------------------------------- submission demonstration (local only) */
  function initDemo() {
    d.querySelectorAll("[data-submit-demo]").forEach(function (root) {
      var form = root.querySelector("[data-demo-form]");
      if (!form) return;
      form.setAttribute("autocomplete", "off");
      var steps = Array.prototype.slice.call(root.querySelectorAll("[data-step]"));
      var indicators = Array.prototype.slice.call(root.querySelectorAll("[data-step-indicator]"));
      var summary = root.querySelector("[data-error-summary]");
      var review = root.querySelector("[data-review]");
      var done = root.querySelector("[data-done]");
      var affField = root.querySelector("[data-affiliation-field]");
      var current = 1;
      steps.forEach(function (s) { if (!s.hasAttribute("tabindex")) s.setAttribute("tabindex", "-1"); });

      function go(n, focus) {
        current = n;
        steps.forEach(function (s) { s.hidden = s.getAttribute("data-step") !== String(n); });
        indicators.forEach(function (li) {
          var k = Number(li.getAttribute("data-step-indicator"));
          if (k === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
          li.classList.toggle("is-done", k < n);
        });
        if (done) done.hidden = true;
        var cur = steps.filter(function (s) { return s.getAttribute("data-step") === String(n); })[0];
        if (focus !== false && cur) {
          cur.focus({ preventScroll: true });
          root.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
        }
      }
      root.addEventListener("click", function (e) {
        var g = e.target.closest("[data-go]");
        if (g) { e.preventDefault(); go(Number(g.getAttribute("data-go"))); }
      });

      function setError(id, msg) {
        var input = root.querySelector("#" + id);
        var el = root.querySelector("#" + id + "-err");
        if (!el) return;
        var described = (input && input.getAttribute("aria-describedby") || "").split(" ").filter(function (x) { return x && x !== el.id; });
        if (msg) {
          el.textContent = msg; el.hidden = false;
          if (input) { input.setAttribute("aria-invalid", "true"); described.push(el.id); }
        } else {
          el.textContent = ""; el.hidden = true;
          if (input) input.removeAttribute("aria-invalid");
        }
        if (input) { if (described.length) input.setAttribute("aria-describedby", described.join(" ")); else input.removeAttribute("aria-describedby"); }
      }
      function value(name) { var el = form.elements[name]; return el && el.value ? el.value.trim() : ""; }
      function checked(name) { var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; }
      function syncAffiliation() { if (affField) affField.hidden = checked("status") === "independent"; }
      form.addEventListener("change", function (e) { if (e.target.name === "status") { syncAffiliation(); if (checked("status") === "independent") setError("f-aff", ""); } });
      syncAffiliation();

      function validate() {
        var errors = [];
        function check(id, ok, msg) { setError(id, ok ? "" : msg); if (!ok) errors.push([id, msg]); }
        check("f-name", value("name").length > 1, "Enter the corresponding contributor’s name.");
        var email = value("email");
        check("f-email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), email ? "Enter an email address like name@example.org." : "Enter an email address.");
        check("f-aff", checked("status") === "independent" || value("affiliation").length > 1, "Enter your institution, or choose Independent practitioner.");
        check("f-country", value("country").length > 1, "Enter the country or region of your research.");
        check("f-title", value("title").length > 2, "Enter the title of your contribution.");
        var fileInput = form.elements.file, file = fileInput && fileInput.files && fileInput.files[0], fmsg = "";
        if (!file) fmsg = "Choose your completed template.";
        else if (!/\.(docx|pdf|odt)$/i.test(file.name)) fmsg = "Choose a DOCX, PDF or ODT file.";
        else if (file.size > 10 * 1024 * 1024) fmsg = "Choose a file smaller than 10 MB.";
        else if (file.size === 0) fmsg = "That file is empty. Choose your completed template.";
        check("f-file", !fmsg, fmsg);
        var lenErr = root.querySelector("#f-length-err");
        if (!checked("length")) { lenErr.textContent = "Choose a presentation length."; lenErr.hidden = false; errors.push(["f-length", "Choose a presentation length."]); }
        else { lenErr.textContent = ""; lenErr.hidden = true; }
        return errors;
      }
      function showSummary(errors) {
        var ul = summary.querySelector("ul");
        while (ul.firstChild) ul.removeChild(ul.firstChild);
        errors.forEach(function (er) {
          var li = d.createElement("li"), a = d.createElement("a");
          var target = er[0] === "f-length" ? (form.querySelector('input[name="length"]') || {}).id || "" : er[0];
          a.href = "#" + (er[0] === "f-length" ? "f-length-first" : er[0]);
          a.textContent = er[1];
          a.addEventListener("click", function (e) {
            e.preventDefault();
            var el = er[0] === "f-length" ? form.querySelector('input[name="length"]') : root.querySelector("#" + er[0]);
            if (el) el.focus();
          });
          li.appendChild(a); ul.appendChild(li);
        });
        summary.hidden = errors.length === 0;
        if (errors.length) summary.focus();
      }
      function row(term, desc, note) {
        var dt = d.createElement("dt"), dd = d.createElement("dd");
        dt.textContent = term; dd.textContent = desc;
        if (note) { var s = d.createElement("span"); s.className = "review-note"; s.textContent = note; dd.appendChild(d.createElement("br")); dd.appendChild(s); }
        review.appendChild(dt); review.appendChild(dd);
      }
      function sizeText(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var errors = validate();
        showSummary(errors);
        if (errors.length) return;
        while (review.firstChild) review.removeChild(review.firstChild);
        var file = form.elements.file.files[0];
        row("Corresponding contributor", value("name"));
        row("Email", value("email"), "For the organisers only. Not published.");
        row("Affiliation", checked("status") === "independent" ? "Independent practitioner" : value("affiliation"));
        row("Country or region of research", value("country"));
        row("Contribution title", value("title"));
        row("Completed template", file.name + " (" + sizeText(file.size) + ")", "In this demo the file never leaves your device.");
        row("Preferred presentation length", checked("length"), "Subject to the programme.");
        row("Accessibility or technical requirements", value("access") || "None given");
        row("Annual publication", form.elements.publication.checked ? "Yes, please consider this contribution for the year-end collection" : "Not requested",
          form.elements.publication.checked ? "Not a guarantee of inclusion, and no transfer of copyright." : "You can opt in later by updating the same contribution.");
        go(4);
      });
      var finish = root.querySelector("[data-finish]");
      if (finish) finish.addEventListener("click", function () { done.hidden = false; done.focus(); });
      var reset = root.querySelector("[data-reset]");
      if (reset) reset.addEventListener("click", function () {
        form.reset();
        ["f-name", "f-email", "f-aff", "f-country", "f-title", "f-file"].forEach(function (id) { setError(id, ""); });
        var lenErr = root.querySelector("#f-length-err"); lenErr.hidden = true;
        summary.hidden = true;
        while (review.firstChild) review.removeChild(review.firstChild);
        syncAffiliation();
        go(1);
      });
      // drop entries if the page is restored from the back/forward cache
      window.addEventListener("pageshow", function (e) { if (e.persisted) { form.reset(); go(1, false); } });
    });
  }

  /* ---------------------------------------------------------------- gentle reveals (decorative only) */
  function initReveal() {
    if (reduced() || !("IntersectionObserver" in window)) return;
    var els = d.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    d.documentElement.classList.add("motion");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add("is-in"); else io.observe(el);
    });
  }

  function init() { initNav(); initSelect(); initBoard(); initFilters(); initStrips(); initDemo(); initReveal(); }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", init); else init();
})();
