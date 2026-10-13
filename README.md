# AlgoLab

AlgoLab is an interactive Design and Analysis of Algorithms learning platform. It combines a rule-based paradigm advisor, algorithm visualizations driven by execution traces, and empirical benchmarks.

## Included modules

- Algorithm library: sorting, searching, graph, dynamic-programming, greedy, and backtracking implementations
- Paradigm Advisor: explainable recommendations based on problem characteristics
- Visualizer: step-by-step execution traces and metrics
- Benchmark Lab: runtime and operation-count comparisons
- Case studies: delivery routing, timetabling, compression, and task assignment

## Run locally

Use two terminals.

```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. Interactive API documentation is available at `http://localhost:8000/docs`.

## Verification

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest -q

cd ..\frontend
npm run build
```

## Project specification

The detailed proposal and execution plan is included as `AlgoLab_Project_Document.docx`.
