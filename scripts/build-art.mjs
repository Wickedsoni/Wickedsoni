// Builds the hand-made SVGs in assets/: hero banner, project cards, tech marquee and section headers.
// Edit the data below and run `node scripts/build-art.mjs` (CI also runs it daily).
// Colours follow garvitmaheshwari.in (Material 3, dark green scheme).
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = new URL("../assets/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const C = {
  bg: "#101411", surface: "#161b17", surface2: "#1d231e", line: "#2c332d", outline: "#404943",
  text: "#e1e3de", muted: "#c0c9c0", dim: "#8a938b", primary: "#7cdb9a", android: "#3ddc84", kotlin: "#7f52ff",
};
const TONE = { green: "#7cdb9a", blue: "#a6c8ff", amber: "#f2c46d", coral: "#ffb4a6", violet: "#cdbdff" };
const SANS = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const MONO_W = 0.6; // average monospace glyph width in em

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
${body}
</svg>
`;
const save = (name, content) => writeFileSync(new URL(name, OUT), content);

// ------------------------------------------------------------------ data
const ME = {
  name: "Garvit Maheshwari",
  role: "Android Developer · Kotlin & Jetpack Compose",
  roles: [
    "builds offline-first apps.",
    "writes testable Kotlin.",
    "designs with Material 3.",
    "ships with Jetpack Compose.",
    "keeps architecture clean.",
  ],
  chips: ["B.Tech CSE · Class of '27", "Chennai, India", "Open to Android / SDE roles"],
  site: "garvitmaheshwari.in",
};

const PROJECTS = [
  {
    file: "card-wifilens.svg", title: "WiFiLens", tone: "blue", art: "wifi", status: "In development",
    tagline: "Offline Android Wi-Fi analyzer. Draw your floor plan, drop the router, and it predicts coverage room by room.",
    chips: ["Kotlin", "Compose", "Room", "Multi-module"],
  },
  {
    file: "card-spendsense.svg", title: "SpendSense", tone: "amber", art: "chart", status: "Android app",
    tagline: "AI-powered expense tracker that reads bank SMS and sorts spending automatically, built for Indian users.",
    chips: ["Kotlin", "Compose", "Room", "Hilt"],
  },
  {
    file: "card-myadvisor.svg", title: "MyAdvisor", tone: "violet", art: "cards", status: "Kotlin Multiplatform",
    tagline: "Checkout advisor that tells you which credit card earns the most for each purchase. Android + iOS.",
    chips: ["KMP", "Compose MP", "Room KMP", "Koin"],
  },
  {
    file: "card-webbanking.svg", title: "Demo Bank", tone: "coral", art: "tests", status: "Software testing",
    tagline: "Kotlin/Kobweb banking app built to show unit, system, regression and i18n testing end to end.",
    chips: ["Kobweb", "JUnit 5", "Selenium", "Material 3"],
  },
];

const TECH = [
  ["Kotlin", "violet"], ["Jetpack Compose", "blue"], ["Material 3", "green"], ["Coroutines", "amber"], ["Flow", "coral"],
  ["Room", "green"], ["Hilt", "blue"], ["Koin", "violet"], ["Clean Architecture", "amber"], ["MVI", "coral"],
  ["Kotlin Multiplatform", "blue"], ["Gradle KTS", "green"], ["Retrofit", "amber"], ["Firebase", "coral"],
  ["Supabase", "green"], ["JUnit", "violet"], ["Kobweb", "blue"], ["Figma", "coral"],
];

const SECTIONS = [
  ["01", "ABOUT_ME"], ["02", "FEATURED_WORK"], ["03", "TOOLBOX"], ["04", "BY_THE_NUMBERS"], ["05", "CONTRIBUTION_CITY"], ["06", "CONNECT"],
];

// ------------------------------------------------------------------ hero
function hero() {
  const W = 1200, H = 460;
  const x0 = 72;

  // Mono text gets an explicit textLength so the caret lands at the end whatever font the viewer has.
  // Typed roles: each one reveals left-to-right through its own clip rect, holds, then deletes.
  const prefix = "> garvit ";
  const fs = 22, cw = fs * MONO_W;
  const rx = x0 + prefix.length * cw;
  const period = ME.roles.length * 3;
  const roles = ME.roles.map((r, i) => {
    const w = Math.ceil(r.length * cw) + 4;
    const kt = "0;0.07;0.16;0.19;1";
    return `<clipPath id="rc${i}"><rect x="${rx}" y="290" height="32" width="0">
  <animate attributeName="width" values="0;${w};${w};0;0" keyTimes="${kt}" dur="${period}s" begin="${i * 3}s" repeatCount="indefinite"/></rect></clipPath>
