/* Concept C: Clear Signal. Motion and the network orbit, on top of the shared aparn.js.
   Everything here is an enhancement: pages work without it. Motion follows the device setting
   (prefers-reduced-motion); the Animations switch lets a visitor turn it on or off for this visit only
   (kept in sessionStorage). Nothing else is stored and nothing is sent anywhere. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  function still() { return !root.classList.contains("anim"); }
  var riseOn = false, countOn = false;
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* header shadow, reading progress and the back-to-top button */
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
      var offset = (header ? header.offsetHeight : 0) + 16;
      var y = toTop ? 0 : Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
      window.scrollTo({ top: y, behavior: still() ? "auto" : "smooth" });
      if (!target.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(target.tagName)) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (window.history && history.replaceState) history.replaceState(null, "", toTop ? window.location.pathname : "#" + id);
    });
  }

  /* a blue bar slides under the main navigation, following the pointer and keyboard focus */
  function initNavBar() {
    var nav = d.querySelector("[data-navbar]");
    if (!nav) return;
    var bar = nav.querySelector(".nav-bar"), links = nav.querySelectorAll("a"), current = nav.querySelector('a[aria-current="page"]');
    function place(a) {
      if (!a || !a.offsetParent) { bar.style.opacity = "0"; return; }
      var n = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
      bar.style.width = Math.round(r.width - 24) + "px";
      bar.style.transform = "translateX(" + Math.round(r.left - n.left + 12) + "px)";
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

  /* content rises in from the side you are scrolling from, every time it comes back into view */
  function initRise() {
    var els = d.querySelectorAll("[data-rise]");
    if (!els.length || still() || !("IntersectionObserver" in window)) return;
    root.classList.add("motion");
    if (riseOn) return;
    riseOn = true;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var el = en.target;
        if (en.isIntersecting) { el.classList.add("is-in"); return; }
        el.setAttribute("data-from", en.boundingClientRect.top < 0 ? "top" : "bottom");
        el.classList.remove("is-in");
      });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0 });
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
    d.addEventListener("animationend", function (e) { if (e.animationName === "c-ripple") e.target.classList.remove("is-rippling"); });
  }

  /* the network orbit: whatever is chosen moves to the centre and its connections arrange around it */
  function initOrbit() {
    each(d.querySelectorAll("[data-orbit]"), function (orbit) {
      var stage = orbit.querySelector("[data-orbit-stage]"), svg = orbit.querySelector("[data-orbit-lines]");
      if (!stage || !svg) return;
      var NS = "http://www.w3.org/2000/svg";
      var orbs = Array.prototype.slice.call(stage.querySelectorAll(".orb"));
      stage.classList.add("is-live", "no-anim");
      function layout() {
        var sel = stage.querySelector('.orb[aria-pressed="true"]');
        if (!sel) return;
        var id = sel.getAttribute("data-select-button");
        var rel = (sel.getAttribute("data-links") || "").split(" ").filter(Boolean);
        var W = stage.clientWidth, n = rel.length, pos = {}, H, centre;
        if (W < 560) {
          // phones: a fan, the chosen item on top and its connections in two columns below
          var rowH = 56, top0 = 112;
          H = top0 + Math.ceil(n / 2) * rowH + 16;
          stage.style.height = H + "px";
          centre = [W / 2, 44];
          rel.forEach(function (r, i) { pos[r] = [W * (i % 2 ? 0.74 : 0.26), top0 + Math.floor(i / 2) * rowH + 14]; });
        } else {
          stage.style.height = "";
          H = stage.clientHeight;
          centre = [W / 2, H / 2];
          var rx = W * 0.36, ry = H * 0.38;
          rel.forEach(function (r, i) {
            var a = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(n, 1), k = n > 8 && i % 2 ? 0.76 : 1;
            pos[r] = [centre[0] + rx * k * Math.cos(a), centre[1] + ry * k * Math.sin(a)];
          });
        }
        pos[id] = centre;
        orbs.forEach(function (o) {
          var oid = o.getAttribute("data-select-button"), p = pos[oid], on = !!p, q = p || centre;
          o.style.transform = "translate(" + q[0].toFixed(1) + "px," + q[1].toFixed(1) + "px) translate(-50%,-50%)" + (on ? "" : " scale(.4)");
          o.classList.toggle("is-center", oid === id);
          o.classList.toggle("is-ring", on && oid !== id);
          o.classList.toggle("is-off", !on);
          if (on) { o.removeAttribute("inert"); o.removeAttribute("aria-hidden"); } else { o.setAttribute("inert", ""); o.setAttribute("aria-hidden", "true"); }
        });
        svg.setAttribute("viewBox", "0 0 " + W + " " + H);
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        var lines = [];
        rel.forEach(function (r) {
          var p = pos[r], l = d.createElementNS(NS, "line"), len = Math.hypot(p[0] - centre[0], p[1] - centre[1]);
          l.setAttribute("x1", centre[0].toFixed(1)); l.setAttribute("y1", centre[1].toFixed(1));
          l.setAttribute("x2", p[0].toFixed(1)); l.setAttribute("y2", p[1].toFixed(1));
          l.style.strokeDasharray = len.toFixed(1);
          l.style.strokeDashoffset = still() || stage.classList.contains("no-anim") ? "0" : len.toFixed(1);
          svg.appendChild(l); lines.push(l);
        });
        window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { lines.forEach(function (l) { l.style.strokeDashoffset = "0"; }); }); });
      }
      orbit.addEventListener("aparn:select", layout);
      var t;
      window.addEventListener("resize", function () { window.clearTimeout(t); t = window.setTimeout(function () { stage.classList.add("no-anim"); layout(); window.requestAnimationFrame(function () { stage.classList.remove("no-anim"); }); }, 120); });
      layout();
      window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { stage.classList.remove("no-anim"); }); });
      if (d.fonts && d.fonts.ready) d.fonts.ready.then(layout);
    });
  }

  /* the Animations switch in the prototype bar */
  function initSwitch() {
    var btn = d.querySelector("[data-motion-toggle]");
    if (!btn) return;
    function sync() { btn.setAttribute("aria-pressed", still() ? "false" : "true"); }
    btn.hidden = false;
    btn.addEventListener("click", function () {
      var on = still();
      root.classList.toggle("anim", on);
      root.classList.toggle("motion-off", !on);
      try { window.sessionStorage.setItem("aparn-motion", on ? "on" : "off"); } catch (e) {}
      if (on) { initRise(); initCount(); } else { root.classList.remove("motion"); }
      sync();
    });
    sync();
  }

  function init() { initSwitch(); initScroll(); initSmooth(); initNavBar(); initRise(); initCount(); initIndex(); initPress(); initOrbit(); }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", init); else init();
})();
