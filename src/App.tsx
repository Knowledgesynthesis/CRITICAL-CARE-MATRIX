import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { HemodynamicsLab } from './pages/HemodynamicsLab';
import { VentilationLab } from './pages/VentilationLab';
import { AcidBaseAnalyzer } from './pages/AcidBaseAnalyzer';
import { RenalFunction } from './pages/RenalFunction';
import { ShockPathways } from './pages/ShockPathways';
import { MatrixDashboard } from './pages/MatrixDashboard';
import { CaseEngine } from './pages/CaseEngine';
import { AssessmentHub } from './pages/AssessmentHub';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'hemodynamics':
        return <HemodynamicsLab />;
      case 'ventilation':
        return <VentilationLab />;
      case 'acid-base':
        return <AcidBaseAnalyzer />;
      case 'renal':
        return <RenalFunction />;
      case 'shock':
        return <ShockPathways />;
      case 'matrix':
        return <MatrixDashboard />;
      case 'cases':
        return <CaseEngine />;
      case 'assessment':
        return <AssessmentHub />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 md:ml-0">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
