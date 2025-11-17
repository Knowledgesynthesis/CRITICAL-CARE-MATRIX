import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Book, Search } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'ABG (Arterial Blood Gas)',
    definition: 'Laboratory test measuring pH, PaCO₂, PaO₂, and other blood gas parameters to assess acid-base balance and oxygenation.',
    category: 'Lab Values',
  },
  {
    term: 'Anion Gap',
    definition: 'Calculated value (Na⁺ - [Cl⁻ + HCO₃⁻]) representing unmeasured anions. Normal: 8-12 mEq/L. Elevated in certain metabolic acidoses.',
    category: 'Lab Values',
  },
  {
    term: 'ARDS (Acute Respiratory Distress Syndrome)',
    definition: 'Severe inflammatory lung injury causing bilateral pulmonary infiltrates and hypoxemia. Classified by PaO₂/FiO₂ ratio.',
    category: 'Respiratory',
  },
  {
    term: 'Cardiac Output (CO)',
    definition: 'Volume of blood pumped by the heart per minute. CO = Heart Rate × Stroke Volume. Normal: 4-8 L/min.',
    category: 'Hemodynamics',
  },
  {
    term: 'Central Venous Pressure (CVP)',
    definition: 'Pressure in the right atrium or vena cava. Reflects preload and right heart function. Normal: 2-8 mmHg.',
    category: 'Hemodynamics',
  },
  {
    term: 'FiO₂',
    definition: 'Fraction of inspired oxygen. Room air is 0.21 (21%). Mechanical ventilation can deliver 0.21-1.0.',
    category: 'Respiratory',
  },
  {
    term: 'Frank-Starling Curve',
    definition: 'Relationship between preload (ventricular end-diastolic volume) and stroke volume. Describes cardiac contractile response to filling.',
    category: 'Hemodynamics',
  },
  {
    term: 'GFR (Glomerular Filtration Rate)',
    definition: 'Volume of fluid filtered by kidneys per minute. Estimated from creatinine. Normal: >90 mL/min/1.73m².',
    category: 'Renal',
  },
  {
    term: 'Henderson-Hasselbalch Equation',
    definition: 'pH = 6.1 + log([HCO₃⁻]/[0.03 × PaCO₂]). Describes relationship between pH, bicarbonate, and carbon dioxide.',
    category: 'Acid-Base',
  },
  {
    term: 'MAP (Mean Arterial Pressure)',
    definition: 'Average arterial pressure during cardiac cycle. MAP = Diastolic + ⅓(Systolic - Diastolic). Target: ≥65 mmHg in shock.',
    category: 'Hemodynamics',
  },
  {
    term: 'Metabolic Acidosis',
    definition: 'Primary decrease in HCO₃⁻ causing low pH. Can be high anion gap (MUDPILES) or normal anion gap (GI/renal losses).',
    category: 'Acid-Base',
  },
  {
    term: 'Metabolic Alkalosis',
    definition: 'Primary increase in HCO₃⁻ causing high pH. Common causes: vomiting, diuretics, volume contraction.',
    category: 'Acid-Base',
  },
  {
    term: 'Minute Ventilation',
    definition: 'Total volume of air moved per minute. MV = Tidal Volume × Respiratory Rate. Controls CO₂ elimination.',
    category: 'Respiratory',
  },
  {
    term: 'MUDPILES',
    definition: 'Mnemonic for high anion gap metabolic acidosis: Methanol, Uremia, DKA, Propylene glycol, Iron/INH, Lactic acidosis, Ethylene glycol, Salicylates.',
    category: 'Acid-Base',
  },
  {
    term: 'Norepinephrine',
    definition: 'First-line vasopressor in septic shock. Primarily α₁-adrenergic agonist causing vasoconstriction and increased SVR.',
    category: 'Medications',
  },
  {
    term: 'Oliguria',
    definition: 'Decreased urine output <0.5 mL/kg/hr or <400-500 mL/day. Sign of inadequate renal perfusion or intrinsic kidney dysfunction.',
    category: 'Renal',
  },
  {
    term: 'PEEP (Positive End-Expiratory Pressure)',
    definition: 'Pressure maintained in airways at end of expiration. Recruits collapsed alveoli. Increases intrathoracic pressure, may decrease preload.',
    category: 'Respiratory',
  },
  {
    term: 'Respiratory Acidosis',
    definition: 'Primary increase in PaCO₂ causing low pH. Due to hypoventilation. Acute vs chronic based on HCO₃⁻ compensation.',
    category: 'Acid-Base',
  },
  {
    term: 'Respiratory Alkalosis',
    definition: 'Primary decrease in PaCO₂ causing high pH. Due to hyperventilation. Common in anxiety, pain, mechanical over-ventilation.',
    category: 'Acid-Base',
  },
  {
    term: 'Septic Shock',
    definition: 'Distributive shock from infection. Characterized by high cardiac output, low SVR, hypotension despite adequate fluid resuscitation.',
    category: 'Shock',
  },
  {
    term: 'Stroke Volume',
    definition: 'Volume of blood ejected by ventricle per beat. Determined by preload, afterload, and contractility. Normal: 60-100 mL.',
    category: 'Hemodynamics',
  },
  {
    term: 'SVR (Systemic Vascular Resistance)',
    definition: 'Resistance to blood flow in systemic circulation. SVR = (MAP - CVP) × 80 / CO. Normal: 800-1200 dynes·sec/cm⁵.',
    category: 'Hemodynamics',
  },
  {
    term: 'Tidal Volume',
    definition: 'Volume of air moved per breath. For lung-protective ventilation in ARDS: 6 mL/kg ideal body weight.',
    category: 'Respiratory',
  },
  {
    term: 'Winter\'s Formula',
    definition: 'Predicts expected PaCO₂ in metabolic acidosis: PaCO₂ = 1.5(HCO₃⁻) + 8 ± 2. Assesses respiratory compensation.',
    category: 'Acid-Base',
  },
];

export function Glossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(glossaryTerms.map((t) => t.category)))];

  const filteredTerms = glossaryTerms.filter((term) => {
    const matchesSearch =
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Book className="w-8 h-8" />
          Medical Glossary
        </h1>
        <p className="text-muted-foreground">
          Definitions of key critical care terms and concepts
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search terms or definitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms List */}
      <div className="space-y-4">
        {filteredTerms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No terms found matching your search.
            </CardContent>
          </Card>
        ) : (
          filteredTerms.map((item) => (
            <Card key={item.term}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-xl">{item.term}</CardTitle>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary whitespace-nowrap">
                    {item.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.definition}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Legend */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About This Glossary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            This glossary provides definitions of common critical care terms used throughout the Critical Care
            Matrix application. Definitions are simplified for educational purposes and may not capture all
            clinical nuances.
          </p>
          <p>
            <strong>Categories:</strong> Terms are organized by category (Hemodynamics, Respiratory, Acid-Base,
            Renal, Lab Values, Medications, Shock) for easier navigation.
          </p>
          <p>
            For comprehensive medical information, consult clinical references and textbooks.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
