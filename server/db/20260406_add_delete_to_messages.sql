-- Migration: Add delete flags to messages table
-- Purpose: Allow users to delete messages from their own perspective without affecting the other user.
-- Requirement: 3.16.2.4

-- 1. Add boolean columns for soft-deletion by sender and receiver
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS deleted_by_sender BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_by_receiver BOOLEAN DEFAULT FALSE;

-- 2. Add an index for performance on unread message queries (Req 3.16.2.6)
CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON messages (receiver_id, is_read) 
WHERE is_read = FALSE;

-- 3. Add an index for the chat list previews
CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON messages (sender_id, receiver_id, created_at DESC);

-- NOTE: Ensure your Supabase RLS policies allow the authenticated user 
-- to UPDATE these new boolean columns on their own sent/received messages.
