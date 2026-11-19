import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';

const Home = lazy(() => import('@/pages/Home'));
const Learn = lazy(() => import('@/pages/Learn'));
const ModulePage = lazy(() => import('@/pages/ModulePage'));
const Labs = lazy(() => import('@/pages/Labs'));
const ShockLab = lazy(() => import('@/pages/labs/ShockLab'));
const VentLab = lazy(() => import('@/pages/labs/VentLab'));
const AcidBaseLab = lazy(() => import('@/pages/labs/AcidBaseLab'));
const FluidsLab = lazy(() => import('@/pages/labs/FluidsLab'));
const Tools = lazy(() => import('@/pages/Tools'));
const ResusCard = lazy(() => import('@/pages/tools/ResusCard'));
const PhoenixTool = lazy(() => import('@/pages/tools/PhoenixTool'));
const PardsTool = lazy(() => import('@/pages/tools/PardsTool'));
const InfusionTool = lazy(() => import('@/pages/tools/InfusionTool'));
const RenalTool = lazy(() => import('@/pages/tools/RenalTool'));
const NeuroTool = lazy(() => import('@/pages/tools/NeuroTool'));
const CardiacTool = lazy(() => import('@/pages/tools/CardiacTool'));
const DkaTool = lazy(() => import('@/pages/tools/DkaTool'));
const Cases = lazy(() => import('@/pages/Cases'));
const CasePlayer = lazy(() => import('@/pages/CasePlayer'));
const Quiz = lazy(() => import('@/pages/Quiz'));
const Reference = lazy(() => import('@/pages/Reference'));
const About = lazy(() => import('@/pages/About'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function Loading() {
  return (
    <div className="flex h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:id" element={<ModulePage />} />
            <Route path="/labs" element={<Labs />} />
            <Route path="/labs/shock" element={<ShockLab />} />
            <Route path="/labs/ventilator" element={<VentLab />} />
            <Route path="/labs/acid-base" element={<AcidBaseLab />} />
            <Route path="/labs/fluids" element={<FluidsLab />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/resus" element={<ResusCard />} />
            <Route path="/tools/phoenix" element={<PhoenixTool />} />
            <Route path="/tools/pards" element={<PardsTool />} />
            <Route path="/tools/infusions" element={<InfusionTool />} />
            <Route path="/tools/renal" element={<RenalTool />} />
            <Route path="/tools/neuro" element={<NeuroTool />} />
            <Route path="/tools/cardiac" element={<CardiacTool />} />
            <Route path="/tools/dka" element={<DkaTool />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CasePlayer />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/reference" element={<Reference />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppShell>
    </BrowserRouter>
  );
}
