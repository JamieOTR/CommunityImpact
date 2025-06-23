import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Coins, ArrowRight, CheckCircle } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ProgressRing from '../UI/ProgressRing';
import { useMilestones, useAchievements } from '../../hooks/useDatabase';
import { useAuth } from '../../hooks/useAuth';
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

export default function DatabaseMilestones() {
  const { user } = useAuth();
  const { milestones, loading: milestonesLoading } = useMilestones(user?.user_id);
  const { achievements, loading: achievementsLoading } = useAchievements(user?.user_id || '');

  if (milestonesLoading || achievementsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Active Milestones</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Create a map of achievements by milestone_id for quick lookup
  const achievementsByMilestone = achievements.reduce((acc, achievement) => {
    acc[achievement.milestone_id] = achievement;
    return acc;
  }, {} as Record<string, any>);

  // Enhance milestones with achievement data
  const enhancedMilestones = milestones.map(milestone => {
    const achievement = achievementsByMilestone[milestone.milestone_id];
    return {
      ...milestone,
      progress: achievement?.progress || 0,
      status: achievement?.status || 'available',
      achievement_id: achievement?.achievement_id
    };
  });

  const activeMilestones = enhancedMilestones.filter(m => m.status !== 'completed');

  if (activeMilestones.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Active Milestones</h2>
        </div>
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Milestones</h3>
          <p className="text-gray-600 mb-4">
            All available milestones have been completed! Check back later for new opportunities.
          </p>
          <Button>Explore Community Programs</Button>
        </Card>
      </div>
    );
  }

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
            key={milestone.milestone_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[milestone.status as keyof typeof statusColors]}`}>
                      {milestone.status.replace('-', ' ')}
                    </span>
                    {milestone.difficulty && (
                      <span className={`px-2 py-1 text-xs font-medium rounded ${difficultyColors[milestone.difficulty as keyof typeof difficultyColors]}`}>
                        {milestone.difficulty}
                      </span>
                    )}
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
                    {milestone.reward_amount} {milestone.reward_token}
                  </span>
                </div>

                {milestone.deadline && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline</span>
                    </div>
                    <span className="text-gray-700">
                      {formatDistanceToNow(new Date(milestone.deadline), { addSuffix: true })}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Category</span>
                  </div>
                  <span className="text-gray-700">{milestone.category || 'General'}</span>
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