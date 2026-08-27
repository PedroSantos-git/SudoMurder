import { CASES, TUTORIAL_CASE, BONUS_CASES } from "./data.js";
import { RULES } from "./rules.js";
import { WALKTHROUGHS } from "./walkthroughs.js";
import { BOARDS, NONOCC, ICON } from "./boards.js";

/* ============================ storage ============================ */
const LS = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
const gridKey = (id) => `md.grid.${id}`;
const guessKey = (id) => `md.guess.${id}`;
const solvedKey = (id) => `md.solved.${id}`;

/* ============================ palette ============================ */
const PALETTE = ["#e5342e", "#5aa9ff", "#3ecf8e", "#f2c14e", "#b07bff", "#ff8a3d",
  "#38d6c7", "#ff6bab", "#9bcf3a", "#7d8cff", "#d98cff", "#ffd23d"];
const colorFor = (i) => PALETTE[i % PALETTE.length];
const initials = (name) => name.trim().slice(0, 2);

/* ============================ helpers ============================ */
const $ = (sel, el = document) => el.querySelector(sel);
const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const allCases = () => [TUTORIAL_CASE, ...CASES, ...BONUS_CASES];
const caseById = (id) => allCases().find((c) => String(c.id) === String(id));

function progress() {
  const total = CASES.length;
  let solved = 0, guessed = 0;
  for (const c of CASES) {
    if (LS.get(solvedKey(c.id))) solved++;
    else if (LS.get(guessKey(c.id))) guessed++;
  }
  return { total, solved, guessed };
}

/* ============================ router ============================ */
const routes = {
  "": renderHome,
  "casos": renderList,
  "regras": renderRules,
  "treino": () => renderCase(TUTORIAL_CASE, true),
  "caso": (id) => { const c = caseById(id); c ? renderCase(c, false) : renderHome(); },
};

function router() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, param] = raw.split("/");
  const fn = routes[path] || renderHome;
  window.scrollTo(0, 0);
  fn(param);
  syncNav(path);
}
function syncNav(path) {
  document.querySelectorAll("header.top nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.path === path || (path === "" && a.dataset.path === ""));
  });
}
window.addEventListener("hashchange", router);

/* ============================ shell ============================ */
const app = $("#app");
document.body.prepend(el(`<div class="bg-blobs" aria-hidden="true"><span></span><span></span><span></span><span></span></div>`));
document.body.prepend(el(`
  <header class="top">
    <div class="wrap">
      <a class="brand" href="#/"><span class="dot"></span>MUR<b>DOKU</b></a>
      <nav>
        <a data-path="" href="#/">Início</a>
        <a data-path="casos" href="#/casos">80 Casos</a>
        <a data-path="treino" href="#/treino">Treino</a>
        <a data-path="regras" href="#/regras">Regras</a>
      </nav>
    </div>
  </header>
`));
document.body.append(el(`
  <footer>
    Companion interativo não-oficial do livro <i>Murdoku — 80 Crimes para Resolver</i> (Manuel Garand · Zero a Oito).
    Feito para resolveres os casos com a lógica na ponta dos dedos.
  </footer>
`));

/* ============================ HOME ============================ */
function renderHome() {
  const p = progress();
  const featured = CASES.slice(0, 6);
  app.innerHTML = "";
  app.append(el(`
    <div class="wrap">
      <section class="hero">
        <div class="pill">80 crimes · uma grelha · um assassino</div>
        <h1>MUR<span class="drip">DOKU</span></h1>
        <p class="tag">Localiza cada suspeito com lógica de Sudoku, encontra a última célula livre — e descobre quem ficou sozinho com a vítima.</p>
        <div class="cta">
          <a class="btn primary" href="#/casos">Ver os 80 casos →</a>
          <a class="btn ghost" href="#/treino">Fazer o treino</a>
          <a class="btn ghost" href="#/regras">Como se joga</a>
        </div>
      </section>

      <div class="panel" style="margin-top:8px">
        <h4>O teu progresso</h4>
        <div class="progress-bar"><i style="width:${(p.solved / p.total * 100).toFixed(1)}%"></i></div>
        <div class="stat-row" style="margin-top:14px">
          <div class="stat"><b>${p.solved}</b> resolvidos</div>
          <div class="stat"><b>${p.guessed}</b> com palpite</div>
          <div class="stat"><b>${p.total - p.solved - p.guessed}</b> por começar</div>
        </div>
      </div>

      <div class="section-h"><h2>Começa por aqui</h2><span>os primeiros casos são os mais suaves</span></div>
      <div class="cases" id="feat"></div>

      ${BONUS_CASES.length ? `<div class="section-h"><h2>Bónus</h2><span>puzzles extra de murdoku.com</span></div><div class="cases" id="bonus"></div>` : ""}

      <div class="section-h"><h2>Como funciona o site</h2></div>
      <div class="prose">
        <ul>
          <li><b>Grelha de dedução interativa</b> — escolhe um suspeito e clica nas células para o colocar; usa <b>✕</b> para eliminar e <b>Nota</b> para marcações a lápis. Tudo fica guardado no teu navegador.</li>
          <li><b>Pistas completas</b> de todos os 80 casos, mais as pistas gerais e objetos especiais.</li>
          <li><b>Palpite &amp; verificação</b> — arrisca o nome do assassino e confirma. Resoluções passo-a-passo disponíveis (a serem adicionadas caso a caso).</li>
        </ul>
      </div>
    </div>
  `));
  const feat = $("#feat");
  featured.forEach((c) => feat.append(caseCard(c)));
  const bonusWrap = $("#bonus");
  if (bonusWrap) BONUS_CASES.forEach((c) => bonusWrap.append(caseCard(c)));
}