<g clip-path="url(#rc${i})"><text x="${rx}" y="312" class="mono" font-size="${fs}" fill="${C.primary}" textLength="${(r.length * cw).toFixed(1)}" lengthAdjust="spacingAndGlyphs">${esc(r)}</text></g>
<rect y="294" width="11" height="24" fill="${C.primary}" opacity="0" x="${rx}">
  <animate attributeName="x" values="${rx};${rx + w};${rx + w};${rx};${rx}" keyTimes="${kt}" dur="${period}s" begin="${i * 3}s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="1;1;1;1;0;0" keyTimes="0;0.07;0.12;0.19;0.2;1" dur="${period}s" begin="${i * 3}s" repeatCount="indefinite"/>
</rect>`;
  }).join("\n");

  // Chips under the intro.
  let cx = x0;
  const chips = ME.chips.map((t, i) => {
    const last = i === ME.chips.length - 1;
    const w = Math.round(t.length * 7.4) + (last ? 44 : 28);
    const g = `<g transform="translate(${cx},356)">
  <rect width="${w}" height="34" rx="17" fill="${last ? "#00522d" : C.surface}" stroke="${last ? C.primary : C.outline}" stroke-opacity="${last ? 0.6 : 1}"/>
  ${last ? `<circle cx="18" cy="17" r="4.5" fill="${C.android}" class="pulse"/>` : ""}
  <text x="${last ? 30 : 14}" y="22" class="sans" font-size="13.5" fill="${last ? "#98f7b4" : C.muted}">${esc(t)}</text></g>`;
    cx += w + 10;
    return g;
  }).join("\n");

  // Phone screen: a Wi-Fi coverage heatmap that pulses outward from the router.
  const cols = 6, rows = 8, ts = 21, gap = 3, router = [1, 2];
  const heat = ["#7cdb9a", "#57c785", "#2f9c62", "#c8b45a", "#f2c46d", "#ffb4a6"];
  const walls = new Set(["3,0", "3,1", "3,2", "3,4", "0,5", "1,5", "2,5", "4,5", "5,5"]);
  let tiles = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const d = Math.hypot(c - router[0], r - router[1]);
    const x = 13 + c * (ts + gap), y = 66 + r * (ts + gap);
    if (walls.has(`${c},${r}`)) { tiles += `<rect x="${x}" y="${y}" width="${ts}" height="${ts}" rx="4" fill="${C.outline}"/>`; continue; }
    const col = heat[Math.min(heat.length - 1, Math.floor(d / 1.25))];
    tiles += `<rect x="${x}" y="${y}" width="${ts}" height="${ts}" rx="4" fill="${col}" class="tile" style="animation-delay:${(d * 0.18).toFixed(2)}s"/>`;
  }
  const [rcx, rcy] = [13 + router[0] * (ts + gap) + ts / 2, 66 + router[1] * (ts + gap) + ts / 2];

  const phoneFace = (fill, stroke) => `<rect width="170" height="330" rx="28" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
  const phone = `
<g class="float">
  <g transform="translate(838,62) skewY(-6)">
    <g transform="translate(-14,10)">${phoneFace("#0a0d0b", "#1f2621")}</g>
    <g transform="translate(-7,5)">${phoneFace("#141915", "#2c332d")}</g>
    ${phoneFace("#1d231e", C.outline)}
    <rect x="7" y="7" width="156" height="316" rx="22" fill="#0b0f0c"/>
    <text x="22" y="30" class="sans" font-size="10" font-weight="600" fill="${C.muted}">9:41</text>
    <rect x="70" y="18" width="30" height="8" rx="4" fill="#000"/>
    <g fill="${C.muted}"><rect x="128" y="22" width="3" height="5" rx="1"/><rect x="133" y="20" width="3" height="7" rx="1"/><rect x="138" y="18" width="3" height="9" rx="1"/><rect x="144" y="18" width="10" height="9" rx="2" fill="none" stroke="${C.muted}"/></g>
    <text x="16" y="54" class="sans" font-size="13" font-weight="700" fill="${C.text}">WiFiLens</text>
    <text x="154" y="54" text-anchor="end" class="mono" font-size="9" fill="${C.primary}">-42 dBm</text>
    ${tiles}
    <circle cx="${rcx}" cy="${rcy}" r="5" fill="#fff"/>
    <circle cx="${rcx}" cy="${rcy}" r="5" fill="none" stroke="#fff" stroke-width="2">
      <animate attributeName="r" values="5;48" dur="2.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.9;0" dur="2.4s" repeatCount="indefinite"/>
    </circle>
    <rect x="16" y="268" width="138" height="34" rx="17" fill="#00522d"/>
    <text x="85" y="289" text-anchor="middle" class="sans" font-size="11" font-weight="600" fill="#98f7b4">Find best spot</text>
    <rect x="62" y="312" width="46" height="4" rx="2" fill="${C.dim}"/>
  </g>
