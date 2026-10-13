# AlgoLab

> **Interactive Design & Analysis of Algorithms Platform**

AlgoLab is a premium‑grade, full‑stack educational platform that helps students and professionals explore algorithms, get paradigm recommendations, visualise step‑by‑step execution, and benchmark performance across inputs.

---

## ✨ Features

- **Paradigm Advisor** – Rule‑based engine that suggests the most suitable algorithmic paradigm based on problem characteristics.
- **Algorithm Visualizer** – Animated execution traces with colour‑coded highlights, metrics, and step controls.
- **Benchmark Lab** – Run bulk benchmarks, view statistical tables and compare runtime/operations.
- **Case Studies** – Real‑world problem walkthroughs (routing, timetabling, compression, …).
- **Responsive UI** – Glass‑morphism cards, smooth micro‑animations, dark‑mode ready.
- **Authentication** – Secure sign‑in/out with JWT.
- **Comprehensive API** – FastAPI backend with OpenAPI docs.

---

## 📸 Screenshots

| ![Dashboard](images/dashboard.png) |
| *Dashboard overview with algorithm categories and quick links.* |

| ![Algorithm List](images/algorithm.png) |
| *Browse all algorithms, filter by category and paradigm.* |

| ![Visualizer](images/visualizer.png) |
| *Step‑by‑step visualisation of an algorithm execution trace.* |

| ![Benchmark Lab](images/benchmarks.png) |
| *Run benchmarks, view results in sortable tables and charts.* |

| ![Paradigm Advisor](images/paradigm.png) |
| *Get explainable paradigm recommendations for a given problem.* |

| ![Case Studies](images/caseStudies.png) |
| *Interactive case‑study walkthroughs for real‑world scenarios.* |

| ![Login Page](images/login.png) |
| *Secure sign‑in and account creation.* |

---

## 🛠️ Installation & Running Locally

### Prerequisites

- **Node.js** >= 18
- **Python** >= 3.10
- **PowerShell** (Windows) or any POSIX‑compatible shell

### Backend (FastAPI)

```powershell
cd backend
# Create a virtual environment if not present
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The interactive OpenAPI docs are available at `http://localhost:8000/docs`.

### Front‑end (React + Vite)

```powershell
cd frontend
Copy-Item .env.example .env   # adjust VITE_API_URL if needed
npm install
npm run dev
```

Open `http://localhost:5173` in a browser. The app should load without the previous "white screen" error.

---

## ✅ Testing

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pytest -q
```

Frontend unit tests (if added) can be run with `npm test`.

---

## 🎨 Design Notes

- **Favicon** – A custom SVG favicon (`public/favicon.svg`) featuring a stylised, gradient “A” that matches the app’s teal‑purple colour scheme.
- **Styling** – Uses Tailwind‑CSS for rapid utility classes, with glass‑morphism components and subtle hover animations.
- **Accessibility** – Semantic HTML, proper ARIA labels, and keyboard‑friendly navigation.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo, create a feature branch, and open a pull request. Follow the existing linting rules (`oxc` for TypeScript, `flake8` for Python).

---

## 📜 License

MIT © 2024‑2026 Ganesh Kumbhar
