# ♟️ AI Chess Master

An interactive Chess game built with **Next.js** and **TypeScript**, featuring an AI opponent with multiple difficulty levels, move history, board flipping, and clear game status indicators.

---

## 🚀 Features

- Play against an AI opponent 🤖
- Multiple difficulty levels: Easy / Medium / Hard
- Flip the board to switch perspective
- Move history tracking
- Status indicators: Check, Checkmate, Draw
- Clean, responsive UI with Tailwind CSS

---

## 🖼️ Demo / Screenshots

Add screenshots or GIFs of gameplay here (e.g., `public/screenshots/`):
- Board view
- Move history panel
- Difficulty controls

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (TypeScript)
- **Styling:** Tailwind CSS
- **AI Engine:** Minimax with alpha–beta pruning (difficulty = search depth)
- **Package Manager:** pnpm (recommended)

---

## 📂 Project Structure

```
AI_Chess_Master/
├── app/                      # Next.js app routes, pages & layouts
│   ├── page.tsx              # main entry point
│   └── api/                  # backend routes (if used)
├── components/               # UI components
│   ├── ChessBoard/           # board, square, piece components
│   ├── Controls/             # difficulty, reset, flip
│   ├── MoveHistory/          # history UI
│   └── StatusDisplay/        # check, checkmate, draw
├── lib/                      # core logic & helpers
│   ├── chessLogic/           # move validation, AI engine
│   └── types/                # TypeScript types
├── public/                   # static assets (icons, images)
├── styles/                   # Tailwind + global styles
├── next.config.mjs           # Next.js config
├── tailwind.config.ts        # Tailwind config
├── tsconfig.json             # TypeScript config
├── package.json              # dependencies & scripts
├── pnpm-lock.yaml            # lockfile
└── README.md                 # project docs
```

---

## 🏗️ System Architecture

```
┌──────────────────────────────┐
│          UI Layer            │  ← React components (board, controls, status)
└──────────────┬───────────────┘
               │
┌──────────────┴───────────────┐
│   Game State & Logic Layer   │  ← rules, move validation, AI engine
│    (Minimax + pruning)       │
└──────────────┬───────────────┘
               │
┌──────────────┴───────────────┐
│   Utility / Helper Modules   │  ← move gen, history, eval fn
└──────────────┬───────────────┘
               │
┌──────────────┴───────────────┐
│        Styling / Assets      │  ← Tailwind, icons, assets
└──────────────────────────────┘
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js >= 18
- pnpm installed (`npm i -g pnpm`) or use npm/yarn

### Installation

```bash
# clone the repo
git clone https://github.com/lokesh-poreddy/AI_Chess_Master.git
cd AI_Chess_Master

# install dependencies
pnpm install

# run locally
pnpm dev
```

Open `http://localhost:3000` in your browser 🎉

### Configuration
- Change AI difficulty via the controls panel
- AI strength = search depth (Easy = shallow, Hard = deeper)
- Styling tweaks via `tailwind.config.ts` and `styles/`

---

## 🧪 Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 🎮 Controls & Gameplay
- **Difficulty:** Easy / Medium / Hard (maps to Minimax depth)
- **Flip Board:** Toggle perspective between White/Black
- **Reset:** Start a new game
- **Move History:** Inspect previous moves
- **Status:** Check, Checkmate, Draw indicators

---

## 🗺️ Roadmap (suggested)
- Add evaluation tuning and opening book
- Add perft tests and move-gen validation
- Add keyboard shortcuts and accessibility improvements
- Enable PWA installability and offline play

---

## 🤝 Contributing

Contributions are welcome!
1. Fork the repo
2. Create a feature branch (`feature/my-change`)
3. Commit changes
4. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**. See [`LICENSE`](./LICENSE).

---

## 📎 Links
- GitHub repository: https://github.com/lokesh-poreddy/AI_Chess_Master
