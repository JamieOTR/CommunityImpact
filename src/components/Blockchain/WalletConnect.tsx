import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ExternalLink, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import { blockchainService } from '../../lib/blockchain';

interface WalletConnectProps {
  onWalletConnected?: (address: string) => void;
}

export default function WalletConnect({ onWalletConnected }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (blockchainService.isWalletConnected()) {
        const address = await blockchainService.getCurrentAccount();
        if (address) {
          setWalletAddress(address);
          const balance = await blockchainService.getTokenBalance(address);
          setTokenBalance(balance);
        }
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const address = await blockchainService.connectWallet();
      if (address) {
        setWalletAddress(address);
        const balance = await blockchainService.getTokenBalance(address);
        setTokenBalance(balance);
        onWalletConnected?.(address);
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (walletAddress) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Wallet Connected</h3>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Connected</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Wallet Address</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Copy address"
                >
                  <Copy className="w-3 h-3 text-gray-500" />
                </button>
                <a
                  href={`https://etherscan.io/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              </div>
            </div>
            <p className="font-mono text-sm text-gray-900">
              {formatAddress(walletAddress)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-primary-50 rounded-lg">
              <p className="text-lg font-bold text-primary-600">{tokenBalance.toLocaleString()}</p>
              <p className="text-xs text-primary-700">IMPACT Tokens</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-bold text-green-600">
                ${(tokenBalance * 0.45).toFixed(2)}
              </p>
              <p className="text-xs text-green-700">USD Value</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(`https://etherscan.io/address/${walletAddress}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Blockchain
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-primary-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-600 mb-6">
          Connect your Web3 wallet to receive IMPACT tokens automatically when you complete milestones.
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </motion.div>
        )}

        <Button
          onClick={connectWallet}
          loading={isConnecting}
          className="w-full"
          size="lg"
        >
          <Wallet className="w-5 h-5 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </Button>

        <div className="mt-4 text-xs text-gray-500">
          <p>Supported wallets: MetaMask, WalletConnect, Coinbase Wallet</p>
          <p className="mt-1">Your wallet will be used to receive IMPACT token rewards</p>
        </div>
      </div>
    </Card>
  );
}