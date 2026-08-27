// Tabuleiros autênticos, reconstruídos a partir das ilustrações do livro.
// Cada caso: divisões (retângulos ou lista de células), objetos por célula,
// janelas nas bordas, e a solução (posição de cada suspeito + vítima).
//
// obj: tipos que NÃO podem ser ocupados -> tv, plant, table, shelf, box, statue,
//      present, easel, catapult, weaponrack, vase, locker, punchbag, boulder,
//      rubble, tree, trashcan, barrel, lion, cow, pig, gaspump, register, cashreg
//      tipos ocupáveis (mostrados, mas pisáveis) -> bed, chair, rug, sofa, towel,
//      car, horse, mud, stool
// windows: "r,c,LADO" com LADO em N|E|S|W (borda dessa célula)
// solution: { "Nome": "linha,coluna", ..., "__VICTIM__": "linha,coluna" }

const rect = (r0, c0, r1, c1) => {
  const cells = [];
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) cells.push(r + "," + c);
  return cells;
};

export const NONOCC = new Set([
  "tv", "plant", "table", "shelf", "box", "statue", "present", "easel", "catapult",
  "weaponrack", "vase", "locker", "punchbag", "boulder", "rubble", "tree",
  "trashcan", "barrel", "lion", "cow", "pig", "gaspump", "register", "cashreg",
]);

export const ICON = {
  tv: "📺", plant: "🪴", table: "🟫", shelf: "📚", box: "📦", statue: "🗿",
  present: "🎁", bed: "🛏️", chair: "🪑", car: "🚗", horse: "🐴", cow: "🐄",
  pig: "🐖", lion: "🦁", tree: "🌲", trashcan: "🗑️", barrel: "🛢️",
  cashreg: "🧾", register: "🧾", vase: "🏺", punchbag: "🥊", locker: "🔒",
  boulder: "🪨", rubble: "🧱", weaponrack: "⚔️", easel: "🖼️", catapult: "🎯",
  towel: "🧣", mud: "🟤", sofa: "🛋️", stool: "🪑",
};

export const BOARDS = {
  // ---- Caso de treino ----
  0: {
    rows: 4, cols: 4,
    rooms: [
      { name: "Sala de Estar", cells: rect(1, 1, 2, 4) },
      { name: "Quarto Principal", cells: rect(3, 1, 4, 4) },
    ],
    obj: {
      "1,1": "table", "1,4": "plant",
      "2,4": "tv",
      "3,1": "plant", "3,4": "bed",
      "4,2": "rug",
    },
    windows: ["4,2,S"],
    solution: { "Charlene": "4,2", "Austin": "2,1", "Brycen": "3,4", "__VICTIM__": "1,3" },
  },

  // ---- Caso 1 · O teu primeiro caso ----
  1: {
    rows: 6, cols: 6,
    rooms: [
      { name: "Sala de Estar", cells: rect(1, 1, 3, 3) },
      { name: "Quarto Principal", cells: rect(1, 4, 3, 6) },
      { name: "Hall de Entrada", cells: rect(4, 1, 6, 3) },
      { name: "Sala de Jantar", cells: rect(4, 4, 6, 6) },
    ],
    obj: {
      "2,3": "rug",
      "4,1": "tv", "6,1": "tv", "5,3": "plant",
      "4,6": "tv", "5,6": "plant",
    },
    multi: [{ t: "bed", cells: ["2,5", "3,5"] }],
    windows: ["1,2,N", "1,5,N"],
    solution: {
      "Axel": "1,2", "Bella": "5,1", "Cora": "2,3",
      "Douglas": "3,5", "Ella": "6,6", "__VICTIM__": "4,4",
    },
  },
};
