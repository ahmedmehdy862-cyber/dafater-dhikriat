-- Add is_public column to memories table
ALTER TABLE memories ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Update existing approved memories to be public
UPDATE memories SET is_public = true WHERE is_public IS NULL;
