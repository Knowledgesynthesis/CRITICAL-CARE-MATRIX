import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

interface FrankStarlingCurveProps {
  currentCVP: number;
  currentCO: number;
}

export function FrankStarlingCurve({ currentCVP, currentCO }: FrankStarlingCurveProps) {
  // Generate ideal Frank-Starling curve
  const idealCurve = Array.from({ length: 20 }, (_, i) => {
    const cvp = i;
    let co;
    if (cvp < 8) {
      // Ascending limb
      co = 3 + (cvp * 0.5);
    } else if (cvp < 15) {
      // Plateau
      co = 7 + ((cvp - 8) * 0.2);
    } else {
      // Descending limb (over-distension)
      co = 8.4 - ((cvp - 15) * 0.1);
    }
    return { cvp, co, type: 'ideal' };
  });

  // Current patient point
  const currentPoint = [{ cvp: currentCVP, co: currentCO, type: 'current' }];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frank-Starling Curve</CardTitle>
        <CardDescription>
          Relationship between preload (CVP) and cardiac output
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              type="number"
              dataKey="cvp"
              name="CVP"
              unit=" mmHg"
              domain={[0, 20]}
              label={{ value: 'CVP (mmHg)', position: 'insideBottom', offset: -5 }}
              stroke="#9ca3af"
            />
            <YAxis
              type="number"
              dataKey="co"
              name="CO"
              unit=" L/min"
              domain={[2, 10]}
              label={{ value: 'Cardiac Output (L/min)', angle: -90, position: 'insideLeft' }}
              stroke="#9ca3af"
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#f9fafb' }}
            />
            <ReferenceLine x={8} stroke="#6b7280" strokeDasharray="3 3" />
            <ReferenceLine y={5} stroke="#6b7280" strokeDasharray="3 3" />
            <Scatter
              name="Ideal Curve"
              data={idealCurve}
              fill="#3b82f6"
              line={{ stroke: '#3b82f6', strokeWidth: 2 }}
              shape="circle"
            />
            <Scatter
              name="Current State"
              data={currentPoint}
              fill="#ef4444"
              shape="diamond"
              legendType="diamond"
            />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm space-y-1">
          <p className="text-muted-foreground">
            • <strong>Ascending limb (CVP {'<'} 8):</strong> Fluid responsive - increasing preload increases CO
          </p>
          <p className="text-muted-foreground">
            • <strong>Plateau (CVP 8-15):</strong> Optimal filling - minimal CO change with fluids
          </p>
          <p className="text-muted-foreground">
            • <strong>Descending limb (CVP {'>'} 15):</strong> Over-distension - fluids may decrease CO
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
