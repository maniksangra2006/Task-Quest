import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BadgesDisplay from "@/components/BadgesDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Trophy, Star, Crown } from "lucide-react";
import { toast } from "sonner";

const Achievements = () => {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: allBadges } = await supabase.from("badges").select("*");
      const { data: userBadges } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", user.id);

      const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id) || []);
      const badgesWithStatus =
        allBadges?.map((badge) => ({
          ...badge,
          earned: earnedBadgeIds.has(badge.id),
        })) || [];

      setBadges(badgesWithStatus);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Award className="w-16 h-16 text-primary animate-bounce" />
      </div>
    );
  }

  const earnedCount = badges.filter((b) => b.earned).length;
  const totalCount = badges.length;
  const progressPercentage = (earnedCount / totalCount) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary animate-pulse" />
          Achievements
        </h1>
        <p className="text-muted-foreground">Unlock badges and showcase your accomplishments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <Card className="bg-gradient-card border-border/50 hover-scale shadow-lg hover:shadow-glow-primary transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="w-4 h-4" />
              Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {earnedCount}/{totalCount}
            </div>
            <Progress value={progressPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 hover-scale shadow-lg hover:shadow-glow-primary transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {progressPercentage.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 hover-scale shadow-lg hover:shadow-glow-primary transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Next Badge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">
              {badges.find((b) => !b.earned)?.name || "All Done!"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {badges.find((b) => !b.earned)?.description || "You've earned them all!"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="animate-fade-in hover-scale" style={{ animationDelay: "0.2s" }}>
        <BadgesDisplay badges={badges} />
      </div>
    </div>
  );
};

export default Achievements;
