
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Users, Trophy, Star, Gift, TrendingUp, User, Clock, Package } from 'lucide-react';
import { format } from 'date-fns';

interface StatsProps {
  directReferrals: number;
  communitySize: number;
  directBonus: number;
  referralBonus: number;
  upgradeBonus: number;
  levelUpBonus: number;
  royaltyBonus: number;
  rewardedBonus: number;
  recentBonus: number;
  bnbPrice: number;
  isLoading: boolean;
  uniqueId?: string;
  referralCode?: string;
  packageLevel?: number;
  activationDate?: string;
  referredBy?: string;
}

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  subValue?: string;
}> = ({ title, value, icon, subValue }) => (
  <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-white/70">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subValue && (
        <p className="text-xs text-white/50 mt-1">{subValue}</p>
      )}
    </CardContent>
  </Card>
);

const Stats: React.FC<StatsProps> = ({
  directReferrals,
  communitySize,
  directBonus,
  referralBonus,
  upgradeBonus,
  levelUpBonus,
  royaltyBonus,
  rewardedBonus,
  recentBonus,
  bnbPrice,
  isLoading,
  uniqueId,
  referralCode,
  packageLevel,
  activationDate,
  referredBy,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <Card key={i} className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24 bg-white/20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 bg-white/20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatBNB = (amount: number) => {
    return `${amount.toFixed(4)} BNB`;
  };

  const formatUSD = (bnbAmount: number) => {
    return `≈ $${(bnbAmount * bnbPrice).toFixed(2)} USD`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Unique ID"
        value={uniqueId || 'Not Available'}
        icon={<User className="h-4 w-4 text-white/70" />}
      />
      <StatCard
        title="Referral Code"
        value={referralCode || 'Not Available'}
        icon={<Users className="h-4 w-4 text-white/70" />}
      />
      <StatCard
        title="Package Level"
        value={packageLevel ? `Level ${packageLevel}` : 'Not Activated'}
        icon={<Package className="h-4 w-4 text-white/70" />}
      />
      <StatCard
        title="Activation Date"
        value={activationDate ? format(new Date(activationDate), 'PPP') : 'Not Activated'}
        icon={<Clock className="h-4 w-4 text-white/70" />}
        subValue={activationDate ? format(new Date(activationDate), 'pp') : undefined}
      />
      <StatCard
        title="Referred By"
        value={referredBy || 'Not Referred'}
        icon={<User className="h-4 w-4 text-white/70" />}
      />
      <StatCard
        title="Direct Referrals"
        value={directReferrals.toString()}
        icon={<Users className="h-4 w-4 text-white/70" />}
        subValue={`Total Community: ${communitySize}`}
      />
      <StatCard
        title="Direct Bonus"
        value={formatBNB(directBonus)}
        icon={<DollarSign className="h-4 w-4 text-white/70" />}
        subValue={formatUSD(directBonus)}
      />
      <StatCard
        title="Referral Bonus"
        value={formatBNB(referralBonus)}
        icon={<Gift className="h-4 w-4 text-white/70" />}
        subValue={formatUSD(referralBonus)}
      />
      <StatCard
        title="Upgrade Bonus"
        value={formatBNB(upgradeBonus)}
        icon={<TrendingUp className="h-4 w-4 text-white/70" />}
        subValue={formatUSD(upgradeBonus)}
      />
    </div>
  );
};

export default Stats;
