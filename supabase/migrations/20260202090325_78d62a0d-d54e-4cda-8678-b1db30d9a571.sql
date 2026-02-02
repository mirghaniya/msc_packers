-- Create table to store contact form messages
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies - admins can view all messages
CREATE POLICY "Admins can view all contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to update messages (mark as read)
CREATE POLICY "Admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to delete messages
CREATE POLICY "Admins can delete contact messages" 
ON public.contact_messages 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Allow anyone to insert a message (public contact form)
CREATE POLICY "Anyone can submit contact message" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);