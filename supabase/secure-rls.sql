-- ============================================
-- تقييد RLS — شغّل هذا في Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → Run)
-- ============================================
-- السبب: سياساتك الحالية بتسمح لأي حد بالـ anon key إنه:
--   1) يدخل ذكريات بحالة approved مباشرة (بتجاوز المراجعة)
--   2) يمسح/يرفع أي صورة في الباكيت (سياسة الحذف مفتوحة للكل!)
-- كل عمليات الكتابة في الموقع بتم عن طريق service role في الـ API،
-- فمفيش أي سبب نسيب الكتابة مفتوحة للـ anon.

-- 1) جدول الذكريات: شيل كل السياسات واقفل القراءة المباشرة
DROP POLICY IF EXISTS "Public can view approved memories" ON memories;
DROP POLICY IF EXISTS "Anyone can submit a memory" ON memories;
DROP POLICY IF EXISTS "Admin full access" ON memories;

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- 2) الصور: شيل سياسات الكتابة المفتوحة للكل
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete images" ON storage.objects;

-- سياسة قراءة عامة للصور (الروابط لازم تفضل شغالة)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Public can view images'
      AND tablename = 'objects'
      AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Public can view images" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'memory-images');
  END IF;
END $$;

-- انتهى. الموقع هيفضل شغال عادي لأن الـ API بيستخدم service role
-- اللي بيتخطى RLS تمامًا.