/* ============================ LIST ============================ */
function renderList() {
  app.innerHTML = "";
  const state = LS.get("md.list.filter", { q: "", solved: false, walk: false });
  const view = el(`
    <div class="wrap">
      <div class="case-head">
        <div class="num">CASE FILES</div>
        <h1>Os 80 Casos</h1>
        <p class="sub">Escolhe um crime. Cada um tem grelha, suspeitos, pistas e um assassino à espera de ser desmascarado.</p>
      </div>
      <div class="filters">
        <input type="search" id="q" placeholder="Procurar por título, suspeito, divisão…" value="${esc(state.q)}">
        <button class="chip-toggle ${state.solved ? "on" : ""}" id="f-solved">Resolvidos</button>
        <button class="chip-toggle ${state.walk ? "on" : ""}" id="f-walk">Com resolução</button>
      </div>
      <div class="cases" id="grid"></div>
      <div class="empty" id="empty" hidden>Nenhum caso corresponde à procura.</div>
    </div>
  `);
  app.append(view);

  const grid = $("#grid", view), empty = $("#empty", view);
  function paint() {
    LS.set("md.list.filter", state);
    const q = state.q.toLowerCase().trim();
    grid.innerHTML = "";
    let n = 0;
    CASES.forEach((c) => {
      if (state.solved && !LS.get(solvedKey(c.id))) return;
      if (state.walk && !WALKTHROUGHS[c.id]) return;
      if (q) {
        const hay = [c.title, c.subtitle, ...(c.rooms || []), ...c.suspects.map((s) => s.n), c.victim].join(" ").toLowerCase();
        if (!hay.includes(q)) return;
      }
      grid.append(caseCard(c));
      n++;
    });
    empty.hidden = n > 0;
  }
  $("#q", view).addEventListener("input", (e) => { state.q = e.target.value; paint(); });
  $("#f-solved", view).addEventListener("click", (e) => { state.solved = !state.solved; e.target.classList.toggle("on"); paint(); });
  $("#f-walk", view).addEventListener("click", (e) => { state.walk = !state.walk; e.target.classList.toggle("on"); paint(); });
  paint();
}

function caseCard(c) {
  const isTut = c.id === 0;
  const isBonus = typeof c.id === "string";
  const solved = LS.get(solvedKey(c.id));
  const guess = LS.get(guessKey(c.id));
  const [r, cc] = c.grid || [];
  const badge = solved
    ? `<div class="badge-solved">RESOLVIDO</div>`
    : guess ? `<div class="badge-guess">PALPITE</div>` : "";
  const card = el(`
    <a class="case-card" href="#/${isTut ? "treino" : "caso/" + c.id}">
      ${badge}
      <div class="num">${isTut ? "TREINO" : isBonus ? "BÓNUS" : "CASO " + String(c.id).padStart(2, "0")}</div>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.subtitle || "")}</p>
      <div class="meta">
        <span><b>${c.suspects.length}</b> suspeitos</span>
        <span><b>${(c.rooms || []).length}</b> divisões</span>
        ${r ? `<span><b>${r}×${cc}</b> grelha</span>` : ""}
        ${BOARDS[c.id] ? `<span>· tabuleiro ✓</span>` : ""}
        ${WALKTHROUGHS[c.id] ? `<span>· resolução ✓</span>` : ""}
      </div>
    </a>
  `);
  return card;
}

/* ============================ CASE DETAIL ============================ */
function renderCase(c, isTutorial) {
  app.innerHTML = "";
  const wrap = el(`<div class="wrap"></div>`);
  app.append(wrap);

  const isBonus = typeof c.id === "string";
  wrap.append(el(`<a class="back" href="#/${isTutorial ? "" : "casos"}">← ${isTutorial ? "Início" : "Todos os casos"}</a>`));
  wrap.append(el(`
    <div class="case-head">
      <div class="num">${isTutorial ? "CASO DE TREINO" : isBonus ? "BÓNUS" : "CASO " + String(c.id).padStart(2, "0")}</div>
      <h1>${esc(c.title)}</h1>
      <p class="sub">${esc(c.subtitle || "")}</p>
    </div>
  `));

  if (isTutorial) {
    wrap.append(el(`
      <div class="note-box" style="margin-top:14px">
        <b>Objetivo:</b> ${esc(RULES.objetivo)} Coloca os 3 suspeitos na grelha 4×4 usando as pistas.
        A vítima fica na última célula livre; quem estiver sozinho com ela na mesma divisão é o assassino.
      </div>
    `));
  }

  const layout = el(`<div class="layout"></div>`);
  wrap.append(layout);

  /* ---- LEFT: interactive board / grid ---- */
  const board = BOARDS[c.id];
  const scanName = c.scan || (isTutorial ? "tutorial" : "case" + c.id);
  const left = el(`<div class="panel"><h4>${board ? "Tabuleiro" : "Grelha de dedução"}
    <button class="scan-link" data-scan="${scanName}">ver página do livro ↗</button></h4></div>`);
  left.querySelector(".scan-link").addEventListener("click", () => openScan(scanName, c.title));
  let boardApi = null;
  if (board) { const b = buildAuthBoard(c, board); left.append(b.node); boardApi = b.api; }
  else left.append(buildGrid(c));
  layout.append(left);

  /* ---- RIGHT: clues + rooms + reveal ---- */
  const right = el(`<div></div>`);
  layout.append(right);

  const clues = el(`<div class="panel"><h4>Suspeitos &amp; pistas</h4></div>`);
  c.suspects.forEach((s, i) => {
    clues.append(el(`
      <div class="suspect">
        <div class="tok" style="color:${colorFor(i)}">${esc(initials(s.n))}</div>
        <div class="body"><div class="nm">${esc(s.n)}</div><div class="cl">${esc(s.c)}</div></div>
      </div>
    `));
  });
  clues.append(el(`
    <div class="suspect">
      <div class="tok victim">${esc(initials(c.victim))}</div>
      <div class="body"><div class="nm">${esc(c.victim)} <span style="color:var(--accent-2);font-size:11px">· VÍTIMA</span></div>
      <div class="cl victim">Estava na última célula restante — sozinha com o assassino.</div></div>
    </div>
  `));
  right.append(clues);

  if (c.general && c.general.length) {
    const g = el(`<div class="panel" style="margin-top:16px"><h4>Pistas gerais</h4><ul class="general-clues"></ul></div>`);
    c.general.forEach((t) => $("ul", g).append(el(`<li>${esc(t)}</li>`)));
    right.append(g);
  }

  const rooms = el(`<div class="panel" style="margin-top:16px"><h4>Divisões</h4><div class="rooms"></div></div>`);
  (c.rooms || []).forEach((rm) => $(".rooms", rooms).append(el(`<span>${esc(rm)}</span>`)));
  if (c.note) rooms.append(el(`<div class="note-box">${esc(c.note)}</div>`));
  right.append(rooms);

  right.append(buildKillerPanel(c, boardApi));
}

