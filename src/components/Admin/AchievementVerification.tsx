import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Eye, Clock, AlertCircle } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface SubmittedAchievement {
  achievement_id: string;
  user_id: string;
  milestone_id: string;
  evidence_url: string;
  evidence_hash: string | null;
  created_at: string;
  updated_at: string;
  users: {
    name: string;
    email: string;
  };
  milestones: {
    title: string;
    description: string;
    reward_amount: number;
    reward_token: string;
    category: string;
  };
}

export default function AchievementVerification() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SubmittedAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmittedAchievement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('achievements')
        .select(`
          *,
          users (name, email),
          milestones (title, description, reward_amount, reward_token, category)
        `)
        .eq('status', 'submitted')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (achievementId: string, userId: string, rewardAmount: number) => {
    try {
      setProcessingId(achievementId);

      const { error: achievementError } = await supabase
        .from('achievements')
        .update({
          status: 'verified',
          verification_status: 'verified',
          updated_at: new Date().toISOString()
        })
        .eq('achievement_id', achievementId);

      if (achievementError) throw achievementError;

      const { error: rewardError } = await supabase
        .from('rewards')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          token_amount: rewardAmount,
          token_type: 'IMPACT',
          status: 'pending',
          description: 'Achievement reward pending blockchain distribution'
        });

      if (rewardError) throw rewardError;

      const { data: userData } = await supabase
        .from('users')
        .select('token_balance')
        .eq('user_id', userId)
        .single();

      const currentBalance = userData?.token_balance || 0;

      const { error: updateError } = await supabase
        .from('users')
        .update({
          token_balance: currentBalance + rewardAmount,
          total_impact_score: currentBalance + rewardAmount
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      await fetchSubmissions();
      setShowDetailModal(false);
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Failed to verify achievement:', error);
      alert('Failed to verify achievement. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (achievementId: string) => {
    if (!confirm('Are you sure you want to reject this submission? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingId(achievementId);

      const { error } = await supabase
        .from('achievements')
        .update({
          status: 'in-progress',
          verification_status: 'rejected',
          progress: 50,
          updated_at: new Date().toISOString()
        })
        .eq('achievement_id', achievementId);

      if (error) throw error;

      await fetchSubmissions();
      setShowDetailModal(false);
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Failed to reject achievement:', error);
      alert('Failed to reject achievement. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const openDetailModal = (submission: SubmittedAchievement) => {
    setSelectedSubmission(submission);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pending Verifications</h3>
            <p className="text-sm text-gray-600 mt-1">
              Review and verify submitted achievement evidence
            </p>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">{submissions.length} Pending</span>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h4>
            <p className="text-gray-600">No pending achievement verifications at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <motion.div
                key={submission.achievement_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {submission.milestones.title}
                      </h4>
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 rounded-full">
                        Pending Review
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Submitted by</p>
                        <p className="text-sm font-medium text-gray-900">{submission.users.name}</p>
                        <p className="text-xs text-gray-600">{submission.users.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Submitted</p>
                        <p className="text-sm text-gray-900">
                          {formatDistanceToNow(new Date(submission.updated_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-600">
                          Category: <span className="font-medium text-gray-900">{submission.milestones.category}</span>
                        </span>
                        <span className="text-gray-600">
                          Reward: <span className="font-medium text-secondary-600">
                            {submission.milestones.reward_amount} {submission.milestones.reward_token || 'IMPACT'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailModal(submission)}
                      disabled={processingId === submission.achievement_id}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {showDetailModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Review Submission</h3>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{selectedSubmission.milestones.title}</h4>
                <p className="text-sm text-gray-600">{selectedSubmission.milestones.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Participant</p>
                  <p className="font-medium text-gray-900">{selectedSubmission.users.name}</p>
                  <p className="text-sm text-gray-600">{selectedSubmission.users.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reward Amount</p>
                  <p className="text-lg font-semibold text-secondary-600">
                    {selectedSubmission.milestones.reward_amount} {selectedSubmission.milestones.reward_token || 'IMPACT'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Submitted Evidence</p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  {selectedSubmission.evidence_url?.startsWith('http') ? (
                    <div>
                      <a
                        href={selectedSubmission.evidence_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline break-all"
                      >
                        {selectedSubmission.evidence_url}
                      </a>
                      <p className="text-xs text-gray-600 mt-2">Click to open evidence in a new tab</p>
                    </div>
                  ) : (
                    <p className="text-gray-900">{selectedSubmission.evidence_url}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Verification Instructions</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Review the submitted evidence carefully</li>
                    <li>Verify it meets the milestone requirements</li>
                    <li>Approving will distribute rewards to the participant</li>
                    <li>Rejecting will return the milestone to in-progress status</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedSubmission(null);
                }}
                disabled={!!processingId}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleReject(selectedSubmission.achievement_id)}
                disabled={!!processingId}
              >
                <XCircle className="w-4 h-4 mr-1" />
                {processingId === selectedSubmission.achievement_id ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleVerify(
                  selectedSubmission.achievement_id,
                  selectedSubmission.user_id,
                  selectedSubmission.milestones.reward_amount
                )}
                disabled={!!processingId}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {processingId === selectedSubmission.achievement_id ? 'Processing...' : 'Approve & Reward'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
