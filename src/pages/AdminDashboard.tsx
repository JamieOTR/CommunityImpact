import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Settings, Plus, Share2, BarChart3, Award, Target, Coins } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import CommunityReferralManager from '../components/Admin/CommunityReferralManager';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { databaseService } from '../lib/database';

interface Community {
  community_id: string;
  name: string;
  description: string;
  member_count: number;
  referral_code: string;
  created_at: string;
}

interface CommunityStats {
  totalMembers: number;
  activePrograms: number;
  totalRewards: number;
  completedMilestones: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [stats, setStats] = useState<CommunityStats>({
    totalMembers: 0,
    activePrograms: 0,
    totalRewards: 0,
    completedMilestones: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCommunityData();
    }
  }, [user]);

  const fetchCommunityData = async () => {
    if (!user) return;

    try {
      // Fetch community data where user is admin
      const { data: communityData } = await supabase
        .from('communities')
        .select('*')
        .eq('admin_id', user.user_id)
        .single();

      if (communityData) {
        setCommunity(communityData);
        
        // Fetch community statistics
        const communityStats = await databaseService.getCommunityStats(communityData.community_id);
        setStats(communityStats);
      }
    } catch (error) {
      console.error('Failed to fetch community data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">No Community Found</h2>
          <p className="text-gray-600 mb-6">
            You don't appear to be an administrator of any community. Create a community to access the admin dashboard.
          </p>
          <Button>Create Community</Button>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers.toLocaleString(),
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Programs',
      value: stats.activePrograms.toString(),
      change: '+3',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Completed Milestones',
      value: stats.completedMilestones.toLocaleString(),
      change: '+28%',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Rewards Distributed',
      value: `${(stats.totalRewards / 1000).toFixed(0)}K`,
      change: '+15%',
      icon: Coins,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage {community.name} and track community impact
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Program
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <Card key={stat.title} hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} mb-3`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Community Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Community Information</h3>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Community Name</label>
                  <p className="text-lg font-semibold text-gray-900">{community.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-700">{community.description || 'No description provided'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                  <p className="text-gray-700">
                    {new Date(community.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Community Growth</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{stats.totalMembers}</p>
                      <p className="text-xs text-gray-600">Total Members</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">+12</p>
                      <p className="text-xs text-gray-600">This Month</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">85%</p>
                      <p className="text-xs text-gray-600">Active Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Referral Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <CommunityReferralManager
              communityId={community.community_id}
              referralCode={community.referral_code}
            />

            {/* Quick Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-3" />
                  Create New Program
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="w-4 h-4 mr-3" />
                  Add Milestone
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-3" />
                  Manage Members
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-3" />
                  View Analytics
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}