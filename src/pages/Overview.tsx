import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatsCard from "@/components/StatsCard";
import LevelDisplay from "@/components/LevelDisplay";
import DailyRewardCard from "@/components/DailyRewardCard";
import StreakDisplay from "@/components/StreakDisplay";
import ChallengesDisplay from "@/components/ChallengesDisplay";
import SpinWheel from "@/components/SpinWheel";
import { Trophy, Target, Flame, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { requestNotificationPermission } from "@/lib/notifications";
import { startNotificationScheduler } from "@/lib/notificationScheduler";

const Overview = () => {
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    requestNotificationPermission();
    
    // Start notification scheduler for periodic checks
    const cleanup = startNotificationScheduler();
    
    return cleanup;
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id);

      setTasks(tasksData || []);

      const { data: activeChallenges } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true);

      const { data: userChallenges } = await supabase
        .from("user_challenges")
        .select("*")
        .eq("user_id", user.id);

      const challengesWithProgress =
        activeChallenges?.map((challenge) => {
          const userChallenge = userChallenges?.find(
            (uc) => uc.challenge_id === challenge.id
          );
          return {
            ...challenge,
            progress: userChallenge?.progress || 0,
            completed: userChallenge?.completed || false,
          };
        }) || [];

      setChallenges(challengesWithProgress);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Trophy className="w-16 h-16 text-primary animate-bounce" />
      </div>
    );
  }

  const activeTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome back, {profile?.username}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
        <div className="hover-scale">
          <StatsCard
            title="Total Points"
            value={profile?.total_points || 0}
            icon={Trophy}
            gradient
          />
        </div>
        <div className="hover-scale">
          <StatsCard
            title="Tasks Completed"
            value={profile?.tasks_completed || 0}
            icon={CheckCircle2}
            gradient="info"
          />
        </div>
        <div className="hover-scale">
          <StatsCard
            title="Current Streak"
            value={`${profile?.current_streak || 0} days`}
            icon={Flame}
            gradient="pink"
          />
        </div>
        <div className="hover-scale">
          <StatsCard title="Active Tasks" value={activeTasks.length} icon={Target} gradient="cyan" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="space-y-6">
          <div className="hover-scale">
            <SpinWheel userId={profile?.id} onRewardClaimed={loadData} />
          </div>
          <div className="hover-scale">
            <DailyRewardCard
              userId={profile?.id}
              currentStreak={profile?.current_streak || 0}
              onRewardClaimed={loadData}
            />
          </div>
          <div className="hover-scale">
            <StreakDisplay
              currentStreak={profile?.current_streak || 0}
              longestStreak={profile?.longest_streak || 0}
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="hover-scale">
            <LevelDisplay totalPoints={profile?.total_points || 0} />
          </div>
          <div className="hover-scale">
            <ChallengesDisplay challenges={challenges} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