/* ---------------- password (2nd letter of each suspect name, in order) ---------------- */
function passwordFor(c) {
  return c.suspects.map((s) => (s.n[1] || "")).join("").toLowerCase();
}
function askPassword(c) {
  return new Promise((resolve) => {
    const modal = el(`
      <div class="pw-overlay">
        <div class="pw-box glass">
          <div class="pw-title">Palavra-passe da solução</div>
          <input type="password" autocomplete="off" placeholder="••••••">
          <div class="pw-err"></div>
          <div class="pw-actions"><button class="mini" data-a="cancel">Cancelar</button><button class="btn primary" data-a="ok">Confirmar</button></div>
        </div>
      </div>
    `);
    const inp = $("input", modal), err = $(".pw-err", modal);
    const done = (v) => { modal.remove(); resolve(v); };
    const submit = () => {
      if (inp.value.trim().toLowerCase() === passwordFor(c)) done(true);
      else { err.textContent = "Palavra-passe errada."; inp.select(); }
    };
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.dataset.a === "cancel") done(false);
      if (e.target.dataset.a === "ok") submit();
    });
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") done(false); });
    document.body.append(modal);
    inp.focus();
  });
}

function walkHtml(c) {
  return WALKTHROUGHS[c.id]
    ? `<div class="walk"><ol>${WALKTHROUGHS[c.id].map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>`
    : `<div class="walk" style="color:var(--text-mute);font-size:12px;margin-top:10px">Resolução passo-a-passo ainda não transcrita — consulta as páginas de solução do livro.</div>`;
}

/* ---------------- "O assassino" panel: pick + verify, then password reveal ---------------- */
function buildKillerPanel(c, boardApi) {
  const box = el(`<div class="panel" style="margin-top:16px"><h4>O assassino</h4></div>`);
  const holder = el(`<div></div>`);
  box.append(holder);

  const savedGuess = LS.get(guessKey(c.id), "");
  const pickRow = el(`
    <div class="killer-pick">
      <select>
        <option value="">— escolhe o assassino —</option>
        ${c.suspects.map((s) => `<option ${s.n === savedGuess ? "selected" : ""}>${esc(s.n)}</option>`).join("")}
      </select>
      <button class="btn primary" data-a="verify" disabled>Verificar</button>
    </div>
  `);
  const verdict = el(`<div class="verdict"></div>`);
  const sel = $("select", pickRow), vbtn = $('[data-a="verify"]', pickRow);
  vbtn.disabled = !sel.value;
  sel.addEventListener("change", () => {
    vbtn.disabled = !sel.value;
    LS.set(guessKey(c.id), sel.value);
    verdict.textContent = ""; verdict.className = "verdict";
  });
  vbtn.addEventListener("click", () => {
    const pick = sel.value;
    if (!pick) return;
    if (boardApi) {
      const boardOk = boardApi.flashCheck();
      if (!boardOk) {
        verdict.className = "verdict wrong";
        verdict.textContent = "Ainda há posições erradas ou em falta no tabuleiro (a vítima também conta).";
      } else if (pick !== c.killer) {
        verdict.className = "verdict wrong";
        verdict.textContent = "As posições no tabuleiro estão certas — mas esse não é o assassino.";
      } else {
        verdict.className = "verdict right";
        verdict.textContent = "✓ Tudo certo! Caso resolvido.";
        LS.set(solvedKey(c.id), true);
      }
    } else {
      if (pick === c.killer) {
        verdict.className = "verdict right";
        verdict.textContent = "✓ Certo! Caso resolvido.";
        LS.set(solvedKey(c.id), true);
      } else {
        verdict.className = "verdict wrong";
        verdict.textContent = "✕ Esse não é o assassino. Continua a investigar.";
      }
    }
  });
  holder.append(pickRow, verdict);

  function showReveal() {
    holder.innerHTML = "";
    holder.append(el(`
      <div class="reveal-box">
        <div class="who">O assassino é…</div>
        <div class="name">${esc(c.killer)}</div>
        ${walkHtml(c)}
      </div>
    `));
  }
  const sp = el(`<div class="spoiler" style="margin-top:14px">Preferes desistir? <button>Revelar solução</button></div>`);
  sp.querySelector("button").addEventListener("click", async () => {
    if (await askPassword(c)) { LS.set(guessKey(c.id), c.killer); showReveal(); }
  });
  holder.append(sp);
  return box;
}

