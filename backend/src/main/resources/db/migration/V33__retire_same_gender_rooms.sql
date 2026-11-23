-- Runs after V32__all_rooms_same_gender (kept unchanged because databases may already have applied it).
-- Keep the compatibility columns; room discovery and participation are no longer gender-filtered.
-- Clear agreement flags for open rooms whose conditions changed, so participants review again.
UPDATE room_participants p SET confirmed_terms_version = NULL
WHERE p.room_id IN (SELECT id FROM ride_rooms WHERE same_gender_only = true AND status IN ('OPEN','COORDINATING'));

UPDATE ride_rooms SET terms_version = terms_version + 1, updated_at = now()
WHERE same_gender_only = true AND status IN ('OPEN','COORDINATING');

UPDATE ride_rooms SET same_gender_only = false, restricted_gender = NULL
WHERE same_gender_only = true OR restricted_gender IS NOT NULL;
