/* Concept D: Monochrome. The sliding navigation bar, the section index and the light that
   follows the pointer across the black title areas. Smooth scrolling, reveals, counters and the press ripple come
   from the shared motion.js. Nothing is stored and nothing is sent anywhere. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  function still() { return !root.classList.contains("anim"); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* a white bar slides under the main navigation, following the pointer and keyboard focus */
  function initNavBar() {
    var nav = d.querySelector("[data-navbar]");
    if (!nav) return;
    var bar = nav.querySelector(".nav-bar"), links = nav.querySelectorAll("a"), current = nav.querySelector('a[aria-current="page"]');
    function place(a) {
      if (!a || !a.offsetParent) { bar.style.opacity = "0"; return; }
      var n = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
      bar.style.width = Math.round(r.width - 28) + "px";
      bar.style.transform = "translateX(" + Math.round(r.left - n.left + 14) + "px)";
      bar.style.opacity = "1";
    }
    each(links, function (a) {
      a.addEventListener("mouseenter", function () { place(a); });
      a.addEventListener("focus", function () { place(a); });
    });
    nav.addEventListener("mouseleave", function () { place(current); });
    nav.addEventListener("focusout", function (e) { if (!nav.contains(e.relatedTarget)) place(current); });
    window.addEventListener("resize", function () { place(current); });
    bar.style.transition = "none";
    place(current);
    window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { bar.style.transition = ""; }); });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { place(current); });
  }

  /* the section index on the home page shows where you are */
  function initIndex() {
    var nav = d.querySelector("[data-index]");
    if (!nav || !("IntersectionObserver" in window)) return;
    var map = {};
    each(nav.querySelectorAll("a"), function (a) { var s = d.getElementById(a.getAttribute("href").slice(1)); if (s) map[s.id] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        each(nav.querySelectorAll("a"), function (l) { l.classList.remove("is-current"); l.removeAttribute("aria-current"); });
        var a = map[en.target.id];
        if (a) { a.classList.add("is-current"); a.setAttribute("aria-current", "location"); }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { io.observe(d.getElementById(id)); });
  }

  /* a soft light follows the pointer across the black title areas (mouse and pen only) */
  function initSpot() {
    if (still() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    each(d.querySelectorAll(".hero, .phead, .hclose"), function (el) {
      var frame = 0, x = 0, y = 0;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        x = e.clientX - r.left; y = e.clientY - r.top;
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
          frame = 0;
          el.style.setProperty("--mx", x.toFixed(0) + "px");
          el.style.setProperty("--my", y.toFixed(0) + "px");
          el.classList.add("is-lit");
        });
      });
      el.addEventListener("pointerleave", function () { el.classList.remove("is-lit"); });
    });
  }

  function init() { initNavBar(); initIndex(); initSpot(); }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", init); else init();
})();
