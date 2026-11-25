/* APARN prototypes: shared motion for all four concepts (no dependencies).
   Opening titles on the home page, smooth scrolling up and down, a reading-progress line, back to top, content that rises in from the side you
   scroll from, counting figures and a soft press ripple on buttons. Animations are always on: the page head adds
   class "anim" to <html>. Nothing is stored and nothing is sent anywhere. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  function still() { return !root.classList.contains("anim"); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  var riseOn = false, countOn = false;

  /* the opening titles on the home page: the APARN mark, a sweep of light, then the curtain opens.
     The page head starts them only for visitors who arrive from outside the site. Any key, click, touch or
     scroll ends them at once; otherwise they end when their last animation finishes. */
  function initOpening() {
    var el = d.querySelector("[data-intro]");
    if (!el) return;
    if (!root.classList.contains("opening") || still()) { root.classList.remove("opening"); el.hidden = true; return; }
    var done = false, timer = 0, EVENTS = ["keydown", "pointerdown", "wheel", "touchstart"];
    function end() {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      EVENTS.forEach(function (ev) { window.removeEventListener(ev, end, true); });
      root.classList.add("opening-out");
      root.classList.remove("opening");
      window.setTimeout(function () { root.classList.remove("opening-out"); el.hidden = true; }, 1100);
    }
    EVENTS.forEach(function (ev) { window.addEventListener(ev, end, { capture: true, passive: true }); });
    // the animations start with the first paint, before this script runs: end when the last of them finishes
    var left = 1900;
    if (el.getAnimations) {
      left = 0;
      el.getAnimations({ subtree: true }).forEach(function (a) {
        var t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
        if (t && isFinite(t.endTime)) left = Math.max(left, t.endTime - (a.currentTime || 0));
      });
    }
    timer = window.setTimeout(end, Math.min(2600, Math.max(250, left + 150)));
  }

  /* header state, reading progress and the back-to-top button */
  function initScroll() {
    var top = d.querySelector("[data-top]"), bar = d.querySelector("[data-progress]"), totop = d.querySelector("[data-totop]");
    var queued = false;
    function update() {
      queued = false;
      var y = window.scrollY, max = root.scrollHeight - window.innerHeight;
      if (top) top.classList.toggle("is-scrolled", y > 8);
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max).toFixed(4) : 0) + ")";
      if (totop) totop.classList.toggle("is-shown", y > 640);
    }
    window.addEventListener("scroll", function () { if (!queued) { queued = true; window.requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* smooth scrolling, up or down, for every link within the page; the target then takes focus */
  function initSmooth() {
    d.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = decodeURIComponent(a.getAttribute("href").slice(1));
      var target = id ? d.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      var toTop = a.hasAttribute("data-totop");
      var header = d.querySelector("[data-top]");
      var fixed = header && /sticky|fixed/.test(window.getComputedStyle(header).position);
      var offset = (fixed ? header.offsetHeight : 0) + 16;
      var y = toTop ? 0 : Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
      window.scrollTo({ top: y, behavior: still() ? "auto" : "smooth" });
      if (!target.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(target.tagName)) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (window.history && history.replaceState) history.replaceState(null, "", toTop ? window.location.pathname : "#" + id);
    });
  }

  /* content rises in from the side you are scrolling from, every time it comes back into view */
  function initRise() {
    var els = d.querySelectorAll("[data-rise]");
    if (!els.length || still() || !("IntersectionObserver" in window)) return;
    root.classList.add("motion");
    if (riseOn) return;
    riseOn = true;
    var out = [];
    function side(el) { var from = el.getBoundingClientRect().top < 0 ? "top" : "bottom"; if (el.getAttribute("data-from") !== from) el.setAttribute("data-from", from); }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var el = en.target, i = out.indexOf(el);
        if (en.isIntersecting) { el.classList.add("is-in"); if (i > -1) out.splice(i, 1); return; }
        side(el);
        el.classList.remove("is-in");
        if (i < 0) out.push(el);
      });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0 });
    // content that was skipped over (a jump or a fast scroll) still comes back from the side it is on
    var queued = false;
    window.addEventListener("scroll", function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () { queued = false; out.forEach(side); });
    }, { passive: true });
    each(els, function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-in");
      io.observe(el);
    });
  }

  /* figures count up the first time they are seen */
  function initCount() {
    var els = d.querySelectorAll("[data-count]");
    if (!els.length || still() || !("IntersectionObserver" in window) || countOn) return;
    countOn = true;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, end = Number(el.getAttribute("data-count")), suffix = el.getAttribute("data-suffix") || "", t0 = null;
        function step(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / 1400), eased = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(end * eased) + suffix;
          if (k < 1) window.requestAnimationFrame(step);
        }
        el.textContent = "0" + suffix;
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    each(els, function (el) { io.observe(el); });
  }

  /* a soft ripple where a button is pressed */
  function initPress() {
    d.addEventListener("pointerdown", function (e) {
      if (still()) return;
      var b = e.target.closest(".btn");
      if (!b) return;
      var r = b.getBoundingClientRect();
      b.style.setProperty("--rx", (e.clientX - r.left) + "px");
      b.style.setProperty("--ry", (e.clientY - r.top) + "px");
      b.classList.remove("is-rippling");
      void b.offsetWidth;
      b.classList.add("is-rippling");
    });
    d.addEventListener("animationend", function (e) { if (e.animationName === "m-ripple") e.target.classList.remove("is-rippling"); });
  }

  function init() { initOpening(); initScroll(); initSmooth(); initRise(); initCount(); initPress(); }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", init); else init();
})();
