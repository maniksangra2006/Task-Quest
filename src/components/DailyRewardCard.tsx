import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateDailyReward } from "@/lib/gamification";
import { showDailyReward } from "@/lib/notifications";

interface DailyRewardCardProps {
  userId: string;
  currentStreak: number;
  onRewardClaimed: () => void;
}

const DailyRewardCard = ({ userId, currentStreak, onRewardClaimed }: DailyRewardCardProps) => {
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfClaimed();
  }, []);

  const checkIfClaimed = () => {
    const lastClaim = localStorage.getItem(`daily_reward_${userId}`);
    if (lastClaim) {
      const lastClaimDate = new Date(lastClaim);
      const today = new Date();
      if (
        lastClaimDate.getDate() === today.getDate() &&
        lastClaimDate.getMonth() === today.getMonth() &&
        lastClaimDate.getFullYear() === today.getFullYear()
      ) {
        setClaimed(true);
      }
    }
  };

  const claimReward = async () => {
    setLoading(true);
    try {
      const rewardPoints = calculateDailyReward(currentStreak);

      // Update profile points
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_points")
        .eq("id", userId)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ total_points: (profile.total_points || 0) + rewardPoints })
          .eq("id", userId);

        localStorage.setItem(`daily_reward_${userId}`, new Date().toISOString());
        setClaimed(true);
        
        toast.success(`Daily reward claimed! +${rewardPoints} XP`, {
          icon: "🎁",
        });

        showDailyReward(rewardPoints);
        onRewardClaimed();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const rewardPoints = calculateDailyReward(currentStreak);

  return (
    <Card className={`${claimed ? "bg-gradient-card" : "bg-gradient-primary"} border-border/50 ${!claimed && "shadow-glow-primary"}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={claimed ? "text-foreground" : "text-primary-foreground"}>
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5" />
              <h3 className="font-semibold">Daily Reward</h3>
            </div>
            <p className="text-sm opacity-90">
              {claimed ? "Come back tomorrow!" : `+${rewardPoints} XP available`}
            </p>
          </div>
          {claimed ? (
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-success" />
            </div>
          ) : (
            <Button
              onClick={claimReward}
              disabled={loading}
              className="bg-primary-foreground text-primary hover:opacity-90"
            >
              {loading ? "Claiming..." : "Claim"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyRewardCard;
