-- Allow users to update their own quiz metadata (for renaming)
CREATE POLICY "Users can update their own quiz metadata"
ON enem_quiz_metadata
FOR UPDATE
USING (
  resumo_id IN (
    SELECT r.id
    FROM resumos r
    JOIN uploads u ON r.upload_id = u.id
    WHERE u.user_id = auth.uid()
  )
)
WITH CHECK (
  resumo_id IN (
    SELECT r.id
    FROM resumos r
    JOIN uploads u ON r.upload_id = u.id
    WHERE u.user_id = auth.uid()
  )
);