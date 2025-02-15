
import React from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ReferralNode {
  user_id: string;
  referrer_id: string | null;
  level: number;
  package_id: number;
  referral_code: string;
}

interface ReferralTreeProps {
  data: ReferralNode[] | null;
  isLoading: boolean;
}

const ReferralTree: React.FC<ReferralTreeProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="w-full bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Loading Referral Network...
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full bg-white/20" />
            <Skeleton className="h-12 w-full bg-white/20" />
            <Skeleton className="h-12 w-full bg-white/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="w-full bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Referral Network
            </div>
          </CardTitle>
          <CardDescription className="text-white/70">
            No referrals found in your network yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const groupByLevel = (nodes: ReferralNode[]) => {
    return nodes.reduce((acc, node) => {
      const level = node.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(node);
      return acc;
    }, {} as Record<number, ReferralNode[]>);
  };

  const leveledData = groupByLevel(data);

  return (
    <Card className="w-full bg-white/10 backdrop-blur-xl border border-white/20">
      <CardHeader>
        <CardTitle className="text-white">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Referral Network
          </div>
        </CardTitle>
        <CardDescription className="text-white/70">
          {data.length - 1} members in your network across {Object.keys(leveledData).length} levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(leveledData).map(([level, nodes]) => (
            <div key={level} className="space-y-2">
              <h4 className="text-sm font-medium text-white/70">Level {level}</h4>
              <div className="grid gap-2">
                {nodes.map((node) => (
                  <div
                    key={node.user_id}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 transition-colors hover:bg-white/10"
                  >
                    <div className="text-sm text-white font-mono truncate">
                      {node.user_id}
                    </div>
                    {node.referral_code && (
                      <div className="text-xs text-white/50 mt-1">
                        Referral Code: {node.referral_code}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralTree;
