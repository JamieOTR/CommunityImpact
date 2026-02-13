import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FolderKanban, Target, CheckSquare, Coins, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '../../components/UI/Card';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Stats {
  totalMembers: number;
  totalPrograms: number;
  totalMilestones: number;
  pendingSubmissions: number;
  pendingRewards: number;
  totalTokensDistributed: number;
}

export default function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    totalPrograms: 0,
    totalMilestones: 0,
    pendingSubmissions: 0,
    pendingRewards: 0,
    totalTokensDistributed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [communityName, setCommunityName] = useState('');

  useEffect(() => {
    async function loadStats() {
      if (!user) return;

      try {
        // Get current user's community
        const { data: userData } = await supabase
          .from('users')
          .select('community_id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (!userData?.community_id) {
          setLoading(false);
          return;
        }

        // Get community name
        const { data: communityData } = await supabase
          .from('communities')
          .select('name')
          .eq('community_id', userData.community_id)
          .maybeSingle();

        if (communityData) {
          setCommunityName(communityData.name);
        }

        // Get total members
        const { count: membersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', userData.community_id);

        // Get total programs
        const { count: programsCount } = await supabase
          .from('programs')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', userData.community_id);

        // Get total milestones
        const { data: programs } = await supabase
          .from('programs')
          .select('program_id')
          .eq('community_id', userData.community_id);

        const programIds = programs?.map(p => p.program_id) || [];

        let milestonesCount = 0;
        if (programIds.length > 0) {
          const { count } = await supabase
            .from('milestones')
            .select('*', { count: 'exact', head: true })
            .in('program_id', programIds);
          milestonesCount = count || 0;
        }

        // Get pending submissions (achievements with status 'submitted')
        const { data: communityUsers } = await supabase
          .from('users')
          .select('user_id')
          .eq('community_id', userData.community_id);

        const userIds = communityUsers?.map(u => u.user_id) || [];

        let pendingSubmissionsCount = 0;
        if (userIds.length > 0) {
          const { count } = await supabase
            .from('achievements')
            .select('*', { count: 'exact', head: true })
            .in('user_id', userIds)
            .eq('verification_status', 'pending');
          pendingSubmissionsCount = count || 0;
        }

        // Get pending rewards
        let pendingRewardsCount = 0;
        if (userIds.length > 0) {
          const { count } = await supabase
            .from('rewards')
            .select('*', { count: 'exact', head: true })
            .in('user_id', userIds)
            .eq('status', 'pending');
          pendingRewardsCount = count || 0;
        }

        // Get total tokens distributed
        let totalTokens = 0;
        if (userIds.length > 0) {
          const { data: rewards } = await supabase
            .from('rewards')
            .select('token_amount')
            .in('user_id', userIds)
            .eq('status', 'confirmed');

          totalTokens = rewards?.reduce((sum, r) => sum + r.token_amount, 0) || 0;
        }

        setStats({
          totalMembers: membersCount || 0,
          totalPrograms: programsCount || 0,
          totalMilestones: milestonesCount,
          pendingSubmissions: pendingSubmissionsCount,
          pendingRewards: pendingRewardsCount,
          totalTokensDistributed: totalTokens,
        });
      } catch (error) {
        console.error('Error loading admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user]);

  const statCards = [
    {
      label: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      color: 'bg-blue-500',
      link: null,
    },
    {
      label: 'Active Programs',
      value: stats.totalPrograms,
      icon: FolderKanban,
      color: 'bg-green-500',
      link: '/admin/programs',
    },
    {
      label: 'Total Milestones',
      value: stats.totalMilestones,
      icon: Target,
      color: 'bg-purple-500',
      link: '/admin/milestones',
    },
    {
      label: 'Pending Submissions',
      value: stats.pendingSubmissions,
      icon: CheckSquare,
      color: 'bg-orange-500',
      link: '/admin/submissions',
      alert: stats.pendingSubmissions > 0,
    },
    {
      label: 'Pending Rewards',
      value: stats.pendingRewards,
      icon: Coins,
      color: 'bg-yellow-500',
      link: '/admin/rewards',
      alert: stats.pendingRewards > 0,
    },
    {
      label: 'Tokens Distributed',
      value: stats.totalTokensDistributed.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-indigo-500',
      link: null,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Admin Dashboard
        </h1>
        {communityName && (
          <p className="text-slate-600">
            Managing {communityName}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const CardWrapper = stat.link ? Link : 'div';
          const wrapperProps = stat.link ? { to: stat.link } : {};

          return (
            <CardWrapper key={stat.label} {...wrapperProps}>
              <Card className={`${stat.link ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''} relative`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} rounded-lg p-3`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                {stat.alert && (
                  <div className="mt-3 flex items-center text-orange-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Requires attention
                  </div>
                )}
              </Card>
            </CardWrapper>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/programs"
            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FolderKanban className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-slate-900 mb-1">Create New Program</h3>
            <p className="text-sm text-slate-600">
              Start a new community development program
            </p>
          </Link>

          <Link
            to="/admin/milestones"
            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Target className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-slate-900 mb-1">Add Milestone</h3>
            <p className="text-sm text-slate-600">
              Create achievement milestones for programs
            </p>
          </Link>

          <Link
            to="/admin/submissions"
            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <CheckSquare className="w-8 h-8 text-orange-600 mb-2" />
            <h3 className="font-semibold text-slate-900 mb-1">Review Submissions</h3>
            <p className="text-sm text-slate-600">
              Verify and approve achievement submissions
            </p>
          </Link>

          <Link
            to="/admin/settings"
            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Settings className="w-8 h-8 text-slate-600 mb-2" />
            <h3 className="font-semibold text-slate-900 mb-1">Community Settings</h3>
            <p className="text-sm text-slate-600">
              Manage community configuration and preferences
            </p>
          </Link>
        </div>
      </Card>

      {/* Empty State Helper */}
      {stats.totalPrograms === 0 && (
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Get Started with Your First Program
              </h3>
              <p className="text-blue-800 mb-3">
                You haven't created any programs yet. Programs are the foundation of your community's activities and milestones.
              </p>
              <Link
                to="/admin/programs"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Program
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
