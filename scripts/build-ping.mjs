// Ping: the mascot. A living signal made of code brackets, a HUD visor and a Wi-Fi antenna.
// Writes animated poses to assets/ping/*.svg, plus avatar and social-preview SVGs that
// scripts/render-png.mjs turns into PNGs for the places GitHub only accepts images.
//
//   node scripts/build-ping.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = new URL("../assets/ping/", import.meta.url);
mkdirSync(new URL("social/", OUT), { recursive: true });

const C = {
  bg: "#101411", core: "#1d231e", coreDark: "#0b0f0c", line: "#2c332d", outline: "#404943",
  text: "#e1e3de", muted: "#c0c9c0", dim: "#8a938b", neon: "#7cdb9a", neonHi: "#98f7b4", neonLo: "#2f9c62",
  red: "#ff6b8b", blue: "#a6c8ff", amber: "#f2c46d", coral: "#ffb4a6", violet: "#cdbdff",
};
const SANS = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ------------------------------------------------------------------ the character
// Drawn in a 240x240 box, centred on (120,124). `p` is a prefix so several Pings can share one SVG.
function ping({ p = "p", eyes = "open", hands = "idle", mood = "neon", glitchEvery = 7, animate = true } = {}) {
  const accent = mood === "error" ? C.red : C.neon;
  const accentHi = mood === "error" ? "#ffb3c4" : C.neonHi;
  const accentLo = mood === "error" ? "#a33a55" : C.neonLo;

  const eye = {
    open: `<g class="${p}-blink"><rect x="97" y="108" width="12" height="22" rx="6"/><rect x="131" y="108" width="12" height="22" rx="6"/></g>`,
    happy: `<g fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M96,124 l7,-9 l7,9"/><path d="M130,124 l7,-9 l7,9"/></g>`,
    x: `<g fill="none" stroke-width="4.5" stroke-linecap="round"><path d="M97,111 l12,14 M109,111 l-12,14"/><path d="M131,111 l12,14 M143,111 l-12,14"/></g>`,
    scan: `<g opacity=".35"><rect x="90" y="106" width="34" height="3" rx="1.5" class="${p}-code"/><rect x="90" y="113" width="52" height="3" rx="1.5" class="${p}-code" style="animation-delay:.3s"/><rect x="98" y="120" width="28" height="3" rx="1.5" class="${p}-code" style="animation-delay:.6s"/><rect x="98" y="127" width="44" height="3" rx="1.5" class="${p}-code" style="animation-delay:.9s"/></g>
      <rect y="112" width="22" height="14" rx="7" class="${p}-scan"${animate ? "" : ' transform="translate(109,0)"'}/>`,
  }[eyes];

  const hand = (x, y, cls = "") => `<g class="${cls}"><rect x="${x - 9}" y="${y - 9}" width="18" height="18" rx="6" fill="${C.core}" stroke="${accent}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="2.5" fill="${accentHi}"/></g>`;
  const handsSvg = {
    idle: hand(24, 140, `${p}-bobL`) + hand(216, 140, `${p}-bobR`),
    wave: hand(24, 140, `${p}-bobL`) + hand(214, 84, `${p}-wave`),
    up: hand(30, 78, `${p}-cheerL`) + hand(210, 78, `${p}-cheerR`),
    type: `<rect x="70" y="190" width="100" height="12" rx="4" fill="${C.coreDark}" stroke="${accent}" stroke-opacity=".7" stroke-width="2"/>
      <g fill="${accentHi}" opacity=".7">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${78 + i * 11}" y="194" width="7" height="3" rx="1"/>`).join("")}</g>
      ${hand(94, 184, `${p}-typeL`)}${hand(146, 184, `${p}-typeR`)}`,
    droop: hand(30, 160, "") + hand(210, 160, ""),
  }[hands];

  const arcs = [14, 24, 34].map((r, i) => {
    const d = (r * Math.SQRT1_2).toFixed(2);
    return `<path d="M${(120 - d).toFixed(2)},${(70 - d).toFixed(2)} A${r},${r} 0 0 1 ${(120 + +d).toFixed(2)},${(70 - d).toFixed(2)}" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" class="${p}-arc" style="animation-delay:${i * 0.25}s"/>`;
  }).join("");

  const body = `
  <g class="${p}-thrust" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M110,172 l10,7 l10,-7" opacity=".8"/><path d="M113,183 l7,5 l7,-5" opacity=".5"/><path d="M116,193 l4,3 l4,-3" opacity=".3"/>
  </g>
  <rect x="118" y="70" width="4" height="18" rx="2" fill="${C.outline}"/>
  ${arcs}
  <circle cx="120" cy="70" r="6" fill="${accentHi}" filter="url(#${p}-glow)"/>
  <rect x="72" y="86" width="96" height="78" rx="24" fill="url(#${p}-core)" stroke="${C.line}" stroke-width="2"/>
  <rect x="82" y="100" width="76" height="38" rx="14" fill="#050806" stroke="${accent}" stroke-opacity=".4" stroke-width="1.5"/>
  <rect x="86" y="103" width="30" height="5" rx="2.5" fill="#fff" opacity=".06"/>
  <g fill="${accentHi}" stroke="${accentHi}" filter="url(#${p}-glow)">${eye}</g>
  <rect x="113" y="148" width="14" height="4" rx="2" fill="${accent}" class="${p}-cursor"/>
  <path d="M66,80 L42,124 L66,168" fill="none" stroke="url(#${p}-neon)" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" filter="url(#${p}-soft)"/>
  <path d="M174,80 L198,124 L174,168" fill="none" stroke="url(#${p}-neon)" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" filter="url(#${p}-soft)"/>
  ${handsSvg}`;

  const g = glitchEvery;
  const css = animate ? `
    .${p}-float{animation:${p}-float 4s ease-in-out infinite}
    .${p}-blink{transform-box:fill-box;transform-origin:center;animation:${p}-blink 5s infinite}
    .${p}-arc{animation:${p}-arc 2s ease-in-out infinite}
    .${p}-cursor{animation:${p}-cur 1s steps(1) infinite}
    .${p}-thrust{animation:${p}-thrust 1.2s ease-in-out infinite}
    .${p}-bobL{animation:${p}-bob 4s ease-in-out infinite .4s}
    .${p}-bobR{animation:${p}-bob 4s ease-in-out infinite .9s}
    .${p}-wave{transform-box:fill-box;transform-origin:50% 100%;animation:${p}-wave 1.4s ease-in-out infinite}
    .${p}-cheerL{animation:${p}-cheer .8s ease-in-out infinite}
    .${p}-cheerR{animation:${p}-cheer .8s ease-in-out infinite .4s}
    .${p}-typeL{animation:${p}-type .36s ease-in-out infinite}
    .${p}-typeR{animation:${p}-type .36s ease-in-out infinite .18s}
    .${p}-scan{animation:${p}-scan 1.6s ease-in-out infinite alternate}
    .${p}-code{animation:${p}-code 1.2s steps(2) infinite}
    .${p}-ghostA{animation:${p}-ghostA ${g}s infinite} .${p}-ghostB{animation:${p}-ghostB ${g}s infinite}
    .${p}-jit{animation:${p}-jit ${g}s infinite}
    @keyframes ${p}-float{50%{transform:translateY(-8px)}}
    @keyframes ${p}-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
    @keyframes ${p}-arc{0%,100%{opacity:.25}40%{opacity:1}}
    @keyframes ${p}-cur{50%{opacity:0}}
    @keyframes ${p}-thrust{50%{transform:translateY(3px);opacity:.6}}
    @keyframes ${p}-bob{50%{transform:translateY(-6px)}}
    @keyframes ${p}-wave{0%,100%{transform:rotate(-18deg)}50%{transform:rotate(22deg)}}
    @keyframes ${p}-cheer{50%{transform:translateY(-10px)}}
    @keyframes ${p}-type{50%{transform:translateY(3px)}}
    @keyframes ${p}-scan{from{transform:translateX(88px)}to{transform:translateX(130px)}}
    @keyframes ${p}-code{50%{opacity:.4}}
    @keyframes ${p}-ghostA{0%,90%,96%,100%{opacity:0;transform:none}91%{opacity:.75;transform:translate(-6px,1px)}93%{opacity:.6;transform:translate(4px,-1px)}}
    @keyframes ${p}-ghostB{0%,90%,96%,100%{opacity:0;transform:none}91%{opacity:.75;transform:translate(6px,-1px)}93%{opacity:.6;transform:translate(-4px,1px)}}
    @keyframes ${p}-jit{0%,90%,96%,100%{transform:none}91%{transform:translate(2px,0) skewX(-4deg)}93%{transform:translate(-2px,0) skewX(3deg)}}
    @media (prefers-reduced-motion: reduce){[class^="${p}-"]{animation:none!important}}` : "";

  const defs = `
  <linearGradient id="${p}-neon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${accentHi}"/><stop offset="1" stop-color="${accentLo}"/></linearGradient>
  <linearGradient id="${p}-core" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.core}"/><stop offset="1" stop-color="${C.coreDark}"/></linearGradient>
  <filter id="${p}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="${p}-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feComponentTransfer in="b" result="b2"><feFuncA type="linear" slope=".55"/></feComponentTransfer><feMerge><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="${p}-tintA"><feFlood flood-color="${C.red}"/><feComposite operator="in" in2="SourceAlpha"/></filter>
  <filter id="${p}-tintB"><feFlood flood-color="#5ce1ff"/><feComposite operator="in" in2="SourceAlpha"/></filter>
  <g id="${p}-body">${body}</g>`;

  const draw = `
  <ellipse cx="120" cy="226" rx="52" ry="7" fill="#000" opacity=".35"/>
  <g class="${p}-float">
    <use href="#${p}-body" filter="url(#${p}-tintA)" class="${p}-ghostA" opacity="0"/>
    <use href="#${p}-body" filter="url(#${p}-tintB)" class="${p}-ghostB" opacity="0"/>
    <g class="${p}-jit"><use href="#${p}-body"/></g>
  </g>`;
  return { css, defs, draw };
}

