import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Lock } from "lucide-react";

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

interface BadgesDisplayProps {
  badges: BadgeItem[];
}

const BadgesDisplay = ({ badges }: BadgesDisplayProps) => {
  const earnedBadges = badges.filter((b) => b.earned);

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Achievements ({earnedBadges.length}/{badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge, index) => {
            const colors = ['primary', 'info', 'pink', 'cyan'];
            const colorClass = colors[index % colors.length];
            
            return (
              <div
                key={badge.id}
                className={`relative p-4 rounded-lg border ${
                  badge.earned
                    ? `bg-${colorClass}/10 border-${colorClass}/30 shadow-glow-${colorClass} animate-scale-in`
                    : "bg-secondary/50 border-border opacity-50"
                } transition-all hover:scale-105`}
                style={badge.earned ? { animationDelay: `${index * 0.1}s` } : {}}
              >
                {!badge.earned && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="text-4xl mb-2 text-center">{badge.icon}</div>
                <h4 className="font-semibold text-sm text-center mb-1">{badge.name}</h4>
                <p className="text-xs text-muted-foreground text-center">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgesDisplay;