/* ============================ SCAN LIGHTBOX ============================ */
function openScan(name, title) {
  const lb = el(`
    <div class="lightbox">
      <div class="lb-inner">
        <div class="lb-head"><span>${esc(title)} — página do livro</span><button class="lb-x">✕</button></div>
        <img src="/assets/pages/${name}.jpg" alt="Página do livro — ${esc(title)}">
      </div>
    </div>
  `);
  const close = () => lb.remove();
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-x")) close(); });
  document.addEventListener("keydown", function esc2(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc2); } });
  document.body.append(lb);
}

/* ============================ AUTHENTIC BOARD ============================ */
const ROOM_HUES = [200, 265, 340, 150, 35, 55, 300, 175, 240, 15];
const OCC_FURN = new Set(["bed", "chair", "rug", "towel", "car", "horse", "mud", "stool", "sofa", "oil"]);
const OBJ_LABEL = {
  tv: "Televisão", plant: "Planta", table: "Mesa", shelf: "Estante", box: "Caixa",
  bed: "Cama", chair: "Cadeira", rug: "Tapete", statue: "Estátua", present: "Presente",
  car: "Carro", horse: "Cavalo", cow: "Vaca", pig: "Porco", lion: "Leão", tree: "Árvore",
  trashcan: "Caixote do lixo", barrel: "Barril", cashreg: "Caixa registadora",
  register: "Caixa registadora", vase: "Vaso", punchbag: "Saco de boxe", locker: "Cacifo",
  boulder: "Pedregulho", rubble: "Entulho", weaponrack: "Suporte de armas",
  easel: "Cavalete", catapult: "Catapulta", towel: "Toalha", mud: "Lama", sofa: "Sofá", stool: "Banco",
  bath: "Banheira", sink: "Lavatório", toilet: "Sanita", counter: "Bancada", cabinet: "Armário",
  oil: "Mancha de óleo", car: "Carro",
};

