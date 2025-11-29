import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Challenge {
  id: string;
  title: string;
  description: string;
  target_value: number;
  points: number;
  end_date: string;
  progress: number;
  completed: boolean;
}

interface ChallengesDisplayProps {
  challenges: Challenge[];
}

const ChallengesDisplay = ({ challenges }: ChallengesDisplayProps) => {
  if (challenges.length === 0) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Weekly Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No active challenges at the moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Weekly Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => {
          const progressPercentage = (challenge.progress / challenge.target_value) * 100;
          
          return (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border ${
                challenge.completed
                  ? "bg-success/10 border-success/30"
                  : "bg-secondary/50 border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{challenge.title}</h4>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  {challenge.points} XP
                </Badge>
              </div>
              <div className="space-y-2">
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {challenge.progress} / {challenge.target_value}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ChallengesDisplay;
