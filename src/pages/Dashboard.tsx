import React from 'react';
import { motion } from 'framer-motion';
import ImpactMetrics from '../components/Dashboard/ImpactMetrics';
import MilestonesGrid from '../components/Dashboard/MilestonesGrid';
import TokenBalance from '../components/Dashboard/TokenBalance';
import Leaderboard from '../components/Dashboard/Leaderboard';
import { mockUser } from '../utils/data';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {mockUser.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Let's continue making a positive impact in your community.
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Impact Score</p>
                <p className="text-2xl font-bold text-primary-600">{mockUser.totalImpactScore.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Impact Metrics */}
        <div className="mb-8">
          <ImpactMetrics />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Milestones */}
          <div className="lg:col-span-2 space-y-8">
            <MilestonesGrid />
          </div>

          {/* Right Column - Token Balance & Leaderboard */}
          <div className="space-y-8">
            <TokenBalance />
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}