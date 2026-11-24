/* Concept C: Clear Signal. The sliding navigation bar, the section index and the network orbit.
   Smooth scrolling, reveals, counters, the press ripple and the Animations switch come from the shared motion.js.
   Nothing is stored and nothing is sent anywhere. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  function still() { return !root.classList.contains("anim"); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

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

  function init() { initNavBar(); initIndex(); initOrbit(); }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", init); else init();
})();
