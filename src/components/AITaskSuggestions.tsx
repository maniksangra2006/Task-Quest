import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Suggestion {
  title: string;
  description: string;
  priority: string;
  category: string;
  estimatedDays: number;
}

interface AITaskSuggestionsProps {
  onTaskCreated: () => void;
  profile: any;
  recentTasks: any[];
}

const AITaskSuggestions = ({ onTaskCreated, profile, recentTasks }: AITaskSuggestionsProps) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [adding, setAdding] = useState<Set<number>>(new Set());

  const getSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("task-suggestions", {
        body: {
          profile,
          recentTasks: recentTasks.slice(0, 10),
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setSuggestions(data.suggestions || []);
      toast.success(`Generated ${data.suggestions?.length || 0} AI suggestions!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (suggestion: Suggestion, index: number) => {
    setAdding((prev) => new Set(prev).add(index));
    
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + suggestion.estimatedDays);
      deadline.setHours(17, 0, 0, 0);

      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        category: suggestion.category,
        deadline: deadline.toISOString(),
      });

      if (error) throw error;

      toast.success("Task added to your list!");
      setSuggestions((prev) => prev.filter((_, i) => i !== index));
      onTaskCreated();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAdding((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 hover-scale shadow-lg hover:shadow-glow-primary transition-all">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Task Suggestions
        </CardTitle>
        <CardDescription>
          Let AI analyze your habits and recommend tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <Button
            onClick={getSuggestions}
            disabled={loading}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Suggestions
              </>
            )}
          </Button>
        ) : (
          <>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 bg-secondary/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{suggestion.title}</h4>
                    <Button
                      size="sm"
                      onClick={() => addTask(suggestion, index)}
                      disabled={adding.has(index)}
                      className="bg-primary hover:opacity-90"
                    >
                      {adding.has(index) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {suggestion.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{suggestion.priority}</Badge>
                    <Badge variant="outline">{suggestion.category}</Badge>
                    <Badge variant="outline">{suggestion.estimatedDays}d</Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={getSuggestions}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get New Suggestions
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AITaskSuggestions;
