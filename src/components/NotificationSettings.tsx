import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { requestNotificationPermission } from "@/lib/notifications";

interface NotificationSettingsProps {
  userId: string;
}

const NotificationSettings = ({ userId }: NotificationSettingsProps) => {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [settings, setSettings] = useState({
    deadlines: true,
    streaks: true,
    badges: true,
    challenges: true,
  });

  useEffect(() => {
    checkPermission();
    loadSettings();
  }, []);

  const checkPermission = () => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      setEnabled(Notification.permission === "granted");
    }
  };

  const loadSettings = () => {
    const saved = localStorage.getItem(`notification_settings_${userId}`);
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const saveSettings = (newSettings: typeof settings) => {
    localStorage.setItem(`notification_settings_${userId}`, JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setEnabled(true);
      setPermission("granted");
      toast.success("Notifications enabled!");
    } else {
      toast.error("Notification permission denied");
    }
  };

  const handleToggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5" />}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about deadlines, streaks, and achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission !== "granted" && (
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm mb-3">Enable notifications to never miss a deadline or lose your streak!</p>
            <Button
              onClick={handleEnableNotifications}
              className="w-full bg-gradient-primary hover:opacity-90"
            >
              Enable Notifications
            </Button>
          </div>
        )}

        {enabled && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="deadlines" className="flex flex-col gap-1">
                <span>Task Deadlines</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Notify before tasks are due
                </span>
              </Label>
              <Switch
                id="deadlines"
                checked={settings.deadlines}
                onCheckedChange={() => handleToggleSetting("deadlines")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="streaks" className="flex flex-col gap-1">
                <span>Streak Reminders</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Daily reminders to maintain your streak
                </span>
              </Label>
              <Switch
                id="streaks"
                checked={settings.streaks}
                onCheckedChange={() => handleToggleSetting("streaks")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="badges" className="flex flex-col gap-1">
                <span>Badge Unlocks</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Celebrate when you earn badges
                </span>
              </Label>
              <Switch
                id="badges"
                checked={settings.badges}
                onCheckedChange={() => handleToggleSetting("badges")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="challenges" className="flex flex-col gap-1">
                <span>Challenge Updates</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Progress on weekly challenges
                </span>
              </Label>
              <Switch
                id="challenges"
                checked={settings.challenges}
                onCheckedChange={() => handleToggleSetting("challenges")}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
