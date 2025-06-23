
-- Enable realtime for quiz_sessions table
ALTER TABLE public.quiz_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_sessions;

-- Enable realtime for mind_maps table
ALTER TABLE public.mind_maps REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mind_maps;

-- Add RLS policies for quiz_sessions if not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_sessions' AND policyname = 'Users can view their own quiz sessions'
    ) THEN
        CREATE POLICY "Users can view their own quiz sessions"
          ON public.quiz_sessions
          FOR SELECT
          USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_sessions' AND policyname = 'Users can insert their own quiz sessions'
    ) THEN
        CREATE POLICY "Users can insert their own quiz sessions"
          ON public.quiz_sessions
          FOR INSERT
          WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_sessions' AND policyname = 'Users can delete their own quiz sessions'
    ) THEN
        CREATE POLICY "Users can delete their own quiz sessions"
          ON public.quiz_sessions
          FOR DELETE
          USING (user_id = auth.uid());
    END IF;
END $$;

-- Add RLS policies for mind_maps if not exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'mind_maps' AND policyname = 'Users can view their own mind maps'
    ) THEN
        CREATE POLICY "Users can view their own mind maps"
          ON public.mind_maps
          FOR SELECT
          USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'mind_maps' AND policyname = 'Users can insert their own mind maps'
    ) THEN
        CREATE POLICY "Users can insert their own mind maps"
          ON public.mind_maps
          FOR INSERT
          WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'mind_maps' AND policyname = 'Users can delete their own mind maps'
    ) THEN
        CREATE POLICY "Users can delete their own mind maps"
          ON public.mind_maps
          FOR DELETE
          USING (user_id = auth.uid());
    END IF;
END $$;
