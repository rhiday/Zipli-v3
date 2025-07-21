-- Create the qr_login_tokens table for handling QR code based login
CREATE TABLE IF NOT EXISTS public.qr_login_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token UUID NOT NULL UNIQUE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE NOT NULL
);

-- Add RLS policies
ALTER TABLE public.qr_login_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service role access
CREATE POLICY "Service role can do CRUD on qr_login_tokens" 
  ON public.qr_login_tokens
  USING (true)
  WITH CHECK (true);

-- Anonymous users need to read tokens to validate them during scanning
CREATE POLICY "Anonymous users can select from qr_login_tokens" 
  ON public.qr_login_tokens 
  FOR SELECT 
  TO anon 
  USING (true);

-- Anonymous users need to update tokens after scanning (mark as used)
CREATE POLICY "Anonymous users can update qr_login_tokens" 
  ON public.qr_login_tokens 
  FOR UPDATE 
  TO anon 
  USING (true)
  WITH CHECK (true); 