DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memories' AND column_name = 'show_name'
  ) THEN
    ALTER TABLE memories ADD COLUMN show_name BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memories' AND column_name = 'show_nice_moment'
  ) THEN
    ALTER TABLE memories ADD COLUMN show_nice_moment BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memories' AND column_name = 'show_image'
  ) THEN
    ALTER TABLE memories ADD COLUMN show_image BOOLEAN DEFAULT true;
  END IF;
END $$;
