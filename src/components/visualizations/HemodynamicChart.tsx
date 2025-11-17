import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface HemodynamicChartProps {
  data: Array<{
    timestamp: number;
    vitals: {
      map: number;
      co: number;
      svr: number;
      hr: number;
    };
  }>;
}

export function HemodynamicChart({ data }: HemodynamicChartProps) {
  const chartData = data.map((point, index) => ({
    time: index,
    MAP: point.vitals.map,
    CO: point.vitals.co,
    SVR: point.vitals.svr / 100, // Scale down for visibility
    HR: point.vitals.hr,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hemodynamic Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              label={{ value: 'Time Points', position: 'insideBottom', offset: -5 }}
              stroke="#9ca3af"
            />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#f9fafb' }}
            />
            <Legend />
            <Line type="monotone" dataKey="MAP" stroke="#ef4444" name="MAP (mmHg)" strokeWidth={2} />
            <Line type="monotone" dataKey="CO" stroke="#3b82f6" name="CO (L/min)" strokeWidth={2} />
            <Line
              type="monotone"
              dataKey="SVR"
              stroke="#10b981"
              name="SVR (×100)"
              strokeWidth={2}
            />
            <Line type="monotone" dataKey="HR" stroke="#f59e0b" name="HR (bpm)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
