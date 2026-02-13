import { useEffect, useState } from 'react';
import { Coins, User, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Reward {
  reward_id: string;
  user_id: string;
  achievement_id: string | null;
  token_amount: number;
  token_type: string;
  distributed_at: string;
  transaction_hash: string | null;
  status: string;
  description: string | null;
  user?: {
    name: string;
    email: string;
    wallet_address: string | null;
  };
}

export default function AdminRewards() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRewards();
  }, [user, filter]);

  async function loadRewards() {
    if (!user) return;

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('community_id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!userData?.community_id) {
        setLoading(false);
        return;
      }

      // Get all users in the community
      const { data: communityUsers } = await supabase
        .from('users')
        .select('user_id')
        .eq('community_id', userData.community_id);

      const userIds = communityUsers?.map(u => u.user_id) || [];

      if (userIds.length === 0) {
        setLoading(false);
        return;
      }

      // Get rewards with user details
      let query = supabase
        .from('rewards')
        .select(`
          *,
          users:user_id (name, email, wallet_address)
        `)
        .in('user_id', userIds)
        .order('distributed_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('status', 'pending');
      }

      const { data, error } = await query;

      if (error) throw error;

      setRewards(data as any || []);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDistribute(rewardId: string) {
    setProcessingId(rewardId);

    try {
      // In a real implementation, this would trigger blockchain transaction
      // For now, we'll just mark as confirmed
      const { error } = await supabase
        .from('rewards')
        .update({
          status: 'confirmed',
          transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock transaction hash
        })
        .eq('reward_id', rewardId);

      if (error) throw error;

      await loadRewards();
    } catch (error) {
      console.error('Error distributing reward:', error);
      alert('Failed to distribute reward. Please try again.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDistributeAll() {
    if (!confirm('Are you sure you want to distribute all pending rewards?')) {
      return;
    }

    setProcessingId('all');

    try {
      const pendingRewards = rewards.filter(r => r.status === 'pending');

      for (const reward of pendingRewards) {
        await supabase
          .from('rewards')
          .update({
            status: 'confirmed',
            transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          })
          .eq('reward_id', reward.reward_id);
      }

      await loadRewards();
    } catch (error) {
      console.error('Error distributing rewards:', error);
      alert('Failed to distribute rewards. Please try again.');
    } finally {
      setProcessingId(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const pendingCount = rewards.filter(r => r.status === 'pending').length;
  const totalPending = rewards
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.token_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Rewards Queue
          </h1>
          <p className="text-slate-600">
            Manage and distribute token rewards to members
          </p>
        </div>
        {pendingCount > 0 && (
          <Button
            onClick={handleDistributeAll}
            disabled={processingId === 'all'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Coins className="w-4 h-4 mr-2" />
            Distribute All ({pendingCount})
          </Button>
        )}
      </div>

      {/* Stats */}
      {pendingCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Pending Rewards
                </p>
                <p className="text-3xl font-bold text-yellow-900">
                  {pendingCount}
                </p>
              </div>
              <div className="bg-yellow-200 rounded-lg p-3">
                <Clock className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Total Pending Amount
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {totalPending.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-200 rounded-lg p-3">
                <Coins className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-slate-700">
            Show:
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pending Only
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Rewards
            </button>
          </div>
        </div>
      </Card>

      {/* Rewards List */}
      {rewards.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No rewards found
            </h3>
            <p className="text-slate-600">
              {filter === 'pending'
                ? 'There are no pending rewards to distribute'
                : 'No rewards have been created yet'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {rewards.map((reward) => (
            <Card key={reward.reward_id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center text-slate-900">
                      <User className="w-4 h-4 mr-2 text-slate-500" />
                      <span className="font-semibold">{reward.user?.name || 'Unknown User'}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reward.status)}`}>
                      {reward.status}
                    </span>
                  </div>

                  {reward.description && (
                    <p className="text-sm text-slate-600 mb-2">
                      {reward.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-6 text-sm mb-2">
                    <div>
                      <span className="text-slate-500">Amount:</span>{' '}
                      <span className="font-semibold text-slate-900">
                        {reward.token_amount} {reward.token_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Created:</span>{' '}
                      <span className="text-slate-700">
                        {new Date(reward.distributed_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {!reward.user?.wallet_address && reward.status === 'pending' && (
                    <div className="flex items-start space-x-2 mt-2 p-2 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-800">
                        User has not connected a wallet yet. Reward cannot be distributed until wallet is connected.
                      </p>
                    </div>
                  )}

                  {reward.transaction_hash && (
                    <div className="text-xs text-slate-500 mt-2">
                      <span className="font-medium">Transaction:</span>{' '}
                      <code className="bg-slate-100 px-2 py-1 rounded">
                        {reward.transaction_hash.substring(0, 10)}...
                        {reward.transaction_hash.substring(reward.transaction_hash.length - 8)}
                      </code>
                    </div>
                  )}
                </div>

                {reward.status === 'pending' && (
                  <div className="ml-4">
                    <Button
                      onClick={() => handleDistribute(reward.reward_id)}
                      disabled={processingId === reward.reward_id || !reward.user?.wallet_address}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Distribute
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
