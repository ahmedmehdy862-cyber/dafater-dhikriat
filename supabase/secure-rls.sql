-- ============================================
-- تقييد RLS — شغّل هذا في Supabase SQL Editor
-- ============================================
-- السبب: سياسات current بتسمح لأي حد بـ anon key إنه:
--   1) يدخل ذكريات بحالة approved مباشرة (بتجاوز المراجعة)
--   2) يمسح/يرفع أي صورة في البакيت
-- كل عمليات الكتابة بتتم عن طريق service role في الـ API،
-- فمفيش أي سبب نسيب الكتابة مفتوحة للـ anon.

-- 1) القراءة: خلي القراءة المباشرة للـ anon مقفولة خالص
--    (القراءة بتحصل من الـ API بالـ service role)
DROP POLICY IF EXISTS "Public can view approved memories" ON memories;
DROP POLICY IF EXISTS "Anyone can submit a memory" ON memories;
DROP POLICY IF EXISTS "Admin full access" ON memories;

-- 2) التأكد إن RLS مقفول على الكتابة
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
DELETE FROM pg_policies WHERE tablename = 'memories';

-- 3) الصور: الكتابة كلها بالـ service role، القراءة عامة للروابط
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete images" ON storage.objects;

-- سياسة قراءة عامة للصور (الروابط لازم تفضل شغالة)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Public can view images'
      AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public can view images" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'memory-images');
  END IF;
END $$;
