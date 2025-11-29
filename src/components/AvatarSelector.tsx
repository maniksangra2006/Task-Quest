import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Check } from "lucide-react";
import { toast } from "sonner";
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

interface Avatar {
  id: string;
  name: string;
  image_url: string;
  unlock_requirement_type: string;
  unlock_requirement_value: number;
  rarity: string;
}

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

const rarityColors: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  uncommon: "bg-success/20 text-success",
  rare: "bg-info/20 text-info",
  epic: "bg-pink/20 text-pink",
  legendary: "bg-gradient-primary text-primary-foreground",
};

interface AvatarSelectorProps {
  userId: string;
  currentAvatarId?: string;
  onAvatarChange?: () => void;
}

const AvatarSelector = ({ userId, currentAvatarId, onAvatarChange }: AvatarSelectorProps) => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [unlockedAvatarIds, setUnlockedAvatarIds] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      // Load all avatars
      const { data: avatarsData } = await supabase
        .from("avatars")
        .select("*")
        .order("unlock_requirement_value", { ascending: true });

      if (avatarsData) setAvatars(avatarsData);

      // Load user's profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileData) setProfile(profileData);

      // Load unlocked avatars
      const { data: unlockedData } = await supabase
        .from("user_avatars")
        .select("avatar_id")
        .eq("user_id", userId);

      if (unlockedData) {
        setUnlockedAvatarIds(new Set(unlockedData.map((ua) => ua.avatar_id)));
      }

      // Check for newly unlockable avatars
      if (profileData && avatarsData) {
        checkAndUnlockAvatars(profileData, avatarsData, unlockedData || []);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAndUnlockAvatars = async (
    userProfile: any,
    allAvatars: Avatar[],
    currentUnlocked: any[]
  ) => {
    const currentUnlockedIds = new Set(currentUnlocked.map((ua) => ua.avatar_id));
    const newlyUnlocked: Avatar[] = [];

    for (const avatar of allAvatars) {
      if (currentUnlockedIds.has(avatar.id)) continue;

      let shouldUnlock = false;
      switch (avatar.unlock_requirement_type) {
        case "tasks_completed":
          shouldUnlock = (userProfile.tasks_completed || 0) >= avatar.unlock_requirement_value;
          break;
        case "current_streak":
          shouldUnlock = (userProfile.current_streak || 0) >= avatar.unlock_requirement_value;
          break;
        case "total_points":
          shouldUnlock = (userProfile.total_points || 0) >= avatar.unlock_requirement_value;
          break;
        case "highest_combo":
          shouldUnlock = (userProfile.highest_combo || 0) >= avatar.unlock_requirement_value;
          break;
      }

      if (shouldUnlock) {
        newlyUnlocked.push(avatar);
        await supabase.from("user_avatars").insert({
          user_id: userId,
          avatar_id: avatar.id,
        });
      }
    }

    if (newlyUnlocked.length > 0) {
      toast.success(`Unlocked ${newlyUnlocked.length} new avatar${newlyUnlocked.length > 1 ? "s" : ""}!`);
      loadData();
    }
  };

  const isUnlocked = (avatarId: string) => unlockedAvatarIds.has(avatarId);

  const selectAvatar = async (avatarId: string) => {
    if (!isUnlocked(avatarId)) {
      toast.error("This avatar is locked!");
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ selected_avatar_id: avatarId })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Avatar updated!");
      onAvatarChange?.();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getRequirementText = (avatar: Avatar) => {
    const typeLabels: Record<string, string> = {
      tasks_completed: "Complete",
      current_streak: "Streak of",
      total_points: "Earn",
      highest_combo: "Combo of",
    };

    const label = typeLabels[avatar.unlock_requirement_type] || "";
    const value = avatar.unlock_requirement_value;
    const suffix =
      avatar.unlock_requirement_type === "total_points"
        ? " points"
        : avatar.unlock_requirement_type === "tasks_completed"
        ? " tasks"
        : " days";

    return `${label} ${value}${suffix}`;
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading avatars...</div>;
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle>Avatar Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {avatars.map((avatar) => {
            const unlocked = isUnlocked(avatar.id);
            const selected = currentAvatarId === avatar.id;

            return (
              <button
                key={avatar.id}
                onClick={() => selectAvatar(avatar.id)}
                disabled={!unlocked}
                className={`relative p-3 rounded-lg border-2 transition-all ${
                  selected
                    ? "border-primary shadow-glow-primary"
                    : unlocked
                    ? "border-border hover:border-primary/50 hover-scale"
                    : "border-border/30 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="relative w-full aspect-square mb-2">
                  <img
                    src={avatarImages[avatar.image_url]}
                    alt={avatar.name}
                    className={`w-full h-full object-cover rounded ${!unlocked ? "grayscale" : ""}`}
                  />
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  {selected && (
                    <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="text-xs font-medium text-center mb-1 truncate">{avatar.name}</div>
                <Badge className={`w-full text-[10px] ${rarityColors[avatar.rarity]}`}>
                  {avatar.rarity}
                </Badge>
                {!unlocked && (
                  <div className="text-[10px] text-muted-foreground text-center mt-1">
                    {getRequirementText(avatar)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarSelector;
