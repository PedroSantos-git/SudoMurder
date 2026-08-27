import { JSDOM } from "jsdom";
const dom = new JSDOM(`<!doctype html><html><body><main id="app"></main></body></html>`, { url: "http://localhost/", pretendToBeVisual: true });
const { window } = dom;
global.window = window; global.document = window.document;
global.location = window.location; global.localStorage = window.localStorage;
global.prompt = () => ""; global.confirm = () => true;
window.scrollTo = () => {};
if (!window.Element.prototype.animate) window.Element.prototype.animate = () => ({ finished: Promise.resolve() });
let failed = false;
window.addEventListener("error", (e) => { failed = true; console.error("window error:", e.error?.stack || e.message); });
process.on("unhandledRejection", (e) => { failed = true; console.error("rejection:", e); });

await import("../assets/app.js");
for (const r of ["#/", "#/casos", "#/regras", "#/treino", "#/caso/1", "#/caso/40", "#/caso/80"]) {
  window.location.hash = r;
  window.dispatchEvent(new window.Event("hashchange"));
  await new Promise((res) => setTimeout(res, 15));
  const html = document.getElementById("app").innerHTML;
  const ok = html.length > 200;
  console.log(r.padEnd(12), "len", html.length, ok ? "OK" : "!! EMPTY");
  if (!ok) failed = true;
}
window.location.hash = "#/caso/1";
window.dispatchEvent(new window.Event("hashchange"));
await new Promise((res) => setTimeout(res, 15));
const cells = document.querySelectorAll(".acell").length;
console.log("case1 board cells:", cells, "(expect 36)");
if (cells !== 36) failed = true;
// simulate placing a suspect on cell 1,2 then check
const cell = document.querySelector('.acell[data-key="1,2"]');
cell && cell.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((res) => setTimeout(res, 10));
console.log("after click, badges:", document.querySelectorAll(".tok-badge").length);
console.log(failed ? "\nSMOKE FAILED" : "\nSMOKE PASSED");
process.exit(failed ? 1 : 0);
