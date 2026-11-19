export interface Reference {
  id: string;
  short: string;
  citation: string;
  year: number;
  url?: string;
  kind: 'guideline' | 'trial' | 'consensus' | 'review' | 'method';
}

export const REFERENCES: Reference[] = [
  // Sepsis & shock
  { id: 'ssc-peds-2026', short: 'SSC Children 2026', year: 2026, kind: 'guideline', citation: 'Weiss SL, et al. Surviving Sepsis Campaign International Guidelines for the Management of Sepsis and Septic Shock in Children 2026. Pediatr Crit Care Med / Intensive Care Med 2026.', url: 'https://journals.lww.com/pccmjournal/fulltext/2026/04000/surviving_sepsis_campaign_international_guidelines.3.aspx' },
  { id: 'phoenix-2024', short: 'Phoenix criteria 2024', year: 2024, kind: 'consensus', citation: 'Schlapbach LJ, et al. International consensus criteria for pediatric sepsis and septic shock. JAMA 2024;331:665–674; Sanchez-Pinto LN, et al. Development and validation of the Phoenix criteria. JAMA 2024;331:675–686.', url: 'https://doi.org/10.1001/jama.2024.0179' },
  { id: 'prompt-bolus-2026', short: 'PRoMPT BOLUS 2026', year: 2026, kind: 'trial', citation: 'Balamuth F, Weiss SL, Long E, et al. Balanced fluids vs 0.9% saline for pediatric septic shock (PRoMPT BOLUS; 9,041 children, 47 EDs). N Engl J Med 2026.', url: 'https://doi.org/10.1056/NEJMoa2601969' },
  { id: 'feast-2011', short: 'FEAST 2011', year: 2011, kind: 'trial', citation: 'Maitland K, et al. Mortality after fluid bolus in African children with severe infection. N Engl J Med 2011;364:2483–2495.', url: 'https://doi.org/10.1056/NEJMoa1101549' },
  { id: 'sipa-2015', short: 'SIPA 2015', year: 2015, kind: 'method', citation: 'Acker SN, et al. Pediatric specific shock index accurately identifies severely injured children. J Pediatr Surg 2015;50:331–334.' },
  // Respiratory
  { id: 'palicc2-2023', short: 'PALICC-2 2023', year: 2023, kind: 'guideline', citation: 'Emeriaud G, et al. Executive summary of the Second International Guidelines for the Diagnosis and Management of Pediatric ARDS (PALICC-2). Pediatr Crit Care Med 2023;24:143–168.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9848214/' },
  { id: 'oxypicu-2024', short: 'Oxy-PICU 2024', year: 2024, kind: 'trial', citation: 'Peters MJ, et al. Conservative versus liberal oxygenation targets in critically ill children (Oxy-PICU): a randomised clinical trial. Lancet 2024;403:355–364.' },
  { id: 'aap-bronch-2014', short: 'AAP bronchiolitis 2014', year: 2014, kind: 'guideline', citation: 'Ralston SL, et al. Clinical practice guideline: the diagnosis, management, and prevention of bronchiolitis. Pediatrics 2014;134:e1474–e1502.' },
  { id: 'paris-2018', short: 'PARIS 2018', year: 2018, kind: 'trial', citation: 'Franklin D, et al. A randomized trial of high-flow oxygen therapy in infants with bronchiolitis. N Engl J Med 2018;378:1121–1131.' },
  { id: 'tramontane2-2018', short: 'TRAMONTANE 2 2018', year: 2018, kind: 'trial', citation: 'Milési C, et al. 2 vs 3 L/kg/min with high-flow nasal cannula in infants with bronchiolitis: a randomized controlled trial. Intensive Care Med 2018;44:1870–1878.' },
  { id: 'firstabc-2022', short: 'FIRST-ABC 2022', year: 2022, kind: 'trial', citation: 'Ramnarayan P, et al. High-flow nasal cannula vs CPAP in critically ill children: step-up (JAMA 2022;328:162–172) and step-down (JAMA 2022;327:1555–1565) trials.' },
  { id: 'gina-2025', short: 'GINA 2025', year: 2025, kind: 'guideline', citation: 'Global Initiative for Asthma. Global Strategy for Asthma Management and Prevention, 2025 update.' },
  // Resuscitation
  { id: 'pals-2025', short: 'AHA/AAP PALS 2025', year: 2025, kind: 'guideline', citation: 'Part 8: Pediatric Advanced Life Support. 2025 American Heart Association and American Academy of Pediatrics Guidelines for CPR and ECC. Circulation 2025 / Pediatrics 2026.', url: 'https://doi.org/10.1161/CIR.0000000000001368' },
  { id: 'pbls-2025', short: 'AHA/AAP PBLS 2025', year: 2025, kind: 'guideline', citation: 'Part 6: Pediatric Basic Life Support. 2025 AHA/AAP Guidelines for CPR and ECC.' },
  { id: 'thapca-2015', short: 'THAPCA 2015/2017', year: 2015, kind: 'trial', citation: 'Moler FW, et al. Therapeutic hypothermia after out-of-hospital (N Engl J Med 2015;372:1898–1908) and in-hospital (N Engl J Med 2017;376:318–329) cardiac arrest in children.' },
  // Neuro
  { id: 'btf-2019', short: 'BTF pediatric TBI 2019', year: 2019, kind: 'guideline', citation: 'Kochanek PM, et al. Guidelines for the Management of Pediatric Severe Traumatic Brain Injury, Third Edition. Pediatr Crit Care Med 2019;20(3S Suppl 1):S1–S82.' },
  { id: 'aes-2016', short: 'AES status epilepticus 2016', year: 2016, kind: 'guideline', citation: 'Glauser T, et al. Evidence-based guideline: treatment of convulsive status epilepticus in children and adults. Epilepsy Curr 2016;16:48–61.' },
  { id: 'esett-2019', short: 'ESETT / ConSEPT / EcLiPSE 2019', year: 2019, kind: 'trial', citation: 'Kapur J, et al. N Engl J Med 2019;381:2103–2113 (ESETT); Dalziel SR, et al. Lancet 2019;393:2135–2145 (ConSEPT); Lyttle MD, et al. Lancet 2019;393:2125–2134 (EcLiPSE).' },
  { id: 'bd-2023', short: 'Brain death consensus 2023', year: 2023, kind: 'consensus', citation: 'Greer DM, et al. Pediatric and adult brain death/death by neurologic criteria determination: consensus guideline. Neurology 2023;101:1112–1132.' },
  // Endocrine / metabolic / fluids
  { id: 'ispad-2022', short: 'ISPAD DKA 2022', year: 2022, kind: 'guideline', citation: 'Glaser N, et al. ISPAD Clinical Practice Consensus Guidelines 2022: Diabetic ketoacidosis and hyperglycemic hyperosmolar state. Pediatr Diabetes 2022;23:835–856.' },
  { id: 'pecarn-fluid-2018', short: 'PECARN FLUID 2018', year: 2018, kind: 'trial', citation: 'Kuppermann N, et al. Clinical trial of fluid infusion rates for pediatric diabetic ketoacidosis. N Engl J Med 2018;378:2275–2287.' },
  { id: 'aap-fluids-2018', short: 'AAP maintenance IV fluids 2018', year: 2018, kind: 'guideline', citation: 'Feld LG, et al. Clinical practice guideline: maintenance intravenous fluids in children. Pediatrics 2018;142:e20183083.' },
  { id: 'moritz-2010', short: 'Moritz & Ayus 2010', year: 2010, kind: 'review', citation: 'Moritz ML, Ayus JC. New aspects in the pathogenesis, prevention, and treatment of hyponatremic encephalopathy in children. Pediatr Nephrol 2010;25:1225–1238.' },
  { id: 'berend-2014', short: 'Berend NEJM 2014', year: 2014, kind: 'review', citation: 'Berend K, de Vries APJ, Gans ROB. Physiological approach to assessment of acid–base disturbances. N Engl J Med 2014;371:1434–1445.' },
  { id: 'halfpint-2017', short: 'HALF-PINT 2017', year: 2017, kind: 'trial', citation: 'Agus MSD, et al. Tight glycemic control in critically ill children. N Engl J Med 2017;376:729–741.' },
  { id: 'chip-2014', short: 'CHiP 2014', year: 2014, kind: 'trial', citation: 'Macrae D, et al. A randomized trial of hyperglycemic control in pediatric intensive care. N Engl J Med 2014;370:107–118.' },
  { id: 'nirsevimab-2023', short: 'RSV prevention 2023–25', year: 2025, kind: 'trial', citation: 'Hammitt LL, et al. Nirsevimab for prevention of RSV in healthy late-preterm and term infants. N Engl J Med 2022;386:837–846; maternal RSVpreF vaccine (Kampmann B, et al. N Engl J Med 2023;388:1451–1464).' },
  // Renal
  { id: 'kdigo-2012', short: 'KDIGO AKI 2012', year: 2012, kind: 'guideline', citation: 'KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl 2012;2:1–138. (2026 AKI/AKD update completed public review May 2026.)', url: 'https://kdigo.org/guidelines/acute-kidney-injury/' },
  { id: 'ckid-2009', short: 'Bedside Schwartz 2009', year: 2009, kind: 'method', citation: 'Schwartz GJ, et al. New equations to estimate GFR in children with CKD. J Am Soc Nephrol 2009;20:629–637.' },
  { id: 'ckidu25-2021', short: 'CKiD U25 2021', year: 2021, kind: 'method', citation: 'Pierce CB, et al. Age- and sex-dependent clinical equations to estimate GFR in children and young adults with CKD. Kidney Int 2021;99:948–956.' },
  { id: 'rai-2014', short: 'Renal angina index 2014', year: 2014, kind: 'method', citation: 'Basu RK, et al. Derivation and validation of the renal angina index in critically ill children. Kidney Int 2014;85:659–667.' },
  { id: 'ninja-2016', short: 'NINJA 2016/2020', year: 2016, kind: 'trial', citation: 'Goldstein SL, et al. A prospective multi-center quality improvement initiative (NINJA) reduces nephrotoxic medication-associated AKI. Kidney Int 2016;90:212–221; Pediatrics 2020;145:e20192735.' },
  // Supportive
  { id: 'pandem-2022', short: 'SCCM PANDEM 2022', year: 2022, kind: 'guideline', citation: 'Smith HAB, et al. 2022 SCCM clinical practice guidelines on prevention and management of pain, agitation, neuromuscular blockade, and delirium in critically ill pediatric patients (PANDEM). Pediatr Crit Care Med 2022;23:e74–e110.' },
  { id: 'restore-2015', short: 'RESTORE 2015', year: 2015, kind: 'trial', citation: 'Curley MAQ, et al. Protocolized sedation vs usual care in pediatric patients mechanically ventilated for acute respiratory failure. JAMA 2015;313:379–389.' },
  { id: 'taxi-2018', short: 'TAXI 2018', year: 2018, kind: 'consensus', citation: 'Valentine SL, et al. Consensus recommendations for RBC transfusion practice in critically ill children (TAXI). Pediatr Crit Care Med 2018;19:884–898.' },
  { id: 'tripicu-2007', short: 'TRIPICU 2007', year: 2007, kind: 'trial', citation: 'Lacroix J, et al. Transfusion strategies for patients in pediatric intensive care units. N Engl J Med 2007;356:1609–1619.' },
  { id: 'taxicab-2022', short: 'TAXI-CAB 2022', year: 2022, kind: 'consensus', citation: 'Nellis ME, et al. Recommendations for plasma and platelet transfusion practice in critically ill children (TAXI-CAB). Pediatr Crit Care Med 2022;23:34–51.' },
  { id: 'aspen-2017', short: 'SCCM/ASPEN nutrition 2017', year: 2017, kind: 'guideline', citation: 'Mehta NM, et al. Guidelines for the provision and assessment of nutrition support therapy in the pediatric critically ill patient. Pediatr Crit Care Med 2017;18:675–715.' },
  { id: 'pepanic-2016', short: 'PEPaNIC 2016', year: 2016, kind: 'trial', citation: 'Fivez T, et al. Early versus late parenteral nutrition in critically ill children. N Engl J Med 2016;374:1111–1122.' },
  // Cardiac
  { id: 'primacorp-2003', short: 'PRIMACORP 2003', year: 2003, kind: 'trial', citation: 'Hoffman TM, et al. Efficacy and safety of milrinone in preventing low cardiac output syndrome after corrective surgery for congenital heart disease. Circulation 2003;107:996–1002.' },
];

const byId = new Map(REFERENCES.map((r) => [r.id, r]));
export function getRef(id: string): Reference | undefined {
  return byId.get(id);
}
