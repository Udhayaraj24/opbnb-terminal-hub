
import { ethers } from 'ethers';

export const COMPANY_WALLET = "0xE484201328c61Fbc8aCc316B9Ea4b2dC3A4EDEA9";

export interface DistributionShare {
  address: string;
  amount: string; // in BNB
  percentage: number;
  level?: number;
}

export const calculateDistribution = (
  totalAmount: number,
  directReferrer: string | null,
  upperLevels: string[]
): DistributionShare[] => {
  const shares: DistributionShare[] = [];
  
  // Company's initial 10%
  const companyShare = totalAmount * 0.1;
  shares.push({
    address: COMPANY_WALLET,
    amount: ethers.formatEther(ethers.parseEther(companyShare.toString())),
    percentage: 10
  });

  // Direct referral shares (61.2% + 9%)
  if (directReferrer) {
    // 61.2% share
    shares.push({
      address: directReferrer,
      amount: ethers.formatEther(ethers.parseEther((totalAmount * 0.612).toString())),
      percentage: 61.2
    });
    // 9% share
    shares.push({
      address: directReferrer,
      amount: ethers.formatEther(ethers.parseEther((totalAmount * 0.09).toString())),
      percentage: 9
    });
  } else {
    // If no direct referrer, company gets these shares
    shares.push({
      address: COMPANY_WALLET,
      amount: ethers.formatEther(ethers.parseEther((totalAmount * 0.702).toString())), // 61.2% + 9%
      percentage: 70.2
    });
  }

  // Upper levels distribution (19.8% total, 1.8% each for up to 11 levels)
  const levelShare = 0.018; // 1.8% per level
  const maxLevels = 11;

  for (let i = 0; i < maxLevels; i++) {
    const uplineAddress = upperLevels[i] || COMPANY_WALLET;
    shares.push({
      address: uplineAddress,
      amount: ethers.formatEther(ethers.parseEther((totalAmount * levelShare).toString())),
      percentage: 1.8,
      level: i + 1
    });
  }

  return shares;
};
