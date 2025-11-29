import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakDisplay = ({ currentStreak, longestStreak }: StreakDisplayProps) => {
  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          Streak Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-pink/10 border border-pink/30 rounded-lg shadow-glow-pink animate-pulse">
            <div className="text-4xl font-bold text-pink mb-1">
              {currentStreak}
            </div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </div>
          <div className="text-center p-4 bg-cyan/10 border border-cyan/30 rounded-lg shadow-glow-cyan">
            <div className="text-4xl font-bold text-cyan mb-1">{longestStreak}</div>
            <div className="text-sm text-muted-foreground">Longest Streak</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Complete tasks daily to maintain your streak!
        </p>
      </CardContent>
    </Card>
  );
};

export default StreakDisplay;
