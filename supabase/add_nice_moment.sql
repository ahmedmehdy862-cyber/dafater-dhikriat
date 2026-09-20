DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memories' AND column_name = 'nice_moment'
  ) THEN
    ALTER TABLE memories ADD COLUMN nice_moment TEXT;
  END IF;
END $$;
