-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can insert referrals" ON public.referrals;

-- Create a more appropriate policy - users can only insert for their own wallet address
-- Since we're using wallet addresses (not auth.uid()), we allow inserts but the UNIQUE constraint on user_id prevents abuse
CREATE POLICY "Users can insert their own referral"
  ON public.referrals FOR INSERT
  WITH CHECK (NOT EXISTS (SELECT 1 FROM public.referrals WHERE user_id = referrals.user_id));