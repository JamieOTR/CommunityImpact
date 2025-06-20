import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Coins, Trophy } from 'lucide-react';
import Card from '../UI/Card';
import ProgressRing from '../UI/ProgressRing';
import { mockImpactMetrics } from '../../utils/data';

const metrics = [
  {
    title: 'Total Impact Score',
    value: mockImpactMetrics.totalScore.toLocaleString(),
    change: `+${mockImpactMetrics.growth.score}%`,
    icon: Trophy,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    description: 'Your overall community impact'
  },
  {
    title: 'Milestones Completed',
    value: mockImpactMetrics.milestonesCompleted,
    change: `+${mockImpactMetrics.growth.milestones}%`,
    icon: Award,
    color: 'text-secondary-600',
    bgColor: 'bg-secondary-50',
    description: 'Verified achievements'
  },
  {
    title: 'Tokens Earned',
    value: mockImpactMetrics.tokensEarned,
    change: `+${mockImpactMetrics.growth.tokens}%`,
    icon: Coins,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'IMPACT tokens in wallet'
  },
  {
    title: 'Community Rank',
    value: `#${mockImpactMetrics.communityRank}`,
    change: '+5 positions',
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Out of 500+ participants'
  }
];

export default function ImpactMetrics() {
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`inline-flex p-2 rounded-lg ${metric.bgColor} mb-3`}>
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-green-600">{metric.change}</span>
                    <span className="text-xs text-gray-500">vs last month</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* This Month Progress */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">This Month's Progress</h3>
          <span className="text-sm text-gray-500">March 2024</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <ProgressRing
              progress={(mockImpactMetrics.thisMonth.score / 500) * 100}
              size={100}
              color="#2563eb"
              text={`${mockImpactMetrics.thisMonth.score}`}
            />
            <p className="text-sm font-medium text-gray-900 mt-2">Impact Score</p>
            <p className="text-xs text-gray-500">Target: 500</p>
          </div>
          
          <div className="text-center">
            <ProgressRing
              progress={(mockImpactMetrics.thisMonth.milestones / 5) * 100}
              size={100}
              color="#10b981"
              text={`${mockImpactMetrics.thisMonth.milestones}`}
            />
            <p className="text-sm font-medium text-gray-900 mt-2">Milestones</p>
            <p className="text-xs text-gray-500">Target: 5</p>
          </div>
          
          <div className="text-center">
            <ProgressRing
              progress={(mockImpactMetrics.thisMonth.tokens / 400) * 100}
              size={100}
              color="#f59e0b"
              text={`${mockImpactMetrics.thisMonth.tokens}`}
            />
            <p className="text-sm font-medium text-gray-900 mt-2">Tokens</p>
            <p className="text-xs text-gray-500">Target: 400</p>
          </div>
        </div>
      </Card>
    </div>
  );
}