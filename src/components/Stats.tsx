
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Users, Trophy, Star, Gift, TrendingUp } from 'lucide-react';

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
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
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
      <StatCard
        title="Level Up Bonus"
        value={formatBNB(levelUpBonus)}
        icon={<Trophy className="h-4 w-4 text-white/70" />}
        subValue={formatUSD(levelUpBonus)}
      />
      <StatCard
        title="Royalty Bonus"
        value={formatBNB(royaltyBonus)}
        icon={<Star className="h-4 w-4 text-white/70" />}
        subValue={formatUSD(royaltyBonus)}
      />
    </div>
  );
};

export default Stats;
