-- Add penalty_applied column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS penalty_applied BOOLEAN DEFAULT false;

-- Create index for overdue task checks
CREATE INDEX IF NOT EXISTS idx_tasks_overdue ON tasks(completed, deadline) WHERE completed = false;

-- Update notification settings function to handle overdue notifications
CREATE OR REPLACE FUNCTION check_overdue_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function is a placeholder for the edge function trigger
  -- The actual logic is in the edge function
  RAISE NOTICE 'Overdue tasks check triggered';
END;
$$;