import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp } from "lucide-react";
import { getLevelInfo, getProgressToNextLevel, getPointsToNextLevel } from "@/lib/gamification";

interface LevelDisplayProps {
  totalPoints: number;
}

const LevelDisplay = ({ totalPoints }: LevelDisplayProps) => {
  const levelInfo = getLevelInfo(totalPoints);
  const progress = getProgressToNextLevel(totalPoints);
  const pointsToNext = getPointsToNextLevel(totalPoints);

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Level Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-5xl font-bold ${levelInfo.color} mb-2`}>
            Level {levelInfo.level}
          </div>
          <div className="text-2xl font-semibold text-foreground mb-1">
            {levelInfo.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {totalPoints.toLocaleString()} XP
          </div>
        </div>

        {levelInfo.maxPoints !== Infinity && (
          <>
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {progress.toFixed(1)}% Complete
                </span>
                <span>{pointsToNext.toLocaleString()} XP to Level {levelInfo.level + 1}</span>
              </div>
            </div>
          </>
        )}

        {levelInfo.maxPoints === Infinity && (
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary font-semibold">
              🎉 You've reached the maximum level!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LevelDisplay;
