// Theme toggle, mobile menu, and the chromatic filtration figure on the home page.
(function () {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));

  document.addEventListener("DOMContentLoaded", function () {
    // ---- theme ----
    const btn = document.getElementById("theme-toggle");
    const icon = btn && btn.querySelector("i");
    const syncIcon = () => {
      if (icon) icon.className = root.getAttribute("data-theme") === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    };
    syncIcon();
    btn && btn.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncIcon();
      document.dispatchEvent(new Event("themechange"));
    });

    // ---- menu ----
    const menuBtn = document.getElementById("menu-toggle");
    const links = document.getElementById("nav-links");
    menuBtn && menuBtn.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    colony();
  });

  // ---------------------------------------------------------------
  // A simulated BMP4-treated colony: SOX2 centre, BRA ring, CDX2 edge.
  // The slider grows a ball around each cell (a Vietoris–Rips style
  // filtration); links are grey within a fate, coloured across fates.
  // ---------------------------------------------------------------
  function colony() {
    const canvas = document.getElementById("colony");
    const slider = document.getElementById("radius");
    if (!canvas || !slider) return;
    const out = document.getElementById("radius-out");
    const sComp = document.getElementById("stat-components");
    const sMono = document.getElementById("stat-mono");
    const sChroma = document.getElementById("stat-chroma");

    const S = 560, C = S / 2, R = 248;
    let seed = 20240917;
    const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-12)) * Math.cos(2 * Math.PI * rand());

    // cells: dart throwing with a minimum spacing
    const pts = [];
    for (let tries = 0; tries < 20000 && pts.length < 430; tries++) {
      const a = rand() * 2 * Math.PI, r = R * Math.sqrt(rand());
      const x = C + r * Math.cos(a), y = C + r * Math.sin(a);
      if (pts.every(p => (p.x - x) ** 2 + (p.y - y) ** 2 > 13.5 ** 2)) {
        const rr = r / R + gauss() * 0.05;
        const fate = rr < 0.47 ? 0 : rr < 0.76 ? 1 : 2;
        pts.push({ x, y, fate });
      }
    }
    // candidate pairs, sorted by distance
    const pairs = [];
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 2 * 40) pairs.push([d, i, j]);
      }
    pairs.sort((a, b) => a[0] - b[0]);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = S * dpr; canvas.height = S * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    let col = {};
    const readColours = () => {
      const cs = getComputedStyle(document.documentElement);
      col = {
        f: [cs.getPropertyValue("--c1").trim(), cs.getPropertyValue("--c2").trim(), cs.getPropertyValue("--c3").trim()],
        mono: cs.getPropertyValue("--mono-edge").trim(),
        stage: cs.getPropertyValue("--stage").trim(),
      };
    };

    function draw() {
      const t = parseFloat(slider.value);
      out.textContent = t.toFixed(1);
      ctx.fillStyle = col.stage; ctx.fillRect(0, 0, S, S);

      // balls
      if (t > 0) {
        ctx.globalAlpha = 0.13;
        for (const p of pts) { ctx.fillStyle = col.f[p.fate]; ctx.beginPath(); ctx.arc(p.x, p.y, t, 0, 2 * Math.PI); ctx.fill(); }
        ctx.globalAlpha = 1;
      }
      // links + union-find
      const parent = pts.map((_, i) => i);
      const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
      let comps = pts.length, mono = 0, chroma = 0;
      ctx.lineWidth = 1.1;
      for (const [d, i, j] of pairs) {
        if (d > 2 * t) break;
        const a = pts[i], b = pts[j];
        if (a.fate === b.fate) { mono++; ctx.strokeStyle = col.mono; }
        else {
          chroma++;
          const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          g.addColorStop(0, col.f[a.fate]); g.addColorStop(1, col.f[b.fate]);
          ctx.strokeStyle = g;
        }
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        const ra = find(i), rb = find(j);
        if (ra !== rb) { parent[ra] = rb; comps--; }
      }
      // cells
      for (const p of pts) { ctx.fillStyle = col.f[p.fate]; ctx.beginPath(); ctx.arc(p.x, p.y, 3.6, 0, 2 * Math.PI); ctx.fill(); }

      sComp.textContent = comps; sMono.textContent = mono; sChroma.textContent = chroma;
    }

    readColours(); draw();
    slider.addEventListener("input", draw);
    document.addEventListener("themechange", () => { readColours(); draw(); });
  }
})();
