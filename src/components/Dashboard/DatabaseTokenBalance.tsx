import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, ArrowUpRight, ExternalLink } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useRewards } from '../../hooks/useDatabase';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

export default function DatabaseTokenBalance() {
  const { user } = useAuth();
  const { rewards, loading } = useRewards(user?.user_id || '');

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }

  const recentTransactions = rewards.slice(0, 5);
  const totalBalance = rewards
    .filter(reward => reward.status === 'confirmed')
    .reduce((sum, reward) => sum + reward.token_amount, 0);

  const thisMonthRewards = rewards
    .filter(reward => {
      const rewardDate = new Date(reward.distributed_at);
      const now = new Date();
      return rewardDate.getMonth() === now.getMonth() && 
             rewardDate.getFullYear() === now.getFullYear() &&
             reward.status === 'confirmed';
    })
    .reduce((sum, reward) => sum + reward.token_amount, 0);

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Token Balance</h3>
          <Button variant="outline" size="sm">
            <Wallet className="w-4 h-4 mr-2" />
            View Wallet
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full mb-4">
            <span className="text-white font-bold text-lg">IT</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {totalBalance.toLocaleString()} IMPACT
          </h2>
          <p className="text-sm text-gray-500">
            ≈ ${(totalBalance * 0.45).toFixed(2)} USD
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Earned</span>
            </div>
            <p className="text-xl font-bold text-green-700">+{thisMonthRewards}</p>
            <p className="text-xs text-green-600">This month</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Growth</span>
            </div>
            <p className="text-xl font-bold text-gray-700">+22.8%</p>
            <p className="text-xs text-gray-600">vs last month</p>
          </div>
        </div>

        {user?.wallet_address && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Wallet Address</span>
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
            <p className="font-mono text-sm text-gray-900 mt-1">
              {user.wallet_address}
            </p>
          </div>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-1">Complete milestones to earn your first tokens!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((reward, index) => (
              <motion.div
                key={reward.reward_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{reward.description}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(reward.distributed_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    +{reward.token_amount} {reward.token_type}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      reward.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : reward.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {reward.status}
                    </span>
                    {reward.transaction_hash && (
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}