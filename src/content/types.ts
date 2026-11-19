export interface Concept {
  title: string;
  points: string[];
  /** where pediatric practice differs from adult practice */
  pearl?: string;
}

export interface WorkedStep {
  q: string;
  a: string;
}

export interface WorkedExample {
  title: string;
  scenario: string;
  steps: WorkedStep[];
}

export interface NumberToKnow {
  label: string;
  value: string;
}

export interface ToolLink {
  to: string;
  label: string;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  tagline: string;
  icon: string;
  minutes: number;
  prereqs: string[];
  objectives: string[];
  concepts: Concept[];
  numbers: NumberToKnow[];
  pitfalls: string[];
  example: WorkedExample;
  tools: ToolLink[];
  refs: string[];
}

export interface Question {
  id: string;
  module: string;
  level: 1 | 2 | 3;
  stem: string;
  options: string[];
  answer: number;
  explanation: string;
  refs: string[];
}
