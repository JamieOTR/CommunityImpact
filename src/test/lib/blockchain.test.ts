import { describe, it, expect, vi } from 'vitest';
import { BlockchainService } from '../../services/blockchain';

// Mock ethers
vi.mock('ethers', () => ({
  ethers: {
    BrowserProvider: vi.fn(() => ({
      send: vi.fn(),
      getSigner: vi.fn(() => ({
        getAddress: vi.fn(() => Promise.resolve('0x123...abc')),
      })),
    })),
    Contract: vi.fn(() => ({
      balanceOf: vi.fn(() => Promise.resolve(BigInt('1000000000000000000000'))),
      distributeReward: vi.fn(() => ({
        wait: vi.fn(() => Promise.resolve({ hash: '0xabc123' })),
      })),
    })),
    formatUnits: vi.fn(() => '1000'),
    parseUnits: vi.fn(() => BigInt('1000000000000000000000')),
  },
}));

describe('BlockchainService', () => {
  let blockchainService: BlockchainService;

  beforeEach(() => {
    blockchainService = new BlockchainService();
    // Mock window.ethereum
    global.window = {
      ...global.window,
      ethereum: {
        request: vi.fn(),
      },
    };
  });

  it('connects to wallet successfully', async () => {
    const address = await blockchainService.connectWallet();
    expect(address).toBe('0x123...abc');
  });

  it('gets token balance', async () => {
    await blockchainService.connectWallet();
    const balance = await blockchainService.getTokenBalance('0x123...abc');
    expect(balance).toBe(1000);
  });

  it('distributes rewards', async () => {
    await blockchainService.connectWallet();
    const txHash = await blockchainService.distributeReward('0x123...abc', 100, 'Test Milestone');
    expect(txHash).toBe('0xabc123');
  });

  it('verifies achievements', async () => {
    const isVerified = await blockchainService.verifyAchievement('achievement123', 'evidence456');
    expect(typeof isVerified).toBe('boolean');
  });
});