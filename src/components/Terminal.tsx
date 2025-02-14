
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Terminal = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      
      // Check if we're on opBNB network (chainId: 204)
      if (network.chainId !== BigInt(204)) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xCC' }], // 204 in hex
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-xl shadow-2xl relative z-10">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-xs uppercase tracking-wider text-white/70">Terminal Status</div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
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
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Terminal;
