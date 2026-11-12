// Set this to your form-handling URL (it must accept a JSON POST and return a 2xx status on success).
// While it is empty, the form will NOT claim anything was submitted.
var SUBMIT_ENDPOINT = "";

var SPECIALIZATIONS = ["Information Technology","Software Development","Artificial Intelligence","Engineering","Robotics","Business and Entrepreneurship","Finance and Economics","Marketing","Design and Creative Arts","Science","Mathematics","Languages","Sports","Media and Communication","Other professional fields"];

var chips = document.getElementById("chips");
var spec = document.getElementById("spec");
var form = document.getElementById("form");
var statusEl = document.getElementById("status");

function select(name) {
  spec.value = name;
  Array.prototype.forEach.call(chips.children, function (c) {
    c.setAttribute("aria-pressed", c.textContent === name ? "true" : "false");
  });
}

SPECIALIZATIONS.forEach(function (name) {
  var b = document.createElement("button");
  b.type = "button"; b.className = "chip"; b.textContent = name;
  b.setAttribute("aria-pressed", "false");
  b.addEventListener("click", function () {
    select(name);
    statusEl.textContent = name + " selected. Complete the application form below.";
    statusEl.className = "status";
    document.getElementById("apply").scrollIntoView();
  });
  chips.appendChild(b);
  var o = document.createElement("option"); o.textContent = name; spec.appendChild(o);
});
spec.addEventListener("change", function () { select(spec.value); });

form.addEventListener("submit", function (e) {
  e.preventDefault();
  statusEl.className = "status";
  if (!form.checkValidity()) {
    statusEl.className = "status err";
    statusEl.textContent = "Please complete every field before submitting.";
    form.reportValidity();
    return;
  }
  if (!SUBMIT_ENDPOINT) {
    statusEl.className = "status err";
    statusEl.textContent = "Not sent. The online application system is not connected yet. Please call +998 88 700 14 41 to apply.";
    return;
  }
  var data = {};
  new FormData(form).forEach(function (v, k) { data[k] = v; });
  statusEl.textContent = "Sending...";
  fetch(SUBMIT_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    .then(function (r) {
      if (!r.ok) throw new Error("Server responded " + r.status);
      statusEl.textContent = "Application received. We will contact you using the details you provided.";
      form.reset(); select("");
    })
    .catch(function () {
      statusEl.className = "status err";
      statusEl.textContent = "Not sent. Something went wrong. Please try again or call +998 88 700 14 41.";
    });
});

// ---- Animations ----
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Title: letter-by-letter reveal
  var h1 = document.querySelector("h1.chrome");
  if (h1 && !reduce) {
    var i = 0, out = "";
    Array.prototype.forEach.call(h1.childNodes, function (n) {
      if (n.nodeType === 3) {
        n.textContent.split("").forEach(function (ch) { out += '<span class="ch" style="--i:' + (i++) + '">' + ch + '</span>'; });
      } else out += "<br>";
    });
    h1.setAttribute("aria-label", h1.textContent);
    h1.innerHTML = out;
  }

  // Marquee of specializations
  var track = document.getElementById("track");
  if (track) {
    var items = SPECIALIZATIONS.map(function (n) { return "<span>" + n + "</span>"; }).join("");
    track.innerHTML = items + items;
  }

  // Scroll progress bar
  var bar = document.getElementById("progress");
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Hero network canvas (2D particles, reacts to cursor)
  var cv = document.getElementById("net");
  if (cv && !reduce) {
    var ctx = cv.getContext("2d"), pts = [], W = 0, H = 0, mx = -999, my = -999, dpr = Math.min(window.devicePixelRatio || 1, 2), visible = true;
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, W * H / 14000)); pts = [];
      for (var k = 0; k < n; k++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
    }
    size(); window.addEventListener("resize", size);
    cv.parentNode.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    cv.parentNode.addEventListener("pointerleave", function () { mx = my = -999; });
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(cv);
    (function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      for (var a = 0; a < pts.length; a++) {
        var p = pts[a], dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140 && d > 0) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.fillStyle = "rgba(201,205,210,.7)"; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fill();
        for (var b = a + 1; b < pts.length; b++) {
          var q = pts[b], ex = p.x - q.x, ey = p.y - q.y, dd = ex * ex + ey * ey;
          if (dd < 15000) { ctx.strokeStyle = "rgba(138,144,153," + (0.35 * (1 - dd / 15000)) + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
      }
    })();
  }

  // Logo reacts to cursor with a flat shift only
  var ds = document.getElementById("ds");
  if (ds && !reduce) {
    document.getElementById("top").addEventListener("pointermove", function (e) {
      var r = ds.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth, y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      ds.style.translate = (x * 24) + "px " + (y * 24) + "px";
    });
    ds.style.transition = "translate .4s ease-out";
  }

  // Scroll reveal + counters
  if (!("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("js");
  function count(el) {
    var m = el.textContent.match(/^(~?)(\d+)$/); if (!m || reduce) return;
    var to = +m[2], t0 = performance.now();
    (function step(t) { var k = Math.min(1, (t - t0) / 1400); el.textContent = m[1] + Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("in"); io.unobserve(en.target);
      var st = en.target.querySelector && en.target.querySelector("strong"); if (st) count(st);
    });
  }, { threshold: 0.12 });
  var targets = document.querySelectorAll(".sec > h2, .sec > h3, .sec > p, .sec .cols > *, .sec .split > *, .card, .shot, .grid4 > *, .facts li, .ladder li, .chip, form");
  Array.prototype.forEach.call(targets, function (el) {
    el.classList.add("reveal");
    var sib = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.setProperty("--d", Math.min(sib, 6) * 0.08 + "s");
    io.observe(el);
  });
})();
