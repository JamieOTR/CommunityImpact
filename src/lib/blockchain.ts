import { ethers } from 'ethers';

/**
 * Blockchain Integration for IMPACT Token
 *
 * DEMO MODE: This implementation uses mock contract addresses for demonstration purposes.
 *
 * For Production Deployment:
 * 1. Deploy IMPACT token smart contract to desired network (Ethereum, BSC, Polygon)
 * 2. Deploy Achievement Verification contract
 * 3. Update environment variables with real contract addresses:
 *    - VITE_IMPACT_TOKEN_ADDRESS
 *    - VITE_ACHIEVEMENT_VERIFICATION_ADDRESS
 *    - VITE_BLOCKCHAIN_NETWORK (mainnet, goerli, bsc, polygon)
 * 4. Configure appropriate RPC URLs for your network
 * 5. Test thoroughly on testnet before mainnet deployment
 */

// Smart contract ABI for IMPACT token
const IMPACT_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function distributeReward(address recipient, uint256 amount, string milestone) external",
  "event TokensDistributed(address recipient, uint256 amount, string milestone)"
];

// Contract addresses - using environment variables with demo fallback
const CONTRACTS = {
  IMPACT_TOKEN: import.meta.env.VITE_IMPACT_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
  ACHIEVEMENT_VERIFICATION: import.meta.env.VITE_ACHIEVEMENT_VERIFICATION_ADDRESS || '0x0000000000000000000000000000000000000000'
};

// Check if we're in demo mode (no real contracts deployed)
const IS_DEMO_MODE = CONTRACTS.IMPACT_TOKEN === '0x0000000000000000000000000000000000000000';

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
      // In demo mode, return 0 as balance should be tracked in database
      if (IS_DEMO_MODE) {
        console.log('Demo mode: Token balance tracked in database');
        return 0;
      }

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
      // In demo mode, simulate transaction and return mock hash
      if (IS_DEMO_MODE) {
        console.log('Demo mode: Simulating reward distribution', { recipientAddress, amount, milestoneTitle });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        // Return a mock transaction hash
        return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      }

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

  isDemoMode(): boolean {
    return IS_DEMO_MODE;
  }

  getContractAddresses() {
    return {
      impactToken: CONTRACTS.IMPACT_TOKEN,
      achievementVerification: CONTRACTS.ACHIEVEMENT_VERIFICATION,
      isDemoMode: IS_DEMO_MODE
    };
  }
}

export const blockchainService = new BlockchainService();

// Export constants for external use
export { IS_DEMO_MODE, CONTRACTS };