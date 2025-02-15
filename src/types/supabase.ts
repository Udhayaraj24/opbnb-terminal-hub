
export interface Package {
  id: number;
  name: string;
  amount: number;
}

export interface Referral {
  id: string;
  user_id: string;
  referrer_id: string | null;
  package_id: number;
  referral_code: string;
  level: number;
  created_at: string;
}
