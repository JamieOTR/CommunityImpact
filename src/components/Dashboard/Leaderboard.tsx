import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '../UI/Card';
import { mockLeaderboard } from '../../utils/data';

export default function Leaderboard() {
  const getTrendIcon = (change: string) => {
    switch (change) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <Card>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
          <Trophy className="w-5 h-5 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Community Leaderboard</h3>
      </div>

      <div className="space-y-3">
        {mockLeaderboard.map((user, index) => (
          <motion.div
            key={user.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
              user.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-700 w-6">
                  #{user.rank}
                </span>
                {getRankBadge(user.rank) && (
                  <span className="text-lg">{getRankBadge(user.rank)}</span>
                )}
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.score.toLocaleString()} points</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(user.change)}
              <span className={`text-sm font-medium ${
                user.change === 'up' ? 'text-green-600' : 
                user.change === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {user.change === 'same' ? '—' : user.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-primary-600 font-bold">#23</span>
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
                alt="You"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-primary-900">You</p>
              <p className="text-sm text-primary-700">2,850 points</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-primary-600">5 spots to climb</span>
            <p className="text-xs text-primary-500">to reach top 20</p>
          </div>
        </div>
      </div>
    </Card>
  );
}