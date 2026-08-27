// Render pages of the Murdoku PDF to PNGs, and crop rectangles.
// mupdf-wasm renders the page; @napi-rs/canvas does cropping/scaling.
// Usage:
//   node tools/render.mjs page <n> [scale]
//   node tools/render.mjs range <a> <b> [scale]
//   node tools/render.mjs crop <n> <sx> <sy> <sw> <sh> <out> [scale] [outMaxW]
import fs from "node:fs";
import path from "node:path";
import * as mupdf from "mupdf";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const PDF = "/Users/pedrosantos/Downloads/ilide.info-murdoku-1-pt-pt-pr_a25b124de4f7aa8ad7bb189a2cd7cb7b.pdf";
const OUT = path.resolve("tools/pages");
fs.mkdirSync(OUT, { recursive: true });

const buf = fs.readFileSync(PDF);
const doc = mupdf.Document.openDocument(new Uint8Array(buf), "application/pdf");

function pagePNG(n, scale) {
  const page = doc.loadPage(n - 1);
  const pm = page.toPixmap(mupdf.Matrix.scale(scale, scale), mupdf.ColorSpace.DeviceRGB, false, true);
  return pm.asPNG();
}

const [, , cmd, ...a] = process.argv;

if (cmd === "page" || cmd === "range") {
  const [x, y] = cmd === "page" ? [+a[0], +a[0]] : [+a[0], +a[1]];
  const s = +(cmd === "page" ? a[1] : a[2]) || 2.2;
  for (let n = x; n <= y; n++) {
    const f = path.join(OUT, `p${n}.png`);
    fs.writeFileSync(f, pagePNG(n, s));
    console.log(f);
  }
} else if (cmd === "crop") {
  // crop <n> <sx> <sy> <sw> <sh> <out> [scale] [outMaxW] [gridRxC]
  const n = +a[0], sx = +a[1], sy = +a[2], sw = +a[3], sh = +a[4], out = a[5];
  const s = +a[6] || 2.2;
  const outMaxW = +a[7] || 0;
  const grid = a[8]; // "6x6" -> draw guide lines
  const img = await loadImage(pagePNG(n, s));
  let dw = sw, dh = sh;
  if (outMaxW && sw > outMaxW) { dw = outMaxW; dh = Math.round(sh * outMaxW / sw); }
  const cv = createCanvas(dw, dh);
  const ctx = cv.getContext("2d");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
  if (grid) {
    const [gr, gc] = grid.split("x").map(Number);
    ctx.strokeStyle = "rgba(255,0,80,.85)"; ctx.lineWidth = 1;
    for (let i = 0; i <= gc; i++) { const x = Math.round(i * dw / gc) + .5; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, dh); ctx.stroke(); }
    for (let i = 0; i <= gr; i++) { const y = Math.round(i * dh / gr) + .5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(dw, y); ctx.stroke(); }
  }
  const outPath = path.resolve(out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, cv.toBuffer("image/png"));
  console.log(outPath, `${dw}x${dh}`);
} else if (cmd === "refpages") {
  // refpages  -> assets/pages/caseNN.jpg (loose crop of the board side of each spread)
  const s = 2.0, Q = 72, outW = 880;
  const dir = path.resolve("assets/pages");
  fs.mkdirSync(dir, { recursive: true });
  const jobs = [["tutorial", 4], ["tutorial5", 5]];
  for (let id = 1; id <= 80; id++) jobs.push(["case" + id, 5 + id]);
  for (const [name, pageNo] of jobs) {
    const img = await loadImage(pagePNG(pageNo, s));
    const W = img.width, H = img.height;
    // board sits on the right page of the spread
    const sx = Math.round(W * 0.47), sw = W - sx;
    const sy = Math.round(H * 0.02), sh = Math.round(H * 0.94);
    const dw = outW, dh = Math.round(sh * outW / sw);
    const cv = createCanvas(dw, dh);
    cv.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
    const f = path.join(dir, name + ".jpg");
    fs.writeFileSync(f, cv.toBuffer("image/jpeg", Q));
    console.log(f);
  }
} else {
  console.log("cmds: page | range | crop | refpages");
}
