import React from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Calendar, Star, ArrowRight, Trophy, Target, Heart } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { mockPrograms } from '../utils/data';

const communityStats = [
  { icon: Users, label: 'Active Members', value: '10,247', change: '+12%' },
  { icon: Trophy, label: 'Programs Completed', value: '1,856', change: '+28%' },
  { icon: Target, label: 'Milestones Achieved', value: '15,392', change: '+35%' },
  { icon: Heart, label: 'Community Impact Score', value: '2.8M', change: '+18%' }
];

const successStories = [
  {
    id: '1',
    title: 'Urban Garden Initiative',
    description: 'Local community transformed vacant lots into thriving urban gardens, providing fresh produce to 200+ families.',
    image: 'https://images.pexels.com/photos/1105019/pexels-photo-1105019.jpeg?auto=compress&cs=tinysrgb&w=800',
    participants: 45,
    tokensEarned: 12500,
    category: 'Environment',
    location: 'Brooklyn, NY'
  },
  {
    id: '2',
    title: 'Digital Literacy for Seniors',
    description: 'Volunteers taught 150+ seniors essential digital skills, helping them stay connected with family and access services.',
    image: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=800',
    participants: 28,
    tokensEarned: 8400,
    category: 'Education',
    location: 'Austin, TX'
  },
  {
    id: '3',
    title: 'Youth Mentorship Program',
    description: 'Professional mentors guided 75 at-risk youth through career development and life skills training.',
    image: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=800',
    participants: 35,
    tokensEarned: 15200,
    category: 'Youth Development',
    location: 'Chicago, IL'
  }
];

const featuredPrograms = mockPrograms.slice(0, 3);

export default function Community() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Community Hub</h1>
          <p className="text-gray-600">
            Connect with fellow changemakers, discover inspiring success stories, and explore new programs.
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {communityStats.map((stat, index) => (
              <Card key={stat.label} className="text-center">
                <div className="inline-flex p-3 rounded-full bg-primary-50 mb-4">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                <span className="text-xs font-medium text-green-600">{stat.change} this month</span>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Success Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Success Stories</h2>
            <Button variant="outline" size="sm">
              View All Stories
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card hover className="overflow-hidden h-full">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                        {story.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">{story.location}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900">{story.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{story.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{story.participants} participants</span>
                        <span>{story.tokensEarned.toLocaleString()} tokens</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Featured Programs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Featured Programs</h2>
            <Button variant="outline" size="sm">
              Browse All Programs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredPrograms.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded">
                          {program.category}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                          {program.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{program.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Organization</span>
                      <span className="font-medium text-gray-900">{program.organization}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Reward</span>
                      <span className="font-semibold text-secondary-600">
                        {program.totalReward.toLocaleString()} IMPACT
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Participants</span>
                      <span className="text-gray-900">{program.participantCount} members</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="text-gray-900">
                        {program.startDate.toLocaleDateString()} - {program.endDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <Button className="w-full" size="sm">
                      Join Program
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Community Updates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Community Updates</h2>
              <Button variant="outline" size="sm">
                View All Updates
              </Button>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: 'New Environmental Program Launched',
                  description: 'Join our largest climate action initiative with 50+ milestones available.',
                  time: '2 hours ago',
                  type: 'announcement'
                },
                {
                  title: 'Monthly Leaderboard Winners Announced',
                  description: 'Congratulations to our top performers who made exceptional community impact.',
                  time: '1 day ago',
                  type: 'celebration'
                },
                {
                  title: 'Platform Update: Enhanced Verification System',
                  description: 'We\'ve improved our blockchain verification process for faster reward distribution.',
                  time: '3 days ago',
                  type: 'update'
                }
              ].map((update, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    update.type === 'announcement' ? 'bg-blue-500' :
                    update.type === 'celebration' ? 'bg-green-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{update.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{update.description}</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{update.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}