import { type ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Calculator,
  ClipboardList,
  FlaskConical,
  Gauge,
  GraduationCap,
  Home,
  Info,
  Library,
  Menu,
  Moon,
  Droplets,
  Stethoscope,
  Sun,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProgress } from '@/store/progress';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
}

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Learn',
    items: [
      { to: '/', label: 'Home', icon: Home, end: true },
      { to: '/learn', label: 'Curriculum', icon: BookOpen },
    ],
  },
  {
    label: 'Simulate',
    items: [
      { to: '/labs/shock', label: 'Shock Lab', icon: Activity },
      { to: '/labs/ventilator', label: 'Ventilator Lab', icon: Gauge },
      { to: '/labs/acid-base', label: 'Acid–Base Lab', icon: FlaskConical },
      { to: '/labs/fluids', label: 'Fluids Lab', icon: Droplets },
    ],
  },
  {
    label: 'Practice',
    items: [
      { to: '/cases', label: 'Cases', icon: Stethoscope },
      { to: '/quiz', label: 'Question bank', icon: GraduationCap },
    ],
  },
  {
    label: 'Bedside',
    items: [
      { to: '/tools', label: 'Tools & calculators', icon: Calculator },
      { to: '/reference', label: 'Reference', icon: Library },
      { to: '/about', label: 'Sources & settings', icon: Info },
    ],
  },
];

const TABS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/labs', label: 'Labs', icon: Activity },
  { to: '/cases', label: 'Cases', icon: ClipboardList },
  { to: '/tools', label: 'Tools', icon: Calculator },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-primary" />
        <path d="M5 17h5l2.5-6 4 12 3-9 1.5 3H27" fill="none" className="stroke-primary-foreground" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="leading-tight">
        <p className="text-[15px] font-bold tracking-tight">PICU Matrix</p>
        <p className="text-[11px] text-muted-foreground">Pediatric critical care</p>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const theme = useProgress((s) => s.theme);
  const setTheme = useProgress((s) => s.setTheme);
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label={`Switch to ${next} theme`}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-5" aria-label="Main">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</p>
          <ul className="space-y-0.5">
            {g.items.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  end={it.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                      isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  <it.icon className="h-4 w-4 shrink-0" aria-hidden />
                  {it.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const theme = useProgress((s) => s.theme);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0f1a' : '#f6f8fb');
  }, [theme]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center justify-between px-4">
          <NavLink to="/" aria-label="PICU Matrix home">
            <Brand />
          </NavLink>
          <ThemeToggle />
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 pt-2">
          <NavList />
        </div>
        <p className="border-t px-4 py-3 text-[11px] leading-snug text-muted-foreground">Educational simulator · verify doses against local protocols.</p>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/90 px-3 backdrop-blur md:hidden">
        <NavLink to="/" aria-label="PICU Matrix home">
          <Brand />
        </NavLink>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col bg-card shadow-xl">
            <div className="flex h-14 items-center justify-between border-b px-3">
              <span className="text-sm font-semibold">Menu</span>
              <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
            <p className="border-t px-4 py-3 text-[11px] text-muted-foreground">Educational simulator · verify doses against local protocols.</p>
          </div>
        </div>
      )}

      <main id="main" className="md:pl-64">
        {children}
      </main>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Quick">
        <ul className="grid grid-cols-5">
          {TABS.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.end}
                className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}
              >
                <t.icon className="h-5 w-5" aria-hidden />
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
