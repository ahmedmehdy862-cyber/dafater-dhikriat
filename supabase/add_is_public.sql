-- Add is_public column to memories table (skip if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memories' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE memories ADD COLUMN is_public BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Set existing memories to public
UPDATE memories SET is_public = true WHERE is_public IS NULL;
