import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";

interface CompletionTrendChartProps {
  tasks: any[];
}

const CompletionTrendChart = ({ tasks }: CompletionTrendChartProps) => {
  // Generate last 30 days data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dayTasks = tasks.filter((task) => {
      if (!task.completed_at) return false;
      const completedDate = new Date(task.completed_at);
      return format(completedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
    });

    return {
      date: format(date, "MMM dd"),
      completed: dayTasks.length,
      points: dayTasks.reduce((sum, t) => sum + (t.points || 0), 0),
    };
  });

  return (
    <Card className="bg-gradient-card border-border/50 shadow-lg hover:shadow-glow-primary transition-all">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          30-Day Completion Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={last30Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              name="Tasks Completed"
            />
            <Line
              type="monotone"
              dataKey="points"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--success))", r: 4 }}
              name="Points Earned"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CompletionTrendChart;
