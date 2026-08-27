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
  "bath", "sink", "toilet", "counter",
]);

export const ICON = {
  tv: "📺", plant: "🪴", table: "🟫", shelf: "📚", box: "📦", statue: "🗿",
  present: "🎁", bed: "🛏️", chair: "🪑", car: "🚗", horse: "🐴", cow: "🐄",
  pig: "🐖", lion: "🦁", tree: "🌲", trashcan: "🗑️", barrel: "🛢️",
  cashreg: "🧾", register: "🧾", vase: "🏺", punchbag: "🥊", locker: "🔒",
  boulder: "🪨", rubble: "🧱", weaponrack: "⚔️", easel: "🖼️", catapult: "🎯",
  towel: "🧣", mud: "🟤", sofa: "🛋️", stool: "🪑",
  bath: "🛁", sink: "🚰", toilet: "🚽", counter: "🍳",
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

  // ---- Caso 2 · Alojamento de férias ----
  2: {
    rows: 6, cols: 6,
    rooms: [
      { name: "Quarto Principal", cells: rect(1, 1, 4, 2) },
      { name: "Casa de Banho", cells: rect(1, 3, 4, 4) },
      { name: "Quarto de Hóspedes", cells: rect(1, 5, 4, 6) },
      { name: "Sala de Estar", cells: rect(5, 1, 6, 6) },
    ],
    obj: {
      "2,1": "chair",
      "1,3": "tv",
      "1,5": "tv", "2,6": "plant",
      "5,1": "plant", "6,1": "tv", "6,3": "tv",
    },
    multi: [
      { t: "bed", cells: ["3,1", "3,2"] },
      { t: "bed", cells: ["3,5", "3,6"] },
    ],
    windows: [],
    solution: {
      "Arianna": "6,2", "Brycen": "2,1", "Colleen": "1,4",
      "Dan": "3,6", "Evan": "4,5", "__VICTIM__": "5,3",
    },
  },

  // ---- Caso 3 · O pequeno-almoço inglês ----
  3: {
    rows: 6, cols: 6,
    rooms: [
      { name: "Quarto de Hóspedes", cells: ["1,1", "2,1", "3,1", "4,1", "5,1", "6,1", "5,2", "6,2"] },
      { name: "Casa de Banho", cells: ["1,2", "1,3", "1,4", "2,2", "2,3", "2,4"] },
      { name: "Quarto Principal", cells: ["3,2", "3,3", "3,4", "4,2", "4,3", "4,4"] },
      { name: "Cozinha", cells: ["1,5", "1,6", "2,5", "2,6", "3,5", "3,6"] },
      { name: "Sala de Estar", cells: ["4,5", "4,6", "5,3", "5,4", "5,5", "5,6", "6,3", "6,4", "6,5", "6,6"] },
    ],
    obj: {
      "2,4": "chair",
      "3,4": "table", "4,4": "rug",
      "3,5": "plant",
      "4,5": "plant",
      "5,3": "chair", "6,3": "tv",
    },
    multi: [
      { t: "bed", cells: ["1,1", "2,1"] },
      { t: "bath", cells: ["3,1", "4,1"] },
      { t: "bed", cells: ["4,2", "4,3"] },
      { t: "counter", cells: ["1,5", "1,6"] },
    ],
    windows: ["4,6,E"],
    solution: {
      "Alexander": "1,1", "Briggs": "2,5", "Carissa": "3,3",
      "Diana": "6,4", "Elsa": "4,6", "__VICTIM__": "5,2",
    },
  },

  // ---- Caso 4 · Quatro janelas ----
  4: {
    rows: 6, cols: 6,
    rooms: [
      { name: "Sala de Estar", cells: rect(1, 1, 3, 3) },
      { name: "Quarto Principal", cells: rect(1, 4, 3, 6) },
      { name: "Casa de Banho", cells: rect(4, 1, 6, 3) },
      { name: "Quarto de Hóspedes", cells: rect(4, 4, 6, 6) },
    ],
    obj: {
      "2,1": "chair", "2,2": "tv", "3,3": "tv",
      "2,6": "chair",
      "6,3": "tv",
      "4,5": "plant", "5,5": "plant", "5,6": "chair",
    },
    multi: [
      { t: "bed", cells: ["2,4", "2,5"] },
      { t: "table", cells: ["5,1", "5,2"] },
    ],
    windows: ["1,1,W", "6,1,W", "1,6,E", "6,6,E"],
    solution: {
      "Antonio": "1,3", "Ben": "5,6", "Chelsea": "6,1",
      "Dahlia": "2,5", "Emmy": "4,4", "__VICTIM__": "3,2",
    },
  },

  // ---- Caso 5 · Sessão de estudo ----
  5: {
    rows: 6, cols: 6,
    rooms: [
      { name: "Sala de Estar", cells: rect(1, 1, 6, 2) },
      { name: "Escritório", cells: rect(1, 3, 3, 4) },
      { name: "Casa de Banho", cells: rect(4, 3, 6, 4) },
      { name: "Quarto Principal", cells: rect(1, 5, 6, 6) },
    ],
    obj: {
      "1,1": "chair", "3,1": "chair", "5,1": "tv",
      "2,3": "chair", "3,3": "plant",
      "5,3": "table", "5,4": "chair", "6,3": "plant",
      "3,6": "table", "6,6": "table",
    },
    multi: [{ t: "bed", cells: ["4,5", "4,6"] }],
    windows: ["1,1,N", "1,6,N", "4,1,W"],
    solution: {
      "Aaron": "4,5", "Bruno": "2,3", "Clara": "1,6",
      "Donna": "6,4", "Evelyn": "5,2", "__VICTIM__": "3,1",
    },
  },
};
