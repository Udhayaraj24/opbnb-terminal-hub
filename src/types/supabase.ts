
export interface Package {
  id: number;
  name: string;
  amount: number;
  created_at?: string;
}

export interface Referral {
  id: string;
  user_id: string;
  referrer_id: string | null;
  package_id: number;
  referral_code: string;
  unique_id: string;
  level: number;
  activation_date: string;
  created_at: string;
}

export interface UserBonuses {
  id: string;
  user_id: string;
  direct_referrals_count: number;
  community_size: number;
  total_direct_bonus: number;
  total_referral_bonus: number;
  total_upgrade_bonus: number;
  total_level_up_bonus: number;
  total_royalty_bonus: number;
  total_rewarded_bonus: number;
  recent_bonus: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralTreeNode {
  user_id: string;
  referrer_id: string | null;
  level: number;
  package_id: number;
  referral_code: string;
}
