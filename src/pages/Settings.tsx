import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Settings as SettingsIcon, Download, Upload, Trash2, Save } from 'lucide-react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { saveSimulation, loadSimulation, clearAllSavedSimulations, getSavedSimulations } from '@/lib/storage/indexedDB';

export function Settings() {
  const { patientState, interventions, timeElapsed, setPatientState } = useSimulationStore();
  const [saveName, setSaveName] = useState('');
  const [savedSims, setSavedSims] = useState<Array<{ id: string; name: string; timestamp: number }>>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshSavedSimulations = async () => {
    const sims = await getSavedSimulations();
    setSavedSims(sims);
  };

  const handleSave = async () => {
    if (!saveName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a name for the simulation' });
      return;
    }

    try {
      await saveSimulation({
        id: Date.now().toString(),
        name: saveName,
        patientState,
        interventions,
        timeElapsed,
        timestamp: Date.now(),
      });
      setMessage({ type: 'success', text: `Simulation "${saveName}" saved successfully!` });
      setSaveName('');
      await refreshSavedSimulations();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save simulation' });
    }
  };

  const handleLoad = async (id: string) => {
    try {
      const sim = await loadSimulation(id);
      if (sim) {
        setPatientState(sim.patientState);
        setMessage({ type: 'success', text: `Loaded simulation "${sim.name}"` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load simulation' });
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to delete all saved simulations? This cannot be undone.')) {
      try {
        await clearAllSavedSimulations();
        setSavedSims([]);
        setMessage({ type: 'success', text: 'All saved simulations cleared' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to clear simulations' });
      }
    }
  };

  const handleExportData = () => {
    const data = {
      patientState,
      interventions,
      timeElapsed,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `critical-care-simulation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Simulation data exported' });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setPatientState(data.patientState);
        setMessage({ type: 'success', text: 'Simulation data imported' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to import data. Invalid file format.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your simulations and application preferences
        </p>
      </div>

      {message && (
        <Card className={`mb-6 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
          <CardContent className="py-4">
            <p className={message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {message.text}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Save Current Simulation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Current Simulation
          </CardTitle>
          <CardDescription>
            Save your current patient state and interventions to load later
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter simulation name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={handleSave}>
              Save Simulation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Load Saved Simulations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Saved Simulations</CardTitle>
          <CardDescription>
            Load previously saved simulations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refreshSavedSimulations} variant="outline" className="mb-4">
            Refresh List
          </Button>
          {savedSims.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No saved simulations. Save your current state to see it here.
            </p>
          ) : (
            <div className="space-y-2">
              {savedSims.map((sim) => (
                <div
                  key={sim.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{sim.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sim.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button onClick={() => handleLoad(sim.id)} variant="outline" size="sm">
                    Load
                  </Button>
                </div>
              ))}
            </div>
          )}
          {savedSims.length > 0 && (
            <Button
              onClick={handleClearAll}
              variant="destructive"
              className="mt-4"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Saved Simulations
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle>Import/Export</CardTitle>
          <CardDescription>
            Export current simulation to JSON or import from file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={handleExportData} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Current Simulation
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Downloads a JSON file with your current patient state and interventions
            </p>
          </div>

          <div>
            <label htmlFor="import-file" className="block">
              <Button variant="outline" className="w-full" onClick={() => document.getElementById('import-file')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Import Simulation from File
              </Button>
            </label>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Load a previously exported JSON simulation file
            </p>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Critical Care Matrix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Version:</strong> 1.0.0
          </p>
          <p>
            <strong>Purpose:</strong> Educational ICU physiology simulator for medical trainees
          </p>
          <p>
            <strong>Disclaimer:</strong> This application uses synthetic data and simplified models.
            It is for educational purposes only and should never be used for actual clinical decision-making.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