</g>`;

  // Orbiting tech badges. Each badge is drawn twice: dim behind the phone on the far half, bright in front on the near half.
  const ocx = 922, ocy = 238, orx = 210, ory = 58;
  const orbitPath = `M${ocx - orx},${ocy} a${orx},${ory} 0 1,0 ${2 * orx},0 a${orx},${ory} 0 1,0 ${-2 * orx},0`;
  const badges = [
    `<circle r="20" fill="#14111f" stroke="${C.kotlin}" stroke-width="1.5"/><g transform="translate(-8,-8) scale(0.667)"><defs><linearGradient id="kt" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#7f52ff"/><stop offset="0.5" stop-color="#c711e1"/><stop offset="1" stop-color="#e54857"/></linearGradient></defs><path d="M24 24H0V0h24L12 12Z" fill="url(#kt)"/></g>`,
    `<circle r="20" fill="#0f1a13" stroke="${C.android}" stroke-width="1.5"/><path d="M-11,6 a11,11 0 0,1 22,0 z" fill="${C.android}"/><circle cx="-4.5" cy="1" r="1.6" fill="#0f1a13"/><circle cx="4.5" cy="1" r="1.6" fill="#0f1a13"/><path d="M-7,-6 l-3,-5 M7,-6 l3,-5" stroke="${C.android}" stroke-width="1.6" stroke-linecap="round"/>`,
    `<circle r="20" fill="#0f1520" stroke="#4285f4" stroke-width="1.5"/><path d="M0,-11 9.5,-5.5 9.5,5.5 0,11 -9.5,5.5 -9.5,-5.5Z" fill="none" stroke="#a6c8ff" stroke-width="2"/><path d="M0,-5 4.3,-2.5 4.3,2.5 0,5 -4.3,2.5 -4.3,-2.5Z" fill="#4285f4"/>`,
    `<circle r="20" fill="#141a15" stroke="${C.primary}" stroke-width="1.5"/><text y="5" text-anchor="middle" class="mono" font-size="13" font-weight="700" fill="${C.primary}">M3</text>`,
  ];
  const dur = 16;
  const orbiters = (op) => badges.map((b, i) =>
    `<g opacity="${op}"><animateMotion dur="${dur}s" begin="${-(i * dur) / badges.length}s" repeatCount="indefinite" path="${orbitPath}"/>${b}</g>`).join("\n");

  const body = `<defs>
  <style>
    .sans{font-family:${SANS}} .mono{font-family:${MONO}}
    .float{animation:float 6s ease-in-out infinite}
    .shadow{animation:shadow 6s ease-in-out infinite;transform-origin:922px 432px}
    .tile{animation:heat 3.2s ease-in-out infinite;opacity:.35}
    .pulse{animation:pulse 1.6s ease-in-out infinite}
    .blink{animation:blink 1.1s steps(1) infinite}
    .glow{animation:glow 7s ease-in-out infinite}
    @keyframes float{50%{transform:translateY(-12px)}}
    @keyframes shadow{50%{transform:scale(.82);opacity:.35}}
    @keyframes heat{0%,100%{opacity:.35}25%{opacity:1}}
    @keyframes pulse{50%{opacity:.25}}
    @keyframes blink{50%{opacity:0}}
    @keyframes glow{50%{opacity:.55}}
    @media (prefers-reduced-motion: reduce){.float,.shadow,.tile,.pulse,.blink,.glow{animation:none}.tile{opacity:.85}}
  </style>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="${C.primary}" opacity=".13"/></pattern>
  <radialGradient id="halo" cx="922" cy="238" r="380" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.primary}" stop-opacity=".22"/><stop offset="1" stop-color="${C.primary}" stop-opacity="0"/></radialGradient>
  <radialGradient id="fade" cx="600" cy="230" r="700" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="${C.bg}" stop-opacity="0"/><stop offset="1" stop-color="${C.bg}"/></radialGradient>
  <linearGradient id="nameFill" x1="0" x2="1"><stop offset="0" stop-color="${C.text}"/><stop offset=".45" stop-color="${C.text}"/><stop offset=".5" stop-color="#ffffff"/><stop offset=".55" stop-color="${C.primary}"/><stop offset="1" stop-color="${C.primary}"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="-1;0.6;0.6" keyTimes="0;0.35;1" dur="7s" repeatCount="indefinite"/></linearGradient>
  <clipPath id="far"><rect x="0" y="0" width="${W}" height="${ocy}"/></clipPath>
  <clipPath id="near"><rect x="0" y="${ocy}" width="${W}" height="${H - ocy}"/></clipPath>
  ${roles.match(/<clipPath[\s\S]*?<\/clipPath>/g).join("\n")}
</defs>
<rect width="${W}" height="${H}" rx="20" fill="${C.bg}"/>
<rect width="${W}" height="${H}" rx="20" fill="url(#dots)"/>
<rect width="${W}" height="${H}" rx="20" fill="url(#halo)" class="glow"/>
<rect width="${W}" height="${H}" rx="20" fill="url(#fade)"/>

<g stroke="${C.primary}" stroke-width="2" fill="none" opacity=".7">
  <path d="M24,48 V24 H48"/><path d="M${W - 48},24 H${W - 24} V48"/><path d="M24,${H - 48} V${H - 24} H48"/><path d="M${W - 48},${H - 24} H${W - 24} V${H - 48}"/>
</g>
<text x="40" y="44" class="mono" font-size="12" fill="${C.dim}" letter-spacing="2">GM // ANDROID.DEV</text>
<text x="${W - 40}" y="44" text-anchor="end" class="mono" font-size="12" fill="${C.dim}" letter-spacing="2">SYS.ONLINE <tspan fill="${C.android}" class="blink">●</tspan></text>
<text x="40" y="${H - 34}" class="mono" font-size="12" fill="${C.dim}" letter-spacing="2">13.08°N · 80.27°E</text>
<text x="${W - 40}" y="${H - 34}" text-anchor="end" class="mono" font-size="12" fill="${C.dim}" letter-spacing="2">${ME.site.toUpperCase()}</text>

<text x="${x0}" y="140" class="mono" font-size="18" fill="${C.primary}">$ whoami<tspan class="blink">_</tspan></text>
<text x="${x0}" y="212" class="sans" font-size="60" font-weight="800" letter-spacing="-1" fill="url(#nameFill)">${esc(ME.name)}</text>
<text x="${x0}" y="254" class="sans" font-size="22" fill="${C.muted}">${esc(ME.role)}</text>
<text x="${x0}" y="312" class="mono" font-size="${fs}" fill="${C.dim}" textLength="${(prefix.length * cw).toFixed(1)}" lengthAdjust="spacingAndGlyphs" xml:space="preserve">${esc(prefix)}</text>
${roles.replace(/<clipPath[\s\S]*?<\/clipPath>\n?/g, "")}
${chips}

<ellipse cx="922" cy="432" rx="96" ry="11" fill="#000" opacity=".6" class="shadow"/>
<g clip-path="url(#far)">
  <ellipse cx="${ocx}" cy="${ocy}" rx="${orx}" ry="${ory}" fill="none" stroke="${C.primary}" stroke-opacity=".28" stroke-dasharray="3 7"/>
  ${orbiters(0.45)}
</g>
${phone}
<g clip-path="url(#near)">
  <ellipse cx="${ocx}" cy="${ocy}" rx="${orx}" ry="${ory}" fill="none" stroke="${C.primary}" stroke-opacity=".5" stroke-dasharray="3 7"/>
  ${orbiters(1)}
</g>`;
  save("hero.svg", svg(W, H, body, `${ME.name}: ${ME.role}`));
}

