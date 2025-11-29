-- Fix the handle_task_completion function to include ELSE clause in CASE statement
CREATE OR REPLACE FUNCTION public.handle_task_completion(task_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_points INTEGER;
  v_profile RECORD;
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_streak_exists BOOLEAN;
  v_yesterday_streak_exists BOOLEAN;
  v_new_badges json[];
  v_badge RECORD;
BEGIN
  -- Get task info
  SELECT user_id, points INTO v_user_id, v_points
  FROM tasks
  WHERE id = task_id AND completed = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Task not found or not completed');
  END IF;
  
  -- Get current profile
  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;
  
  -- Update profile stats
  UPDATE profiles
  SET 
    total_points = COALESCE(total_points, 0) + v_points,
    tasks_completed = COALESCE(tasks_completed, 0) + 1,
    updated_at = now()
  WHERE id = v_user_id;
  
  -- Handle streak logic
  SELECT EXISTS(
    SELECT 1 FROM streaks 
    WHERE user_id = v_user_id AND streak_date = v_today
  ) INTO v_streak_exists;
  
  SELECT EXISTS(
    SELECT 1 FROM streaks 
    WHERE user_id = v_user_id AND streak_date = v_yesterday
  ) INTO v_yesterday_streak_exists;
  
  -- Insert or update today's streak
  IF NOT v_streak_exists THEN
    INSERT INTO streaks (user_id, streak_date, tasks_completed)
    VALUES (v_user_id, v_today, 1);
    
    -- Update streak count
    IF v_yesterday_streak_exists THEN
      -- Continue streak
      UPDATE profiles
      SET 
        current_streak = COALESCE(current_streak, 0) + 1,
        longest_streak = GREATEST(COALESCE(longest_streak, 0), COALESCE(current_streak, 0) + 1)
      WHERE id = v_user_id;
    ELSE
      -- Start new streak
      UPDATE profiles
      SET 
        current_streak = 1,
        longest_streak = GREATEST(COALESCE(longest_streak, 0), 1)
      WHERE id = v_user_id;
    END IF;
  ELSE
    -- Just increment today's task count
    UPDATE streaks
    SET tasks_completed = tasks_completed + 1
    WHERE user_id = v_user_id AND streak_date = v_today;
  END IF;
  
  -- Get updated profile for badge checking
  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;
  
  -- Check and award badges
  v_new_badges := ARRAY[]::json[];
  
  FOR v_badge IN 
    SELECT b.* 
    FROM badges b
    WHERE NOT EXISTS (
      SELECT 1 FROM user_badges ub 
      WHERE ub.user_id = v_user_id AND ub.badge_id = b.id
    )
  LOOP
    DECLARE
      should_award BOOLEAN := false;
    BEGIN
      CASE v_badge.requirement_type
        WHEN 'tasks_completed' THEN
          should_award := v_profile.tasks_completed >= v_badge.requirement_value;
        WHEN 'current_streak' THEN
          should_award := v_profile.current_streak >= v_badge.requirement_value;
        WHEN 'total_points' THEN
          should_award := v_profile.total_points >= v_badge.requirement_value;
        ELSE
          should_award := false;
      END CASE;
      
      IF should_award THEN
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (v_user_id, v_badge.id);
        
        -- Add bonus points for badge
        UPDATE profiles
        SET total_points = total_points + COALESCE(v_badge.points, 0)
        WHERE id = v_user_id;
        
        v_new_badges := array_append(v_new_badges, 
          json_build_object(
            'id', v_badge.id,
            'name', v_badge.name,
            'icon', v_badge.icon,
            'points', v_badge.points
          )
        );
      END IF;
    END;
  END LOOP;
  
  -- Return updated stats and new badges
  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;
  
  RETURN json_build_object(
    'total_points', v_profile.total_points,
    'tasks_completed', v_profile.tasks_completed,
    'current_streak', v_profile.current_streak,
    'longest_streak', v_profile.longest_streak,
    'new_badges', v_new_badges,
    'points_earned', v_points
  );
END;
$function$;