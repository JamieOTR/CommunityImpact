import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../UI/Card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface ChartData {
  impactTrend: Array<{ month: string; score: number; tokens: number; milestones: number }>;
  categoryData: Array<{ name: string; value: number; color: string }>;
  weeklyActivity: Array<{ day: string; activities: number; rewards: number }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  environment: '#10b981',
  education: '#3b82f6',
  social: '#f59e0b',
  health: '#ef4444',
  community: '#8b5cf6',
  other: '#6b7280'
};

export default function AdvancedCharts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData>({
    impactTrend: [],
    categoryData: [],
    weeklyActivity: []
  });

  useEffect(() => {
    if (user) {
      fetchChartData();
    }
  }, [user]);

  const fetchChartData = async () => {
    try {
      setLoading(true);

      const [achievementsRes, rewardsRes, milestonesRes] = await Promise.all([
        supabase
          .from('achievements')
          .select('completed_at, milestone_id, milestones(category)')
          .eq('user_id', user?.user_id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: true }),
        supabase
          .from('rewards')
          .select('token_amount, distributed_at')
          .eq('user_id', user?.user_id)
          .eq('status', 'confirmed')
          .order('distributed_at', { ascending: true }),
        supabase
          .from('achievements')
          .select('completed_at, milestone_id, milestones(category)')
          .eq('user_id', user?.user_id)
          .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const achievements = achievementsRes.data || [];
      const rewards = rewardsRes.data || [];
      const weeklyAchievements = milestonesRes.data || [];

      const impactTrend = processImpactTrend(achievements, rewards);
      const categoryData = processCategoryData(achievements);
      const weeklyActivity = processWeeklyActivity(weeklyAchievements, rewards);

      setChartData({
        impactTrend,
        categoryData,
        weeklyActivity
      });
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processImpactTrend = (achievements: any[], rewards: any[]) => {
    const monthlyData: Record<string, { score: number; tokens: number; milestones: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        month: monthNames[date.getMonth()]
      };
    });

    last6Months.forEach(({ key, month }) => {
      monthlyData[month] = { score: 0, tokens: 0, milestones: 0 };
    });

    achievements.forEach(achievement => {
      if (achievement.completed_at) {
        const date = new Date(achievement.completed_at);
        const month = monthNames[date.getMonth()];
        if (monthlyData[month]) {
          monthlyData[month].milestones += 1;
          monthlyData[month].score += 100;
        }
      }
    });

    rewards.forEach(reward => {
      if (reward.distributed_at) {
        const date = new Date(reward.distributed_at);
        const month = monthNames[date.getMonth()];
        if (monthlyData[month]) {
          monthlyData[month].tokens += reward.token_amount || 0;
        }
      }
    });

    let cumulativeScore = 0;
    let cumulativeTokens = 0;
    let cumulativeMilestones = 0;

    return last6Months.map(({ month }) => {
      cumulativeScore += monthlyData[month]?.score || 0;
      cumulativeTokens += monthlyData[month]?.tokens || 0;
      cumulativeMilestones += monthlyData[month]?.milestones || 0;

      return {
        month,
        score: cumulativeScore,
        tokens: cumulativeTokens,
        milestones: cumulativeMilestones
      };
    });
  };

  const processCategoryData = (achievements: any[]) => {
    const categoryCounts: Record<string, number> = {};
    let total = 0;

    achievements.forEach(achievement => {
      const category = achievement.milestones?.category?.toLowerCase() || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      total += 1;
    });

    if (total === 0) {
      return [
        { name: 'No Data Yet', value: 100, color: '#e2e8f0' }
      ];
    }

    return Object.entries(categoryCounts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS.other
    }));
  };

  const processWeeklyActivity = (achievements: any[], rewards: any[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData: Record<string, { activities: number; rewards: number }> = {};

    dayNames.forEach(day => {
      weeklyData[day] = { activities: 0, rewards: 0 };
    });

    achievements.forEach(achievement => {
      if (achievement.completed_at) {
        const date = new Date(achievement.completed_at);
        const day = dayNames[date.getDay()];
        weeklyData[day].activities += 1;
      }
    });

    const recentRewards = rewards.filter(r => {
      if (!r.distributed_at) return false;
      const distributedDate = new Date(r.distributed_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return distributedDate >= weekAgo;
    });

    recentRewards.forEach(reward => {
      if (reward.distributed_at) {
        const date = new Date(reward.distributed_at);
        const day = dayNames[date.getDay()];
        weeklyData[day].rewards += reward.token_amount || 0;
      }
    });

    return dayNames.slice(1).concat(dayNames[0]).map(day => ({
      day,
      activities: weeklyData[day].activities,
      rewards: weeklyData[day].rewards
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Impact Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Impact Growth Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.impactTrend}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="tokensGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                  name="Impact Score"
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#tokensGradient)"
                  name="Tokens Earned"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Impact by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Contribution']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {chartData.categoryData.map((category) => (
                <div key={category.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-600">{category.name}</span>
                  <span className="text-sm font-medium text-gray-900">{category.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="activities" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    name="Activities"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Milestone Completion Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Milestone Completion Rate</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.impactTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="milestones"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#f59e0b', strokeWidth: 2 }}
                  name="Milestones Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}