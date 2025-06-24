import { ethers } from 'ethers';

// Mock smart contract ABI for IMPACT token
const IMPACT_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function distributeReward(address recipient, uint256 amount, string milestone) external",
  "event TokensDistributed(address recipient, uint256 amount, string milestone)"
];

// Mock contract addresses (replace with actual deployed contracts)
const CONTRACTS = {
  IMPACT_TOKEN: '0x742d35Cc6634C0532925a3b8D8C9D2E9e2cF3456',
  ACHIEVEMENT_VERIFICATION: '0x123d35Cc6634C0532925a3b8D8C9D2E9e2cF7890'
};

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private impactTokenContract: ethers.Contract | null = null;

  async connectWallet(): Promise<string | null> {
    try {
      // Check if window.ethereum exists and is properly initialized
      if (typeof window.ethereum === 'undefined' || window.ethereum === null) {
        throw new Error('MetaMask is not installed');
      }

      // Additional check to ensure MetaMask is properly initialized
      if (!window.ethereum.isMetaMask) {
        throw new Error('MetaMask is not properly initialized');
      }

      // Wait a bit to ensure MetaMask is fully loaded
      await new Promise(resolve => setTimeout(resolve, 100));

      this.provider = new ethers.BrowserProvider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      this.signer = await this.provider.getSigner();
      
      this.impactTokenContract = new ethers.Contract(
        CONTRACTS.IMPACT_TOKEN,
        IMPACT_TOKEN_ABI,
        this.signer
      );

      const address = await this.signer.getAddress();
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  async getTokenBalance(address: string): Promise<number> {
    try {
      if (!this.impactTokenContract) {
        await this.connectWallet();
      }

      if (!this.impactTokenContract) {
        throw new Error('Contract not initialized');
      }

      const balance = await this.impactTokenContract.balanceOf(address);
      return parseInt(ethers.formatUnits(balance, 18));
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return 0;
    }
  }

  async distributeReward(recipientAddress: string, amount: number, milestoneTitle: string): Promise<string | null> {
    try {
      if (!this.impactTokenContract || !this.signer) {
        await this.connectWallet();
      }

      if (!this.impactTokenContract) {
        throw new Error('Contract not initialized');
      }

      const amountInWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await this.impactTokenContract.distributeReward(
        recipientAddress,
        amountInWei,
        milestoneTitle
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Failed to distribute reward:', error);
      return null;
    }
  }

  async verifyAchievement(achievementId: string, evidenceHash: string): Promise<boolean> {
    try {
      // Mock verification logic - in production, this would interact with verification contract
      console.log('Verifying achievement:', achievementId, 'with evidence:', evidenceHash);
      
      // Simulate blockchain verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result (90% success rate)
      return Math.random() > 0.1;
    } catch (error) {
      console.error('Failed to verify achievement:', error);
      return false;
    }
  }

  isWalletConnected(): boolean {
    return this.signer !== null;
  }

  async getCurrentAccount(): Promise<string | null> {
    try {
      if (!this.signer) {
        return null;
      }
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Failed to get current account:', error);
      return null;
    }
  }
}

export const blockchainService = new BlockchainService();