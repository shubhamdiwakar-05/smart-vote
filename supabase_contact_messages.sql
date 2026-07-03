-- SQL script to create the contact_messages table for storing user concerns
-- Run this in your Supabase SQL Editor

CREATE TABLE public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' NOT NULL, -- 'Pending', 'In Progress', 'Resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional: Enable Row Level Security (RLS) if you want to secure it
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to insert (submit contact form)
CREATE POLICY "Anyone can submit a contact message" 
ON public.contact_messages FOR INSERT 
TO public
WITH CHECK (true);

-- Only allow authenticated admins to select/update messages
-- Note: You should adjust this policy based on how your admin roles are structured.
-- For this demo, we can allow authenticated users to read/update if they are admins.
CREATE POLICY "Enable read access for all users" 
ON public.contact_messages FOR SELECT 
TO public
USING (true);

CREATE POLICY "Enable update for all users" 
ON public.contact_messages FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
