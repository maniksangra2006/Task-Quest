import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gift, Loader2, Sparkles, Zap, Flame, Trophy } from "lucide-react";
import { toast } from "sonner";

interface SpinWheelProps {
  userId: string;
  onRewardClaimed: () => void;
}

const REWARDS = [
  { type: "points", value: 50, label: "+50 XP", icon: Trophy, color: "text-primary" },
  { type: "points", value: 100, label: "+100 XP", icon: Sparkles, color: "text-success" },
  { type: "points", value: 200, label: "+200 XP", icon: Zap, color: "text-warning" },
  { type: "streak_freeze", value: 1, label: "Streak Freeze", icon: Flame, color: "text-destructive" },
  { type: "double_xp", value: 1, label: "2x XP (1 day)", icon: Trophy, color: "text-accent" },
  { type: "points", value: 25, label: "+25 XP", icon: Gift, color: "text-muted-foreground" },
];

const SpinWheel = ({ userId, onRewardClaimed }: SpinWheelProps) => {
  const [canSpin, setCanSpin] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [reward, setReward] = useState<any>(null);
  const [rotation, setRotation] = useState(0);

  const checkCanSpin = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("daily_spins")
      .select("*")
      .eq("user_id", userId)
      .eq("spin_date", today)
      .single();

    setCanSpin(!data);
  };

  useState(() => {
    checkCanSpin();
  });

  const spin = async () => {
    if (!canSpin || spinning) return;

    setSpinning(true);
    
    // Random reward selection
    const selectedReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    const spinsNeeded = Math.floor(Math.random() * 8) + 5; // 5-12 spins
    const degreesPerReward = 360 / REWARDS.length;
    const selectedIndex = REWARDS.indexOf(selectedReward);
    const targetRotation = rotation + (360 * spinsNeeded) + (degreesPerReward * selectedIndex);

    setRotation(targetRotation);

    // Wait for spin animation
    setTimeout(async () => {
      try {
        // Save spin to database
        await supabase.from("daily_spins").insert({
          user_id: userId,
          reward_type: selectedReward.type,
          reward_value: selectedReward.value,
        });

        // Award points if applicable
        if (selectedReward.type === "points") {
          const { data: profile } = await supabase
            .from("profiles")
            .select("total_points")
            .eq("id", userId)
            .single();

          if (profile) {
            await supabase
              .from("profiles")
              .update({ total_points: profile.total_points + selectedReward.value })
              .eq("id", userId);
          }
        }

        setReward(selectedReward);
        setShowReward(true);
        setCanSpin(false);
        onRewardClaimed();
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setSpinning(false);
      }
    }, 4000);
  };

  const Icon = reward?.icon || Gift;

  return (
    <>
      <Card className="bg-gradient-card border-border/50 hover-scale shadow-lg hover:shadow-glow-primary transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Daily Spin Wheel
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative w-64 h-64">
            <div
              className="w-full h-full rounded-full border-8 border-primary relative overflow-hidden transition-transform duration-[4000ms] ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
                background: `conic-gradient(
                  from 0deg,
                  hsl(var(--primary)) 0deg 60deg,
                  hsl(var(--success)) 60deg 120deg,
                  hsl(var(--warning)) 120deg 180deg,
                  hsl(var(--destructive)) 180deg 240deg,
                  hsl(var(--accent)) 240deg 300deg,
                  hsl(var(--muted)) 300deg 360deg
                )`,
              }}
            >
              {REWARDS.map((r, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 text-white font-bold"
                  style={{
                    transform: `rotate(${(360 / REWARDS.length) * i}deg) translateY(-80px)`,
                    transformOrigin: "0 0",
                  }}
                >
                  <r.icon className="w-6 h-6" />
                </div>
              ))}
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-foreground" />
          </div>

          <Button
            onClick={spin}
            disabled={!canSpin || spinning}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {spinning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Spinning...
              </>
            ) : canSpin ? (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Spin Now!
              </>
            ) : (
              "Come back tomorrow!"
            )}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showReward} onOpenChange={setShowReward}>
        <DialogContent className="bg-gradient-card border-border">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">You Won!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-bounce">
              <Icon className={`w-10 h-10 ${reward?.color}`} />
            </div>
            <h3 className="text-3xl font-bold text-primary">{reward?.label}</h3>
            <p className="text-muted-foreground text-center">
              {reward?.type === "streak_freeze"
                ? "Your next missed day won't break your streak!"
                : reward?.type === "double_xp"
                ? "Earn 2x XP on all tasks for 24 hours!"
                : "Bonus points added to your account!"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SpinWheel;
