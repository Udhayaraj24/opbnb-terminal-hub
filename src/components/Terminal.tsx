
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Leaf, ArrowUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Packages from './Packages';

const Terminal = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transacting, setTransacting] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const { toast } = useToast();

  const RECIPIENT_ADDRESS = "0xE484201328c61Fbc8aCc316B9Ea4b2dC3A4EDEA9";

  useEffect(() => {
    const getReferralCode = async () => {
      if (!account) return;
      
      const { data, error } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('user_id', account)
        .maybeSingle();
      
      if (data) {
        setReferralCode(data.referral_code);
      }
    };

    getReferralCode();
  }, [account]);

  const connectWallet = async () => {
    try {
      setLoading(true);
      if (!window.ethereum) {
        toast({
          title: "Wallet Not Found",
          description: "Please install SafePal wallet extension",
          variant: "destructive",
        });
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      if (network.chainId !== BigInt(204)) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xCC' }],
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
                  decimals: 18,
                },
                rpcUrls: ['https://opbnb-mainnet-rpc.bnbchain.org'],
                blockExplorerUrls: ['https://opbnb.bscscan.com/'],
              }],
            });
          }
        }
      }

      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      setAccount(address);

      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));

      toast({
        title: "Connected Successfully",
        description: "Your SafePal wallet is now connected",
      });
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = async (packageId: number, amount: number) => {
    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setTransacting(true);
      
      // First create the referral record
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .insert([
          {
            user_id: account,
            package_id: packageId,
            level: 1,
          }
        ])
        .select()
        .single();

      if (referralError) throw referralError;

      // Then send the transaction
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const transaction = {
        to: RECIPIENT_ADDRESS,
        value: ethers.parseEther(amount.toString())
      };

      const tx = await signer.sendTransaction(transaction);
      
      toast({
        title: "Transaction Sent",
        description: "Please wait for confirmation",
      });

      await tx.wait();
      
      // Update balance after transaction
      const newBalance = await provider.getBalance(account);
      setBalance(ethers.formatEther(newBalance));

      setReferralCode(referralData.referral_code);

      toast({
        title: "Package Activated",
        description: `Successfully activated package for ${amount} opBNB`,
      });
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTransacting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 z-10 relative">
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-xl shadow-2xl">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-2">
                itradeBNB
              </h1>
              <div className="text-xs uppercase tracking-wider text-white/70">Terminal Status</div>
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                SafePal Connection
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
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</>
                  ) : (
                    'Connect SafePal Wallet'
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
                      <div className="text-xs text-white/70 mb-1">opBNB Balance</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                        {parseFloat(balance).toFixed(4)} BNB
                      </div>
                    </div>
                  )}

                  {referralCode && (
                    <div className="p-4 rounded-lg bg-white/10 backdrop-blur border border-white/20 transition-all duration-300 hover:bg-white/20">
                      <div className="text-xs text-white/70 mb-1">Your Referral Link</div>
                      <div className="font-mono text-sm break-all text-white">
                        {`${window.location.origin}?ref=${referralCode}`}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {account && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-center text-white">Available Packages</h3>
            <Packages onSelect={handlePackageSelect} isLoading={transacting} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
