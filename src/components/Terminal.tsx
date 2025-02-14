
import React, { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-xl shadow-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Terminal Status</div>
            <h2 className="text-2xl font-semibold tracking-tight">SafePal Connection</h2>
          </div>
          
          <div className="space-y-4">
            {!account ? (
              <Button 
                onClick={connectWallet} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-zinc-700 transition-all duration-300"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</>
                ) : (
                  'Connect SafePal Wallet'
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <div className="text-xs text-zinc-500 mb-1">Connected Account</div>
                  <div className="font-mono text-sm break-all">{account}</div>
                </div>
                
                {balance && (
                  <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                    <div className="text-xs text-zinc-500 mb-1">opBNB Balance</div>
                    <div className="text-xl font-semibold">{parseFloat(balance).toFixed(4)} BNB</div>
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