// ------------------------------------------------------------------ project cards
function wrap(text, max) {
  const lines = [];
  let cur = "";
  for (const w of text.split(" ")) {
    if ((cur + " " + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

const ART = {
  wifi: (t) => `<g transform="translate(510,128)">
    <circle r="7" fill="${t}"/>
    ${[26, 46, 66].map((r, i) => `<path d="M${-r * 0.75},${-r * 0.66} A${r},${r} 0 0,1 ${r * 0.75},${-r * 0.66}" fill="none" stroke="${t}" stroke-width="7" stroke-linecap="round" class="arc" style="animation-delay:${i * 0.3}s"/>`).join("")}
  </g>`,
  chart: (t) => `<g transform="translate(450,70)">
    <line x1="0" y1="110" x2="120" y2="110" stroke="${C.outline}" stroke-width="2"/>
    ${[46, 78, 30, 96, 62].map((h, i) => `<rect x="${4 + i * 23}" width="16" rx="4" fill="${t}" opacity="${0.45 + i * 0.12}" y="${110 - h}" height="${h}">
      <animate attributeName="height" values="0;${h};${h}" keyTimes="0;0.3;1" dur="4s" begin="${i * 0.15}s" repeatCount="indefinite"/>
      <animate attributeName="y" values="110;${110 - h};${110 - h}" keyTimes="0;0.3;1" dur="4s" begin="${i * 0.15}s" repeatCount="indefinite"/></rect>`).join("")}
  </g>`,
  cards: (t) => `<g transform="translate(510,128)">
    <rect x="-52" y="-32" width="104" height="66" rx="10" fill="${C.surface2}" stroke="${C.outline}" transform="rotate(-14) translate(-10,6)"/>
    <rect x="-52" y="-32" width="104" height="66" rx="10" fill="#2a2440" stroke="${t}" stroke-opacity=".5" transform="rotate(-5) translate(-4,2)"/>
    <g><animateTransform attributeName="transform" type="translate" values="0,0;0,-14;0,-14;0,0" keyTimes="0;0.25;0.7;1" dur="3.6s" repeatCount="indefinite"/>
      <rect x="-52" y="-32" width="104" height="66" rx="10" fill="${t}"/>
      <rect x="-40" y="-18" width="18" height="13" rx="3" fill="#00000055"/>
      <rect x="-40" y="12" width="56" height="5" rx="2.5" fill="#00000055"/>
      <text x="40" y="-10" text-anchor="end" class="sans" font-size="11" font-weight="800" fill="#1d1638">5X</text></g>
  </g>`,
  tests: (t) => `<g transform="translate(450,60)">
    ${[0, 1, 2, 3].map((i) => `<g transform="translate(0,${i * 34})">
      <rect width="24" height="24" rx="6" fill="none" stroke="${t}" stroke-opacity=".6" stroke-width="2"/>
      <path d="M6,12 l4,4 l8,-9" fill="none" stroke="${t}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" class="tick" style="animation-delay:${i * 0.45}s"/>
      <rect x="36" y="8" width="${[86, 64, 92, 72][i]}" height="8" rx="4" fill="${C.outline}"/></g>`).join("")}
  </g>`,
};

function card(p) {
  const W = 600, H = 250, t = TONE[p.tone];
  const lines = wrap(p.tagline, 44).slice(0, 3);
  let cx = 28;
  const chips = p.chips.map((c) => {
    const w = Math.round(c.length * 12 * MONO_W) + 24;
    const g = `<g transform="translate(${cx},196)"><rect width="${w}" height="28" rx="14" fill="${t}" fill-opacity=".1" stroke="${t}" stroke-opacity=".45"/><text x="${w / 2}" y="18.5" text-anchor="middle" class="mono" font-size="12" fill="${t}">${esc(c)}</text></g>`;
    cx += w + 8;
    return g;
  }).join("");
  const body = `<defs>
  <style>
    .sans{font-family:${SANS}} .mono{font-family:${MONO}}
    .arc{animation:arc 2.4s ease-in-out infinite;opacity:.25}
    .tick{stroke-dasharray:1;stroke-dashoffset:1;animation:tick 3.6s ease-out infinite}
    @keyframes arc{30%,60%{opacity:1}}
    @keyframes tick{0%{stroke-dashoffset:1}25%,85%{stroke-dashoffset:0}100%{stroke-dashoffset:0;opacity:0}}
    @media (prefers-reduced-motion: reduce){.arc{animation:none;opacity:1}.tick{animation:none;stroke-dashoffset:0}}
  </style>
  <radialGradient id="g" cx="510" cy="120" r="260" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t}" stop-opacity=".16"/><stop offset="1" stop-color="${t}" stop-opacity="0"/></radialGradient>
</defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="${C.surface}" stroke="${C.line}"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="url(#g)"/>
<rect x="0" y="34" width="4" height="40" rx="2" fill="${t}"/>
<text x="28" y="44" class="mono" font-size="12" letter-spacing="1.5" fill="${t}">◆ ${esc(p.status.toUpperCase())}</text>
<text x="${W - 28}" y="44" text-anchor="end" class="mono" font-size="13" fill="${C.dim}">view repo ↗</text>
<text x="28" y="86" class="sans" font-size="30" font-weight="800" fill="${C.text}">${esc(p.title)}</text>
${lines.map((l, i) => `<text x="28" y="${120 + i * 22}" class="sans" font-size="15" fill="${C.muted}">${esc(l)}</text>`).join("\n")}
${ART[p.art](t)}
${chips}`;
  save(p.file, svg(W, H, body, `${p.title}: ${p.tagline}`));
}

// ------------------------------------------------------------------ tech marquee
function marquee() {
  const W = 1200, H = 64;
  let x = 0;
  const row = TECH.map(([name, tone]) => {
    const w = Math.round(name.length * 14 * MONO_W) + 40;
    const g = `<g transform="translate(${x},14)"><rect width="${w}" height="36" rx="18" fill="${C.surface}" stroke="${C.line}"/><circle cx="17" cy="18" r="4" fill="${TONE[tone]}"/><text x="28" y="23" class="mono" font-size="14" fill="${C.text}">${esc(name)}</text></g>`;
    x += w + 12;
    return g;
  }).join("");
  const span = x;
  const body = `<defs>
  <style>
    .mono{font-family:${MONO}}
    .track{animation:scroll ${Math.round(span / 28)}s linear infinite}
    @keyframes scroll{to{transform:translateX(-${span}px)}}
    @media (prefers-reduced-motion: reduce){.track{animation:none}}
  </style>
  <linearGradient id="edge" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".08" stop-color="#fff"/><stop offset=".92" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <mask id="m"><rect width="${W}" height="${H}" fill="url(#edge)"/></mask>
</defs>
<g mask="url(#m)"><g class="track">${row}<g transform="translate(${span},0)">${row}</g></g></g>`;
  save("tech-marquee.svg", svg(W, H, body, `Toolbox: ${TECH.map((t) => t[0]).join(", ")}`));
}

// ------------------------------------------------------------------ section headers
function header([num, label]) {
  const W = 1200, H = 60;
  const lx = 92 + label.length * 22 * MONO_W + 24;
  const body = `<defs>
  <style>.mono{font-family:${MONO}} .run{animation:run 2.4s linear infinite} @keyframes run{to{transform:translateX(36px)}} @media (prefers-reduced-motion: reduce){.run{animation:none}}</style>
  <linearGradient id="l" x1="0" x2="1"><stop offset="0" stop-color="${C.primary}" stop-opacity=".8"/><stop offset="1" stop-color="${C.primary}" stop-opacity="0"/></linearGradient>
  <clipPath id="c"><rect x="${W - 140}" y="0" width="120" height="${H}"/></clipPath>
</defs>
<rect x="0" y="12" width="64" height="36" rx="10" fill="#00522d"/>
<text x="32" y="36" text-anchor="middle" class="mono" font-size="16" font-weight="700" fill="#98f7b4">${num}</text>
<text x="80" y="38" class="mono" font-size="22" font-weight="700" fill="${C.text}"><tspan fill="${C.primary}">//</tspan> ${esc(label)}</text>
<rect x="${lx}" y="29" width="${W - 160 - lx}" height="2" fill="url(#l)"/>
<g clip-path="url(#c)"><g class="run" fill="${C.primary}">${[0, 1, 2, 3, 4].map((i) => `<path d="M${W - 176 + i * 36},22 l10,8 l-10,8z" opacity="${0.25 + i * 0.15}"/>`).join("")}</g></g>`;
  save(`h-${num}.svg`, svg(W, H, body, `${num} ${label.replace(/_/g, " ").toLowerCase()}`));
}

hero();
PROJECTS.forEach(card);
marquee();
SECTIONS.forEach(header);
console.log("art: wrote hero, %d cards, marquee, %d headers", PROJECTS.length, SECTIONS.length);
