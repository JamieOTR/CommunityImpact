import { useEffect, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, Clock, ExternalLink, User } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LiveIndicator from '../../components/UI/LiveIndicator';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Submission {
  achievement_id: string;
  user_id: string;
  milestone_id: string;
  completed_at: string;
  evidence_url: string | null;
  evidence_hash: string | null;
  verification_status: string;
  progress: number;
  status: string;
  user?: {
    name: string;
    email: string;
  };
  milestone?: {
    title: string;
    reward_amount: number;
    reward_token: string;
  };
}

export default function AdminSubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const communityIdRef = useRef<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [user, filter]);

  useEffect(() => {
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, filter]);

  const loadSubmissions = useCallback(async () => {
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

      communityIdRef.current = userData.community_id;

      const { data: communityUsers } = await supabase
        .from('users')
        .select('user_id')
        .eq('community_id', userData.community_id);

      const userIds = communityUsers?.map(u => u.user_id) || [];

      if (userIds.length === 0) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from('achievements')
        .select(`
          *,
          users:user_id (name, email),
          milestones:milestone_id (title, reward_amount, reward_token)
        `)
        .in('user_id', userIds)
        .order('completed_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('verification_status', 'pending');
      }

      const { data, error } = await query;

      if (error) throw error;

      setSubmissions(data as any || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  const setupRealtimeSubscription = useCallback(async () => {
    if (!user || !communityIdRef.current) return;

    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`admin-submissions-${communityIdRef.current}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'achievements',
        },
        async (payload) => {
          console.log('Achievement change detected:', payload);
          await loadSubmissions();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsLive(true);
          console.log('Subscribed to achievements changes');
        } else if (status === 'CHANNEL_ERROR') {
          setIsLive(false);
          console.error('Subscription error');
          setTimeout(setupRealtimeSubscription, 5000);
        } else if (status === 'TIMED_OUT') {
          setIsLive(false);
          console.error('Subscription timed out');
          setTimeout(setupRealtimeSubscription, 5000);
        } else if (status === 'CLOSED') {
          setIsLive(false);
        }
      });

    channelRef.current = channel;
  }, [user, loadSubmissions]);

  async function handleVerify(achievementId: string, approved: boolean) {
    setProcessingId(achievementId);

    try {
      const { error: updateError } = await supabase
        .from('achievements')
        .update({
          verification_status: approved ? 'verified' : 'rejected',
          status: approved ? 'completed' : 'available',
        })
        .eq('achievement_id', achievementId);

      if (updateError) throw updateError;

      // If approved, create a reward
      if (approved) {
        const submission = submissions.find(s => s.achievement_id === achievementId);
        if (submission) {
          const { error: rewardError } = await supabase
            .from('rewards')
            .insert({
              user_id: submission.user_id,
              achievement_id: achievementId,
              token_amount: submission.milestone?.reward_amount || 0,
              token_type: submission.milestone?.reward_token || 'IMPACT',
              status: 'pending',
              description: `Reward for: ${submission.milestone?.title}`,
            });

          if (rewardError) throw rewardError;
        }
      }

      // Reload submissions
      await loadSubmissions();
    } catch (error) {
      console.error('Error processing submission:', error);
      alert('Failed to process submission. Please try again.');
    } finally {
      setProcessingId(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Achievement Submissions
            </h1>
            <p className="text-slate-600">
              Review and verify member achievement submissions
            </p>
          </div>
          <LiveIndicator isConnected={isLive} />
        </div>
      </div>

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
              All Submissions
            </button>
          </div>
        </div>
      </Card>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No submissions found
            </h3>
            <p className="text-slate-600">
              {filter === 'pending'
                ? 'There are no pending submissions to review'
                : 'No submissions have been made yet'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.achievement_id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {submission.milestone?.title || 'Unknown Milestone'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.verification_status)}`}>
                      {submission.verification_status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {submission.user?.name || 'Unknown User'}
                    </div>
                    <div>
                      {new Date(submission.completed_at).toLocaleDateString()} at{' '}
                      {new Date(submission.completed_at).toLocaleTimeString()}
                    </div>
                  </div>

                  {submission.evidence_url && (
                    <a
                      href={submission.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-3"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Evidence
                    </a>
                  )}

                  <div className="flex items-center space-x-6 text-sm">
                    <div>
                      <span className="text-slate-500">Reward:</span>{' '}
                      <span className="font-semibold text-slate-900">
                        {submission.milestone?.reward_amount || 0} {submission.milestone?.reward_token || 'IMPACT'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Progress:</span>{' '}
                      <span className="font-semibold text-slate-900">{submission.progress}%</span>
                    </div>
                  </div>
                </div>

                {submission.verification_status === 'pending' && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      onClick={() => handleVerify(submission.achievement_id, true)}
                      disabled={processingId === submission.achievement_id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleVerify(submission.achievement_id, false)}
                      disabled={processingId === submission.achievement_id}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
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
