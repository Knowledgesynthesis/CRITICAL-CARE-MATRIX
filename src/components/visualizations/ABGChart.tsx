import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface ABGChartProps {
  data: Array<{
    timestamp: number;
    abg: {
      pH: number;
      paCO2: number;
      paO2: number;
      lactate: number;
    };
  }>;
}

export function ABGChart({ data }: ABGChartProps) {
  const chartData = data.map((point, index) => ({
    time: index,
    pH: point.abg.pH,
    PaCO2: point.abg.paCO2,
    PaO2: point.abg.paO2 / 10, // Scale down for visibility
    Lactate: point.abg.lactate,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gas Exchange & Acid-Base Trends</CardTitle>
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
            <Line type="monotone" dataKey="pH" stroke="#8b5cf6" name="pH" strokeWidth={2} />
            <Line type="monotone" dataKey="PaCO2" stroke="#ec4899" name="PaCO₂ (mmHg)" strokeWidth={2} />
            <Line
              type="monotone"
              dataKey="PaO2"
              stroke="#06b6d4"
              name="PaO₂ (×10 mmHg)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Lactate"
              stroke="#f97316"
              name="Lactate (mmol/L)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
