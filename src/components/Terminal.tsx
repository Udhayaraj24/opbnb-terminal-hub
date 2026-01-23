import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Packages from './Packages';
import ReferralTree from './ReferralTree';
import Stats from './Stats';
import { fetchBNBPrice } from '@/utils/price';
import { calculateDistribution, DistributionShare } from '@/utils/priceDistribution';

interface ReferralNode {
  user_id: string;
  referrer_id: string | null;
  level: number;
  package_id: number;
  referral_code: string;
}

interface UserBonuses {
  direct_referrals_count: number;
  community_size: number;
  total_direct_bonus: number;
  total_referral_bonus: number;
  total_upgrade_bonus: number;
  total_level_up_bonus: number;
  total_royalty_bonus: number;
  total_rewarded_bonus: number;
  recent_bonus: number;
}

const Terminal = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transacting, setTransacting] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralTree, setReferralTree] = useState<ReferralNode[] | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [userBonuses, setUserBonuses] = useState<UserBonuses | null>(null);
  const [bonusesLoading, setBonusesLoading] = useState(false);
  const [referralDetails, setReferralDetails] = useState<any | null>(null);
  const { toast } = useToast();

  const RECIPIENT_ADDRESS = "0xE484201328c61Fbc8aCc316B9Ea4b2dC3A4EDEA9";

  const updateBalance = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchUserBonuses = async () => {
    if (!account) return;
    try {
      setBonusesLoading(true);
      const { data, error } = await supabase
        .from('user_bonuses' as any)
        .select('*')
        .eq('user_id', account)
        .maybeSingle(); // Changed from .single() to .maybeSingle()
      
      if (error) throw error;
      setUserBonuses((data as unknown as UserBonuses) || {
        direct_referrals_count: 0,
        community_size: 0,
        total_direct_bonus: 0,
        total_referral_bonus: 0,
        total_upgrade_bonus: 0,
        total_level_up_bonus: 0,
        total_royalty_bonus: 0,
        total_rewarded_bonus: 0,
        recent_bonus: 0,
      });
    } catch (error: any) {
      console.error('Error fetching user bonuses:', error);
    } finally {
      setBonusesLoading(false);
    }
  };

  const fetchReferralDetails = async () => {
    if (!account) return;
    try {
      const { data, error } = await supabase
        .from('referrals' as any)
        .select('*')
        .eq('user_id', account)
        .maybeSingle(); // Changed from .single() to .maybeSingle()
      
      if (error) throw error;
      setReferralDetails(data || null);
    } catch (error: any) {
      console.error('Error fetching referral details:', error);
    }
  };

  useEffect(() => {
    const updateBNBPrice = async () => {
      const price = await fetchBNBPrice();
      setBnbPrice(price);
    };
    updateBNBPrice();
    const interval = setInterval(updateBNBPrice, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchReferralTree = async () => {
    if (!account) return;
    try {
      setTreeLoading(true);
      const { data, error } = await supabase.rpc('get_referral_tree' as any, {
        user_uuid: account
      });
      if (error) throw error;
      setReferralTree(data);
    } catch (error: any) {
      toast({
        title: "Error Loading Referral Tree",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTreeLoading(false);
    }
  };

  useEffect(() => {
    const getReferralCode = async () => {
      if (!account) return;
      const { data, error } = await supabase
        .from('referrals' as any)
        .select('referral_code')
        .eq('user_id', account)
        .maybeSingle();
      if (data) {
        setReferralCode((data as any).referral_code);
      }
    };
    getReferralCode();
    fetchReferralTree();
    fetchReferralDetails();
    fetchUserBonuses();
  }, [account]);

  const copyReferralLink = async () => {
    if (!referralCode) return;
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard"
    });
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Update balance periodically
  useEffect(() => {
    if (!account) return;

    updateBalance(account);
    const interval = setInterval(() => {
      updateBalance(account);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [account]);

  const handlePackageSelect = async (packageId: number, amount: number) => {
    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }
    try {
      setTransacting(true);

      // Get existing referral first
      const { data: existingReferral } = await supabase
        .from('referrals' as any)
        .select('*')
        .eq('user_id', account)
        .maybeSingle();

      if (existingReferral) {
        toast({
          title: "Package Already Activated",
          description: "You have already activated a package",
          variant: "destructive"
        });
        return;
      }

      // First create the referral record
      const { data: referralData, error: referralError } = await supabase
        .from('referrals' as any)
        .insert([{
          user_id: account,
          package_id: packageId,
          level: 1
        }])
        .select()
        .single();

      if (referralError) throw referralError;
      if (!referralData) throw new Error('Failed to create referral');

      // Get the referral tree for distribution
      const { data: upperLevels, error: treeError } = await supabase.rpc('get_referral_tree' as any, {
        user_uuid: account
      });
      
      if (treeError) throw treeError;

      const directReferrer = (referralData as any).referrer_id;
      const uplineAddresses = (upperLevels as any[] || [])
        .filter((node: any) => node.level <= 11)
        .map((node: any) => node.user_id);

      const distributions = calculateDistribution(amount, directReferrer, uplineAddresses);

      // Send the transactions
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Send each share as a separate transaction
      for (const share of distributions) {
        const transaction = {
          to: share.address,
          value: ethers.parseEther(share.amount)
        };
        
        const tx = await signer.sendTransaction(transaction);
        toast({
          title: "Transaction Sent",
          description: `Sending ${share.amount} BNB to ${share.address.slice(0, 6)}...${share.address.slice(-4)} (${share.percentage}%${share.level ? ` - Level ${share.level}` : ''})`
        });
        await tx.wait();
        
        // Update balance after each transaction
        await updateBalance(account);
      }

      // Refresh data
      await fetchUserBonuses();
      await fetchReferralDetails();
      
      toast({
        title: "Package Activated",
        description: `Successfully activated package for ${amount} BNB with distributions complete`
      });
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTransacting(false);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      if (!window.ethereum) {
        toast({
          title: "Wallet Not Found",
          description: "Please install SafePal wallet extension",
          variant: "destructive"
        });
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(204)) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xCC' }]
          });
        } catch (error: any) {
          if (error.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xCC',
                chainName: 'opBNB',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18
                },
                rpcUrls: ['https://opbnb-mainnet-rpc.bnbchain.org'],
                blockExplorerUrls: ['https://opbnb.bscscan.com/']
              }]
            });
          }
        }
      }
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      setAccount(address);
      
      // Fetch initial balance
      await updateBalance(address);

      // Set up balance update on account change
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          const newAddress = accounts[0];
          setAccount(newAddress);
          await updateBalance(newAddress);
        } else {
          setAccount(null);
          setBalance(null);
        }
      });

      // Set up balance update on network change
      window.ethereum.on('chainChanged', async () => {
        if (address) {
          await updateBalance(address);
        }
      });

      // Set up balance update on block change
      provider.on('block', async () => {
        if (address) {
          await updateBalance(address);
        }
      });

      toast({
        title: "Connected Successfully",
        description: "Your SafePal wallet is now connected"
      });
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add cleanup for event listeners
  useEffect(() => {
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 z-10 relative">
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-xl shadow-2xl">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-2">BNB Terminal</h1>
              <div className="text-xs uppercase tracking-wider text-white/70">Terminal Status</div>
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Wallet Connection
              </h2>
            </div>
            
            <div className="space-y-4">
              {!account ? (
                <Button 
                  onClick={connectWallet} 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white border-none transition-all duration-300 transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Connecting...
                    </>
                  ) : (
                    'Connect Wallet'
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/10 backdrop-blur border border-white/20 transition-all duration-300 hover:bg-white/20">
                    <div className="text-xs text-white/70 mb-1">Connected Account</div>
                    <div className="font-mono text-sm break-all text-white">{account}</div>
                  </div>
                  
                  {balance && (
                    <div className="p-4 rounded-lg bg-white/10 backdrop-blur border border-white/20 transition-all duration-300 hover:bg-white/20">
                      <div className="text-xs text-white/70 mb-1">BNB Balance</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                        {Number(balance).toFixed(4)} BNB
                      </div>
                      {bnbPrice > 0 && (
                        <div className="text-sm text-white/50 mt-1">
                          ≈ ${(Number(balance) * bnbPrice).toFixed(2)} USD
                        </div>
                      )}
                    </div>
                  )}

                  {userBonuses && (
                    <Stats
                      directReferrals={userBonuses.direct_referrals_count}
                      communitySize={userBonuses.community_size}
                      directBonus={userBonuses.total_direct_bonus}
                      referralBonus={userBonuses.total_referral_bonus}
                      upgradeBonus={userBonuses.total_upgrade_bonus}
                      levelUpBonus={userBonuses.total_level_up_bonus}
                      royaltyBonus={userBonuses.total_royalty_bonus}
                      rewardedBonus={userBonuses.total_rewarded_bonus}
                      recentBonus={userBonuses.recent_bonus}
                      bnbPrice={bnbPrice}
                      isLoading={bonusesLoading}
                      uniqueId={referralDetails?.unique_id}
                      referralCode={referralDetails?.referral_code}
                      packageLevel={referralDetails?.level}
                      activationDate={referralDetails?.activation_date}
                      referredBy={referralDetails?.referrer_id}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {account && (
          <div className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-center text-white mb-8">Available Packages</h3>
                <Packages onSelect={handlePackageSelect} isLoading={transacting} />
              </div>
              <div className="space-y-4 mt-8">
                <h3 className="text-3xl font-bold text-center text-white mb-8">Network Overview</h3>
                <ReferralTree data={referralTree} isLoading={treeLoading} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
