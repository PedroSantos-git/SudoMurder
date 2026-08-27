import { CASES, TUTORIAL_CASE } from "./data.js";
import { RULES } from "./rules.js";
import { WALKTHROUGHS } from "./walkthroughs.js";

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
const allCases = () => [TUTORIAL_CASE, ...CASES];
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
  const solved = LS.get(solvedKey(c.id));
  const guess = LS.get(guessKey(c.id));
  const [r, cc] = c.grid || [];
  const badge = solved
    ? `<div class="badge-solved">RESOLVIDO</div>`
    : guess ? `<div class="badge-guess">PALPITE</div>` : "";
  const card = el(`
    <a class="case-card" href="#/${isTut ? "treino" : "caso/" + c.id}">
      ${badge}
      <div class="num">${isTut ? "TREINO" : "CASO " + String(c.id).padStart(2, "0")}</div>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.subtitle || "")}</p>
      <div class="meta">
        <span><b>${c.suspects.length}</b> suspeitos</span>
        <span><b>${(c.rooms || []).length}</b> divisões</span>
        ${r ? `<span><b>${r}×${cc}</b> grelha</span>` : ""}
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

  wrap.append(el(`<a class="back" href="#/${isTutorial ? "" : "casos"}">← ${isTutorial ? "Início" : "Todos os casos"}</a>`));
  wrap.append(el(`
    <div class="case-head">
      <div class="num">${isTutorial ? "CASO DE TREINO" : "CASO " + String(c.id).padStart(2, "0")}</div>
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

  /* ---- LEFT: interactive grid ---- */
  const left = el(`<div class="panel"><h4>Grelha de dedução</h4></div>`);
  left.append(buildGrid(c));
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

  right.append(buildReveal(c));
}

/* ---------------- reveal / guess panel ---------------- */
function buildReveal(c) {
  const box = el(`<div class="panel" style="margin-top:16px"><h4>O assassino</h4></div>`);
  const names = c.suspects.map((s) => s.n);
  const savedGuess = LS.get(guessKey(c.id), "");
  const solved = LS.get(solvedKey(c.id), false);

  const sel = el(`
    <div class="killer-select">
      <select>
        <option value="">— o teu palpite —</option>
        ${names.map((n) => `<option ${n === savedGuess ? "selected" : ""}>${esc(n)}</option>`).join("")}
      </select>
      <button class="mini" id="check">Verificar</button>
    </div>
  `);
  const verdict = el(`<div class="verdict"></div>`);
  box.append(sel, verdict);

  function showVerdict() {
    const g = LS.get(guessKey(c.id), "");
    if (!g) { verdict.className = "verdict"; verdict.textContent = ""; return; }
    if (g === c.killer) {
      verdict.className = "verdict right";
      verdict.textContent = `✓ Certo! ${c.killer} é o assassino.`;
      LS.set(solvedKey(c.id), true);
    } else {
      verdict.className = "verdict wrong";
      verdict.textContent = `✕ ${g} não é. Tenta outra vez.`;
    }
  }
  $("select", sel).addEventListener("change", (e) => { LS.set(guessKey(c.id), e.target.value); verdict.textContent = ""; verdict.className = "verdict"; });
  $("#check", sel).addEventListener("click", showVerdict);
  if (solved) showVerdict();

  // spoiler reveal
  const spoilerWrap = el(`<div style="margin-top:12px"></div>`);
  const btn = el(`<div class="spoiler">Preferes desistir? <button>Revelar solução</button></div>`);
  btn.querySelector("button").addEventListener("click", () => {
    const rb = el(`
      <div class="reveal-box">
        <div class="who">O assassino é…</div>
        <div class="name">${esc(c.killer)}</div>
        ${WALKTHROUGHS[c.id]
          ? `<div class="walk"><ol>${WALKTHROUGHS[c.id].map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>`
          : `<div class="walk" style="color:var(--text-mute);font-size:12px;margin-top:10px">Resolução passo-a-passo ainda não transcrita para este caso — consulta as páginas de solução do livro.</div>`}
      </div>
    `);
    spoilerWrap.innerHTML = "";
    spoilerWrap.append(rb);
    LS.set(guessKey(c.id), c.killer);
  });
  spoilerWrap.append(btn);
  box.append(spoilerWrap);
  return box;
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
