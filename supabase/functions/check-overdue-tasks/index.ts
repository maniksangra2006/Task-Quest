import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all incomplete overdue tasks
    const now = new Date().toISOString();
    const { data: overdueTasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, user_id, title, deadline, points")
      .eq("completed", false)
      .lt("deadline", now);

    if (tasksError) throw tasksError;

    console.log(`Found ${overdueTasks?.length || 0} overdue tasks`);

    const results = [];

    for (const task of overdueTasks || []) {
      // Calculate penalty (20% of task points, minimum 5 XP)
      const penalty = Math.max(Math.floor(task.points * 0.2), 5);

      // Get current profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_points")
        .eq("id", task.user_id)
        .single();

      if (!profile) continue;

      // Apply penalty to user profile (ensure it doesn't go negative)
      const newPoints = Math.max((profile.total_points || 0) - penalty, 0);
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ total_points: newPoints })
        .eq("id", task.user_id);

      if (profileError) {
        console.error(`Error applying penalty for task ${task.id}:`, profileError);
        continue;
      }

      // Mark task as having penalty applied
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ penalty_applied: true })
        .eq("id", task.id);

      if (taskError) {
        console.error(`Error updating task ${task.id}:`, taskError);
      }

      results.push({
        task_id: task.id,
        user_id: task.user_id,
        title: task.title,
        penalty_applied: penalty,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error checking overdue tasks:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
