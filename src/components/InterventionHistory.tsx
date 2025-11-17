import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Clock, Activity, Droplet, Wind, Pill } from 'lucide-react';
import type { Intervention } from '@/types';

interface InterventionHistoryProps {
  interventions: Intervention[];
}

export function InterventionHistory({ interventions }: InterventionHistoryProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Ventilator':
        return Wind;
      case 'Fluid':
        return Droplet;
      case 'Medication':
        return Pill;
      default:
        return Activity;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'Ventilator':
        return 'text-blue-500';
      case 'Fluid':
        return 'text-cyan-500';
      case 'Medication':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Intervention History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {interventions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No interventions recorded yet. Make changes in the simulation modules.
          </p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {interventions
              .slice()
              .reverse()
              .map((intervention) => {
                const Icon = getIcon(intervention.type);
                const color = getColor(intervention.type);
                return (
                  <div
                    key={intervention.id}
                    className="flex gap-3 p-3 bg-muted/50 rounded-lg border border-border"
                  >
                    <Icon className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{intervention.type}</p>
                          <p className="text-sm text-muted-foreground">{intervention.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(intervention.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {intervention.parameters && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {Object.entries(intervention.parameters).map(([key, value]) => (
                            <span key={key} className="mr-2">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
