import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import Algorithms from './pages/Algorithms/Algorithms';
import AlgorithmDetail from './pages/Algorithms/AlgorithmDetail';
import Visualizer from './pages/Visualizer/Visualizer';
import BenchmarkLab from './pages/BenchmarkLab/BenchmarkLab';
import ParadigmAdvisor from './pages/ParadigmAdvisor/ParadigmAdvisor';
import CaseStudies from './pages/CaseStudies/CaseStudies';
import About from './pages/About/About';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-900">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/algorithms" element={<Algorithms />} />
            <Route path="/algorithms/:id" element={<AlgorithmDetail />} />
            <Route path="/visualizer" element={<Visualizer />} />
            <Route path="/visualizer/:id" element={<Visualizer />} />
            <Route path="/benchmark" element={<BenchmarkLab />} />
            <Route path="/advisor" element={<ParadigmAdvisor />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
