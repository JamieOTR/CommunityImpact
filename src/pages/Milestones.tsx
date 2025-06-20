import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, Coins, Calendar, ArrowRight } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import ProgressRing from '../components/UI/ProgressRing';
import { mockMilestones } from '../utils/data';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

const categories = ['All', 'Environment', 'Education', 'Social Support', 'Health', 'Technology'];
const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
const statuses = ['All', 'Available', 'In Progress', 'Submitted', 'Completed'];

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

export default function Milestones() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filteredMilestones = mockMilestones.filter(milestone => {
    const matchesSearch = milestone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         milestone.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || milestone.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || 
                             milestone.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchesStatus = selectedStatus === 'All' || 
                         milestone.status.toLowerCase().replace('-', ' ') === selectedStatus.toLowerCase().replace('-', ' ');

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Milestones</h1>
          <p className="text-gray-600">
            Discover and track your community impact milestones. Each completed milestone earns you verified IMPACT tokens.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search milestones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-1">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={clsx(
                        'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                        selectedCategory === category
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Difficulty Filter */}
                <div className="flex flex-wrap gap-1">
                  {difficulties.map(difficulty => (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={clsx(
                        'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                        selectedDifficulty === difficulty
                          ? 'bg-secondary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex flex-wrap gap-1">
                  {statuses.map(status => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={clsx(
                        'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                        selectedStatus === status
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            Showing {filteredMilestones.length} of {mockMilestones.length} milestones
          </p>
        </motion.div>

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card hover className="h-full flex flex-col">
                {/* Header */}
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
                    <p className="text-sm text-gray-600 line-clamp-2">{milestone.description}</p>
                  </div>
                  {milestone.progress > 0 && (
                    <div className="ml-4">
                      <ProgressRing
                        progress={milestone.progress}
                        size={50}
                        strokeWidth={4}
                        showText={false}
                      />
                    </div>
                  )}
                </div>

                {/* Progress Bar for In-Progress */}
                {milestone.status === 'in-progress' && milestone.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Progress</span>
                      <span className="text-xs text-gray-500">{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 space-y-3 mb-4">
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
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  {milestone.status === 'in-progress' && (
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                      <Button size="sm" className="w-full">
                        Submit Evidence
                      </Button>
                    </div>
                  )}
                  {milestone.status === 'submitted' && (
                    <div className="text-center">
                      <p className="text-sm text-yellow-600 font-medium">Under Review</p>
                      <p className="text-xs text-gray-500 mt-1">2-3 business days</p>
                    </div>
                  )}
                  {milestone.status === 'completed' && (
                    <div className="text-center">
                      <p className="text-sm text-green-600 font-medium">✓ Completed</p>
                      <p className="text-xs text-gray-500 mt-1">Tokens distributed</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMilestones.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms to find more milestones.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
                setSelectedStatus('All');
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}