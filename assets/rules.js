// Regras e glossário — transcritos das páginas iniciais e finais do livro.

export const RULES = {
  objetivo:
    "Identificar o assassino, descobrindo quem estava na mesma divisão que a vítima.",
  regras: [
    "Cada pessoa estava numa coluna e numa linha diferentes (como no Sudoku).",
    "Apenas camas, cadeiras e tapetes podem ser ocupados.",
    "Mesas, televisões e plantas NÃO podem ser ocupadas.",
    "A vítima encontra-se na última célula disponível. Quem estiver sozinho com ela na mesma divisão é o assassino.",
  ],
  objetos: {
    ocupaveis: ["Cadeira", "Tapete", "Cama"],
    naoOcupaveis: ["Mesa", "Televisão", "Planta", "Prateleira / Estante", "Caixa"],
    janela:
      "Uma janela é um objeto especial que só aparece sobre linhas grossas da grelha. Pode estar na extremidade da grelha ou entre duas células, caso em que está adjacente a ambas.",
  },
  dicas: [
    {
      t: "Analisa o puzzle linha a linha, coluna a coluna.",
      d: "Na maioria das grelhas há exatamente uma pessoa por linha e por coluna. Se vires uma linha ou coluna com apenas uma célula disponível, alguém tem de estar lá — mesmo que ainda não saibas quem.",
    },
    {
      t: "Analisa o puzzle divisão a divisão.",
      d: "Em vez de descobrires onde cada pessoa está, tenta ver quem pode ou não estar em cada divisão. Particularmente útil quando uma pista diz «Não há nenhuma divisão vazia».",
    },
    {
      t: "Elimina «células intersetadas».",
      d: "Se uma pessoa só pode ocupar duas células, imagina-as como cantos de um retângulo; ninguém mais pode ocupar os outros dois cantos. A mesma lógica aplica-se quando todas as células possíveis coincidem numa única célula.",
    },
  ],
  glossario: [
    ["Sozinho(a)", "Mais ninguém estava na divisão (nem sequer a vítima)."],
    ["Sozinho(a) com (b)", "Apenas estas duas pessoas estavam na divisão."],
    ["Vazio", "Ninguém estava na divisão (nem sequer a vítima)."],
    ["Ao lado de", "Diretamente por cima, por baixo, à esquerda ou à direita, na mesma divisão."],
    ["Canto", "Onde duas paredes de uma divisão se encontram."],
    ["Em frente a uma janela", "A célula está diretamente encostada a uma janela."],
    ["Linha", "Fila horizontal de células."],
    ["Coluna", "Fila vertical de células."],
    ["A oeste de / A leste de", "À esquerda / à direita, em qualquer coluna (não necessariamente adjacente)."],
    ["A norte de / A sul de", "Acima / abaixo, em qualquer linha (não necessariamente na mesma divisão)."],
    ["A única pessoa numa cadeira", "Ninguém mais estava numa cadeira, nem sequer a vítima. Aplica-se também a «único num tapete», «ao lado de uma mesa», etc."],
    ["Divisão", "Qualquer espaço fechado por bordas pretas — incluindo corredores, jacúzis, decks, etc."],
  ],
};
