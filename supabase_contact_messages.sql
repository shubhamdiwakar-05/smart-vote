-- SQL script to create the contact_messages table for storing user concerns
-- Run this in your Supabase SQL Editor

CREATE TABLE public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' NOT NULL, -- 'Pending', 'In Progress', 'Resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id TEXT
);

-- Create support_messages table for the chat system
CREATE TABLE public.support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.contact_messages(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_role TEXT NOT NULL, -- 'user' or 'admin'
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional: Enable Row Level Security (RLS) if you want to secure it
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to insert (submit contact form)
CREATE POLICY "Anyone can submit a contact message" 
ON public.contact_messages FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Enable read access for all users" 
ON public.contact_messages FOR SELECT 
TO public
USING (true);

CREATE POLICY "Enable update for all users" 
ON public.contact_messages FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Support messages policies
CREATE POLICY "Enable read access for support messages" 
ON public.support_messages FOR SELECT 
TO public
USING (true);

CREATE POLICY "Enable insert for support messages" 
ON public.support_messages FOR INSERT 
TO public
WITH CHECK (true);
