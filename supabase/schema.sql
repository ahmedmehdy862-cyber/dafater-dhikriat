-- ============================================
-- دفتر الذكريات — Database Schema for Supabase
-- ============================================

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  university TEXT,
  message TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  consent_to_publish BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_memories_status ON memories(status);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-images', 'memory-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved memories
CREATE POLICY "Public can view approved memories" ON memories
  FOR SELECT
  USING (status = 'approved');

-- Allow anyone to insert (submit a memory)
CREATE POLICY "Anyone can submit a memory" ON memories
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated admin to do everything
CREATE POLICY "Admin full access" ON memories
  FOR ALL
  USING (auth.role() = 'service_role');

-- Storage policies
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'memory-images');

CREATE POLICY "Anyone can upload images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'memory-images');

CREATE POLICY "Admin can delete images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'memory-images');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
