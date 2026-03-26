-- ============================================================
-- GolfGives — Enforce Rolling Window of 5 Scores per User
-- ============================================================
-- This trigger fires AFTER INSERT on the scores table.
-- If the user has more than 5 scores, the row with the oldest
-- `date` is deleted (ties broken by created_at).
-- ============================================================

-- Drop existing trigger (if upgrading from the old BEFORE INSERT version)
DROP TRIGGER IF EXISTS enforce_max_scores_trigger ON scores;
DROP FUNCTION IF EXISTS enforce_max_scores();

CREATE OR REPLACE FUNCTION enforce_max_scores()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER;
  oldest_score_id UUID;
BEGIN
  -- Count how many scores this user now has (including the just-inserted row)
  SELECT COUNT(*) INTO score_count
  FROM scores
  WHERE user_id = NEW.user_id;

  -- If more than 5, delete the one with the oldest date
  IF score_count > 5 THEN
    SELECT id INTO oldest_score_id
    FROM scores
    WHERE user_id = NEW.user_id
      AND id <> NEW.id            -- Exclude the just-inserted row
    ORDER BY date ASC, created_at ASC
    LIMIT 1;

    IF oldest_score_id IS NOT NULL THEN
      DELETE FROM scores WHERE id = oldest_score_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fire AFTER insert so the new row already exists in the table
CREATE TRIGGER enforce_max_scores_trigger
AFTER INSERT ON scores
FOR EACH ROW EXECUTE FUNCTION enforce_max_scores();
