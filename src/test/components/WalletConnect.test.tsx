import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WalletConnect from '../../components/Blockchain/WalletConnect';
import { blockchainService } from '../../lib/blockchain';

// Mock the blockchain service
vi.mock('../../lib/blockchain', () => ({
  blockchainService: {
    connectWallet: vi.fn(),
    isWalletConnected: vi.fn(),
    getCurrentAccount: vi.fn(),
    getTokenBalance: vi.fn(),
  },
}));

describe('WalletConnect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders connect button when wallet is not connected', () => {
    vi.mocked(blockchainService.isWalletConnected).mockReturnValue(false);
    
    render(<WalletConnect />);
    
    expect(screen.getByText('Connect MetaMask')).toBeInTheDocument();
  });

  it('calls connectWallet when connect button is clicked', async () => {
    vi.mocked(blockchainService.isWalletConnected).mockReturnValue(false);
    vi.mocked(blockchainService.connectWallet).mockResolvedValue('0x123...abc');
    vi.mocked(blockchainService.getTokenBalance).mockResolvedValue(1000);
    
    render(<WalletConnect />);
    
    const connectButton = screen.getByText('Connect MetaMask');
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(blockchainService.connectWallet).toHaveBeenCalled();
    });
  });

  it('displays wallet info when connected', async () => {
    vi.mocked(blockchainService.isWalletConnected).mockReturnValue(true);
    vi.mocked(blockchainService.getCurrentAccount).mockResolvedValue('0x1234567890abcdef');
    vi.mocked(blockchainService.getTokenBalance).mockResolvedValue(1500);
    
    render(<WalletConnect />);
    
    await waitFor(() => {
      expect(screen.getByText('Wallet Connected')).toBeInTheDocument();
      expect(screen.getByText('1,500')).toBeInTheDocument();
    });
  });
});