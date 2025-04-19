-- Create a stored procedure to update models after a vote
CREATE OR REPLACE FUNCTION update_models_after_vote(
  model_a_id TEXT,
  model_b_id TEXT,
  new_rating_a INTEGER,
  new_rating_b INTEGER,
  choice_a INTEGER,
  choice_b INTEGER,
  choice_tie INTEGER
) RETURNS void AS $$
BEGIN
  -- Update model A
  UPDATE models
  SET 
    elo_rating = new_rating_a,
    wins = wins + choice_a,
    losses = losses + choice_b,
    ties = ties + choice_tie,
    total_votes = total_votes + 1
  WHERE id = model_a_id;
  
  -- Update model B
  UPDATE models
  SET 
    elo_rating = new_rating_b,
    wins = wins + choice_b,
    losses = losses + choice_a,
    ties = ties + choice_tie,
    total_votes = total_votes + 1
  WHERE id = model_b_id;
END;
$$ LANGUAGE plpgsql;