function buildAuthBoard(c, board) {
  const { rows, cols } = board;
  const roomOf = {};
  board.rooms.forEach((rm, i) => rm.cells.forEach((k) => (roomOf[k] = i)));
  const suspects = c.suspects.map((s, i) => ({ ...s, i, color: colorFor(i), ini: initials(s.n) }));

  // multi-cell objects
  const multiOf = new Map();
  (board.multi || []).forEach((g) => {
    const rs = g.cells.map((k) => k.split(",").map(Number));
    const info = {
      t: g.t, cells: g.cells,
      minR: Math.min(...rs.map((p) => p[0])), maxR: Math.max(...rs.map((p) => p[0])),
      minC: Math.min(...rs.map((p) => p[1])), maxC: Math.max(...rs.map((p) => p[1])),
    };
    g.cells.forEach((k) => multiOf.set(k, info));
  });
  const isBlocked = (key) => {
    const g = multiOf.get(key);
    if (g) return NONOCC.has(g.t);
    return NONOCC.has(board.obj[key]);
  };

  let st = LS.get(gridKey(c.id), null);
  if (!st || !st.cells) st = { cells: {} };
  let tool = { mode: "place", who: 0 };
  let checkMap = null;
  const save = () => LS.set(gridKey(c.id), st);

  const root = el(`<div></div>`);

  const picker = el(`<div class="suspect-picker"></div>`);
  suspects.forEach((s) => picker.append(el(`<button data-i="${s.i}"><span class="sw" style="background:${s.color}"></span>${esc(s.n)}</button>`)));
  picker.append(el(`<button data-i="V" class="pick-victim"><span class="sw" style="background:var(--accent)"></span>${esc(c.victim)} · vítima</button>`));

  const tools = el(`
    <div class="grid-tools">
      <div class="group">
        <button class="tool-btn" data-mode="place" title="Posição definitiva — risca linha e coluna">Colocar</button>
        <button class="tool-btn" data-mode="guess" title="Hipótese (cinzento) — permite várias por pessoa">Hipótese</button>
        <button class="tool-btn" data-mode="x" title="Riscar célula à mão">✕</button>
        <button class="tool-btn" data-mode="note">Nota</button>
        <button class="tool-btn" data-mode="erase">Apagar</button>
      </div>
      <button class="mini" data-act="reveal">Revelar solução</button>
      <button class="mini" data-act="clear">Limpar</button>
    </div>
  `);

  const stage = el(`<div class="aboard-stage"></div>`);
  const verdict = el(`<div class="verdict"></div>`);
  const legend = el(`<div class="board-legend"></div>`);
  const hint = el(`<div class="grid-hint"><b>Colocar</b> = definitivo (risca linha/coluna e apaga as hipóteses dessa pessoa). <b>Hipótese</b> = vários palpites a cinzento. Coloca também a <b>vítima</b>. Quando tiveres tudo, escolhe o assassino em «O assassino» e carrega em <b>Verificar</b>.</div>`);
  root.append(picker, tools, stage, verdict, legend, hint);

  function selectionUI() {
    const needsWho = tool.mode === "place" || tool.mode === "guess";
    picker.querySelectorAll("button").forEach((b) => b.classList.toggle("sel", needsWho && b.dataset.i === String(tool.who)));
    tools.querySelectorAll(".tool-btn").forEach((b) => {
      const on = b.dataset.mode === tool.mode;
      b.classList.toggle("sel", on);
      b.classList.toggle("x", on && tool.mode === "x");
      b.classList.toggle("note", on && tool.mode === "note");
      b.classList.toggle("guess", on && tool.mode === "guess");
    });
  }

  function wall(r, cc, side) {
    const map = { N: [r - 1, cc], E: [r, cc + 1], S: [r + 1, cc], W: [r, cc - 1] };
    const [nr, nc] = map[side];
    if (nr < 1 || nr > rows || nc < 1 || nc > cols) return true;
    return roomOf[nr + "," + nc] !== roomOf[r + "," + cc];
  }

  // rebuild automatic ✕ from firm placements (suspects + firm victim)
  function recomputeAutoX() {
    for (const k of Object.keys(st.cells)) {
      if (st.cells[k]?.kind === "x" && st.cells[k].auto) delete st.cells[k];
    }
    for (const [k, v] of Object.entries(st.cells)) {
      const firm = v?.kind === "place" || (v?.kind === "victim" && !v.guess);
      if (!firm) continue;
      const [r, cc] = k.split(",").map(Number);
      const mark = (rr, ccc) => {
        const kk = rr + "," + ccc;
        if (kk === k || isBlocked(kk)) return;
        if (!st.cells[kk]) st.cells[kk] = { kind: "x", auto: true };
      };
      for (let i = 1; i <= cols; i++) mark(r, i);
      for (let i = 1; i <= rows; i++) mark(i, cc);
    }
  }

  function commit() { recomputeAutoX(); save(); draw(); }

  function draw() {
    const wrap = el(`<div class="aboard-wrap"></div>`);
    const grid = el(`<div class="aboard" style="grid-template-columns:repeat(${cols},1fr)"></div>`);
    for (let r = 1; r <= rows; r++) {
      for (let cc = 1; cc <= cols; cc++) {
        const key = r + "," + cc;
        const ri = roomOf[key];
        const cell = el(`<div class="acell" data-key="${key}"></div>`);
        cell.style.background = ri == null ? "var(--bg)" : `hsl(${ROOM_HUES[ri % ROOM_HUES.length]} 34% 15%)`;
        ["N", "E", "S", "W"].forEach((s) => { if (wall(r, cc, s)) cell.classList.add("w" + s); });

        const mg = multiOf.get(key);
        if (mg) {
          if (NONOCC.has(mg.t)) cell.classList.add("blk");
          if (mg.t === "bed") cell.classList.add("has-bed");
          if (mg.t === "rug") cell.classList.add("has-rug");
          if (r === mg.minR && cc === mg.minC) {
            const w = mg.maxC - mg.minC + 1, h = mg.maxR - mg.minR + 1;
            const vert = h >= w;
            const mo = el(`<span class="multi-obj" style="width:${w * 100}%;height:${h * 100}%"></span>`);
            if (mg.t === "bed") mo.append(el(`<span class="bed-shape ${vert ? "v" : "h"}"></span>`));
            else if (mg.t === "rug") mo.append(el(`<span class="rug-shape"></span>`));
            else mo.append(el(`<span class="oicon" style="font-size:clamp(24px,${(vert ? h : w) * 4}vw,44px)">${ICON[mg.t] || "▪"}</span>`));
            cell.append(mo);
          }
        } else {
          const o = board.obj[key];
          if (o) {
            if (o === "rug") cell.classList.add("has-rug");
            else if (o === "oil") cell.classList.add("has-oil");
            else if (o === "bed") { cell.classList.add("has-bed"); cell.append(el(`<span class="oicon">${ICON.bed}</span>`)); }
            else cell.append(el(`<span class="oicon">${ICON[o] || "▪"}</span>`));
            if (NONOCC.has(o)) cell.classList.add("blk");
          }
        }

        board.windows.forEach((win) => {
          const [wr, wc, ws] = win.split(",");
          if (+wr === r && +wc === cc) cell.append(el(`<span class="win win-${ws}"></span>`));
        });

        const cs = st.cells[key];
        if (cs) {
          if (cs.kind === "place" || cs.kind === "guess") {
            const s = suspects[cs.who];
            if (s) cell.append(el(`<span class="tok-badge ${cs.kind === "guess" ? "guess" : ""}" style="--tc:${s.color}">${esc(s.ini)}</span>`));
          } else if (cs.kind === "victim") {
            cell.append(el(`<span class="tok-badge victim ${cs.guess ? "guess" : ""}">${esc(initials(c.victim))}</span>`));
          } else if (cs.kind === "x") cell.append(el(`<span class="cell-x ${cs.auto ? "auto" : ""}">✕</span>`));
          else if (cs.kind === "note") cell.append(el(`<span class="cell-note">${esc(cs.text)}</span>`));
        }
        if (checkMap && checkMap[key]) cell.classList.add("chk-" + checkMap[key]);
        grid.append(cell);
      }
    }
    wrap.append(grid);

    // room labels: bottom edge of a central cell of the room that has NO window nearby
    const winTouch = new Set();
    board.windows.forEach((win) => {
      const [wr, wc, ws] = win.split(",");
      const R = +wr, C = +wc;
      winTouch.add(R + "," + C);
      const nb = { N: [R - 1, C], S: [R + 1, C], E: [R, C + 1], W: [R, C - 1] }[ws];
      if (nb) winTouch.add(nb[0] + "," + nb[1]);
    });
    const labels = el(`<div class="room-labels"></div>`);
    board.rooms.forEach((rm) => {
      const rs = rm.cells.map((k) => k.split(",").map(Number));
      const rowNums = [...new Set(rs.map((p) => p[0]))].sort((a, b) => b - a); // bottom-up
      const hasObj = (k) => !!board.obj[k] || multiOf.has(k);
      let x = null, y = null;
      // 1st pass: no window AND no object; 2nd pass: just no window
      for (const strict of [true, false]) {
        for (const row of rowNums) {
          const colsInRow = rs.filter((p) => p[0] === row).map((p) => p[1]).sort((a, b) => a - b);
          const centerC = (colsInRow[0] + colsInRow[colsInRow.length - 1]) / 2;
          const ordered = [...colsInRow].sort((a, b) => Math.abs(a - centerC) - Math.abs(b - centerC));
          const col = ordered.find((cn) => !winTouch.has(row + "," + cn) && (!strict || !hasObj(row + "," + cn)));
          if (col != null) { x = (col - 0.5) / cols * 100; y = row / rows * 100; break; }
        }
        if (x != null) break;
      }
      if (x == null) { // everything touches a window — fall back to plain centroid bottom
        const maxR = Math.max(...rs.map((p) => p[0]));
        x = (rs.reduce((s, p) => s + p[1], 0) / rs.length - 0.5) / cols * 100;
        y = maxR / rows * 100;
      }
      const lab = el(`<span class="rlabel">${esc(rm.name)}</span>`);
      lab.style.left = x + "%";
      lab.style.top = y + "%";
      labels.append(lab);
    });
    wrap.append(labels);

    stage.innerHTML = "";
    stage.append(wrap);
    drawLegend();
  }

  function drawLegend() {
    const types = [...new Set([...Object.values(board.obj), ...(board.multi || []).map((g) => g.t)])];
    types.sort((a, b) => (OCC_FURN.has(a) === OCC_FURN.has(b) ? 0 : OCC_FURN.has(a) ? -1 : 1));
    legend.innerHTML = "";
    legend.append(el(`<span class="lg-title">Objetos</span>`));
    types.forEach((t) => {
      const occ = OCC_FURN.has(t);
      const ic = t === "rug" ? "▦" : t === "oil" ? "⬤" : (ICON[t] || "▪");
      legend.append(el(`<span class="lg-item ${occ ? "occ" : "blk"}"><i>${ic}</i>${esc(OBJ_LABEL[t] || t)}<b>${occ ? "ocupável" : "bloqueado"}</b></span>`));
    });
    if (board.windows.length) legend.append(el(`<span class="lg-item occ"><i class="lg-win"></i>Janela<b>na borda</b></span>`));
    legend.append(el(`<span class="lg-item occ"><i>·</i>Chão livre<b>ocupável</b></span>`));
  }

  function shake(cell) {
    cell.animate([{ transform: "translateX(-3px)" }, { transform: "translateX(3px)" }, { transform: "translateX(0)" }], 150);
  }

  stage.addEventListener("click", (e) => {
    const cell = e.target.closest(".acell"); if (!cell) return;
    const key = cell.dataset.key;
    if (checkMap) { checkMap = null; }
    verdict.textContent = ""; verdict.className = "verdict";
    const m = tool.mode;

    if (m === "erase") { delete st.cells[key]; commit(); return; }

    if (m === "x") {
      const cur = st.cells[key];
      if (cur && (cur.kind === "place" || cur.kind === "guess" || cur.kind === "victim")) { shake(cell); return; }
      if (cur?.kind === "x" && !cur.auto) delete st.cells[key];
      else st.cells[key] = { kind: "x", auto: false };
      commit(); return;
    }

    if (m === "note") {
      const cur = st.cells[key]?.kind === "note" ? st.cells[key].text : "";
      const t = prompt("Nota:", cur || ""); if (t === null) return;
      if (!t.trim()) { if (st.cells[key]?.kind === "note") delete st.cells[key]; }
      else st.cells[key] = { kind: "note", text: t.trim().slice(0, 12) };
      commit(); return;
    }

    // place | guess
    if (isBlocked(key)) { shake(cell); return; }
    const isV = tool.who === "V";
    const ex = st.cells[key];

    if (m === "guess") {
      if (isV) {
        if (ex?.kind === "victim" && ex.guess) delete st.cells[key];
        else st.cells[key] = { kind: "victim", guess: true };
      } else {
        if (ex?.kind === "guess" && ex.who === tool.who) delete st.cells[key];
        else st.cells[key] = { kind: "guess", who: tool.who };
      }
      commit(); return;
    }

    // firm place: clears every firm+hypothesis of this identity, then toggles here
    const wasHere = ex && ((isV && ex.kind === "victim" && !ex.guess) || (!isV && ex.kind === "place" && ex.who === tool.who));
    for (const k of Object.keys(st.cells)) {
      const v = st.cells[k];
      if (isV) { if (v?.kind === "victim") delete st.cells[k]; }
      else if ((v?.kind === "place" || v?.kind === "guess") && v.who === tool.who) delete st.cells[k];
    }
    if (!wasHere) st.cells[key] = isV ? { kind: "victim" } : { kind: "place", who: tool.who };
    commit();
  });

  picker.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (tool.mode !== "place" && tool.mode !== "guess") tool.mode = "place";
    tool.who = b.dataset.i === "V" ? "V" : +b.dataset.i;
    selectionUI();
  });

  tools.addEventListener("click", async (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.mode) { tool.mode = b.dataset.mode; selectionUI(); return; }
    const act = b.dataset.act;

    if (act === "clear") {
      if (confirm("Limpar o tabuleiro deste caso?")) { st.cells = {}; checkMap = null; verdict.textContent = ""; save(); draw(); }
      return;
    }

    if (act === "reveal") {
      if (!(await askPassword(c))) { verdict.className = "verdict wrong"; verdict.textContent = "Palavra-passe errada — solução não revelada."; return; }
      st.cells = {};
      for (const [name, pos] of Object.entries(board.solution)) {
        if (name === "__VICTIM__") st.cells[pos] = { kind: "victim" };
        else { const idx = suspects.findIndex((s) => s.n === name); if (idx >= 0) st.cells[pos] = { kind: "place", who: idx }; }
      }
      checkMap = null; recomputeAutoX(); save(); draw();
      verdict.className = "verdict right";
      verdict.textContent = `A vítima (${c.victim}) ficou sozinha com ${c.killer}. ${c.killer} é o assassino.`;
      LS.set(guessKey(c.id), c.killer); LS.set(solvedKey(c.id), true);
      return;
    }

  });

  function firmCell(pred) { return Object.keys(st.cells).find((k) => pred(st.cells[k])); }
  function allCorrect() {
    for (const s of suspects) {
      const k = firmCell((v) => v?.kind === "place" && v.who === s.i);
      if (!k || board.solution[s.n] !== k) return false;
    }
    const vk = firmCell((v) => v?.kind === "victim" && !v.guess);
    return !!(vk && board.solution.__VICTIM__ === vk);
  }
  function flashCheck() {
    const ok = allCorrect();
    if (ok) {
      const map = {};
      for (const s of suspects) {
        const k = firmCell((v) => v?.kind === "place" && v.who === s.i);
        if (k) map[k] = "ok";
      }
      const vk = firmCell((v) => v?.kind === "victim" && !v.guess);
      if (vk) map[vk] = "ok";
      checkMap = map;
    } else checkMap = null;
    draw();
    return ok;
  }

  selectionUI();
  recomputeAutoX();
  draw();
  return { node: root, api: { allCorrect, flashCheck } };
}

