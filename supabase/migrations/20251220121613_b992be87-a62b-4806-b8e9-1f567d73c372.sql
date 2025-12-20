-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create enum for cheque status
CREATE TYPE public.cheque_status AS ENUM ('pending', 'deposited', 'cleared', 'bounced');

-- Create enum for bounce reason
CREATE TYPE public.bounce_reason AS ENUM ('insufficient_funds', 'signature_mismatch', 'account_closed', 'stop_payment', 'stale_dated', 'other');

-- Create enum for recovery status
CREATE TYPE public.recovery_status AS ENUM ('pending', 'in_progress', 'recovered', 'written_off');

-- Create cheques table
CREATE TABLE public.cheques (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  party_name TEXT NOT NULL,
  cheque_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  status cheque_status NOT NULL DEFAULT 'pending',
  bounce_reason bounce_reason,
  bounce_date DATE,
  bounce_remarks TEXT,
  recovery_status recovery_status,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cheques
ALTER TABLE public.cheques ENABLE ROW LEVEL SECURITY;

-- Cheques policies
CREATE POLICY "Users can view their own cheques" 
ON public.cheques FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cheques" 
ON public.cheques FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cheques" 
ON public.cheques FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cheques" 
ON public.cheques FOR DELETE 
USING (auth.uid() = user_id);

-- Create follow-ups table for tracking recovery actions
CREATE TABLE public.follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cheque_id UUID NOT NULL REFERENCES public.cheques(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_date DATE NOT NULL,
  next_follow_up_date DATE,
  notes TEXT,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on follow_ups
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- Follow-ups policies
CREATE POLICY "Users can view their own follow-ups" 
ON public.follow_ups FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own follow-ups" 
ON public.follow_ups FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own follow-ups" 
ON public.follow_ups FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follow-ups" 
ON public.follow_ups FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cheques_updated_at
BEFORE UPDATE ON public.cheques
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();