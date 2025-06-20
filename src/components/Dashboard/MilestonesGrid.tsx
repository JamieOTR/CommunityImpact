import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Coins, ArrowRight, CheckCircle } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ProgressRing from '../UI/ProgressRing';
import { mockMilestones } from '../../utils/data';
import { formatDistanceToNow } from 'date-fns';

const statusColors = {
  available: 'bg-blue-50 text-blue-700 border-blue-200',
  'in-progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  submitted: 'bg-purple-50 text-purple-700 border-purple-200',
  verified: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-gray-50 text-gray-700 border-gray-200'
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
};

export default function MilestonesGrid() {
  const activeMilestones = mockMilestones.filter(m => m.status !== 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Active Milestones</h2>
        <Button variant="outline" size="sm">
          View All
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeMilestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[milestone.status]}`}>
                      {milestone.status.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${difficultyColors[milestone.difficulty]}`}>
                      {milestone.difficulty}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                </div>
                {milestone.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </div>

              {/* Progress */}
              {milestone.progress > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">{milestone.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-primary-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${milestone.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Coins className="w-4 h-4" />
                    <span>Reward</span>
                  </div>
                  <span className="font-semibold text-secondary-600">
                    {milestone.rewardAmount} {milestone.rewardToken}
                  </span>
                </div>

                {milestone.deadline && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline</span>
                    </div>
                    <span className="text-gray-700">
                      {formatDistanceToNow(milestone.deadline, { addSuffix: true })}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Category</span>
                  </div>
                  <span className="text-gray-700">{milestone.category}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100">
                {milestone.status === 'available' && (
                  <Button className="w-full" size="sm">
                    Start Milestone
                  </Button>
                )}
                {milestone.status === 'in-progress' && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1">
                      Submit Evidence
                    </Button>
                  </div>
                )}
                {milestone.status === 'submitted' && (
                  <div className="text-center">
                    <p className="text-sm text-yellow-600 font-medium">Verification in progress...</p>
                    <p className="text-xs text-gray-500 mt-1">Usually takes 2-3 business days</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}