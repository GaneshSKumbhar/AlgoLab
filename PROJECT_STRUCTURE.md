# Project Structure Overview

> This document provides a **detailed, hierarchical view** of the AlgoLab codebase, describing the purpose of each top‑level directory and the most important files within them. It is meant to help new contributors quickly understand where to find backend logic, frontend components, assets, configuration, and tests.

---

## 📂 Root Directory (`v:/Projects/AlgoLab`)

```
AlgoLab/
├── .git/                     # Git history (ignored in releases)
├── .gitignore                # Files/folders excluded from version control
├── .oxlintrc.json            # Oxlint configuration for TypeScript linting
├── AlgoLab_Project_Document.docx   # Detailed project proposal and spec
├── README.md                 # Project overview (you are reading it!)
├── image.png                 # Original screenshot provided by the user
├── images/                   # Screenshots used in README
│   ├── about.png
│   ├── algorithm.png
│   ├── benchmarks.png
│   ├── caseStudies.png
│   ├── dashboard.png
│   ├── login.png
│   ├── paradigm.png
│   ├── paradi… (truncated)
│   └── visualizer.png
├── backend/                  # Python FastAPI server
│   ├── app/                  # Core application package
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI entry point (uvicorn runs this)
│   │   ├── auth/             # JWT authentication utilities
│   │   ├── algorithms/       # Implementations of sorting, graph, DP, etc.
│   │   │   ├── sorting/      # e.g., quicksort, mergesort, heap‑sort
│   │   │   ├── graph/        # BFS, DFS, Dijkstra, etc.
│   │   │   └── dp/           # knapsack, longest‑common‑subsequence
│   │   ├── benchmark/        # Benchmark runner and result models
│   │   └── advisor/          # Paradigm‑recommendation engine
│   ├── tests/                # pytest test suite
│   │   ├── test_sorting.py
│   │   ├── test_graph.py
│   │   └── …
│   ├── requirements.txt      # Python dependencies
│   └── venv/                 # Virtual environment (usually .gitignored)
├── frontend/                 # React + Vite SPA
│   ├── public/               # Static assets served as‑is
│   │   ├── favicon.svg       # Custom gradient “A” favicon (updated)
│   │   └── icons.svg
│   ├── src/                  # Source code (TypeScript, JSX, CSS)
│   │   ├── assets/           # Images imported directly in components
│   │   ├── components/       # Reusable UI components (cards, badges, etc.)
│   │   │   └── ui/           # Design‑system primitives
│   │   ├── pages/            # Page‑level components (router targets)
│   │   │   ├── Algorithms/   # List & detail views for algorithms
│   │   │   │   ├── Algorithms.tsx
│   │   │   │   └── AlgorithmDetail.tsx
│   │   │   ├── BenchmarkLab/ # Benchmark UI
│   │   │   ├── ParadigmAdvisor/ # Advisor UI
│   │   │   └── Visualizer/   # Visualisation UI
│   │   ├── services/         # API wrapper (`src/services/api.ts`)
│   │   ├── App.tsx           # Root React component + router
│   │   ├── main.tsx          # ReactDOM.render entry point
│   │   └── index.css         # Global Tailwind imports + custom styles
│   ├── .env.example          # Template environment file (VITE_API_URL etc.)
│   ├── package.json          # NPM dependencies and scripts
│   ├── tailwind.config.js    # Tailwind CSS configuration (dark mode, colors)
│   ├── vite.config.ts        # Vite configuration (React plugin)
│   └── tsconfig.json         # TypeScript compiler options
├── docs/                     # Additional documentation (could host MkDocs/Sphinx)
└── .docx-review/            # Review artefacts for the .docx spec (optional)
```

---

## 🏗️ Architectural Overview

The system follows a **clear separation of concerns**:

- **Frontend** – A single‑page application built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**. It communicates with the backend exclusively via JSON over HTTP.
- **Backend** – A **FastAPI** service exposing a RESTful API. All algorithmic logic lives here, together with a **uniform trace format** that feeds both visualisation and benchmarking.
- **Shared Data Model** – Types such as `AlgorithmMeta`, `VisualizeResponse`, `BenchmarkResult`, and `AdvisorResponse` are defined in `frontend/src/services/api.ts` (TypeScript) and mirrored in the backend Python models, ensuring type‑safety across the stack.

```
+--------------------+        +--------------------------+
| React Front‑end    | <----> | FastAPI Back‑end          |
| (Vite dev server) | HTTP   | (Uvicorn ASGI server)    |
+--------------------+        +--------------------------+
| - UI components   |        | - Algorithm implementations |
| - API wrapper     |        | - Trace generator          |
| - State management|        | - Paradigm advisor logic   |
+--------------------+        +--------------------------+
```

---

## 🛠️ How to Extend the Project

1. **Add a new algorithm**
   - Implement the algorithm in `backend/app/algorithms/<category>/<name>.py`.
   - Export a function `run(input: dict) -> TraceEvent[]` that returns the execution trace.
   - Register the algorithm in `backend/app/algorithms/__init__.py` so it appears in the `/api/algorithms` endpoint.
   - Create a new entry in the TypeScript `AlgorithmMeta` definition if additional metadata is required.
   - Add a card component under `frontend/src/pages/Algorithms` to display it.
2. **Create a new visualiser type**
   - Extend the `TraceEvent` schema if new event types are needed.
   - Update the UI components in `frontend/src/pages/Visualizer` to render those events.
3. **Enhance the Paradigm Advisor**
   - Modify the rule‑engine in `backend/app/advisor/` – rules are pure Python functions returning scores.
   - Adjust the TypeScript `AdvisorRequest` interface to expose any new problem descriptors.
4. **Add tests**
   - Backend: new `pytest` functions under `backend/tests/`.
   - Frontend: Jest/React Testing Library tests in `frontend/src/__tests__/`.
   - Run `npm test` and `pytest -q` to ensure everything passes.

---

## 📦 Dependency Summary

| Area | Tool / Library | Version (as of repo) |
|------|----------------|----------------------|
| Frontend Framework | React | 18.x |
| Bundler | Vite | 8.3.4 |
| Styling | Tailwind CSS | 3.x |
| Icon set | Lucide‑react | latest |
| TypeScript | – | 5.x |
| Backend Framework | FastAPI | 0.110.x |
| ASGI Server | Uvicorn | 0.27.x |
| Testing (backend) | pytest | 7.x |
| Linting (TS) | oxlint | 0.1.x |
| Linting (Python) | flake8 | 7.x |

---

## 📄 What This Document Covers

- Full folder tree with brief purpose of each major directory.
- High‑level architecture diagram.
- Step‑by‑step guidelines for extending the codebase.
- Dependency snapshot for reproducibility.

Feel free to copy this structure into your own documentation or as a quick‑start guide for contributors.
