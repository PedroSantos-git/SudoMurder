import fs from "node:fs"; import path from "node:path";
import * as mupdf from "mupdf";
import { createCanvas, loadImage } from "@napi-rs/canvas";
const [,, pdf, cmd, ...a] = process.argv;
const doc = mupdf.Document.openDocument(new Uint8Array(fs.readFileSync(pdf)), "application/pdf");
function pagePNG(n, s){ return doc.loadPage(n-1).toPixmap(mupdf.Matrix.scale(s,s), mupdf.ColorSpace.DeviceRGB, false, true).asPNG(); }
if (cmd === "page") {
  const n=+a[0], s=+a[1]||2.5;
  fs.writeFileSync("tools/pages/x.png", pagePNG(n,s));
  console.log("tools/pages/x.png");
} else if (cmd === "crop") {
  const n=+a[0], sx=+a[1], sy=+a[2], sw=+a[3], sh=+a[4], out=a[5], s=+a[6]||2.5, mw=+a[7]||0, grid=a[8];
  const img = await loadImage(pagePNG(n,s));
  let dw=sw,dh=sh; if(mw && sw>mw){ dw=mw; dh=Math.round(sh*mw/sw); }
  const cv=createCanvas(dw,dh); const ctx=cv.getContext("2d");
  ctx.drawImage(img, sx,sy,sw,sh, 0,0,dw,dh);
  if(grid){ const [gr,gc]=grid.split("x").map(Number); ctx.strokeStyle="rgba(255,0,80,.9)"; ctx.lineWidth=1;
    for(let i=0;i<=gc;i++){const x=Math.round(i*dw/gc)+.5;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,dh);ctx.stroke();}
    for(let i=0;i<=gr;i++){const y=Math.round(i*dh/gr)+.5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(dw,y);ctx.stroke();}}
  fs.writeFileSync(out, cv.toBuffer("image/png")); console.log(out, dw+"x"+dh);
}
