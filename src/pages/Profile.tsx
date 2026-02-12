import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Award, Wallet, Settings, Edit3, Share2, Download, Calendar, MapPin, Link2, Volume2, Video } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import ProgressRing from '../components/UI/ProgressRing';
import VoiceSettings from '../components/Voice/VoiceSettings';
import VideoGenerator from '../components/Video/VideoGenerator';
import { useAuth } from '../hooks/useAuth';
import { useRewards, useAchievements } from '../hooks/useDatabase';
import { formatDistanceToNow } from 'date-fns';
import { aiService } from '../services/aiService';

const rarityColors = {
  common: 'border-gray-300 bg-gray-50',
  rare: 'border-blue-300 bg-blue-50',
  epic: 'border-purple-300 bg-purple-50',
  legendary: 'border-yellow-300 bg-yellow-50'
};

export default function Profile() {
  const { user } = useAuth();
  const { rewards } = useRewards(user?.user_id || '');
  const { achievements } = useAchievements(user?.user_id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'voice' | 'video'>('overview');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const totalTokens = rewards.filter(r => r.status === 'confirmed').reduce((sum, r) => sum + r.token_amount, 0);
  const completedAchievements = achievements.filter(a => a.status === 'completed');
  const recentTransactions = rewards.slice(0, 3);

  const handleVoiceChange = (voiceId: string) => {
    aiService.setVoiceId(voiceId);
  };

  const mockBadges = [
    {
      id: '1',
      name: 'Community Leader',
      description: 'Led 5+ community initiatives',
      icon: '👑',
      earnedAt: new Date('2024-01-15'),
      rarity: 'epic' as const
    },
    {
      id: '2',
      name: 'Environmental Champion',
      description: 'Completed 10 environmental milestones',
      icon: '🌱',
      earnedAt: new Date('2024-02-20'),
      rarity: 'rare' as const
    },
    {
      id: '3',
      name: 'Education Advocate',
      description: 'Supported 3 educational programs',
      icon: '📚',
      earnedAt: new Date('2024-03-10'),
      rarity: 'common' as const
    }
  ];

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
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-3">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
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
                    <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
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

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: User },
                { id: 'voice', name: 'Voice Settings', icon: Volume2 },
                { id: 'video', name: 'Video Generator', icon: Video }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
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
                        text={user.total_impact_score.toLocaleString()}
                        showText={false}
                      />
                      <p className="text-lg font-bold text-gray-900 mt-2">{user.total_impact_score.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Impact Score</p>
                    </div>
                    
                    <div className="text-center">
                      <ProgressRing
                        progress={85}
                        size={80}
                        color="#10b981"
                        text={completedAchievements.length.toString()}
                        showText={false}
                      />
                      <p className="text-lg font-bold text-gray-900 mt-2">{completedAchievements.length}</p>
                      <p className="text-sm text-gray-600">Milestones</p>
                    </div>
                    
                    <div className="text-center">
                      <ProgressRing
                        progress={65}
                        size={80}
                        color="#f59e0b"
                        text={totalTokens.toString()}
                        showText={false}
                      />
                      <p className="text-lg font-bold text-gray-900 mt-2">{totalTokens}</p>
                      <p className="text-sm text-gray-600">Tokens</p>
                    </div>
                    
                    <div className="text-center">
                      <ProgressRing
                        progress={92}
                        size={80}
                        color="#8b5cf6"
                        text="#23"
                        showText={false}
                      />
                      <p className="text-lg font-bold text-gray-900 mt-2">#23</p>
                      <p className="text-sm text-gray-600">Rank</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">+15.2%</p>
                      <p className="text-sm text-green-700">Score Growth</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">+25.0%</p>
                      <p className="text-sm text-blue-700">Milestone Growth</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-600">+22.8%</p>
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
                    {mockBadges.map((badge, index) => (
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
                    {user.wallet_address && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Wallet Address</span>
                          <Link2 className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="font-mono text-sm text-gray-900 break-all">
                          {user.wallet_address}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-primary-50 rounded-lg">
                        <p className="text-lg font-bold text-primary-600">{totalTokens}</p>
                        <p className="text-xs text-primary-700">IMPACT Tokens</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">
                          ${(totalTokens * 0.45).toFixed(0)}
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
                  
                  {recentTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600">No recent activity</p>
                      <p className="text-sm text-gray-500 mt-1">Complete milestones to see activity here!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentTransactions.map((transaction, index) => (
                        <div key={transaction.reward_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Award className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                +{transaction.token_amount} {transaction.token_type}
                              </p>
                              <p className="text-xs text-gray-600">
                                {formatDistanceToNow(new Date(transaction.distributed_at), { addSuffix: true })}
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
                  )}
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
        )}

        {activeTab === 'voice' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <VoiceSettings onVoiceChange={handleVoiceChange} />
          </motion.div>
        )}

        {activeTab === 'video' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <VideoGenerator
              userName={user.name}
              milestoneTitle="Community Leadership"
              rewardAmount={250}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}