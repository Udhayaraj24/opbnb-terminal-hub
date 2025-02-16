
import React from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Users, Share2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

  const copyReferralLink = async (referralCode: string) => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    await navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard"
    });
  };

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

  const userReferralCode = data[0]?.referral_code;
  const directReferrals = data.filter(node => node.referrer_id === data[0].user_id);
  const remainingSlots = 5 - directReferrals.length;

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
        {userReferralCode && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-white/70 mb-1">Your Referral Code</h4>
                <div className="font-mono text-lg text-white">{userReferralCode}</div>
              </div>
              <Button
                onClick={() => copyReferralLink(userReferralCode)}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-white/70" />
              <span className="text-sm text-white/70">
                {remainingSlots} direct referral {remainingSlots === 1 ? 'slot' : 'slots'} remaining
              </span>
            </div>
          </div>
        )}
        <CardDescription className="text-white/70 mt-4">
          {data.length - 1} members in your network across {Object.keys(leveledData).length} levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(leveledData).map(([level, nodes]) => (
            <div key={level} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white/70">Level {level}</h4>
                <Badge variant="secondary" className="bg-white/10">
                  {nodes.length} {nodes.length === 1 ? 'member' : 'members'}
                </Badge>
              </div>
              <div className="grid gap-3">
                {nodes.map((node) => (
                  <div
                    key={node.user_id}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 transition-colors hover:bg-white/10"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-sm text-white font-mono truncate">
                          {node.user_id}
                        </div>
                        {node.referral_code && (
                          <div className="text-xs text-white/50 mt-1">
                            Referral Code: {node.referral_code}
                          </div>
                        )}
                      </div>
                      {node.referral_code && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full sm:w-auto"
                          onClick={() => copyReferralLink(node.referral_code)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      )}
                    </div>
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
