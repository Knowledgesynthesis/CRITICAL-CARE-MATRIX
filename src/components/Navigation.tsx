import { useState } from 'react';
import {
  Activity,
  Wind,
  Droplets,
  Heart,
  Zap,
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  Menu,
  X,
  Beaker,
  Book,
  Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'hemodynamics', label: 'Hemodynamics Lab', icon: Heart },
  { id: 'ventilation', label: 'Ventilation Lab', icon: Wind },
  { id: 'acid-base', label: 'Acid-Base Analyzer', icon: Activity },
  { id: 'electrolytes', label: 'Electrolyte Explorer', icon: Beaker },
  { id: 'renal', label: 'Renal Function', icon: Droplets },
  { id: 'shock', label: 'Shock Pathways', icon: Zap },
  { id: 'matrix', label: 'ICU Matrix Dashboard', icon: LayoutDashboard },
  { id: 'cases', label: 'Case Engine', icon: BookOpen },
  { id: 'assessment', label: 'Assessment Hub', icon: GraduationCap },
  { id: 'glossary', label: 'Glossary', icon: Book },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex md:flex-col w-64 bg-card border-r border-border min-h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Critical Care Matrix</h1>
          <p className="text-sm text-muted-foreground mt-1">ICU Physiology Simulator</p>
        </div>
        <div className="flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors mb-1',
                  currentPage === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Educational purposes only. Not for clinical decision-making.
          </p>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 bg-card border-b border-border">
          <div>
            <h1 className="text-lg font-bold text-primary">Critical Care Matrix</h1>
            <p className="text-xs text-muted-foreground">ICU Simulator</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute top-[73px] left-0 right-0 bg-card border-b border-border z-50 shadow-lg">
            <div className="p-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors mb-1',
                      currentPage === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
