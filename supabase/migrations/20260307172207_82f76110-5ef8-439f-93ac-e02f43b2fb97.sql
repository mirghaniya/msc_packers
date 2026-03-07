-- This migration ensures RLS and policies for the favorites table are tracked in code.

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Users can view their own favorites') THEN
    CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Users can add their own favorites') THEN
    CREATE POLICY "Users can add their own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Users can remove their own favorites') THEN
    CREATE POLICY "Users can remove their own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;