/* ============================ DEDUCTION GRID ============================ */
function buildGrid(c) {
  const [defR, defC] = c.grid || [6, 6];
  let st = LS.get(gridKey(c.id), null);
  if (!st || !st.rows) st = { rows: defR, cols: defC, cells: {} };

  const suspects = c.suspects.map((s, i) => ({ ...s, i, color: colorFor(i), ini: initials(s.n) }));
  let tool = { mode: "place", who: 0 }; // modes: place | x | note | erase
  let autoX = LS.get("md.autoX", true);

  const root = el(`<div></div>`);

  const picker = el(`<div class="suspect-picker"></div>`);
  suspects.forEach((s) => {
    const b = el(`<button data-i="${s.i}"><span class="sw" style="background:${s.color}"></span>${esc(s.n)}</button>`);
    picker.append(b);
  });

  const tools = el(`
    <div class="grid-tools">
      <div class="group">
        <button class="tool-btn" data-mode="place">Colocar</button>
        <button class="tool-btn" data-mode="x">✕ Eliminar</button>
        <button class="tool-btn" data-mode="note">Nota</button>
        <button class="tool-btn" data-mode="erase">Apagar</button>
      </div>
      <button class="mini" data-act="auto">Auto-✕ linha/coluna: <b>${autoX ? "on" : "off"}</b></button>
      <button class="mini" data-act="rows-">− linha</button>
      <button class="mini" data-act="rows+">+ linha</button>
      <button class="mini" data-act="cols-">− coluna</button>
      <button class="mini" data-act="cols+">+ coluna</button>
      <button class="mini" data-act="clear">Limpar tudo</button>
    </div>
  `);

  const scroll = el(`<div class="board-scroll"></div>`);
  const hint = el(`<div class="grid-hint">Escolhe um suspeito e o modo <b>Colocar</b>, depois clica nas células. A grelha guarda-se automaticamente.</div>`);

  root.append(picker, tools, scroll, hint);

  function save() { LS.set(gridKey(c.id), st); }

  function selectionUI() {
    picker.querySelectorAll("button").forEach((b) => b.classList.toggle("sel", tool.mode === "place" && +b.dataset.i === tool.who));
    tools.querySelectorAll(".tool-btn").forEach((b) => {
      const on = b.dataset.mode === tool.mode;
      b.classList.toggle("sel", on);
      b.classList.toggle("x", on && tool.mode === "x");
      b.classList.toggle("note", on && tool.mode === "note");
    });
  }

  function draw() {
    const t = document.createElement("table");
    t.className = "dgrid";
    // header row
    const head = t.insertRow();
    head.insertCell().className = "corner";
    for (let cx = 1; cx <= st.cols; cx++) { const d = head.insertCell(); d.className = "hdr"; d.textContent = "C" + cx; }
    for (let rx = 1; rx <= st.rows; rx++) {
      const tr = t.insertRow();
      const rh = tr.insertCell(); rh.className = "hdr"; rh.textContent = "L" + rx;
      for (let cx = 1; cx <= st.cols; cx++) {
        const key = rx + "," + cx;
        const cell = st.cells[key];
        const td = tr.insertCell();
        td.dataset.key = key;
        if (cell) {
          if (cell.kind === "place") {
            const s = suspects[cell.who];
            if (s) { td.textContent = s.ini; td.style.color = s.color; td.classList.add("placed"); }
          } else if (cell.kind === "x") {
            td.classList.add("x");
          } else if (cell.kind === "note") {
            td.append(el(`<span class="note">${esc(cell.text || "")}</span>`));
          }
        }
      }
    }
    scroll.innerHTML = "";
    scroll.append(t);
  }

  scroll.addEventListener("click", (e) => {
    const td = e.target.closest("td");
    if (!td || !td.dataset.key) return;
    const key = td.dataset.key;
    if (tool.mode === "erase") { delete st.cells[key]; }
    else if (tool.mode === "x") {
      st.cells[key] = st.cells[key]?.kind === "x" ? undefined : { kind: "x" };
      if (!st.cells[key]) delete st.cells[key];
    }
    else if (tool.mode === "note") {
      const cur = st.cells[key]?.kind === "note" ? st.cells[key].text : "";
      const txt = prompt("Nota nesta célula:", cur || "");
      if (txt === null) return;
      if (txt.trim() === "") delete st.cells[key];
      else st.cells[key] = { kind: "note", text: txt.trim().slice(0, 14) };
    }
    else { // place
      const existing = st.cells[key];
      if (existing?.kind === "place" && existing.who === tool.who) { delete st.cells[key]; }
      else {
        // remove this suspect from anywhere else
        for (const k of Object.keys(st.cells)) if (st.cells[k]?.kind === "place" && st.cells[k].who === tool.who) delete st.cells[k];
        st.cells[key] = { kind: "place", who: tool.who };
        if (autoX) {
          const [rx, cx] = key.split(",").map(Number);
          for (let i = 1; i <= st.cols; i++) { const k = rx + "," + i; if (k !== key && !st.cells[k]) st.cells[k] = { kind: "x" }; }
          for (let i = 1; i <= st.rows; i++) { const k = i + "," + cx; if (k !== key && !st.cells[k]) st.cells[k] = { kind: "x" }; }
        }
      }
    }
    save(); draw();
  });

  picker.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    tool = { mode: "place", who: +b.dataset.i };
    selectionUI();
  });

  tools.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.mode) { tool.mode = b.dataset.mode; selectionUI(); return; }
    const act = b.dataset.act;
    if (act === "auto") { autoX = !autoX; LS.set("md.autoX", autoX); b.innerHTML = `Auto-✕ linha/coluna: <b>${autoX ? "on" : "off"}</b>`; }
    else if (act === "rows+") { st.rows = Math.min(14, st.rows + 1); }
    else if (act === "rows-") { st.rows = Math.max(3, st.rows - 1); pruneOut(); }
    else if (act === "cols+") { st.cols = Math.min(14, st.cols + 1); }
    else if (act === "cols-") { st.cols = Math.max(3, st.cols - 1); pruneOut(); }
    else if (act === "clear") { if (confirm("Limpar toda a grelha deste caso?")) st.cells = {}; }
    save(); draw();
  });

  function pruneOut() {
    for (const k of Object.keys(st.cells)) {
      const [r, cc] = k.split(",").map(Number);
      if (r > st.rows || cc > st.cols) delete st.cells[k];
    }
  }

  tool = { mode: "place", who: 0 };
  selectionUI();
  draw();
  return root;
}

