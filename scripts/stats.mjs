// Generates assets/generated/{stats,languages,streak}.svg from the GitHub GraphQL API.
// Self-hosted on purpose: public stats-card servers rate-limit and break, these files never do.
//
//   GH_TOKEN=... PROFILE_USER=Wickedsoni node scripts/stats.mjs
//
// With the default Actions GITHUB_TOKEN only public data is counted. Add a PROFILE_TOKEN secret
// (classic PAT with read:user + repo) to include private-repo languages and contributions.
import { mkdirSync, writeFileSync } from "node:fs";

const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const USER = process.env.PROFILE_USER || "Wickedsoni";
if (!TOKEN) throw new Error("Set GH_TOKEN");

const OUT = new URL("../assets/generated/", import.meta.url);
mkdirSync(OUT, { recursive: true });

// Repos that are course exercises or meta, not real work.
const SKIP_REPO = (name) => /^skills-/.test(name) || ["hello", USER.toLowerCase()].includes(name.toLowerCase());

const C = {
  bg: "#161b17", line: "#2c332d", outline: "#404943", text: "#e1e3de", muted: "#c0c9c0", dim: "#8a938b",
  primary: "#7cdb9a", primaryC: "#00522d", onPrimaryC: "#98f7b4", amber: "#f2c46d", coral: "#ffb4a6",
};
const SANS = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmt = (n) => (n >= 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : n.toLocaleString("en-US"));

async function gql(query, variables = {}) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json", "User-Agent": "profile-stats" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors ?? json));
  return json.data;
}

// ------------------------------------------------------------------ fetch
const base = await gql(
  `query($login:String!){ user(login:$login){
    createdAt
    followers{ totalCount }
    pullRequests{ totalCount }
    issues{ totalCount }
    repositoriesContributedTo(contributionTypes:[COMMIT,PULL_REQUEST,ISSUE,REPOSITORY]){ totalCount }
    repositories(ownerAffiliations:OWNER, isFork:false, first:100){
      nodes{ name isArchived stargazerCount
        languages(first:10, orderBy:{field:SIZE, direction:DESC}){ edges{ size node{ name color } } } }
    }
  }}`,
  { login: USER },
);
const u = base.user;

const now = new Date();
const startYear = new Date(u.createdAt).getUTCFullYear();
const days = [];
let commitsThisYear = 0;
for (let y = startYear; y <= now.getUTCFullYear(); y++) {
  const from = new Date(Date.UTC(y, 0, 1)).toISOString();
  const to = y === now.getUTCFullYear() ? now.toISOString() : new Date(Date.UTC(y, 11, 31, 23, 59, 59)).toISOString();
  const d = await gql(
    `query($login:String!,$from:DateTime!,$to:DateTime!){ user(login:$login){ contributionsCollection(from:$from,to:$to){
      totalCommitContributions
      contributionCalendar{ weeks{ contributionDays{ date contributionCount } } } } } }`,
    { login: USER, from, to },
  );
  const cc = d.user.contributionsCollection;
  if (y === now.getUTCFullYear()) commitsThisYear = cc.totalCommitContributions;
  for (const w of cc.contributionCalendar.weeks) for (const day of w.contributionDays) days.push(day);
}
const today = now.toISOString().slice(0, 10);
const cal = [...new Map(days.filter((d) => d.date <= today).map((d) => [d.date, d.contributionCount])).entries()].sort();

// ------------------------------------------------------------------ derive
const total = cal.reduce((s, [, n]) => s + n, 0);
let longest = { len: 0, start: null, end: null }, run = { len: 0, start: null };
for (const [date, n] of cal) {
  if (n > 0) {
    run = run.len ? { len: run.len + 1, start: run.start } : { len: 1, start: date };
    if (run.len >= longest.len) longest = { len: run.len, start: run.start, end: date };
  } else run = { len: 0, start: null };
}
// Today with no contributions yet doesn't break the streak.
let current = { len: 0, start: null, end: null };
{
  let i = cal.length - 1;
  if (i >= 0 && cal[i][1] === 0) i--;
  const end = i >= 0 ? cal[i][0] : null;
  while (i >= 0 && cal[i][1] > 0) { current = { len: current.len + 1, start: cal[i][0], end }; i--; }
}
const last365 = cal.slice(-365);
const activeDays = last365.filter(([, n]) => n > 0).length;
const last30 = cal.slice(-30);

