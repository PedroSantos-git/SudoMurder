# Murdoku — 80 Crimes para Resolver · site interativo

Companion web **não-oficial** do livro *Murdoku — 80 Crimes para Resolver*
(Manuel Garand · Zero a Oito). Resolve cada caso de forma interativa: coloca
suspeitos numa grelha de dedução ao estilo Sudoku, marca eliminações e notas,
arrisca o assassino e confirma.

**Live:** deploy automático na Vercel a cada `push` para `main`.

## O que inclui

- **80 casos** + caso de treino, com todas as pistas dos suspeitos, pistas
  gerais e objetos especiais transcritos do livro.
- **Grelha de dedução interativa** — colocar / ✕ eliminar / nota a lápis /
  apagar, auto-✕ de linha e coluna, redimensionamento, e persistência em
  `localStorage` por caso.
- **Palpite & verificação** do assassino; progresso guardado localmente.
- **Regras + glossário** completos.
- **Resoluções passo-a-passo** (transcritas caso a caso — casos 1–24 feitos;
  restantes a caminho).

## Stack

Site 100% estático, sem build. HTML + CSS + JavaScript (ES modules). A Vercel
serve a pasta tal como está (`vercel.json` apenas ativa `cleanUrls`).

```
index.html
assets/
  styles.css        estilos
  app.js            router + vistas + grelha de dedução
  data.js           os 80 casos (CASES) + caso de treino
  rules.js          regras e glossário
  walkthroughs.js   resoluções passo-a-passo por id de caso
```

## Desenvolvimento

```bash
npx serve .        # ou qualquer servidor estático
```

## Adicionar / corrigir dados

Cada caso em `assets/data.js`:

```js
{
  id: 1,
  title: "O teu primeiro caso",
  subtitle: "frase de atmosfera",
  grid: [linhas, colunas],           // usado pela grelha interativa
  rooms: ["Sala de Estar", ...],
  suspects: [{ n: "Axel", c: "Estava em frente a uma janela." }, ...],
  victim: "Vincent",
  killer: "Ella",
  general: ["Não havia nenhuma divisão vazia."],   // opcional
  note: "Carro pode ser ocupado.",                 // opcional
}
```

Resoluções em `assets/walkthroughs.js`: `{ [id]: ["passo 1", "passo 2", ...] }`.

### Roadmap

- [ ] Transcrever resoluções dos casos 25–80.
- [ ] Camada de "tabuleiro autêntico" por caso (mobília, janelas, divisões
      poligonais) para verificação célula-a-célula contra a solução.

---

Todo o conteúdo dos puzzles pertence aos autores/editora originais. Este
projeto é uma ferramenta de apoio para quem já tem o livro.
