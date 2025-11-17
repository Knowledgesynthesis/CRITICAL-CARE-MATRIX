import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Activity, Wind, Droplets, Heart, Zap, BookOpen, LayoutDashboard, GraduationCap } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const modules = [
    {
      id: 'hemodynamics',
      title: 'Hemodynamics Lab',
      description: 'Explore cardiac output, SVR, and fluid responsiveness',
      icon: Heart,
      color: 'text-red-500',
    },
    {
      id: 'ventilation',
      title: 'Ventilation Lab',
      description: 'Simulate mechanical ventilation and gas exchange',
      icon: Wind,
      color: 'text-blue-500',
    },
    {
      id: 'acid-base',
      title: 'Acid-Base Analyzer',
      description: 'Interpret ABGs and understand compensation',
      icon: Activity,
      color: 'text-green-500',
    },
    {
      id: 'renal',
      title: 'Renal Function',
      description: 'Study GFR, urine output, and perfusion',
      icon: Droplets,
      color: 'text-cyan-500',
    },
    {
      id: 'shock',
      title: 'Shock Pathways',
      description: 'Differentiate shock types and learn management',
      icon: Zap,
      color: 'text-yellow-500',
    },
    {
      id: 'matrix',
      title: 'ICU Matrix Dashboard',
      description: 'Integrated view of all physiologic systems',
      icon: LayoutDashboard,
      color: 'text-purple-500',
    },
    {
      id: 'cases',
      title: 'Case Engine',
      description: 'Practice with realistic ICU scenarios',
      icon: BookOpen,
      color: 'text-orange-500',
    },
    {
      id: 'assessment',
      title: 'Assessment Hub',
      description: 'Test your knowledge with practice questions',
      icon: GraduationCap,
      color: 'text-indigo-500',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to Critical Care Matrix</h1>
        <p className="text-lg text-muted-foreground">
          An integrated ICU physiology simulator for medical education
        </p>
      </div>

      <Card className="mb-8 bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle>About This App</CardTitle>
          <CardDescription className="text-foreground/80">
            Critical Care Matrix teaches how critical care physiology works as an integrated system.
            Learn about fluids, electrolytes, hemodynamics, mechanical ventilation, renal function,
            and acid-base interactions through interactive simulations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Risk-Free Learning</h4>
              <p className="text-muted-foreground">
                Practice with synthetic data only - no real patient information
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Physiology-First</h4>
              <p className="text-muted-foreground">
                Evidence-based models with accurate multi-system interactions
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">All Learner Levels</h4>
              <p className="text-muted-foreground">
                From medical students to attending intensivists
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Explore Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.id}
              className="cursor-pointer"
              onClick={() => onNavigate(module.id)}
            >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Icon className={`w-8 h-8 ${module.color}`} />
                </div>
                <CardTitle className="text-xl mt-2">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Launch Module
                </Button>
              </CardContent>
            </Card>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Educational Disclaimer:</strong> This application is for educational purposes only.
          It uses synthetic patient data and simplified physiological models. Do not use for actual
          clinical decision-making.
        </p>
      </div>
    </div>
  );
}