const repos = u.repositories.nodes.filter((r) => !SKIP_REPO(r.name) && !r.isArchived);
const stars = u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);
const langMap = new Map();
for (const r of repos) for (const e of r.languages.edges) {
  const cur = langMap.get(e.node.name) ?? { size: 0, color: e.node.color ?? C.dim };
  cur.size += e.size;
  langMap.set(e.node.name, cur);
}
const langTotal = [...langMap.values()].reduce((s, l) => s + l.size, 0) || 1;
const langs = [...langMap.entries()].map(([name, l]) => ({ name, color: l.color, pct: (l.size / langTotal) * 100 }))
  .sort((a, b) => b.pct - a.pct).slice(0, 6);

// ------------------------------------------------------------------ draw
const STYLE = `<style>
  .sans{font-family:${SANS}} .mono{font-family:${MONO}}
  .in{opacity:0;animation:in .6s ease-out forwards}
  .grow{transform:scaleX(0);transform-box:fill-box;animation:grow 1.2s cubic-bezier(.2,.8,.2,1) .2s forwards}
  .rise{transform:scaleY(0);transform-box:fill-box;transform-origin:bottom;animation:rise .8s ease-out forwards}
  .ring{animation:ring 1.6s cubic-bezier(.2,.8,.2,1) forwards}
  .flame{animation:flame 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:bottom}
  @keyframes in{to{opacity:1}} @keyframes grow{to{transform:scaleX(1)}} @keyframes rise{to{transform:scaleY(1)}}
  @keyframes flame{50%{transform:scale(1.08,.92)}}
  @media (prefers-reduced-motion: reduce){.in,.grow,.rise,.ring,.flame{animation:none;opacity:1;transform:none;stroke-dashoffset:0}}
</style>`;
const frame = (w, h, label, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<defs>${STYLE}</defs>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="18" fill="${C.bg}" stroke="${C.line}"/>
<text x="28" y="42" class="mono" font-size="13" letter-spacing="2" fill="${C.primary}">▍${esc(label)}</text>
<text x="${w - 28}" y="42" text-anchor="end" class="mono" font-size="11" fill="${C.dim}">updated ${today}</text>
${body}
</svg>
`;
const dateFmt = (d) => (d ? new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "–");

function statsCard() {
  const rows = [
    ["Contributions, all time", fmt(total)],
    [`Commits in ${now.getUTCFullYear()}`, fmt(commitsThisYear)],
    ["Pull requests", fmt(u.pullRequests.totalCount)],
    ["Issues", fmt(u.issues.totalCount)],
    ["Stars earned", fmt(stars)],
    ["Repos contributed to", fmt(u.repositoriesContributedTo.totalCount)],
  ];
  const list = rows.map(([k, v], i) => `<g class="in" style="animation-delay:${0.1 + i * 0.08}s" transform="translate(28,${78 + i * 28})">
    <rect y="-11" width="6" height="6" rx="1.5" fill="${C.primary}" opacity="${1 - i * 0.12}"/>
    <text x="16" y="-3" class="sans" font-size="14.5" fill="${C.muted}">${esc(k)}</text>
    <text x="320" y="-3" text-anchor="end" class="mono" font-size="15" font-weight="700" fill="${C.text}">${esc(v)}</text></g>`).join("\n");
  const pct = activeDays / 365, r = 64, circ = 2 * Math.PI * r;
  const ring = `<g transform="translate(470,140)">
    <circle r="${r}" fill="none" stroke="${C.line}" stroke-width="12"/>
    <circle r="${r}" fill="none" stroke="${C.primary}" stroke-width="12" stroke-linecap="round" transform="rotate(-90)"
      stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${(circ * (1 - pct)).toFixed(1)}" class="ring" style="--from:${circ.toFixed(1)}"/>
    <text y="4" text-anchor="middle" class="sans" font-size="30" font-weight="800" fill="${C.text}">${activeDays}</text>
    <text y="26" text-anchor="middle" class="mono" font-size="11" fill="${C.dim}">active days</text>
    <text y="${r + 34}" text-anchor="middle" class="mono" font-size="11" fill="${C.dim}">last 365 days</text></g>
  <style>@keyframes ring{from{stroke-dashoffset:${circ.toFixed(1)}}}</style>`;
  writeFileSync(new URL("stats.svg", OUT), frame(600, 260, "GITHUB.STATS", list + ring, `GitHub stats: ${fmt(total)} contributions, ${activeDays} active days in the last year`));
}

function languagesCard() {
  let x = 28;
  const W = 544;
  const bar = langs.map((l, i) => {
    const w = Math.max(2, (l.pct / 100) * W);
    const seg = `<rect x="${x.toFixed(1)}" y="64" width="${w.toFixed(1)}" height="14" fill="${l.color}" class="grow" style="animation-delay:${0.15 + i * 0.1}s"/>`;
    x += w;
    return seg;
  }).join("");
  const legend = langs.map((l, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    return `<g class="in" style="animation-delay:${0.4 + i * 0.08}s" transform="translate(${28 + col * 280},${118 + row * 40})">
      <circle cx="6" cy="-5" r="6" fill="${l.color}"/>
      <text x="20" y="0" class="sans" font-size="15" fill="${C.text}">${esc(l.name)}</text>
      <text x="252" y="0" text-anchor="end" class="mono" font-size="14" fill="${C.dim}">${l.pct.toFixed(1)}%</text></g>`;
  }).join("");
  const body = langs.length
    ? `<clipPath id="bar"><rect x="28" y="64" width="${W}" height="14" rx="7"/></clipPath><rect x="28" y="64" width="${W}" height="14" rx="7" fill="${C.line}"/><g clip-path="url(#bar)">${bar}</g>${legend}`
    : `<text x="28" y="120" class="sans" font-size="15" fill="${C.dim}">No language data yet.</text>`;
  writeFileSync(new URL("languages.svg", OUT), frame(600, 260, "TOP_LANGUAGES", body, `Top languages: ${langs.map((l) => `${l.name} ${l.pct.toFixed(0)}%`).join(", ")}`));
}

function streakCard() {
  const W = 1200, H = 250;
  const col = (cx, big, label, sub, color, extra = "") => `<g class="in" transform="translate(${cx},0)">
    ${extra}
    <text y="128" text-anchor="middle" class="sans" font-size="46" font-weight="800" fill="${color}">${esc(big)}</text>
    <text y="156" text-anchor="middle" class="sans" font-size="15" font-weight="600" fill="${C.text}">${esc(label)}</text>
    <text y="178" text-anchor="middle" class="mono" font-size="11.5" fill="${C.dim}">${esc(sub)}</text></g>`;
  const flame = `<g transform="translate(-13,50)"><path class="flame" d="M13 0C15 7 24 11 24 21a11 11 0 0 1-22 0c0-6 4-9 6-13 1 4 3 6 5 6 0-5-2-9 0-14Z" fill="${C.amber}"/></g>`;
  const range = (s) => (s.len ? `${dateFmt(s.start)} → ${dateFmt(s.end)}` : "start one today");
  const max = Math.max(1, ...last30.map(([, n]) => n));
  const bw = 1144 / 30;
  const bars = last30.map(([date, n], i) => {
    const h = n ? 6 + (n / max) * 34 : 3;
    return `<rect x="${(28 + i * bw + 2).toFixed(1)}" y="${(232 - h).toFixed(1)}" width="${(bw - 4).toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${n ? C.primary : C.outline}" opacity="${n ? 0.35 + 0.65 * (n / max) : 1}" class="rise" style="animation-delay:${(i * 0.02).toFixed(2)}s"><title>${date}: ${n}</title></rect>`;
  }).join("");
  const body = `
  ${col(220, fmt(total), "Total contributions", `${dateFmt(cal[0]?.[0])} → present`, C.text)}
  <line x1="400" y1="70" x2="400" y2="180" stroke="${C.line}"/>
  ${col(600, String(current.len), "Current streak", range(current), C.amber, flame)}
  <line x1="800" y1="70" x2="800" y2="180" stroke="${C.line}"/>
  ${col(980, String(longest.len), "Longest streak", range(longest), C.primary)}
  <text x="${W - 28}" y="190" text-anchor="end" class="mono" font-size="10" fill="${C.dim}">last 30 days</text>
  ${bars}`;
  writeFileSync(new URL("streak.svg", OUT), frame(W, H, "STREAK", body, `Streak: current ${current.len} days, longest ${longest.len} days, ${fmt(total)} total contributions`));
}

statsCard();
languagesCard();
streakCard();
console.log(`stats: total=${total} current=${current.len} longest=${longest.len} active365=${activeDays} langs=${langs.map((l) => l.name).join(",")}`);