/* ============================ RULES ============================ */
function renderRules() {
  app.innerHTML = "";
  app.append(el(`
    <div class="wrap">
      <div class="case-head">
        <div class="num">MANUAL</div>
        <h1>Como se joga</h1>
        <p class="sub">Bem-vindo, inspetor. Houve — sim, adivinhaste — um homicídio ontem à noite.</p>
      </div>
      <div class="prose">
        <h2>O teu objetivo</h2>
        <p>${esc(RULES.objetivo)}</p>

        <h2>Regras</h2>
        <ul>${RULES.regras.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>

        <h2>Lista de objetos</h2>
        <div class="obj-cols">
          <div class="box ok"><h4>Podem ser ocupados</h4>${RULES.objetos.ocupaveis.map((o) => `<div>• ${esc(o)}</div>`).join("")}</div>
          <div class="box no"><h4>Não podem ser ocupados</h4>${RULES.objetos.naoOcupaveis.map((o) => `<div>• ${esc(o)}</div>`).join("")}</div>
        </div>
        <p><b>Janela:</b> ${esc(RULES.objetos.janela)}</p>

        <h2>Dicas avançadas</h2>
        ${RULES.dicas.map((d) => `<h3>${esc(d.t)}</h3><p>${esc(d.d)}</p>`).join("")}

        <h2>Glossário de palavras-chave</h2>
        <div class="glossary">
          ${RULES.glossario.map(([k, v]) => `<div class="row"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("")}
        </div>

        <p style="margin-top:26px"><a class="btn primary" href="#/treino">Praticar com o caso de treino →</a></p>
      </div>
    </div>
  `));
}

/* ============================ go ============================ */
router();
