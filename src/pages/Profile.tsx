import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Trophy, Target, Flame, Calendar, Zap } from "lucide-react";
import { toast } from "sonner";
import NotificationSettings from "@/components/NotificationSettings";
import AvatarSelector from "@/components/AvatarSelector";
import ComboDisplay from "@/components/ComboDisplay";
import { format } from "date-fns";
import defaultAvatar from "@/assets/avatars/default-1.png";
import bronzeAchiever from "@/assets/avatars/bronze-achiever.png";
import silverStar from "@/assets/avatars/silver-star.png";
import goldChampion from "@/assets/avatars/gold-champion.png";
import platinumMaster from "@/assets/avatars/platinum-master.png";
import streakWarrior from "@/assets/avatars/streak-warrior.png";
import comboKing from "@/assets/avatars/combo-king.png";
import pointCollector from "@/assets/avatars/point-collector.png";
import elitePerformer from "@/assets/avatars/elite-performer.png";
import legendaryHero from "@/assets/avatars/legendary-hero.png";

const avatarImages: Record<string, string> = {
  "default-1": defaultAvatar,
  "bronze-achiever": bronzeAchiever,
  "silver-star": silverStar,
  "gold-champion": goldChampion,
  "platinum-master": platinumMaster,
  "streak-warrior": streakWarrior,
  "combo-king": comboKing,
  "point-collector": pointCollector,
  "elite-performer": elitePerformer,
  "legendary-hero": legendaryHero,
};

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) return;

      setUser(currentUser);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setUsername(profileData.username || "");

        // Load selected avatar details
        if (profileData.selected_avatar_id) {
          const { data: avatarData } = await supabase
            .from("avatars")
            .select("*")
            .eq("id", profileData.selected_avatar_id)
            .single();

          setSelectedAvatar(avatarData);
        }
      }

      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("completed_at", { ascending: false });

      setTasks(tasksData || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated!");
      loadProfile();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Trophy className="w-16 h-16 text-primary animate-bounce" />
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          Profile & Settings
        </h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Card className="bg-gradient-card border-border/50 hover-scale shadow-lg hover:shadow-glow-primary transition-all">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24 border-4 border-primary shadow-glow-primary">
                  <AvatarImage 
                    src={selectedAvatar ? avatarImages[selectedAvatar.image_url] : defaultAvatar} 
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {username.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              {selectedAvatar && (
                <div className="text-center text-sm text-muted-foreground mb-4">
                  {selectedAvatar.name}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(profile?.created_at), "MMMM d, yyyy")}
                </div>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 hover-scale shadow-lg hover:shadow-glow-primary transition-all">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Total Points
                </span>
                <span className="font-bold text-primary">{profile?.total_points || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Tasks Completed
                </span>
                <span className="font-bold">{profile?.tasks_completed || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Current Streak
                </span>
                <span className="font-bold text-primary">
                  {profile?.current_streak || 0} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Longest Streak
                </span>
                <span className="font-bold">{profile?.longest_streak || 0} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Highest Combo
                </span>
                <span className="font-bold text-warning">{profile?.highest_combo || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-bold text-success">{completionRate.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <ComboDisplay 
            currentCombo={profile?.current_combo || 0}
            highestCombo={profile?.highest_combo || 0}
          />
        </div>

        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <NotificationSettings userId={user.id} />
        </div>
      </div>

      <div className="mt-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <AvatarSelector 
          userId={user.id} 
          currentAvatarId={profile?.selected_avatar_id}
          onAvatarChange={loadProfile}
        />
      </div>
    </div>
  );
};

export default Profile;
