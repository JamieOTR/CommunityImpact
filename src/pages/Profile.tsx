import React from 'react';
import { motion } from 'framer-motion';
import { User, Award, Wallet, Settings, Edit3, Share2, Download, Calendar, MapPin, Link2 } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import ProgressRing from '../components/UI/ProgressRing';
import { mockUser, mockMilestones, mockTransactions, mockImpactMetrics } from '../utils/data';
import { formatDistanceToNow } from 'date-fns';

const rarityColors = {
  common: 'border-gray-300 bg-gray-50',
  rare: 'border-blue-300 bg-blue-50',
  epic: 'border-purple-300 bg-purple-50',
  legendary: 'border-yellow-300 bg-yellow-50'
};

const completedMilestones = mockMilestones.filter(m => m.status === 'completed');
const recentTransactions = mockTransactions.slice(0, 3);

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600 opacity-5"></div>
            
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <img
                  src={mockUser.avatar}
                  alt={mockUser.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-3">
                  <h1 className="text-2xl font-bold text-gray-900">{mockUser.name}</h1>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2 sm:mt-0">
                    <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                      Verified Member
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded">
                      Community Leader
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDistanceToNow(mockUser.joinedAt, { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 mt-1 sm:mt-0">
                    <MapPin className="w-4 h-4" />
                    <span>San Francisco, CA</span>
                  </div>
                </div>

                <p className="text-gray-700 max-w-2xl">
                  Passionate community organizer dedicated to creating positive environmental and social impact. 
                  Specializing in urban sustainability initiatives and youth mentorship programs.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button variant="outline" size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Impact Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Impact Overview</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <ProgressRing
                      progress={75}
                      size={80}
                      color="#2563eb"
                      text={mockImpactMetrics.totalScore.toLocaleString()}
                      showText={false}
                    />
                    <p className="text-lg font-bold text-gray-900 mt-2">{mockImpactMetrics.totalScore.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Impact Score</p>
                  </div>
                  
                  <div className="text-center">
                    <ProgressRing
                      progress={85}
                      size={80}
                      color="#10b981"
                      text={mockImpactMetrics.milestonesCompleted.toString()}
                      showText={false}
                    />
                    <p className="text-lg font-bold text-gray-900 mt-2">{mockImpactMetrics.milestonesCompleted}</p>
                    <p className="text-sm text-gray-600">Milestones</p>
                  </div>
                  
                  <div className="text-center">
                    <ProgressRing
                      progress={65}
                      size={80}
                      color="#f59e0b"
                      text={mockImpactMetrics.tokensEarned.toString()}
                      showText={false}
                    />
                    <p className="text-lg font-bold text-gray-900 mt-2">{mockImpactMetrics.tokensEarned}</p>
                    <p className="text-sm text-gray-600">Tokens</p>
                  </div>
                  
                  <div className="text-center">
                    <ProgressRing
                      progress={92}
                      size={80}
                      color="#8b5cf6"
                      text={`#${mockImpactMetrics.communityRank}`}
                      showText={false}
                    />
                    <p className="text-lg font-bold text-gray-900 mt-2">#{mockImpactMetrics.communityRank}</p>
                    <p className="text-sm text-gray-600">Rank</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">+{mockImpactMetrics.growth.score}%</p>
                    <p className="text-sm text-green-700">Score Growth</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">+{mockImpactMetrics.growth.milestones}%</p>
                    <p className="text-sm text-blue-700">Milestone Growth</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-600">+{mockImpactMetrics.growth.tokens}%</p>
                    <p className="text-sm text-yellow-700">Token Growth</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Achievement Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Achievement Showcase</h3>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockUser.badges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className={`p-4 rounded-lg border-2 ${rarityColors[badge.rarity]} text-center`}
                    >
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <h4 className="font-semibold text-gray-900 mb-1">{badge.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded capitalize ${
                          badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                          badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                          badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {badge.rarity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(badge.earnedAt, { addSuffix: true })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Impact Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Impact Timeline</h3>
                
                <div className="space-y-6">
                  {completedMilestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                          <span className="text-sm font-medium text-secondary-600">
                            +{milestone.rewardAmount} {milestone.rewardToken}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{milestone.category}</span>
                          <span>•</span>
                          <span>Completed recently</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Wallet Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Wallet</h3>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Wallet Address</span>
                      <Link2 className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="font-mono text-sm text-gray-900 break-all">
                      {mockUser.walletAddress}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-primary-50 rounded-lg">
                      <p className="text-lg font-bold text-primary-600">{mockImpactMetrics.tokensEarned}</p>
                      <p className="text-xs text-primary-700">IMPACT Tokens</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">
                        ${(mockImpactMetrics.tokensEarned * 0.45).toFixed(0)}
                      </p>
                      <p className="text-xs text-green-700">USD Value</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Award className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            +{transaction.amount} {transaction.token}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatDistanceToNow(transaction.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-3" />
                    Export Impact Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share2 className="w-4 h-4 mr-3" />
                    Share Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-3" />
                    Privacy Settings
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}