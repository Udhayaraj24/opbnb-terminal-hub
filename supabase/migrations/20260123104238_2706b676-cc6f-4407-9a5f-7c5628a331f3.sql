-- Create packages table
CREATE TABLE public.packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Everyone can view packages
CREATE POLICY "Anyone can view packages"
  ON public.packages FOR SELECT
  USING (true);

-- Insert default packages
INSERT INTO public.packages (name, amount) VALUES
  ('Starter', 0.01),
  ('Bronze', 0.05),
  ('Silver', 0.1),
  ('Gold', 0.25),
  ('Platinum', 0.5),
  ('Diamond', 1),
  ('Elite', 2.5),
  ('VIP', 5);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  referrer_id TEXT,
  package_id INTEGER REFERENCES public.packages(id),
  referral_code TEXT NOT NULL DEFAULT substring(md5(random()::text), 1, 8),
  unique_id TEXT NOT NULL DEFAULT substring(md5(random()::text), 1, 6),
  level INTEGER NOT NULL DEFAULT 1,
  activation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Anyone can view referrals (for tree building)
CREATE POLICY "Anyone can view referrals"
  ON public.referrals FOR SELECT
  USING (true);

-- Users can insert their own referral
CREATE POLICY "Users can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

-- Create user_bonuses table
CREATE TABLE public.user_bonuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  direct_referrals_count INTEGER NOT NULL DEFAULT 0,
  community_size INTEGER NOT NULL DEFAULT 0,
  total_direct_bonus NUMERIC NOT NULL DEFAULT 0,
  total_referral_bonus NUMERIC NOT NULL DEFAULT 0,
  total_upgrade_bonus NUMERIC NOT NULL DEFAULT 0,
  total_level_up_bonus NUMERIC NOT NULL DEFAULT 0,
  total_royalty_bonus NUMERIC NOT NULL DEFAULT 0,
  total_rewarded_bonus NUMERIC NOT NULL DEFAULT 0,
  recent_bonus NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user_bonuses
ALTER TABLE public.user_bonuses ENABLE ROW LEVEL SECURITY;

-- Anyone can view their own bonuses
CREATE POLICY "Anyone can view bonuses"
  ON public.user_bonuses FOR SELECT
  USING (true);

-- Create get_referral_tree function
CREATE OR REPLACE FUNCTION public.get_referral_tree(user_uuid TEXT)
RETURNS TABLE (
  user_id TEXT,
  referrer_id TEXT,
  level INTEGER,
  package_id INTEGER,
  referral_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE tree AS (
    -- Start with the user
    SELECT r.user_id, r.referrer_id, r.level, r.package_id, r.referral_code, 0 as depth
    FROM public.referrals r
    WHERE r.user_id = user_uuid
    
    UNION ALL
    
    -- Get upline (referrers)
    SELECT r.user_id, r.referrer_id, r.level, r.package_id, r.referral_code, t.depth + 1
    FROM public.referrals r
    INNER JOIN tree t ON r.user_id = t.referrer_id
    WHERE t.depth < 11
  )
  SELECT tree.user_id, tree.referrer_id, tree.level, tree.package_id, tree.referral_code
  FROM tree
  WHERE tree.depth > 0
  ORDER BY tree.depth;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;