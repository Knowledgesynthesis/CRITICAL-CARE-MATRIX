import { Activity, Baby, Brain, Droplets, Filter, FlaskConical, Gauge, Heart, HeartPulse, Moon, Syringe, Utensils, Wind, type LucideIcon } from 'lucide-react';

export const MODULE_ICONS: Record<string, LucideIcon> = {
  Baby,
  HeartPulse,
  Activity,
  Wind,
  Gauge,
  FlaskConical,
  Droplets,
  Filter,
  Brain,
  Syringe,
  Heart,
  Moon,
  Utensils,
};

export function moduleIcon(name: string): LucideIcon {
  return MODULE_ICONS[name] ?? Activity;
}