const doc = (w, h, title, { css = "", defs = "", body = "" }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<defs><style>.sans{font-family:${SANS}} .mono{font-family:${MONO}}${css}</style>${defs}</defs>
${body}
</svg>
`;
const save = (name, s) => writeFileSync(new URL(name, OUT), s);

// ------------------------------------------------------------------ poses (transparent, for READMEs)
const POSES = {
  idle: { eyes: "open", hands: "idle", title: "Ping floating and blinking" },
  wave: { eyes: "happy", hands: "wave", title: "Ping waving hello" },
  code: { eyes: "scan", hands: "type", title: "Ping typing code" },
  success: { eyes: "happy", hands: "up", title: "Ping celebrating", confetti: true },
  error: { eyes: "x", hands: "droop", mood: "error", glitchEvery: 2.4, title: "Ping glitching on an error" },
};
for (const [name, o] of Object.entries(POSES)) {
  const c = ping({ p: "p", ...o });
  let confetti = "", confettiCss = "";
  if (o.confetti) {
    const bits = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2, dist = 70 + (i % 3) * 14;
      const col = [C.neon, C.blue, C.amber, C.coral, C.violet][i % 5];
      return `<rect x="117" y="90" width="6" height="6" rx="1.5" fill="${col}" class="cf" style="--x:${(Math.cos(a) * dist).toFixed(0)}px;--y:${(Math.sin(a) * dist * 0.45).toFixed(0)}px;animation-delay:${((i % 4) * 0.08).toFixed(2)}s"/>`;
    }).join("");
    confetti = `<g>${bits}</g>`;
    confettiCss = `.cf{opacity:0;transform-box:fill-box;transform-origin:center;animation:cf 2.2s ease-out infinite}@keyframes cf{0%{opacity:1;transform:translate(0,0) rotate(0)}70%{opacity:1}100%{opacity:0;transform:translate(var(--x),var(--y)) rotate(200deg)}}`;
  }
  save(`ping-${name}.svg`, doc(240, 240, o.title, { css: c.css + confettiCss, defs: c.defs, body: confetti + c.draw }));
}

// ------------------------------------------------------------------ avatar (rendered to PNG for upload)
{
  const c = ping({ p: "a", eyes: "open", hands: "idle", animate: false });
  const body = `
  <rect width="512" height="512" fill="${C.bg}"/>
  <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="${C.neon}" opacity=".14"/></pattern>
  <rect width="512" height="512" fill="url(#dots)"/>
  <radialGradient id="halo" cx="256" cy="256" r="250" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.neon}" stop-opacity=".28"/><stop offset=".7" stop-color="${C.neon}" stop-opacity=".04"/><stop offset="1" stop-color="${C.neon}" stop-opacity="0"/></radialGradient>
  <rect width="512" height="512" fill="url(#halo)"/>
  <circle cx="256" cy="256" r="228" fill="none" stroke="${C.neon}" stroke-opacity=".35" stroke-width="2" stroke-dasharray="4 10"/>
  <g transform="translate(256,262) scale(1.75) translate(-120,-124)">${c.draw}</g>`;
  save("avatar.svg", doc(512, 512, "Ping avatar", { defs: c.defs, body }));
}

// ------------------------------------------------------------------ repo social previews (1280x640)
const REPOS = [
  { repo: "Wifilens", title: "WiFiLens", tone: C.blue, pose: "code", tagline: "See where your Wi-Fi reaches. Draw your floor plan, and it predicts the signal in every room.", chips: ["Kotlin", "Jetpack Compose", "Room", "Offline"] },
  { repo: "SpendSense", title: "SpendSense", tone: C.amber, pose: "code", tagline: "AI expense tracker that reads bank SMS and sorts your spending automatically.", chips: ["Kotlin", "Compose", "Room", "Hilt"] },
  { repo: "MyAdvisor", title: "MyAdvisor", tone: C.violet, pose: "wave", tagline: "Know which credit card to use for every purchase. Android + iOS.", chips: ["Kotlin Multiplatform", "Compose MP", "Koin"] },
  { repo: "WebBanking", title: "Demo Bank", tone: C.coral, pose: "success", tagline: "A Kotlin/Kobweb banking app built to show software testing end to end.", chips: ["Kobweb", "JUnit 5", "Selenium"] },
  { repo: "attendguard", title: "AttendGuard", tone: C.neon, pose: "idle", tagline: "Track attendance against the 75% rule and know how many classes you can skip.", chips: ["Kotlin", "CLI", "Kiwi TCMS"] },
  { repo: ".github", title: "Shared CI/CD", tone: C.neon, pose: "success", tagline: "Reusable GitHub Actions, starters and repo defaults for every project.", chips: ["GitHub Actions", "Android", "Kobweb", "Node"] },
];
function wrap(text, max) {
  const out = []; let cur = "";
  for (const w of text.split(" ")) { if ((cur + " " + w).trim().length > max) { out.push(cur.trim()); cur = w; } else cur += " " + w; }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
for (const r of REPOS) {
  const o = POSES[r.pose];
  const c = ping({ p: "s", ...o, animate: false });
  let cx = 80;
  const chips = r.chips.map((t) => {
    const w = Math.round(t.length * 20 * 0.6) + 40;
    const g = `<g transform="translate(${cx},452)"><rect width="${w}" height="46" rx="23" fill="${r.tone}" fill-opacity=".12" stroke="${r.tone}" stroke-opacity=".5" stroke-width="2"/><text x="${w / 2}" y="30" text-anchor="middle" class="mono" font-size="20" fill="${r.tone}">${esc(t)}</text></g>`;
    cx += w + 14;
    return g;
  }).join("");
  const lines = wrap(r.tagline, 38);
  const body = `
  <rect width="1280" height="640" fill="${C.bg}"/>
  <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="${C.neon}" opacity=".12"/></pattern>
  <rect width="1280" height="640" fill="url(#dots)"/>
  <radialGradient id="halo" cx="980" cy="320" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${r.tone}" stop-opacity=".22"/><stop offset="1" stop-color="${r.tone}" stop-opacity="0"/></radialGradient>
  <rect width="1280" height="640" fill="url(#halo)"/>
  <g stroke="${C.neon}" stroke-width="3" fill="none" opacity=".7"><path d="M36,76 V36 H76"/><path d="M1204,36 H1244 V76"/><path d="M36,564 V604 H76"/><path d="M1204,604 H1244 V564"/></g>
  <text x="80" y="128" class="mono" font-size="24" letter-spacing="3" fill="${C.dim}">WICKEDSONI / <tspan fill="${r.tone}">${esc(r.repo.toUpperCase())}</tspan></text>
  <text x="80" y="232" class="sans" font-size="92" font-weight="800" letter-spacing="-2" fill="${C.text}">${esc(r.title)}</text>
  ${lines.map((l, i) => `<text x="80" y="${300 + i * 44}" class="sans" font-size="34" fill="${C.muted}">${esc(l)}</text>`).join("")}
  ${chips}
  <g transform="translate(985,318) scale(1.9) translate(-120,-124)">${c.draw}</g>
  <text x="1244" y="590" text-anchor="end" class="mono" font-size="18" fill="${C.dim}">garvitmaheshwari.in</text>`;
  save(`social/${r.repo.replace(/^\./, "")}.svg`, doc(1280, 640, `${r.title}: ${r.tagline}`, { defs: c.defs, body }));
}

console.log("ping: %d poses, avatar, %d social previews", Object.keys(POSES).length, REPOS.length);
